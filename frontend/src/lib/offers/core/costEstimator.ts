// lib/offers/core/costEstimator.ts
/**
 * Cost estimation for LLM-based offer generation
 * Estimates token usage and costs before generation
 */

import type { CostEstimate, PromptContext, OutputSchema } from './types';

// ==================== TOKEN PRICING ====================

interface ModelPricing {
  inputTokensPer1M: number; // Cost per 1M input tokens (USD)
  outputTokensPer1M: number; // Cost per 1M output tokens (USD)
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': {
    inputTokensPer1M: 0.15,
    outputTokensPer1M: 0.60,
  },
  'gpt-4o': {
    inputTokensPer1M: 2.50,
    outputTokensPer1M: 10.00,
  },
  'claude-3-5-sonnet': {
    inputTokensPer1M: 3.00,
    outputTokensPer1M: 15.00,
  },
};

// ==================== TOKEN ESTIMATION ====================

/**
 * Rough token estimation (1 token ≈ 4 characters for English)
 * This is a conservative estimate
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens for user input
 */
function estimateInputTokens(userInput: Record<string, string>): number {
  const inputText = Object.entries(userInput)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  return estimateTokens(inputText);
}

/**
 * Estimate tokens for Qdrant advice context
 */
function estimateContextTokens(qdrantAdvice?: string[]): number {
  if (!qdrantAdvice || qdrantAdvice.length === 0) return 0;
  
  const contextText = qdrantAdvice.join('\n\n');
  return estimateTokens(contextText);
}

/**
 * Estimate tokens for the base prompt structure
 * Includes system message, instructions, and output schema
 */
function estimatePromptStructureTokens(outputSchema: OutputSchema): number {
  // Base system message and instructions: ~200 tokens
  // Output schema JSON: estimate based on schema size
  const schemaText = JSON.stringify(outputSchema, null, 2);
  const schemaTokens = estimateTokens(schemaText);
  
  return 200 + schemaTokens;
}

/**
 * Estimate output tokens based on output schema
 */
function estimateOutputTokens(outputSchema: OutputSchema, maxTokens: number): number {
  // Count required fields to estimate minimum output size
  const requiredFields = Object.values(outputSchema.properties).filter(
    (prop) => prop.required
  ).length;
  
  // Estimate based on schema complexity
  const propertiesCount = Object.keys(outputSchema.properties).length;
  
  // Base estimate: 50 tokens per field
  // Additional tokens for arrays and complex structures
  const baseEstimate = propertiesCount * 50;
  
  // Cap at maxTokens
  return Math.min(baseEstimate, maxTokens);
}

// ==================== COST CALCULATION ====================

/**
 * Calculate cost based on token usage
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model];
  
  if (!pricing) {
    console.warn(`Unknown model pricing for ${model}, using gpt-4o-mini as fallback`);
    return calculateCost(inputTokens, outputTokens, 'gpt-4o-mini');
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.inputTokensPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputTokensPer1M;
  
  return inputCost + outputCost;
}

// ==================== MAIN COST ESTIMATOR ====================

/**
 * Create a cost estimator function for an offer definition
 */
export function createCostEstimator(
  model: string,
  maxTokens: number
): (
  userInput: Record<string, string>,
  context: PromptContext,
  outputSchema: OutputSchema
) => CostEstimate {
  return (userInput, context, outputSchema) => {
    // Estimate input tokens
    const userInputTokens = estimateInputTokens(userInput);
    const contextTokens = estimateContextTokens(context.qdrantAdvice);
    const promptStructureTokens = estimatePromptStructureTokens(outputSchema);
    
    const estimatedInputTokens = 
      userInputTokens + 
      contextTokens + 
      promptStructureTokens;
    
    // Estimate output tokens
    const estimatedOutputTokens = estimateOutputTokens(outputSchema, maxTokens);
    
    // Calculate total
    const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;
    
    // Calculate cost
    const estimatedCostUSD = calculateCost(
      estimatedInputTokens,
      estimatedOutputTokens,
      model
    );
    
    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedTotalTokens,
      estimatedCostUSD,
      model,
      breakdown: {
        promptTokens: promptStructureTokens,
        contextTokens,
        outputTokens: estimatedOutputTokens,
      },
    };
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format cost estimate for display
 */
export function formatCostEstimate(estimate: CostEstimate): string {
  const costCents = Math.ceil(estimate.estimatedCostUSD * 100);
  
  if (costCents < 1) {
    return '<$0.01';
  }
  
  return `$${(costCents / 100).toFixed(2)}`;
}

/**
 * Check if cost is within budget
 */
export function isWithinBudget(
  estimate: CostEstimate,
  budgetUSD: number
): boolean {
  return estimate.estimatedCostUSD <= budgetUSD;
}

/**
 * Get cost estimate summary
 */
export function getCostSummary(estimate: CostEstimate): {
  tokens: string;
  cost: string;
  model: string;
} {
  return {
    tokens: `~${estimate.estimatedTotalTokens.toLocaleString()} tokens`,
    cost: formatCostEstimate(estimate),
    model: estimate.model,
  };
}

// ==================== ACTUAL COST TRACKING ====================

/**
 * Calculate actual cost from LLM response
 */
export function calculateActualCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  return calculateCost(inputTokens, outputTokens, model);
}

/**
 * Compare estimated vs actual cost
 */
export function compareCosts(
  estimate: CostEstimate,
  actualInputTokens: number,
  actualOutputTokens: number
): {
  estimatedCost: number;
  actualCost: number;
  difference: number;
  percentageDifference: number;
} {
  const actualCost = calculateActualCost(
    actualInputTokens,
    actualOutputTokens,
    estimate.model
  );
  
  const difference = actualCost - estimate.estimatedCostUSD;
  const percentageDifference = 
    (difference / estimate.estimatedCostUSD) * 100;
  
  return {
    estimatedCost: estimate.estimatedCostUSD,
    actualCost,
    difference,
    percentageDifference,
  };
}