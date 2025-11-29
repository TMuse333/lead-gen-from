// src/lib/tokenUsage/trackUsage.ts
// Main function to track LLM usage and save to MongoDB

import type { LLMUsageTracking } from '@/types/tokenUsage.types';
import { getTokenUsageCollection } from '@/lib/mongodb/db';
import type { TokenUsageDocument } from '@/lib/mongodb/models/tokenUsage';

/**
 * Save usage tracking to MongoDB
 * This should be called after every LLM API call
 */
export async function trackUsage(usage: LLMUsageTracking): Promise<void> {
  try {
    const collection = await getTokenUsageCollection();
    
    // Convert to MongoDB document format
    const document: Omit<TokenUsageDocument, '_id'> = {
      id: usage.id,
      timestamp: usage.timestamp,
      userId: usage.userId,
      sessionId: usage.sessionId,
      provider: usage.provider,
      model: usage.model,
      apiType: usage.apiType,
      tokens: usage.tokens,
      cost: usage.cost,
      performance: usage.performance,
      request: usage.request,
      response: usage.response,
      feature: usage.feature,
      featureData: usage.featureData,
      createdAt: new Date(),
    };

    await collection.insertOne(document as TokenUsageDocument);
    
    console.log(`📊 Token usage tracked: ${usage.feature} - ${usage.tokens.total} tokens - $${usage.cost.total.toFixed(6)}`);
  } catch (error) {
    // Don't throw - tracking failures shouldn't break the app
    console.error('❌ Failed to track token usage:', error);
  }
}

/**
 * Track usage asynchronously (fire and forget)
 * Use this when you don't want to wait for the database write
 */
export function trackUsageAsync(usage: LLMUsageTracking): void {
  trackUsage(usage).catch(error => {
    console.error('❌ Async token usage tracking failed:', error);
  });
}

