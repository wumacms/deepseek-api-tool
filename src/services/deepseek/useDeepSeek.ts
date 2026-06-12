import { ref, onUnmounted, toValue } from 'vue';
import type { Ref, MaybeRefOrGetter } from 'vue';
import { DeepSeekClient } from './client';
import type { ChatCompletionMessageParam, ChatCompletionRequest, ChatCompletionResponse } from './types';

export interface UseDeepSeekReturn {
  loading: Ref<boolean>;
  thinkingText: Ref<string>;
  contentText: Ref<string>;
  error: Ref<Error | null>;
  sendMessage: (
    messages: ChatCompletionMessageParam[],
    overrides?: Omit<ChatCompletionRequest, 'messages'>
  ) => Promise<ChatCompletionResponse | void>;
  abort: () => void;
}

export function useDeepSeek(client: MaybeRefOrGetter<DeepSeekClient>): UseDeepSeekReturn {
  const loading = ref(false);
  const thinkingText = ref('');
  const contentText = ref('');
  const error = ref<Error | null>(null);
  
  let abortController: AbortController | null = null;

  const abort = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
      loading.value = false;
    }
  };

  const sendMessage = async (
    messages: ChatCompletionMessageParam[],
    overrides?: Omit<ChatCompletionRequest, 'messages'>
  ): Promise<ChatCompletionResponse | void> => {
    loading.value = true;
    thinkingText.value = '';
    contentText.value = '';
    error.value = null;

    const clientInstance = toValue(client);
    abortController = new AbortController();

    const isStream = overrides?.stream !== false; // 默认使用流式传输

    if (isStream) {
      try {
        await clientInstance.chatStream(
          {
            messages,
            ...overrides,
          },
          {
            onThinkingChunk: (chunk) => {
              thinkingText.value += chunk;
            },
            onContentChunk: (chunk) => {
              contentText.value += chunk;
            },
            onDone: () => {
              loading.value = false;
              abortController = null;
            },
            onError: (err) => {
              if (err.name === 'AbortError') {
                return;
              }
              error.value = err;
              loading.value = false;
              abortController = null;
            },
          },
          {
            signal: abortController.signal,
          }
        );
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          error.value = err;
          loading.value = false;
          abortController = null;
          throw err;
        }
      }
    } else {
      try {
        const response = await clientInstance.chat(
          {
            messages,
            ...overrides,
          },
          {
            signal: abortController.signal,
          }
        );
        
        const choice = response.choices?.[0]?.message;
        if (choice) {
          contentText.value = choice.content || '';
          thinkingText.value = choice.reasoning_content || '';
        }
        
        loading.value = false;
        abortController = null;
        return response;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          error.value = err as Error;
          loading.value = false;
          abortController = null;
          throw err;
        }
      }
    }
  };

  onUnmounted(() => {
    abort();
  });

  return {
    loading,
    thinkingText,
    contentText,
    error,
    sendMessage,
    abort,
  };
}
