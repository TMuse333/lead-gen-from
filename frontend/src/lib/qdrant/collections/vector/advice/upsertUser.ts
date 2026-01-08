// src/lib/qdrant/collections/vector/advice/advice.upsertUser.ts
// User-specific version that accepts collection name

import { qdrant } from '../../../client';
import type { RuleGroup } from '@/types/rules.types';
import type { AdviceType, AdvicePlacements, KnowledgeKind } from '@/types/advice.types';

interface StoreAdviceParams {
  collectionName: string;
  title: string;
  advice: string;
  embedding: number[];
  metadata: {
    tags?: string[];
    flow?: string[];
    conditions?: Record<string, string[]>; // Simple conditions (OR logic)
    ruleGroups?: RuleGroup[]; // Complex rules (AND/OR logic) - optional
    type?: AdviceType; // Optional advice type
    kind?: KnowledgeKind; // 'tip' or 'story'
    placements?: AdvicePlacements; // Offer-specific placements
  };
}

export async function storeUserAdvice({
  collectionName,
  title,
  advice,
  embedding,
  metadata,
}: StoreAdviceParams): Promise<string> {
  try {
    const pointId = crypto.randomUUID();

    await qdrant.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            title,
            advice,
            tags: metadata.tags || [],
            flow: metadata.flow || [],
            conditions: metadata.conditions || {},
            ruleGroups: metadata.ruleGroups || undefined, // Optional: only include if provided
            type: metadata.type || undefined, // Optional: advice type
            kind: metadata.kind || 'tip', // Default to 'tip' if not specified
            placements: metadata.placements || {}, // Offer-specific placements
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          },
        },
      ],
    });

    console.log(`Stored advice in ${collectionName}:`, title);
    return pointId;
  } catch (error) {
    console.error('Error storing user advice:', error);
    throw error;
  }
}

