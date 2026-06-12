import { reactive, watch, ref } from 'vue';

export interface AppSettings {
  apiKey: string;
  baseURL: string;
  model: string;
  systemPrompt: string;
  thinkingEnabled: boolean;
  reasoningEffort: string;
  temperature: number;
  maxTokens: number;
}

/**
 * 配置持久化 Composable。
 * - 从 localStorage 初始化设置
 * - 变更时 debounce 300ms 后写回 localStorage
 */
export function useSettings() {
  const settings = reactive<AppSettings>({
    apiKey: localStorage.getItem('deepseek_api_key') || '',
    baseURL: localStorage.getItem('deepseek_base_url') || 'https://api.deepseek.com',
    model: localStorage.getItem('deepseek_model') || 'deepseek-v4-flash',
    systemPrompt: localStorage.getItem('deepseek_system_prompt') || '你是一个乐于助人且知识渊博的 AI 助手。',
    thinkingEnabled: localStorage.getItem('deepseek_thinking_enabled') !== 'false',
    reasoningEffort: localStorage.getItem('deepseek_reasoning_effort') || 'high',
    temperature: Number(localStorage.getItem('deepseek_temperature') || '1.0'),
    maxTokens: Number(localStorage.getItem('deepseek_max_tokens') || '4096'),
  });

  const isKeyVisible = ref(false);

  // Debounced settings persistence
  let settingsTimer: ReturnType<typeof setTimeout> | null = null;
  watch(settings, (newVal) => {
    if (settingsTimer) clearTimeout(settingsTimer);
    settingsTimer = setTimeout(() => {
      localStorage.setItem('deepseek_api_key', newVal.apiKey);
      localStorage.setItem('deepseek_base_url', newVal.baseURL);
      localStorage.setItem('deepseek_model', newVal.model);
      localStorage.setItem('deepseek_system_prompt', newVal.systemPrompt);
      localStorage.setItem('deepseek_thinking_enabled', String(newVal.thinkingEnabled));
      localStorage.setItem('deepseek_reasoning_effort', newVal.reasoningEffort);
      localStorage.setItem('deepseek_temperature', String(newVal.temperature));
      localStorage.setItem('deepseek_max_tokens', String(newVal.maxTokens));
    }, 300);
  }, { deep: true });

  return {
    settings,
    isKeyVisible,
  };
}
