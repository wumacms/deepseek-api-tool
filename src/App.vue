<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { MessageSquare } from '@lucide/vue';

// Composables
import { useSettings } from './composables/useSettings';
import { useSessions } from './composables/useSessions';
import { useChat } from './composables/useChat';

// Components
import ChatSidebar from './components/ChatSidebar.vue';
import ChatHeader from './components/ChatHeader.vue';
import ChatMessage from './components/ChatMessage.vue';
import ChatInput from './components/ChatInput.vue';
import StreamingMessage from './components/StreamingMessage.vue';

// ==================== 设置 ====================
const { settings, isKeyVisible } = useSettings();

// ==================== 会话管理 ====================
const {
  activeSessionId,
  activeSession,
  searchQuery,
  filteredSessions,
  createSession,
  deleteSession,
  saveCurrentSession,
  renameSession,
  loadSessionMessages,
} = useSessions();

// ==================== 侧边栏折叠 ====================
const isSidebarCollapsed = ref(localStorage.getItem('deepseek_sidebar_collapsed') === 'true');

watch(isSidebarCollapsed, (newVal) => {
  localStorage.setItem('deepseek_sidebar_collapsed', String(newVal));
});

// ==================== 对话状态 ====================
const chat = useChat(settings, (msgs) => {
  saveCurrentSession(msgs, settings.model);
});

const {
  messages,
  latestUsage,
  globalError,
  streamingThinking,
  streamingContent,
  copiedIndices,
  loading,
  handleSend,
  handleStop,
  clearHistory,
  handleCopyMessage,
  handleDownloadMessage,
  handleGlobalClick,
  scrollToBottom,
} = chat;

// 监听当前活跃会话 ID 变化，同步加载对应的会话消息
watch(activeSessionId, (newId) => {
  const msgs = loadSessionMessages(newId);
  chat.loadSession(msgs);
}, { immediate: true });

// ==================== 快捷提问 ====================
const setQuickInput = (text: string) => {
  handleSend(text);
};

// ==================== 生命周期 ====================
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

    <!-- 左侧配置面板 -->
    <ChatSidebar
      :settings="settings"
      :is-key-visible="isKeyVisible"
      :is-sidebar-collapsed="isSidebarCollapsed"
      :latest-usage="latestUsage"
      :sessions="filteredSessions"
      :active-session-id="activeSessionId"
      :search-query="searchQuery"
      @update:is-key-visible="isKeyVisible = $event"
      @update:search-query="searchQuery = $event"
      @create-session="createSession(settings.model)"
      @switch-session="activeSessionId = $event"
      @delete-session="deleteSession($event)"
    />

    <!-- 右侧对话主界面 -->
    <div class="flex-1 flex flex-col glass-panel rounded-none overflow-hidden relative">

      <!-- 顶部 Header -->
      <ChatHeader
        :api-key="settings.apiKey"
        :model="settings.model"
        :is-sidebar-collapsed="isSidebarCollapsed"
        :active-session-id="activeSessionId"
        :active-session-title="activeSession.title"
        @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
        @create-session="createSession(settings.model)"
        @clear-current-chat="clearHistory"
        @rename-session="renameSession"
      />

      <!-- 全局异常报错提示 -->
      <div
        v-if="globalError"
        class="mx-4 sm:mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-none flex justify-between items-center shrink-0"
      >
        <span>{{ globalError }}</span>
        <button @click="globalError = null" class="text-red-400 hover:text-white">✕</button>
      </div>

      <!-- 对话列表展示区域 -->
      <div
        :ref="(el: any) => { chat.chatContainerRef.value = el as HTMLDivElement; }"
        @click="handleGlobalClick"
        class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:gap-6"
      >
        <!-- 欢迎引导 -->
        <div
          v-if="messages.length === 0 && !streamingThinking && !streamingContent"
          class="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
          <div class="w-16 h-16 rounded-none bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 animate-pulse">
            <MessageSquare class="w-8 h-8 text-blue-400" />
          </div>
          <h3 class="text-lg font-bold text-white mb-1">DeepSeek 官方模型测试沙箱</h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            本沙箱直连官方 API。默认主打 <code class="px-1 py-0.5 rounded-none bg-white/5 border border-white/10 text-blue-400">deepseek-v4-pro</code> 模型。支持对思维链与正文流式输出的分别解析，以及多轮对话中的上下文拼装。
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button
              @click="setQuickInput('9.11和9.8哪个大？')"
              class="text-left text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 p-3 rounded-none transition-all"
            >
              <span class="text-blue-400 font-semibold block mb-0.5">测试数学/逻辑</span>
              <span class="text-gray-400">"9.11和9.8哪个大？"</span>
            </button>
            <button
              @click="setQuickInput('找出单词 strawberry 中有几个字母 r？')"
              class="text-left text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 p-3 rounded-none transition-all"
            >
              <span class="text-purple-400 font-semibold block mb-0.5">测试思维链细节</span>
              <span class="text-gray-400">"strawberry 中有几个 r？"</span>
            </button>
          </div>
        </div>

        <!-- 对话条目 -->
        <template v-else>
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="index"
            :msg="msg"
            :index="index"
            :copied-indices="copiedIndices"
            :current-model="settings.model"
            @copy-message="handleCopyMessage"
            @download-message="handleDownloadMessage"
          />

          <!-- 正在流式生成的临时气泡 -->
          <StreamingMessage
            v-if="loading && (streamingThinking || streamingContent)"
            :streaming-thinking="streamingThinking"
            :streaming-content="streamingContent"
            :copied-indices="copiedIndices"
            @copy-message="handleCopyMessage"
            @download-message="handleDownloadMessage"
          />
        </template>
      </div>

      <!-- 底部输入框 -->
      <ChatInput
        :loading="loading"
        @send="handleSend"
        @stop="handleStop"
      />
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
