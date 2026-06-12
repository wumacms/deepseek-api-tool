<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { DeepSeekClient } from './services/deepseek/client';
import { useDeepSeek } from './services/deepseek/useDeepSeek';
import type { ChatCompletionMessageParam, ChatCompletionUsage } from './services/deepseek/types';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { 
  Sliders, 
  Eye, 
  EyeOff, 
  Trash2, 
  Brain, 
  Loader2, 
  MessageSquare, 
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  Download,
  Check 
} from '@lucide/vue';

// ==================== 状态管理 & 配置持久化 ====================
const settings = reactive({
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
const inputMessage = ref('');
const isSidebarCollapsed = ref(localStorage.getItem('deepseek_sidebar_collapsed') === 'true');

watch(isSidebarCollapsed, (newVal) => {
  localStorage.setItem('deepseek_sidebar_collapsed', String(newVal));
});

// 从 localStorage 加载历史对话
const loadMessages = (): ChatCompletionMessageParam[] => {
  try {
    const saved = localStorage.getItem('deepseek_chat_messages');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Failed to load chat messages from localStorage:', err);
    return [];
  }
};

const messages = ref<ChatCompletionMessageParam[]>(loadMessages());
const latestUsage = ref<ChatCompletionUsage | null>(null);

// 用于本地模拟滚动
const chatContainerRef = ref<HTMLDivElement | null>(null);

// 缓存配置与对话历史
watch(settings, (newVal) => {
  localStorage.setItem('deepseek_api_key', newVal.apiKey);
  localStorage.setItem('deepseek_base_url', newVal.baseURL);
  localStorage.setItem('deepseek_model', newVal.model);
  localStorage.setItem('deepseek_system_prompt', newVal.systemPrompt);
  localStorage.setItem('deepseek_thinking_enabled', String(newVal.thinkingEnabled));
  localStorage.setItem('deepseek_reasoning_effort', newVal.reasoningEffort);
  localStorage.setItem('deepseek_temperature', String(newVal.temperature));
  localStorage.setItem('deepseek_max_tokens', String(newVal.maxTokens));
}, { deep: true });

watch(messages, (newVal) => {
  try {
    localStorage.setItem('deepseek_chat_messages', JSON.stringify(newVal));
  } catch (err) {
    console.error('Failed to save chat messages to localStorage:', err);
  }
}, { deep: true });

// ==================== 实例化 DeepSeek 客户端与 Composable ====================
const client = computed(() => {
  if (!settings.apiKey) return null;
  return new DeepSeekClient({
    apiKey: settings.apiKey,
    baseURL: settings.baseURL,
    defaultModel: settings.model
  });
});

// 错误处理与响应式绑定
const globalError = ref<string | null>(null);

// 辅助状态，用于临时累加流式消息
const streamingThinking = ref('');
const streamingContent = ref('');

// 使用 Composable，并监听变化
const { loading, thinkingText, contentText, error, sendMessage, abort } = useDeepSeek(
  computed(() => client.value || new DeepSeekClient({ apiKey: 'dummy' })) as any
);

watch(thinkingText, (val) => {
  streamingThinking.value = val;
  scrollToBottom();
});

watch(contentText, (val) => {
  streamingContent.value = val;
  scrollToBottom();
});

watch(error, (val) => {
  if (val) {
    globalError.value = val.message;
  }
});

// ==================== 聊天操作函数 ====================
const handleSend = async () => {
  if (!settings.apiKey) {
    globalError.value = '请先在左侧配置面板中填写 API Key！';
    return;
  }
  if (!inputMessage.value.trim() || loading.value) return;

  globalError.value = null;
  const userText = inputMessage.value.trim();
  inputMessage.value = '';

  // 构建当前对话历史
  const chatHistory: ChatCompletionMessageParam[] = [];
  
  // 1. 添加系统提示词（如果有）
  if (settings.systemPrompt.trim()) {
    chatHistory.push({
      role: 'system',
      content: settings.systemPrompt.trim()
    });
  }

  // 2. 添加历史消息（过滤掉系统消息，防止重复）
  messages.value.forEach(msg => {
    if (msg.role !== 'system') {
      chatHistory.push(msg);
    }
  });

  // 3. 添加当前用户提问
  const userMsg: ChatCompletionMessageParam = {
    role: 'user',
    content: userText
  };
  messages.value.push(userMsg);
  chatHistory.push(userMsg);

  scrollToBottom();

  // 4. 重置临时流变量
  streamingThinking.value = '';
  streamingContent.value = '';

  try {
    const overrides: any = {
      stream: true,
      temperature: Number(settings.temperature),
      max_tokens: Number(settings.maxTokens),
      thinking: {
        type: settings.thinkingEnabled ? 'enabled' : 'disabled'
      }
    };

    // 仅在启用思考时传递推理强度控制
    if (settings.thinkingEnabled) {
      overrides.reasoning_effort = settings.reasoningEffort;
    }

    // 调用 Composable 发送
    const response = await sendMessage(chatHistory, overrides);

    // 完成后，若返回了最终数据，将其更新到消息列表并记录 Usage
    if (response) {
      const assistantMessage = response.choices?.[0]?.message;
      if (assistantMessage) {
        messages.value.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          reasoning_content: assistantMessage.reasoning_content || undefined,
          model: response.model,
          usage: response.usage
        } as any);
      }
      if (response.usage) {
        latestUsage.value = response.usage;
      }
    } else {
      // 流式输出结束后，直接从 Ref 组装并追加到消息历史
      messages.value.push({
        role: 'assistant',
        content: streamingContent.value,
        reasoning_content: streamingThinking.value || undefined
      });
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      globalError.value = err.message || '发送失败，请检查配置。';
    }
  } finally {
    streamingThinking.value = '';
    streamingContent.value = '';
    scrollToBottom();
  }
};

