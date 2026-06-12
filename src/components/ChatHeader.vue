<script setup lang="ts">
import {
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from '@lucide/vue';

defineProps<{
  apiKey: string;
  model: string;
  isSidebarCollapsed: boolean;
}>();

const emit = defineEmits<{
  'toggle-sidebar': [];
  'clear-history': [];
}>();

const handleClear = () => {
  if (confirm('确定要清空所有对话记录吗？此操作不可撤销。')) {
    emit('clear-history');
  }
};
</script>

<template>
  <div class="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggle-sidebar')"
        class="text-gray-400 hover:text-white p-1.5 rounded-none hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center mr-0.5"
        :title="isSidebarCollapsed ? '展开配置栏' : '折叠配置栏'"
      >
        <PanelLeftOpen v-if="isSidebarCollapsed" class="w-4.5 h-4.5" />
        <PanelLeftClose v-else class="w-4.5 h-4.5" />
      </button>
      <div class="w-2.5 h-2.5 rounded-none shrink-0" :class="[apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]']"></div>
      <div>
        <h1 class="text-base font-bold text-white tracking-wide">DeepSeek Chat 沙箱</h1>
        <p class="text-xs text-gray-400 hidden sm:block" v-if="apiKey">已连接至 DeepSeek API ({{ model }})</p>
        <p class="text-xs text-red-400/80 hidden sm:block" v-else>未配置 API Key，请先配置以激活</p>
      </div>
    </div>

    <button
      @click="handleClear"
      class="text-xs font-semibold text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-none hover:bg-red-600/20 border border-white/5 hover:border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
    >
      <Trash2 class="w-3.5 h-3.5" />
      <span class="hidden sm:inline">清空历史</span>
    </button>
  </div>
</template>
