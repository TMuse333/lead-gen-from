// components/admin/rules/recommendedRules/api.ts

import axios from 'axios';
import type { RuleRecommendation } from '@/lib/rules/ruleTypes';
import type { AdviceItem } from './types';

/**
 * Fetch saved recommendations from MongoDB
 */
export async function fetchSavedRecommendations(flow?: string) {
  const response = await axios.get('/api/rules/recommendations', {
    params: { flow: flow || null },
  });

  if (response.data.success) {
    return {
      recommendations: response.data.recommendations || [],
      hasRecommendations: response.data.hasRecommendations || false,
    };
  } else {
    throw new Error(response.data.error || 'Failed to load recommendations');
  }
}

/**
 * Generate new recommendations with AI
 */
export async function generateWithAI(flow?: string, forceRegenerate = false) {
  const response = await axios.post('/api/rules/recommend', {
    flow: flow || undefined,
    forceRegenerate,
  });

  if (response.data.success) {
    return {
      recommendations: response.data.recommendations || [],
    };
  } else {
    throw new Error(response.data.error || 'Failed to generate recommendations');
  }
}

/**
 * Clean up rules with placeholder values
 */
export async function cleanupRules(flow?: string) {
  const response = await axios.post('/api/rules/cleanup', {
    flow: flow || null,
    removeInvalidOnly: false,
  });

  if (response.data.success) {
    return {
      cleaned: response.data.cleaned,
      removed: response.data.removed,
    };
  } else {
    throw new Error(response.data.error || 'Failed to clean rules');
  }
}

/**
 * Delete a recommendation
 */
export async function deleteRecommendation(recommendationId: string, flow?: string) {
  const response = await axios.delete('/api/rules/recommendations', {
    params: {
      recommendationId,
      flow: flow || null,
    },
  });

  if (!response.data.success) {
    throw new Error('Failed to delete recommendation');
  }

  return response.data;
}

/**
 * Update a recommendation
 */
export async function updateRecommendation(
  recommendationId: string,
  updates: Partial<RuleRecommendation>,
  flow?: string
) {
  const response = await axios.put('/api/rules/recommendations', {
    recommendationId,
    updates,
    flow: flow || null,
  });

  if (response.data.success) {
    return response.data.recommendation;
  } else {
    throw new Error(response.data.error || 'Failed to update recommendation');
  }
}

/**
 * Fetch all advice items from Qdrant
 */
export async function fetchAdviceItems(): Promise<AdviceItem[]> {
  const response = await axios.get('/api/agent-advice/get', {
    params: { limit: 1000 },
  });

  if (response.data.success) {
    return response.data.advice || [];
  } else {
    throw new Error(response.data.error || 'Failed to fetch advice items');
  }
}

/**
 * Save all rules to selected advice items
 */
export async function saveAllRulesToAdvice(
  recommendations: RuleRecommendation[],
  adviceItemIds: string[]
) {
  const response = await axios.post('/api/rules/save-all', {
    recommendations,
    adviceItemIds,
  });

  if (response.data.success) {
    return {
      saved: response.data.saved,
      failed: response.data.failed,
    };
  } else {
    throw new Error(response.data.error || 'Failed to save rules');
  }
}
