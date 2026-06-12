import type { ChatCompletionUsage, ChatCompletionMessageParam } from '../services/deepseek/types';

/**
 * 扩展的显示消息类型，在 API 原始类型基础上增加了 UI 展示所需的元数据字段。
 * 解决 App.vue 中大量 `as any` 类型逃生舱问题。
 */
export interface DisplayMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  reasoning_content?: string;
  /** 模型名称，仅 assistant 消息携带 */
  model?: string;
  /** Token 用量，仅 assistant 消息携带 */
  usage?: ChatCompletionUsage;
  /** 是否被用户中断生成 */
  interrupted?: boolean;
  /** 工具调用相关（保留兼容性） */
  tool_call_id?: string;
  name?: string;
}

/**
 * 将 DisplayMessage 转换为 API 请求可用的 ChatCompletionMessageParam。
 * 剥离 UI 专属字段 (model, usage, interrupted)。
 */
export function toAPIMessage(msg: DisplayMessage): ChatCompletionMessageParam {
  if (msg.role === 'system') {
    return { role: 'system', content: msg.content };
  }
  if (msg.role === 'user') {
    return { role: 'user', content: msg.content };
  }
  if (msg.role === 'tool') {
    return { role: 'tool', content: msg.content, tool_call_id: msg.tool_call_id || '' };
  }
  // assistant
  return {
    role: 'assistant',
    content: msg.content || null,
    reasoning_content: msg.reasoning_content || undefined,
  };
}
