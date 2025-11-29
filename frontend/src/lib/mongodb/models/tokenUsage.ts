// src/lib/mongodb/models/tokenUsage.ts
// MongoDB schema for token usage tracking

import { ObjectId } from 'mongodb';
import type { LLMUsageTracking } from '@/types/tokenUsage.types';

/**
 * Token Usage Document (stored in 'token_usage' collection)
 */
export interface TokenUsageDocument {
  _id?: ObjectId;
  
  // Base fields (from BaseLLMUsage)
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  provider: 'openai' | 'anthropic' | 'other';
  model: string;
  apiType: 'chat' | 'embedding' | 'function-calling' | 'other';
  
  // Token usage
  tokens: {
    input: number;
    output: number;
    embedding?: number;
    total: number;
  };
  
  // Cost
  cost: {
    input: number;
    output: number;
    embedding?: number;
    total: number;
  };
  
  // Performance
  performance: {
    latency: number;
    retries: number;
    success: boolean;
    error?: string;
  };
  
  // Request metadata
  request: {
    promptLength?: number;
    maxTokens?: number;
    temperature?: number;
    responseFormat?: 'json_object' | 'text' | 'other';
  };
  
  // Response metadata
  response: {
    contentLength?: number;
    finishReason?: 'stop' | 'length' | 'function_call' | 'other';
    hasFunctionCall?: boolean;
  };
  
  // Feature-specific data
  feature: string;
  featureData: Record<string, any>;
  
  // Indexing
  createdAt: Date;
}

/**
 * Aggregate usage stats per user
 */
export interface TokenUsageStats {
  userId: string;
  totalTokens: {
    input: number;
    output: number;
    embedding: number;
    total: number;
  };
  totalCost: number;
  featureBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
  }>;
  modelBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

