// DeepSeek Chat pricing (USD per 1M tokens) — deepseek-chat, cache miss
// https://api-docs.deepseek.com/quick_start/pricing
export const DEEPSEEK_CHAT_INPUT_PER_M = 0.27;
export const DEEPSEEK_CHAT_OUTPUT_PER_M = 1.1;

export function estimateDeepSeekCostUsd(
  promptTokens: number,
  completionTokens: number
): number {
  const inputCost = (promptTokens / 1_000_000) * DEEPSEEK_CHAT_INPUT_PER_M;
  const outputCost = (completionTokens / 1_000_000) * DEEPSEEK_CHAT_OUTPUT_PER_M;
  return Number((inputCost + outputCost).toFixed(6));
}

export const USAGE_REPORT_INTERVAL_USD = 10;
export const DEFAULT_LOW_BALANCE_USD = 5;
