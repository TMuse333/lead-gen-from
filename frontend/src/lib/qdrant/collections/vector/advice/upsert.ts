// src/lib/qdrant/collections/vector/advice/advice.upsert.ts

import { qdrant } from '../../../client';
import { ADVICE_COLLECTION } from './collection';
import { AgentAdviceScenario } from '@/types';
import type { RuleGroup } from '@/types/rules.types';
import type { AdvicePlacements } from '@/types/advice.types';
import type { OfferType } from '@/lib/offers/unified';

interface StoreAdviceParams {
  agentId: string;
  title: string;
  advice: string;
  embedding: number[];
  metadata: {
    tags?: string[];
    flow?: string[];
    /** Which offer types this advice applies to (empty = all offers) */
    offerTypes?: OfferType[];
    /** Specific locations within offers (e.g., timeline phases, pdf sections) */
    placements?: AdvicePlacements;
    conditions?: Record<string, string[]>; // Simple conditions (OR logic)
    ruleGroups?: RuleGroup[]; // Complex rules (AND/OR logic) - optional
  };
}

export async function storeAgentAdvice({
  agentId,
  title,
  advice,
  embedding,
  metadata,
}: StoreAdviceParams): Promise<string> {
  try {
    const pointId = crypto.randomUUID();

    await qdrant.upsert(ADVICE_COLLECTION, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            agentId,
            title,
            advice,
            tags: metadata.tags || [],
            flow: metadata.flow || [],
            offerTypes: metadata.offerTypes || [], // NEW: offer type filtering
            placements: metadata.placements || {}, // NEW: location-specific targeting
            conditions: metadata.conditions || {},
            ruleGroups: metadata.ruleGroups || undefined, // Optional: only include if provided
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          },
        },
      ],
    });

    console.log('Stored advice:', title);
    return pointId;
  } catch (error) {
    console.error('Error storing agent advice:', error);
    throw error;
  }
}

export async function updateAdvice(
  adviceId: string,
  updates: {
    title?: string;
    advice?: string;
    tags?: string[];
    flow?: string[];
    offerTypes?: OfferType[];
    placements?: AdvicePlacements;
    conditions?: Record<string, string[]>;
    ruleGroups?: RuleGroup[];
    embedding?: number[];
  }
) {
  try {
    const payloadUpdate: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.embedding) {
      await qdrant.upsert(ADVICE_COLLECTION, {
        wait: true,
        points: [
          {
            id: adviceId,
            vector: updates.embedding,
            payload: payloadUpdate,
          },
        ],
      });
    } else {
      await qdrant.setPayload(ADVICE_COLLECTION, {
        points: [adviceId],
        payload: payloadUpdate,
      });
    }

    console.log('Updated advice:', adviceId);
  } catch (error) {
    console.error('Error updating advice:', error);
    throw error;
  }
}

export async function deleteAdvice(adviceId: string) {
  try {
    await qdrant.delete(ADVICE_COLLECTION, {
      wait: true,
      points: [adviceId],
    });
    console.log('Deleted advice:', adviceId);
  } catch (error) {
    console.error('Error deleting advice:', error);
    throw error;
  }
}