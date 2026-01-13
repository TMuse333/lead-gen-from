// src/lib/qdrant/collections/vector/advice/advice.upsertUser.ts
// User-specific version that accepts collection name

import { qdrant } from '../../../client';
import { criticalError } from '@/lib/logger';
import type { RuleGroup } from '@/types/rules.types';
import type { AdviceType, AdvicePlacements, KnowledgeKind, Story } from '@/types/advice.types';

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

    return pointId;
  } catch (error) {
    criticalError('QdrantAdviceUpsertUser', error);
    throw error;
  }
}

// ==================== STORY-SPECIFIC FUNCTIONS ====================

interface StoreStoryParams {
  collectionName: string;
  title: string;
  situation: string;
  action: string;
  outcome: string;
  embedding: number[];
  metadata: {
    tags?: string[];
    flows?: string[];
    placements?: AdvicePlacements;
  };
}

/**
 * Store a story with structured fields (situation, action, outcome)
 */
export async function storeUserStory({
  collectionName,
  title,
  situation,
  action,
  outcome,
  embedding,
  metadata,
}: StoreStoryParams): Promise<string> {
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
            situation,
            action,
            outcome,
            // Combined text for search (legacy compatibility)
            advice: `[CLIENT STORY]\nSituation: ${situation}\nWhat I did: ${action}\nOutcome: ${outcome}`,
            tags: metadata.tags || [],
            flows: metadata.flows || [],
            kind: 'story' as KnowledgeKind,
            placements: metadata.placements || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ],
    });

    return pointId;
  } catch (error) {
    criticalError('QdrantStoryUpsertUser', error);
    throw error;
  }
}

interface UpdateStoryParams {
  collectionName: string;
  pointId: string;
  title: string;
  situation: string;
  action: string;
  outcome: string;
  embedding: number[];
  metadata: {
    tags?: string[];
    flows?: string[];
    placements?: AdvicePlacements;
  };
}

/**
 * Update an existing story
 */
export async function updateUserStory({
  collectionName,
  pointId,
  title,
  situation,
  action,
  outcome,
  embedding,
  metadata,
}: UpdateStoryParams): Promise<void> {
  try {
    await qdrant.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            title,
            situation,
            action,
            outcome,
            advice: `[CLIENT STORY]\nSituation: ${situation}\nWhat I did: ${action}\nOutcome: ${outcome}`,
            tags: metadata.tags || [],
            flows: metadata.flows || [],
            kind: 'story' as KnowledgeKind,
            placements: metadata.placements || {},
            updatedAt: new Date().toISOString(),
          },
        },
      ],
    });
  } catch (error) {
    criticalError('QdrantStoryUpdateUser', error);
    throw error;
  }
}

