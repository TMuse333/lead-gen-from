// src/lib/qdrant/collections/vector/advice/getStoriesByIds.ts
// Fetch stories by ID from Qdrant (no vector search - direct retrieval)

import { qdrant } from '../../../client';
import type { StoryReference, StoriesByPhase, StoryMappings } from '@/types/advice.types';
import type { TimelineFlow } from '@/lib/offers/definitions/timeline/timeline-types';

/**
 * Fetch specific stories by their Qdrant point IDs
 * Returns minimal data needed for display
 */
export async function getStoriesByIds(
  collectionName: string,
  storyIds: string[]
): Promise<StoryReference[]> {
  if (!storyIds.length) return [];

  try {
    const result = await qdrant.retrieve(collectionName, {
      ids: storyIds,
      with_payload: true,
      with_vector: false,
    });

    return result.map((point) => {
      const payload = point.payload as any;
      return {
        id: point.id as string,
        title: payload?.title || '',
        advice: payload?.advice || '',
        tags: payload?.tags || [],
      };
    });
  } catch (error) {
    console.error('[getStoriesByIds] Failed to fetch stories:', error);
    return [];
  }
}

/**
 * Resolve story mappings to actual story content
 * Takes phase-to-storyId mappings and returns phase-to-storyContent
 */
export async function resolveStoriesForFlow(
  collectionName: string,
  storyMappings: StoryMappings | undefined,
  flow: TimelineFlow
): Promise<StoriesByPhase> {
  if (!storyMappings) return {};

  const flowMappings = storyMappings[flow];
  if (!flowMappings) return {};

  // Collect all story IDs across all phases
  const allStoryIds = new Set<string>();
  for (const storyIds of Object.values(flowMappings)) {
    storyIds.forEach((id) => allStoryIds.add(id));
  }

  if (allStoryIds.size === 0) return {};

  // Fetch all stories in one request
  const stories = await getStoriesByIds(collectionName, Array.from(allStoryIds));

  // Create lookup map
  const storyMap = new Map(stories.map((s) => [s.id, s]));

  // Build phase-to-stories result
  const result: StoriesByPhase = {};
  for (const [phaseId, storyIds] of Object.entries(flowMappings)) {
    result[phaseId] = storyIds
      .map((id) => storyMap.get(id))
      .filter((s): s is StoryReference => s !== undefined);
  }

  return result;
}
