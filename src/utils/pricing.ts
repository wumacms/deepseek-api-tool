import type { ChatCompletionUsage } from '../services/deepseek/types';

// ==================== 模型价格映射表 ====================

interface PricingTier {
  /** 缓存命中价格：元 / 百万 tokens */
  hitRate: number;
  /** 缓存未命中价格：元 / 百万 tokens */
  missRate: number;
  /** 输出价格：元 / 百万 tokens */
  outputRate: number;
}

/**
 * 精确的模型名 → 价格映射，避免 includes() 子串匹配的脆弱性。
 * 未知模型会 fallback 到 flash 价格。
 */
const MODEL_PRICING: Record<string, PricingTier> = {
  'deepseek-v4-pro': { hitRate: 0.025, missRate: 3.0, outputRate: 6.0 },
  'deepseek-v4-flash': { hitRate: 0.02, missRate: 1.0, outputRate: 2.0 },
  'deepseek-chat': { hitRate: 0.02, missRate: 1.0, outputRate: 2.0 },
  'deepseek-reasoner': { hitRate: 0.025, missRate: 3.0, outputRate: 6.0 },
};

const DEFAULT_PRICING: PricingTier = { hitRate: 0.02, missRate: 1.0, outputRate: 2.0 };

/**
 * 计算单次对话的 Token 费用（人民币）
 */
export function calculateCost(model: string, usage: ChatCompletionUsage | undefined): number {
  if (!usage) return 0;

  const tier = MODEL_PRICING[model] || DEFAULT_PRICING;

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  // 获取缓存命中的 token 数
  let hitTokens = 0;
  if (typeof usage.prompt_cache_hit_tokens === 'number') {
    hitTokens = usage.prompt_cache_hit_tokens;
  } else if (usage.prompt_tokens_details && typeof usage.prompt_tokens_details.cached_tokens === 'number') {
    hitTokens = usage.prompt_tokens_details.cached_tokens;
  }

  const missTokens = Math.max(0, promptTokens - hitTokens);

  return (hitTokens * tier.hitRate + missTokens * tier.missRate + completionTokens * tier.outputRate) / 1_000_000;
}

/**
 * 将费用数值格式化为可读字符串
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '0.00';
  if (cost < 0.0001) return cost.toFixed(6);
  if (cost < 0.01) return cost.toFixed(5);
  return cost.toFixed(4);
}
