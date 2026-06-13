<script setup lang="ts">
import { Send } from '@lucide/vue';
import { ref, watch, nextTick } from 'vue';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  send: [text: string];
  stop: [];
}>();

const inputMessage = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// 跟踪输入法组合状态，防止中文拼音输入时 Enter 键误触发发送
const isComposing = ref(false);

// 自动增高逻辑
const adjustHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
      const maxHeight = 160; // ~6行
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, maxHeight) + 'px';
    }
  });
};

watch(inputMessage, adjustHeight);

const handleSend = () => {
  const text = inputMessage.value.trim();
  if (!text) return;
  emit('send', text);
  inputMessage.value = '';
  nextTick(adjustHeight);
};

const handleKeydown = (e: KeyboardEvent) => {
  // 输入法正在组合中（如中文拼音输入），忽略 Enter 键
  if (isComposing.value) return;
  // Enter 发送, Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div class="p-3 sm:p-6 border-t border-border/40 shrink-0 z-10 bg-[var(--header-bg)] backdrop-blur-md">
    <div class="flex gap-2 sm:gap-3 items-end">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputMessage"
          rows="1"
          class="block w-full glass-input text-sm text-foreground rounded-none px-3 sm:px-4 py-2.5 sm:py-3 pr-10 resize-none"
          placeholder="向 DeepSeek 发起提问... (Enter 发送, Shift+Enter 换行)"
          :disabled="loading"
          @keydown="handleKeydown"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        ></textarea>
      </div>

      <!-- 停止 按钮 -->
      <button
        v-if="loading"
        type="button"
        @click="emit('stop')"
        class="h-[42px] sm:h-[46px] px-4 sm:px-6 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 hover:border-destructive/50 font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
      >
        <span class="w-2.5 h-2.5 bg-destructive rounded-none animate-pulse"></span>
        <span class="hidden sm:inline">停止生成</span>
      </button>

      <!-- 发送 按钮 -->
      <button
        v-else
        type="button"
        @click="handleSend"
        :disabled="!inputMessage.trim()"
        class="h-[42px] sm:h-[46px] px-4 sm:px-6 bg-primary hover:bg-primary/85 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold rounded-none shadow-lg shadow-primary/15 disabled:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
      >
        <Send class="w-4 h-4" />
        <span class="hidden sm:inline">发送请求</span>
      </button>
    </div>
  </div>
</template>
