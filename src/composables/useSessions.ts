import { ref, computed } from 'vue';
import type { ChatSession, SessionMeta, DisplayMessage } from '../types/chat';
import { generateId } from '../types/chat';

const SESSIONS_INDEX_KEY = 'deepseek_sessions_index';
const SESSION_DATA_PREFIX = 'deepseek_session_';
const ACTIVE_SESSION_KEY = 'deepseek_active_session';
const LEGACY_MESSAGES_KEY = 'deepseek_chat_messages';

/**
 * 多会话管理 Composable
 * - 会话 CRUD（创建/读取/删除/切换）
 * - 索引与数据分离存储
 * - 旧单会话数据自动迁移
 * - 标题搜索
 */
export function useSessions() {
  // ==================== 状态 ====================
  const sessions = ref<SessionMeta[]>(loadIndex());
  const activeSessionId = ref<string>(loadActiveId());
  const searchQuery = ref('');

  // ==================== 初始化 & 迁移 ====================
  migrateFromLegacy();

  // 如果没有任何会话，创建一个默认会话
  if (sessions.value.length === 0) {
    const newSession = createSessionData('deepseek-v4-flash');
    saveSessionData(newSession);
    sessions.value.push(toMeta(newSession));
    activeSessionId.value = newSession.id;
    saveIndex();
    saveActiveId();
  }

  // 确保 activeSessionId 有效
  if (!sessions.value.find(s => s.id === activeSessionId.value)) {
    activeSessionId.value = sessions.value[0].id;
    saveActiveId();
  }

  // ==================== 计算属性 ====================
  const activeSession = computed(() =>
    sessions.value.find(s => s.id === activeSessionId.value) || sessions.value[0]
  );

  const filteredSessions = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return sessions.value;
    return sessions.value.filter(s => s.title.toLowerCase().includes(q));
  });

  // ==================== 索引持久化 ====================
  function loadIndex(): SessionMeta[] {
    try {
      const raw = localStorage.getItem(SESSIONS_INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveIndex() {
    localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(sessions.value));
  }

  function loadActiveId(): string {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || '';
  }

  function saveActiveId() {
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId.value);
  }

  // ==================== 会话数据持久化 ====================
  function loadSessionData(id: string): ChatSession | null {
    try {
      const raw = localStorage.getItem(SESSION_DATA_PREFIX + id);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveSessionData(session: ChatSession) {
    localStorage.setItem(SESSION_DATA_PREFIX + session.id, JSON.stringify(session));
  }

  function deleteSessionData(id: string) {
    localStorage.removeItem(SESSION_DATA_PREFIX + id);
  }

  // ==================== 工具函数 ====================
  function createSessionData(model: string): ChatSession {
    return {
      id: generateId(),
      title: '新的对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model,
      messageCount: 0,
    };
  }

  function toMeta(session: ChatSession): SessionMeta {
    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      model: session.model,
      messageCount: session.messageCount,
    };
  }

  // ==================== 旧数据迁移 ====================
  function migrateFromLegacy() {
    const legacy = localStorage.getItem(LEGACY_MESSAGES_KEY);
    if (!legacy) return;

    try {
      const messages: DisplayMessage[] = JSON.parse(legacy);
      if (messages.length === 0) {
        localStorage.removeItem(LEGACY_MESSAGES_KEY);
        return;
      }

      const session: ChatSession = {
        id: generateId(),
        title: extractTitle(messages),
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: 'deepseek-v4-flash',
        messageCount: messages.length,
      };

      saveSessionData(session);
      sessions.value.push(toMeta(session));
      activeSessionId.value = session.id;
      saveIndex();
      saveActiveId();
      localStorage.removeItem(LEGACY_MESSAGES_KEY);

      console.log('已从旧版单会话数据迁移:', session.title);
    } catch (err) {
      console.error('旧数据迁移失败:', err);
      localStorage.removeItem(LEGACY_MESSAGES_KEY);
    }
  }

  function extractTitle(messages: DisplayMessage[]): string {
    const firstUser = messages.find(m => m.role === 'user');
    if (firstUser && firstUser.content) {
      return firstUser.content.slice(0, 30).replace(/\n/g, ' ').trim() || '新的对话';
    }
    return '新的对话';
  }

  // ==================== 公开操作 ====================

  /**
   * 创建新会话并切换为活跃
   */
  function createSession(model: string): ChatSession {
    const session = createSessionData(model);
    saveSessionData(session);
    sessions.value.unshift(toMeta(session));
    activeSessionId.value = session.id;
    saveIndex();
    saveActiveId();
    return session;
  }

  /**
   * 切换到指定会话
   */
  function switchSession(id: string): DisplayMessage[] {
    const session = loadSessionData(id);
    if (!session) return [];
    activeSessionId.value = id;
    saveActiveId();
    return session.messages;
  }

  /**
   * 删除指定会话
   */
  function deleteSession(id: string) {
    deleteSessionData(id);
    sessions.value = sessions.value.filter(s => s.id !== id);
    saveIndex();

    // 如果删除的是活跃会话，切换到第一个
    if (activeSessionId.value === id) {
      if (sessions.value.length === 0) {
        // 没有会话了，创建一个新的
        const newSession = createSessionData('deepseek-v4-flash');
        saveSessionData(newSession);
        sessions.value.push(toMeta(newSession));
        saveIndex();
      }
      activeSessionId.value = sessions.value[0].id;
      saveActiveId();
    }
  }

  /**
   * 保存当前会话的消息（由 useChat 在关键节点调用）
   */
  function saveCurrentSession(messages: DisplayMessage[], model?: string) {
    const id = activeSessionId.value;
    const existing = loadSessionData(id);

    const session: ChatSession = {
      id,
      title: existing?.title || '新的对话',
      messages,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      model: model || existing?.model || 'deepseek-v4-flash',
      messageCount: messages.length,
    };

    // 自动标题：当之前是默认标题、且有用户消息时，更新标题
    if (session.title === '新的对话' && messages.length > 0) {
      session.title = extractTitle(messages);
    }

    saveSessionData(session);

    // 更新索引
    const idx = sessions.value.findIndex(s => s.id === id);
    const meta = toMeta(session);
    if (idx >= 0) {
      sessions.value[idx] = meta;
    } else {
      sessions.value.unshift(meta);
    }
    saveIndex();
  }

  /**
   * 更新会话标题
   */
  function renameSession(id: string, newTitle: string) {
    const session = loadSessionData(id);
    if (session) {
      session.title = newTitle;
      saveSessionData(session);
    }
    const idx = sessions.value.findIndex(s => s.id === id);
    if (idx >= 0) {
      sessions.value[idx] = { ...sessions.value[idx], title: newTitle };
      saveIndex();
    }
  }

  /**
   * 加载指定会话的消息
   */
  function loadSessionMessages(id: string): DisplayMessage[] {
    const session = loadSessionData(id);
    return session?.messages || [];
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    searchQuery,
    filteredSessions,
    createSession,
    switchSession,
    deleteSession,
    saveCurrentSession,
    renameSession,
    loadSessionMessages,
  };
}
