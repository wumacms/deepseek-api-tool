<script setup lang="ts">
import {
  Loader2,
  Copy,
  Download,
  Check,
} from '@lucide/vue';
import { renderMarkdown } from '../utils/markdown';

defineProps<{
  streamingThinking: string;
  streamingContent: string;
  copiedIndices: Record<number, boolean>;
}>();

const emit = defineEmits<{
  'copy-message': [text: string, index: number];
  'download-message': [text: string, index: number];
}>();
</script>

<template>
  <div class="w-full flex flex-col gap-3 self-end">

    <!-- 正在流式输出的思考过程 -->
    <div
      v-if="streamingThinking"
      class="border-r-2 border-[var(--thinking-border)] bg-[var(--thinking-bg)] px-4 py-2.5 rounded-none"
    >
      <div class="flex items-center justify-end gap-1.5 text-xs text-thinking/90 font-bold mb-1.5 select-none">
        <Loader2 class="w-3.5 h-3.5 animate-spin" />
        思考中...
      </div>
      <div class="text-xs text-thinking-foreground/80 font-mono whitespace-pre-wrap leading-relaxed text-left" :class="[!streamingContent ? 'thinking-cursor' : '']">
        {{ streamingThinking }}
      </div>
    </div>

    <!-- 正在流式输出的最终回答 -->
    <div
      v-if="streamingContent"
      class="bg-[var(--assistant-bg)] border border-[var(--assistant-border)] px-5 py-4 rounded-none text-sm text-[var(--assistant-text)] leading-relaxed shadow-sm"
    >
      <div class="markdown-content typing-cursor" v-html="renderMarkdown(streamingContent)"></div>

      <!-- 底部操作栏 -->
      <div class="flex items-center gap-4 mt-3 pt-2.5 border-t border-border/20 text-xs text-muted-foreground select-none">
        <button
          @click="emit('copy-message', streamingContent, -1)"
          class="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
          title="复制全文"
        >
          <Check v-if="copiedIndices[-1]" class="w-3.5 h-3.5 text-success" />
          <Copy v-else class="w-3.5 h-3.5" />
          <span>{{ copiedIndices[-1] ? '已复制' : '复制' }}</span>
        </button>
        <button
          @click="emit('download-message', streamingContent, -1)"
          class="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
          title="下载为 Markdown 文件"
        >
          <Download class="w-3.5 h-3.5" />
          <span>下载</span>
        </button>
      </div>
    </div>
  </div>
</template>
