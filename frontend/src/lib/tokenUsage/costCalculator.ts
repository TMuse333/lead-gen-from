// src/lib/tokenUsage/costCalculator.ts
// Calculate costs based on OpenAI pricing

/**
 * OpenAI pricing per 1M tokens (as of 2024)
 */
const PRICING: Record<string, { input: number; output: number; embedding?: number }> = {
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000,
    output: 0.60 / 1_000_000,
  },
  'gpt-4o': {
    input: 2.50 / 1_000_000,
    output: 10.00 / 1_000_000,
  },
  'text-embedding-3-small': {
    input: 0,
    output: 0,
    embedding: 0.02 / 1_000_000,
  },
  'text-embedding-ada-002': {
    input: 0,
    output: 0,
    embedding: 0.02 / 1_000_000,
  },
};

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  embeddingTokens?: number
): { input: number; output: number; embedding?: number; total: number } {
  const prices = PRICING[model];
  
  if (!prices) {
    // Unknown model - return 0 cost
    return {
      input: 0,
      output: 0,
      embedding: embeddingTokens ? 0 : undefined,
      total: 0,
    };
  }

  const inputCost = inputTokens * (prices.input || 0);
  const outputCost = outputTokens * (prices.output || 0);
  const embeddingCost = embeddingTokens ? embeddingTokens * (prices.embedding || 0) : 0;

  return {
    input: inputCost,
    output: outputCost,
    embedding: embeddingTokens ? embeddingCost : undefined,
    total: inputCost + outputCost + embeddingCost,
  };
}

/**
 * Get pricing info for a model
 */
export function getModelPricing(model: string) {
  return PRICING[model] || null;
}

