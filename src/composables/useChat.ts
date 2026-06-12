import { ref, computed, watch } from 'vue';
import { DeepSeekClient } from '../services/deepseek/client';
import { useDeepSeek } from '../services/deepseek/useDeepSeek';
import type { ChatCompletionMessageParam, ChatCompletionUsage } from '../services/deepseek/types';
import type { DisplayMessage } from '../types/chat';
import { toAPIMessage } from '../types/chat';
import type { AppSettings } from './useSettings';

/**
 * 上下文窗口最大 Token 数估算（按字符粗略估计: 1 token ≈ 3 字符）
 * DeepSeek v4 模型支持 128K 上下文，预留部分给输出
 */
const MAX_CONTEXT_CHARS = 300_000; // ~100K tokens

/**
 * 对话状态管理 Composable。
 * - 支持多会话：通过 loadSession / resetChat 切换
 * - 消息持久化由 useSessions 控制，useChat 在关键节点触发回调
 * - 流式状态管理
 * - 上下文窗口裁剪
 * - rAF 节流滚动
 */
export function useChat(
  settings: AppSettings,
  onSaveSession?: (messages: DisplayMessage[]) => void,
) {
  // ==================== 状态 ====================
  const messages = ref<DisplayMessage[]>([]);
  const latestUsage = ref<ChatCompletionUsage | null>(null);
  const globalError = ref<string | null>(null);
  const chatContainerRef = ref<HTMLDivElement | null>(null);
  const streamingThinking = ref('');
  const streamingContent = ref('');
  const copiedIndices = ref<Record<number, boolean>>({});

  // ==================== Client 实例 ====================
  const client = computed(() => {
    if (!settings.apiKey) return null;
    return new DeepSeekClient({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      defaultModel: settings.model,
    });
  });

  const deepseek = useDeepSeek(
    computed(() => client.value || new DeepSeekClient({ apiKey: 'placeholder' }))
  );

  // 代理 loading 状态
  const loading = deepseek.loading;

  // 监听流式内容变化，触发节流滚动
  watch(deepseek.thinkingText, (val) => {
    streamingThinking.value = val;
    scrollToBottom();
  });

  watch(deepseek.contentText, (val) => {
    streamingContent.value = val;
    scrollToBottom();
  });

  watch(deepseek.error, (val) => {
    if (val) {
      globalError.value = val.message;
    }
  });

  // ==================== 会话管理 ====================
  /**
   * 加载指定会话的消息（由 useSessions 调用）
   */
  function loadSession(sessionMessages: DisplayMessage[]) {
    // 如果正在流式生成，先中止
    if (loading.value) {
      deepseek.abort();
    }
    messages.value = sessionMessages;
    latestUsage.value = null;
    globalError.value = null;
    streamingThinking.value = '';
    streamingContent.value = '';
    copiedIndices.value = {};
    scrollToBottom();
  }

  /**
   * 重置为空白会话
   */
  function resetChat() {
    if (loading.value) {
      deepseek.abort();
    }
    messages.value = [];
    latestUsage.value = null;
    globalError.value = null;
    streamingThinking.value = '';
    streamingContent.value = '';
    copiedIndices.value = {};
  }

  // ==================== 触发保存 ====================
  function triggerSave() {
    if (onSaveSession) {
      onSaveSession(messages.value);
    }
  }

  // ==================== rAF 节流滚动 ====================
  let scrollPending = false;
  function scrollToBottom() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      if (chatContainerRef.value) {
        chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
      }
      scrollPending = false;
    });
  }

  // ==================== 上下文窗口裁剪 ====================
  function trimToContextWindow(history: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
    let totalChars = 0;
    const result: ChatCompletionMessageParam[] = [];

    // 系统提示词始终保留
    const systemMsg = history.find(m => m.role === 'system');
    if (systemMsg) {
      totalChars += (systemMsg.content || '').length;
      result.push(systemMsg);
    }

    // 从最新消息向前遍历，保留能放入窗口的部分
    const nonSystem = history.filter(m => m.role !== 'system');
    const kept: ChatCompletionMessageParam[] = [];

    for (let i = nonSystem.length - 1; i >= 0; i--) {
      const msg = nonSystem[i];
      const msgLen = (typeof msg.content === 'string' ? msg.content.length : 0);
      if (totalChars + msgLen > MAX_CONTEXT_CHARS) break;
      totalChars += msgLen;
      kept.unshift(msg);
    }

    return [...result, ...kept];
  }

  // ==================== 核心操作 ====================
  async function handleSend(userText: string) {
    if (!settings.apiKey) {
      globalError.value = '请先在左侧配置面板中填写 API Key！';
      return;
    }
    if (!userText.trim() || loading.value) return;

    globalError.value = null;

    // 构建对话历史
    const chatHistory: ChatCompletionMessageParam[] = [];

    if (settings.systemPrompt.trim()) {
      chatHistory.push({ role: 'system', content: settings.systemPrompt.trim() });
    }

    messages.value.forEach(msg => {
      if (msg.role !== 'system') {
        chatHistory.push(toAPIMessage(msg));
      }
    });

    const userMsg: DisplayMessage = { role: 'user', content: userText.trim() };
    messages.value.push(userMsg);
    chatHistory.push(toAPIMessage(userMsg));

    // 裁剪到上下文窗口
    const trimmedHistory = trimToContextWindow(chatHistory);

    scrollToBottom();

    streamingThinking.value = '';
    streamingContent.value = '';

    try {
      const overrides: any = {
        stream: true,
        temperature: Number(settings.temperature),
        max_tokens: Number(settings.maxTokens),
        thinking: {
          type: settings.thinkingEnabled ? 'enabled' : 'disabled',
        },
      };

      if (settings.thinkingEnabled) {
        overrides.reasoning_effort = settings.reasoningEffort;
      }

      const response = await deepseek.sendMessage(trimmedHistory, overrides);

      if (response) {
        const assistantMessage = response.choices?.[0]?.message;
        if (assistantMessage) {
          messages.value.push({
            role: 'assistant',
            content: assistantMessage.content || '',
            reasoning_content: assistantMessage.reasoning_content || undefined,
            model: response.model,
            usage: response.usage,
          });
        }
        if (response.usage) {
          latestUsage.value = response.usage;
        }
      } else {
        messages.value.push({
          role: 'assistant',
          content: streamingContent.value,
          reasoning_content: streamingThinking.value || undefined,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        globalError.value = err.message || '发送失败，请检查配置。';
      }
    } finally {
      streamingThinking.value = '';
      streamingContent.value = '';
      triggerSave();
      scrollToBottom();
    }
  }

  function handleStop() {
    deepseek.abort();
    if (streamingContent.value || streamingThinking.value) {
      messages.value.push({
        role: 'assistant',
        content: streamingContent.value,
        reasoning_content: streamingThinking.value || undefined,
        interrupted: true,
      });
    }
    streamingThinking.value = '';
    streamingContent.value = '';
    triggerSave();
  }

  function clearHistory() {
    messages.value = [];
    latestUsage.value = null;
    globalError.value = null;
    triggerSave();
  }

  // ==================== 复制 & 下载 ====================
  function handleCopyMessage(text: string, index: number) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copiedIndices.value[index] = true;
      setTimeout(() => {
        copiedIndices.value[index] = false;
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
  }

  function handleDownloadMessage(text: string, index: number) {
    if (!text) return;
    try {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = index === -1 ? 'deepseek-stream-response.md' : `deepseek-response-${index + 1}.md`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download message:', err);
    }
  }

  // ==================== 代码复制事件委托 ====================
  function handleGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('copy-code-btn')) {
      const codeBlock = target.closest('.relative')?.querySelector('code');
      if (codeBlock) {
        const textToCopy = codeBlock.innerText || '';
        const classList = Array.from(codeBlock.classList);
        const langClass = classList.find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'plaintext';
        const formattedText = `\`\`\`${lang}\n${textToCopy}\n\`\`\``;

        navigator.clipboard.writeText(formattedText).then(() => {
          const originalText = target.innerText;
          target.innerText = '已复制!';
          target.classList.add('text-green-400');
          setTimeout(() => {
            target.innerText = originalText;
            target.classList.remove('text-green-400');
          }, 1500);
        }).catch(err => {
          console.error('Failed to copy code block:', err);
        });
      }
    }
  }

  return {
    messages,
    latestUsage,
    globalError,
    chatContainerRef,
    streamingThinking,
    streamingContent,
    copiedIndices,
    loading,
    client,
    handleSend,
    handleStop,
    clearHistory,
    handleCopyMessage,
    handleDownloadMessage,
    handleGlobalClick,
    scrollToBottom,
    loadSession,
    resetChat,
  };
}
