<script setup lang="ts">
import { Search, Trash2, Plus } from '@lucide/vue';
import type { SessionMeta } from '../types/chat';

defineProps<{
  sessions: SessionMeta[];
  activeSessionId: string;
  searchQuery: string;
}>();

const emit = defineEmits<{
  'create-session': [];
  'switch-session': [id: string];
  'delete-session': [id: string];
  'update:searchQuery': [value: string];
}>();

// 格式化时间为相对日期
function formatTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    // 今天，显示时间
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 分组标签
function getGroupLabel(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return '最近 7 天';
  if (days < 30) return '最近 30 天';
  return '更早';
}

// 对会话进行分组
function groupSessions(list: SessionMeta[]): { label: string; items: SessionMeta[] }[] {
  const groups: Map<string, SessionMeta[]> = new Map();
  const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const session of sorted) {
    const label = getGroupLabel(session.updatedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(session);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function handleDelete(e: Event, id: string) {
  e.stopPropagation();
  if (confirm('确定要删除此会话吗？此操作不可撤销。')) {
    emit('delete-session', id);
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 h-full">
    <!-- 顶部操作栏 -->
    <div class="flex gap-2">
      <button
        @click="emit('create-session')"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        新建会话
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="relative">
      <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
      <input
        type="text"
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        placeholder="搜索对话..."
        class="w-full glass-input text-xs text-foreground pl-8 pr-3 py-2"
      />
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto -mx-1 px-1 flex flex-col gap-0.5">
      <template v-if="sessions.length === 0">
        <div class="text-center text-xs text-muted-foreground/60 py-8">
          {{ searchQuery ? '未找到匹配的对话' : '暂无对话记录' }}
        </div>
      </template>

      <template v-else>
        <div v-for="group in groupSessions(sessions)" :key="group.label" class="mb-2">
          <!-- 分组标签 -->
          <div class="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider px-2 py-1.5 select-none">
            {{ group.label }}
          </div>

          <!-- 会话条目 -->
          <div
            v-for="session in group.items"
            :key="session.id"
            @click="emit('switch-session', session.id)"
            class="group w-full text-left px-2.5 py-2.5 flex items-start gap-2 transition-all duration-200 cursor-pointer relative border-l-2"
            :class="[
              session.id === activeSessionId
                ? 'bg-[var(--glass-bg)] border-[var(--primary)]'
                : 'bg-transparent border-transparent hover:bg-[var(--glass-input-bg)]'
            ]"
          >
            <div class="flex-1 min-w-0">
              <div 
                class="text-xs font-medium text-foreground truncate transition-colors duration-200" 
                :class="[session.id === activeSessionId ? 'text-[var(--primary)] font-semibold' : 'group-hover:text-[var(--primary)]']"
              >
                {{ session.title }}
              </div>
              <div class="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1.5 transition-colors duration-200 group-hover:text-muted-foreground">
                <span>{{ formatTime(session.updatedAt) }}</span>
                <span class="w-1 h-1 bg-[var(--border)] rounded-full"></span>
                <span>{{ session.messageCount }} 条消息</span>
              </div>
            </div>

            <!-- 删除按钮 -->
            <button
              @click="handleDelete($event, session.id)"
              class="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-[var(--destructive)] transition-all duration-200 shrink-0 cursor-pointer"
              title="删除此会话"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
