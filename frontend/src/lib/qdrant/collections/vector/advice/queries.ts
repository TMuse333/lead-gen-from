// src/lib/qdrant/collections/vector/advice/advice.queries.ts

import { qdrant } from '../../../client';
import { ADVICE_COLLECTION } from './collection';
import { AgentAdviceScenario } from '@/types';
import { calculateMatchScore } from '../../../engines/rules';
import { getAdviceTypeFromTags, type AdvicePlacements } from '@/types/advice.types';
import type { OfferType } from '@/lib/offers/unified';

/**
 * Options for querying advice
 */
export interface QueryAdviceOptions {
  limit?: number;
  collectionName?: string;
  /** Filter by offer type (e.g., 'real-estate-timeline') */
  offerType?: OfferType;
  /** Filter by specific location within offer (e.g., 'financial-prep' phase) */
  location?: string;
}

export async function queryRelevantAdvice(
  agentId: string,
  embedding: number[],
  flow: string,
  userInput: Record<string, string>,
  limitOrOptions: number | QueryAdviceOptions = 5,
  collectionName?: string
): Promise<AgentAdviceScenario[]> {
  try {
    // Handle both legacy (limit as number) and new (options object) signatures
    const options: QueryAdviceOptions = typeof limitOrOptions === 'number'
      ? { limit: limitOrOptions, collectionName }
      : limitOrOptions;

    const limit = options.limit ?? 5;
    const collection = options.collectionName || collectionName || ADVICE_COLLECTION;

    const searchResult = await qdrant.search(collection, {
      vector: embedding,
      limit: limit * 3, // Get 3x candidates for filtering
      with_payload: true,
    });

    if (searchResult.length === 0) {
      return [];
    }

    // Apply filters
    const filtered = searchResult
      .filter((result) => {
        const p = result.payload as any;

        // Flow check
        const flows: string[] = p?.flow || [];
        if (flows.length > 0 && !flows.includes(flow)) {
          return false;
        }

        // Offer type check (NEW)
        if (options.offerType) {
          const offerTypes: OfferType[] = p?.offerTypes || [];
          // If advice specifies offer types and current offer isn't included, skip
          if (offerTypes.length > 0 && !offerTypes.includes(options.offerType)) {
            return false;
          }
        }

        // Location/placement check (NEW)
        if (options.location && options.offerType) {
          const placements: AdvicePlacements = p?.placements || {};
          const offerPlacements = placements[options.offerType];
          // If advice specifies placements for this offer and location isn't included, skip
          if (offerPlacements && offerPlacements.length > 0 && !offerPlacements.includes(options.location)) {
            return false;
          }
        }

        // Priority 1: Check ruleGroups if present (complex rules)
        const ruleGroups = p?.ruleGroups;
        if (ruleGroups && Array.isArray(ruleGroups) && ruleGroups.length > 0) {
          const score = calculateMatchScore(
            {
              applicableWhen: {
                flow: flows,
                ruleGroups: ruleGroups,
              },
            },
            userInput,
            flow as 'sell' | 'buy' | 'browse'
          );
          return score > 0;
        }

        // Priority 2: Check simple conditions (OR logic) if no ruleGroups
        const conditions: Record<string, string[]> = p?.conditions || {};
        if (Object.keys(conditions).length === 0) {
          return true; // Universal - no conditions
        }

        return Object.entries(conditions).some(([key, values]) => {
          const userVal = userInput[key];
          return userVal && values.includes(userVal);
        });
      })
      .slice(0, limit);

    const results: AgentAdviceScenario[] = filtered.map((r) => {
      const payload = r.payload as any;
      const tags = (payload?.tags as string[]) || [];
      const type = payload?.type || getAdviceTypeFromTags(tags);

      return {
        id: r.id as string,
        agentId: payload?.agentId,
        title: payload?.title,
        tags,
        advice: payload?.advice,
        type,
        applicableWhen: {
          flow: payload?.flow,
          offerTypes: payload?.offerTypes,
          placements: payload?.placements,
          conditions: payload?.conditions,
          ruleGroups: payload?.ruleGroups,
        },
        createdAt: new Date(payload?.createdAt),
        updatedAt: payload?.updatedAt
          ? new Date(payload?.updatedAt)
          : undefined,
        usageCount: payload?.usageCount,
      };
    });

    return results;
  } catch (error) {
    console.error('Error querying advice:', error);
    return [];
  }
}

/**
 * Query advice for a specific location within an offer
 * Convenience wrapper for phase-specific or section-specific advice retrieval
 */
export async function queryAdviceForLocation(
  agentId: string,
  embedding: number[],
  flow: string,
  userInput: Record<string, string>,
  offerType: OfferType,
  location: string,
  options?: Omit<QueryAdviceOptions, 'offerType' | 'location'>
): Promise<AgentAdviceScenario[]> {
  return queryRelevantAdvice(agentId, embedding, flow, userInput, {
    ...options,
    offerType,
    location,
  });
}

export async function getAgentAdvice(
  agentId: string,
  limit = 100
): Promise<AgentAdviceScenario[]> {
  try {
    const result = await qdrant.scroll(ADVICE_COLLECTION, {
      limit,
      with_payload: true,
      with_vector: false,
      filter: {
        must: [{ key: 'agentId', match: { value: agentId } }],
      },
    });

    return result.points.map((point) => {
      const payload = point.payload as any;
      const tags = (payload?.tags as string[]) || [];
      const type = payload?.type || getAdviceTypeFromTags(tags);

      return {
        id: point.id as string,
        agentId: payload?.agentId,
        title: payload?.title,
        tags,
        advice: payload?.advice,
        type,
        applicableWhen: {
          flow: payload?.flow,
          conditions: payload?.conditions,
          ruleGroups: payload?.ruleGroups,
        },
        createdAt: new Date(payload?.createdAt),
        updatedAt: payload?.updatedAt
          ? new Date(payload?.updatedAt)
          : undefined,
        usageCount: payload?.usageCount,
      };
    });
  } catch (error) {
    console.error('Error fetching agent advice:', error);
    return [];
  }
}
