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
import ThemeSwitcher from './ThemeSwitcher.vue';

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
  <div class="h-16 border-b border-border/40 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0 bg-[var(--header-bg)] backdrop-blur-md">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <!-- 侧边栏开关 -->
      <button
        @click="emit('toggle-sidebar')"
        class="text-muted-foreground hover:text-foreground p-1.5 rounded-none hover:bg-accent transition-all cursor-pointer flex items-center justify-center mr-0.5 shrink-0"
        :title="isSidebarCollapsed ? '展开配置栏' : '折叠配置栏'"
      >
        <PanelLeftOpen v-if="isSidebarCollapsed" class="w-4.5 h-4.5" />
        <PanelLeftClose v-else class="w-4.5 h-4.5" />
      </button>

      <!-- 连接状态点 -->
      <div class="w-2 h-2 rounded-none shrink-0" :class="[apiKey ? 'bg-success shadow-[0_0_8px_var(--success)]' : 'bg-destructive shadow-[0_0_8px_var(--destructive)]']"></div>

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
            class="glass-input text-sm text-foreground rounded-none px-2 py-0.5 w-full focus:outline-none"
          />
        </div>
        <div v-else class="group flex items-center gap-1.5 min-w-0 max-w-full">
          <h1
            @dblclick="startEditing"
            class="text-sm sm:text-base font-bold text-foreground tracking-wide truncate cursor-pointer hover:text-primary transition-colors"
            title="双击重命名会话"
          >
            {{ activeSessionTitle }}
          </h1>
          <button
            @click="startEditing"
            class="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all shrink-0 cursor-pointer"
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
        class="text-xs font-semibold text-primary px-3 py-1.5 rounded-none bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all flex items-center gap-1 cursor-pointer"
        title="新建对话"
      >
        <Plus class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">新建会话</span>
      </button>

      <!-- 主题切换按钮 (深色/浅色 + 颜色主题) -->
      <ThemeSwitcher />

      <!-- 更多操作下拉菜单 -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="showMenu = !showMenu"
          class="p-1.5 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-accent rounded-none transition-all cursor-pointer flex items-center justify-center"
          title="更多操作"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        <!-- 下拉菜单浮层 -->
        <div
          v-if="showMenu"
          class="absolute right-0 mt-1.5 w-40 rounded-none shadow-xl border border-border py-1 z-50 bg-popover/95 backdrop-blur-md"
        >
          <button
            @click="handleClearCurrent"
            class="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            清空当前对话
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
