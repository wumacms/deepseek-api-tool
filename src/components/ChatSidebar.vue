<script setup lang="ts">
import type { AppSettings } from '../composables/useSettings';
import type { ChatCompletionUsage } from '../services/deepseek/types';
import {
  Sliders,
  Eye,
  EyeOff,
} from '@lucide/vue';

defineProps<{
  settings: AppSettings;
  isKeyVisible: boolean;
  isSidebarCollapsed: boolean;
  latestUsage: ChatCompletionUsage | null;
}>();

const emit = defineEmits<{
  'update:isKeyVisible': [value: boolean];
}>();
</script>

<template>
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
          :value="settings.apiKey"
          @input="settings.apiKey = ($event.target as HTMLInputElement).value"
          placeholder="sk-..."
          class="w-full glass-input text-sm text-white rounded-none px-3 py-2 pr-10"
        />
        <button
          @click="emit('update:isKeyVisible', !isKeyVisible)"
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
        :value="settings.baseURL"
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
</template>
