// src/lib/tokenUsage/createTrackingObject.ts
// Helper to create base tracking object

import type { BaseLLMUsage } from '@/types/tokenUsage.types';
import { calculateCost } from './costCalculator';

/**
 * Create base tracking object with common fields
 */
export function createBaseTrackingObject(params: {
  userId?: string;
  sessionId?: string;
  provider: 'openai' | 'anthropic' | 'other';
  model: string;
  apiType: 'chat' | 'embedding' | 'function-calling' | 'other';
  startTime: number; // Performance tracking
}): BaseLLMUsage {
  return {
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId: params.userId,
    sessionId: params.sessionId,
    provider: params.provider,
    model: params.model,
    apiType: params.apiType,
    tokens: {
      input: 0,
      output: 0,
      total: 0,
    },
    cost: {
      input: 0,
      output: 0,
      total: 0,
    },
    performance: {
      latency: Date.now() - params.startTime,
      retries: 0,
      success: false,
    },
    request: {},
    response: {},
  };
}

/**
 * Update tracking object with API response data
 */
export function updateTrackingWithResponse(
  tracking: BaseLLMUsage,
  params: {
    inputTokens: number;
    outputTokens: number;
    embeddingTokens?: number;
    finishReason?: string;
    hasFunctionCall?: boolean;
    contentLength?: number;
    error?: string;
    endTime: number;
  }
): BaseLLMUsage {
  const cost = calculateCost(
    tracking.model,
    params.inputTokens,
    params.outputTokens,
    params.embeddingTokens
  );

  return {
    ...tracking,
    tokens: {
      input: params.inputTokens,
      output: params.outputTokens,
      embedding: params.embeddingTokens,
      total: params.inputTokens + params.outputTokens + (params.embeddingTokens || 0),
    },
    cost,
    performance: {
      latency: params.endTime - (tracking.performance.latency || params.endTime),
      retries: tracking.performance.retries,
      success: !params.error,
      error: params.error,
    },
    response: {
      contentLength: params.contentLength,
      finishReason: params.finishReason as any,
      hasFunctionCall: params.hasFunctionCall,
    },
  };
}

