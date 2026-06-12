export interface DeepSeekClientConfig {
  apiKey: string;
  baseURL?: string; // Default: 'https://api.deepseek.com'
  defaultModel?: string; // Default: 'deepseek-v4-pro'
}

export type ChatCompletionRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatCompletionSystemMessage {
  role: 'system';
  content: string;
  name?: string;
}

export interface ChatCompletionUserMessage {
  role: 'user';
  content: string;
  name?: string;
}

export interface ChatCompletionToolMessage {
  role: 'tool';
  content: string;
  tool_call_id: string;
}

export interface FunctionCall {
  name: string;
  arguments: string; // JSON string
}

export interface ChatCompletionMessageToolCall {
  id: string;
  type: 'function';
  function: FunctionCall;
}

export interface ChatCompletionAssistantMessage {
  role: 'assistant';
  content?: string | null;
  reasoning_content?: string | null; // Multi-turn reasoning continuation
  name?: string;
  tool_calls?: ChatCompletionMessageToolCall[];
}

export type ChatCompletionMessageParam =
  | ChatCompletionSystemMessage
  | ChatCompletionUserMessage
  | ChatCompletionAssistantMessage
  | ChatCompletionToolMessage;

export interface ChatCompletionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>; // JSON Schema
    strict?: boolean;
  };
}

export interface ChatCompletionRequest {
  messages: ChatCompletionMessageParam[];
  model?: string;
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  response_format?: {
    type: 'text' | 'json_object';
  };
  stop?: string | string[] | null;
  stream?: boolean;
  stream_options?: {
    include_usage?: boolean;
  } | null;
  temperature?: number;
  top_p?: number;
  tools?: ChatCompletionTool[] | null;
  tool_choice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };
  user?: string;
  user_id?: string; // Custom rate limit & KVCache isolation regex: [a-zA-Z0-9\-_]+, max 512 length
  thinking?: {
    type: 'enabled' | 'disabled';
  };
  reasoning_effort?: 'high' | 'max';
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens: number;
  };
  completion_tokens_details?: {
    reasoning_tokens: number;
  };
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      reasoning_content?: string | null;
      tool_calls?: ChatCompletionMessageToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'insufficient_system_resource';
  }>;
  usage?: ChatCompletionUsage;
}

export interface ChatCompletionDelta {
  role?: 'assistant';
  content?: string | null;
  reasoning_content?: string | null;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: 'function';
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: Array<{
    index: number;
    delta: ChatCompletionDelta;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'insufficient_system_resource' | null;
  }>;
  usage?: ChatCompletionUsage;
}

export interface StreamCallbacks {
  onThinkingChunk?: (text: string) => void;
  onContentChunk?: (text: string) => void;
  onDone?: (finalData: ChatCompletionResponse) => void;
  onError?: (err: Error) => void;
}
