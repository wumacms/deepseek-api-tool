import type {
  DeepSeekClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamCallbacks,
  ChatCompletionChunk
} from './types';

export class DeepSeekAPIError extends Error {
  status: number;
  code?: string;
  type?: string;

  constructor(message: string, status: number, code?: string, type?: string) {
    super(message);
    this.name = 'DeepSeekAPIError';
    this.status = status;
    this.code = code;
    this.type = type;
    Object.setPrototypeOf(this, DeepSeekAPIError.prototype);
  }
}

export class DeepSeekClient {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: DeepSeekClientConfig) {
    if (!config.apiKey) {
      throw new Error('DeepSeek API Key is required');
    }
    this.apiKey = config.apiKey;
    this.baseURL = (config.baseURL || 'https://api.deepseek.com').replace(/\/$/, '');
    this.defaultModel = config.defaultModel || 'deepseek-v4-pro';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  private async handleError(response: Response): Promise<never> {
    const status = response.status;
    let message = `HTTP Error ${status}: ${response.statusText}`;
    let code: string | undefined;
    let type: string | undefined;

    try {
      const errorBody = await response.json();
      if (errorBody?.error) {
        message = errorBody.error.message || message;
        code = errorBody.error.code;
        type = errorBody.error.type;
      }
    } catch {
      // Ignore JSON parse error if body is not JSON
    }

    if (status === 400) {
      message = `格式错误 (400): ${message}`;
    } else if (status === 401) {
      message = `认证失败 (401): 请检查您的 API key 是否正确。`;
    } else if (status === 402) {
      message = `余额不足 (402): 账号余额不足，请前往充值页面。`;
    } else if (status === 422) {
      message = `参数错误 (422): ${message}`;
    } else if (status === 429) {
      message = `请求速率达到上限或并发超限 (429): 请合理规划您的请求速率并稍后重试。`;
    } else if (status === 500) {
      message = `服务器故障 (500): 服务器内部发生错误，请稍后重试。`;
    } else if (status === 503) {
      message = `服务器繁忙 (503): 服务器负载过高，请稍后重试。`;
    }

    throw new DeepSeekAPIError(message, status, code, type);
  }

  /**
   * 普通对话 (Chat) - Promise 异步返回完整结果
   */
  public async chat(
    request: ChatCompletionRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ChatCompletionResponse> {
    const url = `${this.baseURL}/chat/completions`;
    const payload = {
      model: this.defaultModel,
      ...request,
      stream: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
      signal: options?.signal,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * 流式对话 (Stream Chat) - 逐行解析流数据并过滤 keep-alive 注释行
   */
  public async chatStream(
    request: ChatCompletionRequest,
    callbacks: StreamCallbacks,
    options?: { signal?: AbortSignal }
  ): Promise<void> {
    const url = `${this.baseURL}/chat/completions`;
    const payload = {
      model: this.defaultModel,
      ...request,
      stream: true,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: options?.signal,
      });
    } catch (err: any) {
      if (callbacks.onError) {
        callbacks.onError(err);
      }
      throw err;
    }

    if (!response.ok) {
      try {
        await this.handleError(response);
      } catch (err: any) {
        if (callbacks.onError) {
          callbacks.onError(err);
        }
        throw err;
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const err = new Error('ReadableStream is not supported by the response body');
      if (callbacks.onError) {
        callbacks.onError(err);
      }
      throw err;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let responseId = '';
    let responseModel = '';
    let responseCreated = Math.floor(Date.now() / 1000);
    let systemFingerprint = '';
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let finishReason: any = 'stop';
    let usageInfo: any = undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        let lineEndIdx;
        while ((lineEndIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, lineEndIdx).trim();
          buffer = buffer.slice(lineEndIdx + 1);

          if (!line) {
            continue; // 忽略空白行 (非流式或流式的空白回车)
          }

          // 处理文档提及的 SSE keep-alive 注释，以 ':' 开头
          if (line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();

            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const chunk: ChatCompletionChunk = JSON.parse(dataStr);
              if (chunk.id) responseId = chunk.id;
              if (chunk.model) responseModel = chunk.model;
              if (chunk.created) responseCreated = chunk.created;
              if (chunk.system_fingerprint) systemFingerprint = chunk.system_fingerprint;
              if (chunk.usage) usageInfo = chunk.usage;

              const choice = chunk.choices?.[0];
              if (choice) {
                if (choice.finish_reason) {
                  finishReason = choice.finish_reason;
                }

                const delta = choice.delta;
                if (delta) {
                  // 分别对 reasoning_content 和 content 进行累加和回调输出
                  if (delta.reasoning_content) {
                    accumulatedReasoning += delta.reasoning_content;
                    if (callbacks.onThinkingChunk) {
                      callbacks.onThinkingChunk(delta.reasoning_content);
                    }
                  } else if (delta.content) {
                    accumulatedContent += delta.content;
                    if (callbacks.onContentChunk) {
                      callbacks.onContentChunk(delta.content);
                    }
                  }
                }
              }
            } catch (jsonErr) {
              console.error('Failed to parse SSE JSON chunk:', dataStr, jsonErr);
            }
          }
        }
      }

      // 组装最终结果，以标准 ChatCompletionResponse 形式返回给 onDone
      const finalResponse: ChatCompletionResponse = {
        id: responseId,
        object: 'chat.completion',
        created: responseCreated,
        model: responseModel || this.defaultModel,
        system_fingerprint: systemFingerprint || undefined,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: accumulatedContent || null,
              reasoning_content: accumulatedReasoning || undefined,
            },
            finish_reason: finishReason,
          },
        ],
        usage: usageInfo,
      };

      if (callbacks.onDone) {
        callbacks.onDone(finalResponse);
      }
    } catch (err: any) {
      if (callbacks.onError) {
        callbacks.onError(err);
      }
      throw err;
    } finally {
      reader.releaseLock();
    }
  }
}
