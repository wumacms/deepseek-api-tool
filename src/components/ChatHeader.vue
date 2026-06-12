<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import {
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Edit2,
  MoreVertical,
} from '@lucide/vue';

const props = defineProps<{
  apiKey: string;
  model: string;
  isSidebarCollapsed: boolean;
  activeSessionId: string;
  activeSessionTitle: string;
}>();

const emit = defineEmits<{
  'toggle-sidebar': [];
  'create-session': [];
  'clear-current-chat': [];
  'rename-session': [id: string, title: string];
}>();

const isEditing = ref(false);
const editTitle = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const showMenu = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// 启动编辑
const startEditing = () => {
  editTitle.value = props.activeSessionTitle;
  isEditing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

// 保存编辑
const saveEdit = () => {
  const title = editTitle.value.trim();
  if (title && title !== props.activeSessionTitle) {
    emit('rename-session', props.activeSessionId, title);
  }
  isEditing.value = false;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};

const handleClearCurrent = () => {
  if (confirm('确定要清空当前会话的所有对话记录吗？此操作不可撤销。')) {
    emit('clear-current-chat');
  }
  showMenu.value = false;
};

// 点击外部关闭下拉菜单
const handleOutsideClick = (e: MouseEvent) => {
  if (showMenu.value && dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <div class="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0 bg-[#080b11]/80 backdrop-blur-md">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <!-- 侧边栏开关 -->
      <button
        @click="emit('toggle-sidebar')"
        class="text-gray-400 hover:text-white p-1.5 rounded-none hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center mr-0.5 shrink-0"
        :title="isSidebarCollapsed ? '展开配置栏' : '折叠配置栏'"
      >
        <PanelLeftOpen v-if="isSidebarCollapsed" class="w-4.5 h-4.5" />
        <PanelLeftClose v-else class="w-4.5 h-4.5" />
      </button>

      <!-- 连接状态点 -->
      <div class="w-2 h-2 rounded-none shrink-0" :class="[apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]']"></div>

      <!-- 会话标题区域 -->
      <div class="flex-1 min-w-0 flex items-center gap-2">
        <div v-if="isEditing" class="flex items-center gap-1.5 max-w-[280px] sm:max-w-[400px] w-full">
          <input
            ref="inputRef"
            type="text"
            v-model="editTitle"
            @keydown.enter="saveEdit"
            @keydown.esc="cancelEdit"
            @blur="saveEdit"
            class="glass-input text-sm text-white rounded-none px-2 py-0.5 w-full focus:outline-none border-blue-500/50"
          />
        </div>
        <div v-else class="group flex items-center gap-1.5 min-w-0 max-w-full">
          <h1
            @dblclick="startEditing"
            class="text-sm sm:text-base font-bold text-white tracking-wide truncate cursor-pointer hover:text-blue-300 transition-colors"
            title="双击重命名会话"
          >
            {{ activeSessionTitle }}
          </h1>
          <button
            @click="startEditing"
            class="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-400 transition-all shrink-0 cursor-pointer"
            title="重命名会话"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="flex items-center gap-2 shrink-0 ml-2">
      <!-- 新建会话 -->
      <button
        @click="emit('create-session')"
        class="text-xs font-semibold text-blue-400 hover:text-white px-3 py-1.5 rounded-none bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 transition-all flex items-center gap-1 cursor-pointer"
        title="新建对话"
      >
        <Plus class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">新建会话</span>
      </button>

      <!-- 更多操作下拉菜单 -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="showMenu = !showMenu"
          class="p-1.5 text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 rounded-none transition-all cursor-pointer flex items-center justify-center"
          title="更多操作"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        <!-- 下拉菜单浮层 -->
        <div
          v-if="showMenu"
          class="absolute right-0 mt-1.5 w-40 glass-panel rounded-none shadow-xl border border-white/10 py-1 z-50 bg-[#0c101b]/95 backdrop-blur-md"
        >
          <button
            @click="handleClearCurrent"
            class="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            清空当前对话
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
