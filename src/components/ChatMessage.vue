<script setup lang="ts">
import {
  Brain,
  Copy,
  Download,
  Check,
} from '@lucide/vue';
import { renderMarkdownCached } from '../utils/markdown';
import { calculateCost, formatCost } from '../utils/pricing';
import type { DisplayMessage } from '../types/chat';

defineProps<{
  msg: DisplayMessage;
  index: number;
  copiedIndices: Record<number, boolean>;
  currentModel: string;
}>();

const emit = defineEmits<{
  'copy-message': [text: string, index: number];
  'download-message': [text: string, index: number];
}>();
</script>

<template>
  <div class="flex flex-col gap-2 items-end">
    <!-- 用户气泡 -->
    <div
      v-if="msg.role === 'user'"
      class="max-w-[85%] sm:max-w-[70%] bg-blue-600/20 border border-blue-500/30 px-4 py-2.5 rounded-none text-sm text-gray-100 whitespace-pre-wrap shadow-sm leading-relaxed"
    >
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
        <div
          class="text-xs text-purple-300/80 font-mono whitespace-pre-wrap leading-relaxed text-left markdown-content"
          v-html="renderMarkdownCached(msg.reasoning_content)"
        ></div>
      </div>

      <!-- 回答正文 -->
      <div class="bg-white/5 border border-white/10 px-5 py-4 rounded-none text-sm text-gray-200 leading-relaxed shadow-sm">
        <!-- 中断标记 -->
        <div v-if="msg.interrupted" class="text-[10px] text-amber-400/80 mb-2 flex items-center gap-1 select-none">
          <span class="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
          回答已被中断
        </div>

        <div class="markdown-content" v-html="renderMarkdownCached(msg.content || '')"></div>

        <!-- 底部操作栏 -->
        <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs text-gray-400 select-none">
          <div class="flex items-center gap-4">
            <button
              @click="emit('copy-message', msg.content || '', index)"
              class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="复制全文"
            >
              <Check v-if="copiedIndices[index]" class="w-3.5 h-3.5 text-green-400" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedIndices[index] ? '已复制' : '复制' }}</span>
            </button>
            <button
              @click="emit('download-message', msg.content || '', index)"
              class="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="下载为 Markdown 文件"
            >
              <Download class="w-3.5 h-3.5" />
              <span>下载</span>
            </button>
          </div>
          <div v-if="msg.usage" class="text-[11px] text-gray-500 font-mono flex items-center gap-2">
            <span
              :title="`输入: ${msg.usage.prompt_tokens} | 输出: ${msg.usage.completion_tokens}${ msg.usage.prompt_cache_hit_tokens ? ' | 缓存命中: ' + msg.usage.prompt_cache_hit_tokens : '' }${ msg.usage.completion_tokens_details?.reasoning_tokens ? ' | 思考: ' + msg.usage.completion_tokens_details.reasoning_tokens : '' }`"
              class="cursor-help hover:text-gray-400 transition-colors"
            >
              Tokens: <span class="text-gray-400 font-bold">{{ msg.usage.total_tokens }}</span>
            </span>
            <span class="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
            <span>
              花费: <span class="text-blue-400 font-bold">¥{{ formatCost(calculateCost(msg.model || currentModel, msg.usage)) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