const handleStop = () => {
  abort();
  // 中止后将已生成的内容保存到消息中
  if (streamingContent.value || streamingThinking.value) {
    messages.value.push({
      role: 'assistant',
      content: streamingContent.value,
      reasoning_content: streamingThinking.value || undefined
    });
  }
  streamingThinking.value = '';
  streamingContent.value = '';
};

const clearHistory = () => {
  messages.value = [];
  latestUsage.value = null;
  globalError.value = null;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};

// ==================== 实用 Markdown 解析工具 ====================
// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true
});

const renderer = new marked.Renderer();

// 重写 code 渲染，结合 highlight.js 进行语法高亮，并使用自定义样式类支持事件委托复制
renderer.code = function (codeOrObj: any, lang?: string) {
  let text = '';
  let codeLang = 'plaintext';
  if (typeof codeOrObj === 'object' && codeOrObj !== null) {
    text = codeOrObj.text || '';
    codeLang = codeOrObj.lang || 'plaintext';
  } else {
    text = codeOrObj || '';
    codeLang = lang || 'plaintext';
  }

  let highlighted = text;
  try {
    if (codeLang && hljs.getLanguage(codeLang)) {
      highlighted = hljs.highlight(text, { language: codeLang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch (err) {
    console.error('Highlight error:', err);
  }

  // 构造发光黑盒代码容器，使用 copy-code-btn 类配合事件委托
  return `<div class="relative border border-white/10 rounded-none overflow-hidden bg-black/40 font-mono text-xs my-3">
    <div class="bg-white/5 px-4 py-2 flex justify-between items-center text-[10px] text-gray-400 select-none">
      <span>${codeLang.toUpperCase()}</span>
      <button class="copy-code-btn hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-none hover:bg-white/5">复制</button>
    </div>
    <pre class="p-4 overflow-x-auto text-blue-200/90"><code class="hljs language-${codeLang}">${highlighted}</code></pre>
  </div>`;
};

// KaTeX 数学公式渲染扩展
const blockMath = {
  name: 'blockMath',
  level: 'block' as const,
  start(src: string) { return src.indexOf('$$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (match) {
      return {
        type: 'blockMath',
        raw: match[0],
        text: match[1].trim()
      };
    }
  },
  renderer(token: any) {
    try {
      return `<div class="katex-block-container my-4 overflow-x-auto text-center">${katex.renderToString(token.text, { displayMode: true, throwOnError: false })}</div>`;
    } catch (err) {
      console.error('KaTeX block render error:', err);
      return `<div class="text-red-500 font-mono my-2">${token.raw}</div>`;
    }
  }
};

const inlineMath = {
  name: 'inlineMath',
  level: 'inline' as const,
  start(src: string) { return src.indexOf('$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$([^\$\s\n](?:[^\$\n]*?[^\$\s\n])?)\$/);
    if (match) {
      return {
        type: 'inlineMath',
        raw: match[0],
        text: match[1]
      };
    }
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { displayMode: false, throwOnError: false });
    } catch (err) {
      console.error('KaTeX inline render error:', err);
      return token.raw;
    }
  }
};

marked.use({ 
  renderer,
  extensions: [blockMath, inlineMath]
});

const renderMarkdown = (text: string): string => {
  if (!text) return '';
  try {
    return marked.parse(text) as string;
  } catch (err) {
    console.error('Markdown parsing failed:', err);
    return text;
  }
};

// 安全优雅的事件委托复制逻辑
const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target && target.classList.contains('copy-code-btn')) {
    // 定位到同一个面板里的 <code> 元素
    const codeBlock = target.closest('.relative')?.querySelector('code');
    if (codeBlock) {
      const textToCopy = codeBlock.innerText || '';
      
      // 提取代码所属语言 (从 code 节点的 class 中读取 language-xxx)
      const classList = Array.from(codeBlock.classList);
      const langClass = classList.find(c => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'plaintext';
      
      // 组装包含语言标识的 Markdown 格式代码块
      const formattedText = `\`\`\`${lang}\n${textToCopy}\n\`\`\``;
      
      navigator.clipboard.writeText(formattedText).then(() => {
        // 提供复制成功反馈
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
};
// 记录消息复制状态
const copiedIndices = ref<Record<number, boolean>>({});

// 复制消息全文逻辑
const handleCopyMessage = (text: string, index: number) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copiedIndices.value[index] = true;
    setTimeout(() => {
      copiedIndices.value[index] = false;
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy message:', err);
  });
};

// 下载消息全文为 Markdown 逻辑
const handleDownloadMessage = (text: string, index: number) => {
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
};

// ==================== Token 计费与格式化工具 ====================
const calculateCost = (model: string, usage: any) => {
  if (!usage) return 0;
  const isPro = model.includes('pro');
  let hitRate = 0.025; // Pro 缓存命中价格：0.025元 / 百万 tokens
  let missRate = 3.0;  // Pro 缓存未命中价格：3元 / 百万 tokens
  let outputRate = 6.0; // Pro 输出价格：6元 / 百万 tokens

  if (!isPro && (model.includes('flash') || model.includes('chat'))) {
    hitRate = 0.02; // Flash 缓存命中价格：0.02元 / 百万 tokens
    missRate = 1.0;  // Flash 缓存未命中价格：1元 / 百万 tokens
    outputRate = 2.0; // Flash 输出价格：2元 / 百万 tokens
  }

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  // 获取缓存命中的 token 数
  let hitTokens = 0;
  if (typeof usage.prompt_cache_hit_tokens === 'number') {
    hitTokens = usage.prompt_cache_hit_tokens;
  } else if (usage.prompt_tokens_details && typeof usage.prompt_tokens_details.cached_tokens === 'number') {
    hitTokens = usage.prompt_tokens_details.cached_tokens;
  }

  const missTokens = Math.max(0, promptTokens - hitTokens);

  const cost = (hitTokens * hitRate + missTokens * missRate + completionTokens * outputRate) / 1000000;
  return cost;
};

const formatCost = (cost: number) => {
  if (cost === 0) return '0.00';
  if (cost < 0.0001) {
    return cost.toFixed(6);
  }
  if (cost < 0.01) {
    return cost.toFixed(5);
  }
  return cost.toFixed(4);
};

onMounted(() => {
  if (window.innerWidth < 768 && localStorage.getItem('deepseek_sidebar_collapsed') === null) {
    isSidebarCollapsed.value = true;
  }
  scrollToBottom();
});
</script>

<template>
  <div class="ambient-bg"></div>
  
  <div 
    :class="[isSidebarCollapsed ? 'gap-0' : 'gap-4']"
    class="relative flex h-screen w-screen overflow-hidden p-2 sm:p-4 box-border transition-all duration-300 ease-in-out"
  >
    <!-- 移动端遮罩层 -->
    <div 
      v-if="!isSidebarCollapsed"
      @click="isSidebarCollapsed = true"
      class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20 transition-opacity duration-300"
    ></div>
    
    <!-- ==================== 左侧配置控制面板 ==================== -->
    <div 
      :class="[
        isSidebarCollapsed ? 'w-0 p-0 border-0 opacity-0 overflow-hidden pointer-events-none' : 'w-80 p-4 opacity-100'
      ]"
      class="flex flex-col gap-4 glass-panel rounded-none shrink-0 overflow-y-auto transition-all duration-300 ease-in-out z-30 max-md:absolute max-md:left-2 max-md:top-2 max-md:bottom-2 max-md:h-[calc(100vh-1rem)]"
    >
      <div class="flex items-center gap-2 pb-3 border-b border-white/10">
        <div class="w-8 h-8 rounded-none bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Sliders class="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-white tracking-wide">DeepSeek API 配置</h2>
          <p class="text-[10px] text-gray-400">设置并调试官方最新模型参数</p>
        </div>
      </div>

      <!-- API Key -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-gray-300 font-semibold flex justify-between">
          <span>API Key</span>
          <a href="https://platform.deepseek.com/api_keys" target="_blank" class="text-blue-400 hover:underline text-[10px]">获取 Key</a>
        </label>
        <div class="relative flex items-center">
          <input 
            :type="isKeyVisible ? 'text' : 'password'" 
            v-model="settings.apiKey" 
            placeholder="sk-..." 
            class="w-full glass-input text-sm text-white rounded-none px-3 py-2 pr-10"
          />
          <button 
            @click="isKeyVisible = !isKeyVisible" 
            class="absolute right-2.5 text-gray-400 hover:text-white transition-colors"
          >
            <Eye v-if="isKeyVisible" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Base URL -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-gray-300 font-semibold">接口地址 (Base URL)</label>
        <input 
          type="text" 
          v-model="settings.baseURL" 
          disabled
          class="w-full glass-input text-sm text-gray-400 rounded-none px-3 py-2 bg-white/5 cursor-not-allowed border-white/5"
        />
      </div>

      <!-- Model Selector -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-gray-300 font-semibold">对话模型 (Model)</label>
        <select 
          v-model="settings.model" 
          class="w-full glass-input text-sm text-white rounded-none px-3 py-2 bg-[#0d121f] focus:outline-none"
        >
          <option value="deepseek-v4-pro">deepseek-v4-pro (旗舰模型)</option>
          <option value="deepseek-v4-flash">deepseek-v4-flash (轻快模型)</option>
        </select>
      </div>

      <!-- System Prompt -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-gray-300 font-semibold">系统提示词 (System Prompt)</label>
        <textarea 
          v-model="settings.systemPrompt" 
          rows="3" 
          class="w-full glass-input text-sm text-white rounded-none px-3 py-2 resize-none"
          placeholder="设定助理的身份和特殊要求..."
        ></textarea>
      </div>

      <!-- Thinking Mode Switch -->
      <div class="border-t border-white/10 pt-3 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs text-gray-300 font-semibold block">思考模式 (Thinking)</span>
            <span class="text-[10px] text-gray-400">输出前产生思维链</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.thinkingEnabled" class="sr-only peer">
            <div class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Reasoning Effort -->
        <div v-if="settings.thinkingEnabled" class="flex flex-col gap-1.5">
          <label class="text-xs text-gray-400 font-medium">思维链精细度 (Reasoning Effort)</label>
          <div class="flex gap-2 bg-white/5 p-1 rounded-none border border-white/10">
            <button 
              @click="settings.reasoningEffort = 'high'"
              :class="[settings.reasoningEffort === 'high' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-gray-400 border-transparent']"
              class="flex-1 text-center py-1 text-xs font-semibold rounded-none border transition-all"
            >
              High (高)
            </button>
            <button 
              @click="settings.reasoningEffort = 'max'"
              :class="[settings.reasoningEffort === 'max' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-gray-400 border-transparent']"
              class="flex-1 text-center py-1 text-xs font-semibold rounded-none border transition-all"
            >
              Max (极高)
            </button>
          </div>
        </div>
      </div>

      <!-- Temperature & Max Tokens -->
      <div class="border-t border-white/10 pt-3 flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-300 font-semibold">温度 (Temperature)</span>
          <span class="text-blue-400 font-bold">{{ settings.temperature }}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          v-model.number="settings.temperature" 
          class="w-full h-1 bg-gray-700 rounded-none appearance-none cursor-pointer"
        />

        <div class="flex justify-between items-center text-xs mt-1">
          <span class="text-gray-300 font-semibold">单次最大 Token 数</span>
          <span class="text-blue-400 font-bold">{{ settings.maxTokens }}</span>
        </div>
        <input 
          type="range" 
          min="256" 
          max="8192" 
          step="256" 
          v-model.number="settings.maxTokens" 
          class="w-full h-1 bg-gray-700 rounded-none appearance-none cursor-pointer"
        />
      </div>

      <!-- Token Usage Metrics -->
      <div v-if="latestUsage" class="border-t border-white/10 pt-3 mt-auto flex flex-col gap-2">
        <span class="text-xs text-gray-300 font-semibold">Token 消耗详情 (上一次)</span>
        <div class="grid grid-cols-2 gap-2 text-[11px] bg-white/5 p-2 rounded-none border border-white/10 font-mono">
          <div>
            <span class="text-gray-400 block">输入 Token:</span>
            <span class="text-white">{{ latestUsage.prompt_tokens }}</span>
          </div>
          <div>
            <span class="text-gray-400 block">输出 Token:</span>
            <span class="text-white">{{ latestUsage.completion_tokens }}</span>
          </div>
          <div class="col-span-2 border-t border-white/5 pt-1 mt-1 flex justify-between">
            <span class="text-gray-400">思维链 Token:</span>
            <span class="text-purple-400 font-bold">{{ latestUsage.completion_tokens_details?.reasoning_tokens || 0 }}</span>
          </div>
          <div class="col-span-2 flex justify-between">
            <span class="text-gray-400">缓存命中 Token:</span>
            <span class="text-green-400 font-bold">{{ latestUsage.prompt_cache_hit_tokens || 0 }}</span>
          </div>
          <div class="col-span-2 border-t border-white/5 pt-1 mt-1 flex justify-between text-xs">
            <span class="text-gray-300 font-bold">总计 Token:</span>
            <span class="text-blue-400 font-extrabold">{{ latestUsage.total_tokens }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 右侧对话主界面 ==================== -->
    <div class="flex-1 flex flex-col glass-panel rounded-none overflow-hidden relative">
      
      <!-- 顶部 Header -->
      <div class="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div class="flex items-center gap-3">
          <button 
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            class="text-gray-400 hover:text-white p-1.5 rounded-none hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center mr-0.5"
            :title="isSidebarCollapsed ? '展开配置栏' : '折叠配置栏'"
          >
            <PanelLeftOpen v-if="isSidebarCollapsed" class="w-4.5 h-4.5" />
            <PanelLeftClose v-else class="w-4.5 h-4.5" />
          </button>
          <div class="w-2.5 h-2.5 rounded-none shrink-0" :class="[settings.apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]']"></div>
          <div>
            <h1 class="text-base font-bold text-white tracking-wide">DeepSeek Chat 沙箱</h1>
            <p class="text-xs text-gray-400 hidden sm:block" v-if="settings.apiKey">已连接至 DeepSeek API ({{ settings.model }})</p>
            <p class="text-xs text-red-400/80 hidden sm:block" v-else>未配置 API Key，请先配置以激活</p>
          </div>
        </div>
        
        <button 
          @click="clearHistory" 
          class="text-xs font-semibold text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-none hover:bg-red-600/20 border border-white/5 hover:border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">清空历史</span>
        </button>
      </div>

      <!-- 全局异常报错提示 -->
      <div v-if="globalError" class="mx-4 sm:mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-none flex justify-between items-center shrink-0">
        <span>{{ globalError }}</span>
        <button @click="globalError = null" class="text-red-400 hover:text-white">✕</button>
      </div>

      <!-- 对话列表展示区域 -->
      <div 
        ref="chatContainerRef" 
        @click="handleGlobalClick"
        class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:gap-6"
      >
        <!-- 欢迎引导 -->
        <div v-if="messages.length === 0 && !streamingThinking && !streamingContent" class="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div class="w-16 h-16 rounded-none bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 animate-pulse">
            <MessageSquare class="w-8 h-8 text-blue-400" />
          </div>
          <h3 class="text-lg font-bold text-white mb-1">DeepSeek 官方模型测试沙箱</h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            本沙箱直连官方 API。默认主打 <code class="px-1 py-0.5 rounded-none bg-white/5 border border-white/10 text-blue-400">deepseek-v4-pro</code> 模型。支持对思维链与正文流式输出的分别解析，以及多轮对话中的上下文拼装。
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button 
              @click="inputMessage = '9.11和9.8哪个大？'" 
              class="text-left text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 p-3 rounded-none transition-all"
            >
              <span class="text-blue-400 font-semibold block mb-0.5">测试数学/逻辑</span>
              <span class="text-gray-400">"9.11和9.8哪个大？"</span>
            </button>
            <button 
              @click="inputMessage = '找出单词 strawberry 中有几个字母 r？'" 
              class="text-left text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 p-3 rounded-none transition-all"
            >
              <span class="text-purple-400 font-semibold block mb-0.5">测试思维链细节</span>
              <span class="text-gray-400">"strawberry 中有几个 r？"</span>
            </button>
          </div>
        </div>

        <!-- 对话条目 -->
        <template v-else>
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            class="flex flex-col gap-2 items-end"
          >
            <!-- 用户气泡 -->
            <div v-if="msg.role === 'user'" class="max-w-[85%] sm:max-w-[70%] bg-blue-600/20 border border-blue-500/30 px-4 py-2.5 rounded-none text-sm text-gray-100 whitespace-pre-wrap shadow-sm leading-relaxed">
              {{ msg.content }}
            </div>

            <!-- Assistant 气泡 -->
            <div v-else-if="msg.role === 'assistant'" class="w-full flex flex-col gap-3">
              
              <!-- 思考过程 (思维链) -->
              <div 
                v-if="msg.reasoning_content" 
                class="border-r-2 border-purple-500/40 bg-purple-500/5 px-4 py-2.5 rounded-none"
              >
                <div class="flex items-center justify-end gap-1.5 text-xs text-purple-400/90 font-bold mb-1.5 select-none">
                  <Brain class="w-3.5 h-3.5 animate-pulse" />
                  思维链 (Thinking Process)
                </div>
                <div class="text-xs text-purple-300/80 font-mono whitespace-pre-wrap leading-relaxed text-left">
                  {{ msg.reasoning_content }}
                </div>
              </div>

              <!-- 回答正文 -->
              <div class="bg-white/5 border border-white/10 px-5 py-4 rounded-none text-sm text-gray-200 leading-relaxed shadow-sm">
                <div class="markdown-content" v-html="renderMarkdown(msg.content || '')"></div>
                
                <!-- 底部操作栏：复制 & 下载 & Token消耗/花费 -->
                <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs text-gray-400 select-none">
                  <div class="flex items-center gap-4">
                    <button 
                      @click="handleCopyMessage(msg.content || '', index)"
                      class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      title="复制全文"
                    >
                      <Check v-if="copiedIndices[index]" class="w-3.5 h-3.5 text-green-400" />
                      <Copy v-else class="w-3.5 h-3.5" />
                      <span>{{ copiedIndices[index] ? '已复制' : '复制' }}</span>
                    </button>
                    <button 
                      @click="handleDownloadMessage(msg.content || '', index)"
                      class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      title="下载为 Markdown 文件"
                    >
                      <Download class="w-3.5 h-3.5" />
                      <span>下载</span>
                    </button>
                  </div>
                  <div v-if="(msg as any).usage" class="text-[11px] text-gray-500 font-mono flex items-center gap-2">
                    <span 
                      :title="`输入: ${(msg as any).usage.prompt_tokens} | 输出: ${(msg as any).usage.completion_tokens}${ (msg as any).usage.prompt_cache_hit_tokens ? ' | 缓存命中: ' + (msg as any).usage.prompt_cache_hit_tokens : '' }${ (msg as any).usage.completion_tokens_details?.reasoning_tokens ? ' | 思考: ' + (msg as any).usage.completion_tokens_details.reasoning_tokens : '' }`"
                      class="cursor-help hover:text-gray-400 transition-colors"
                    >
                      Tokens: <span class="text-gray-400 font-bold">{{ (msg as any).usage.total_tokens }}</span>
                    </span>
                    <span class="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                    <span>
                      花费: <span class="text-blue-400 font-bold">¥{{ formatCost(calculateCost((msg as any).model || settings.model, (msg as any).usage)) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== 正在流式生成的临时气泡 ==================== -->
          <div v-if="loading && (streamingThinking || streamingContent)" class="w-full flex flex-col gap-3 self-end">
            
            <!-- 正在流式输出的思考过程 -->
            <div 
              v-if="streamingThinking" 
              class="border-r-2 border-purple-500/40 bg-purple-500/5 px-4 py-2.5 rounded-none"
            >
              <div class="flex items-center justify-end gap-1.5 text-xs text-purple-400/90 font-bold mb-1.5 select-none">
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
                思考中...
              </div>
              <div class="text-xs text-purple-300/80 font-mono whitespace-pre-wrap leading-relaxed text-left" :class="[!streamingContent ? 'thinking-cursor' : '']">
                {{ streamingThinking }}
              </div>
            </div>

            <!-- 正在流式输出的最终回答 -->
            <div 
              v-if="streamingContent" 
              class="bg-white/5 border border-white/10 px-5 py-4 rounded-none text-sm text-gray-200 leading-relaxed shadow-sm"
            >
              <div class="markdown-content typing-cursor" v-html="renderMarkdown(streamingContent)"></div>
              
              <!-- 底部操作栏：复制 & 下载 -->
              <div class="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/5 text-xs text-gray-400 select-none">
                <button 
                  @click="handleCopyMessage(streamingContent, -1)"
                  class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  title="复制全文"
                >
                  <Check v-if="copiedIndices[-1]" class="w-3.5 h-3.5 text-green-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                  <span>{{ copiedIndices[-1] ? '已复制' : '复制' }}</span>
                </button>
                <button 
                  @click="handleDownloadMessage(streamingContent, -1)"
                  class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  title="下载为 Markdown 文件"
                >
                  <Download class="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部输入框 -->
      <div class="p-3 sm:p-6 border-t border-white/10 shrink-0 z-10 bg-[#080b11]/85 backdrop-blur-md">
        <div class="flex gap-2 sm:gap-3 items-center">
          <div class="flex-1 relative">
            <textarea 
              v-model="inputMessage" 
              rows="1" 
              class="block w-full glass-input text-sm text-white rounded-none px-3 sm:px-4 py-2.5 sm:py-3 pr-10 resize-none"
              placeholder="向 DeepSeek 发起提问..."
              :disabled="loading"
            ></textarea>
          </div>

          <!-- 发送 & 停止 按钮 -->
          <button 
            v-if="loading"
            type="button" 
            @click="handleStop"
            class="h-[42px] sm:h-[46px] px-4 sm:px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50 font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span class="w-2.5 h-2.5 bg-red-500 rounded-none animate-pulse"></span>
            <span class="hidden sm:inline">停止生成</span>
          </button>
          
          <button 
            v-else
            type="button" 
            @click="handleSend"
            :disabled="!inputMessage.trim()"
            class="h-[42px] sm:h-[46px] px-4 sm:px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-none shadow-lg shadow-blue-500/15 disabled:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send class="w-4 h-4" />
            <span class="hidden sm:inline">发送请求</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 额外精细控制 */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}
</style>
