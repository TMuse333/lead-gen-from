// app/api/stories-by-phase/route.ts
// Fetch stories by ID from Qdrant - no semantic search, just ID lookup
// Used for client-side offer generation

import { NextRequest, NextResponse } from 'next/server';
import { resolveStoriesForFlow } from '@/lib/qdrant/collections/vector/advice/getStoriesByIds';
import type { StoryMappings } from '@/types/advice.types';

export const runtime = 'nodejs';

/**
 * POST /api/stories-by-phase
 *
 * Body:
 * - flow: 'buy' | 'sell' | 'browse'
 * - storyMappings: StoryMappings object
 * - collectionName: Qdrant collection name
 *
 * Returns: StoriesByPhase - stories organized by phase ID
 *
 * Note: This is a simple ID-based lookup, no embeddings or semantic search.
 * Stories are fetched directly by their Qdrant point IDs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flow, storyMappings, collectionName } = body as {
      flow: 'buy' | 'sell' | 'browse';
      storyMappings: StoryMappings;
      collectionName: string;
    };

    // Validate required fields
    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    if (!collectionName) {
      return NextResponse.json(
        { error: 'collectionName is required' },
        { status: 400 }
      );
    }

    // If no storyMappings, return empty
    if (!storyMappings || Object.keys(storyMappings).length === 0) {
      return NextResponse.json({
        success: true,
        storiesByPhase: {},
        storyCount: 0,
      });
    }

    // Fetch stories by ID (no semantic search)
    const storiesByPhase = await resolveStoriesForFlow(
      collectionName,
      storyMappings,
      flow
    );

    const storyCount = Object.values(storiesByPhase).flat().length;

    return NextResponse.json({
      success: true,
      storiesByPhase,
      storyCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
