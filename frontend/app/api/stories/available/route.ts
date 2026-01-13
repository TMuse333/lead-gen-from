// app/api/stories/available/route.ts
// API for fetching available stories from Qdrant for the story picker

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';
import type { AvailableStory, AvailableStoriesResponse, TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * GET /api/stories/available?flow=buy&search=mortgage&limit=50
 * Returns available stories from the user's Qdrant collection
 *
 * Query params:
 * - flow: 'buy' | 'sell' | 'browse' (optional, filters by flow)
 * - search: string (optional, filters by title/advice content)
 * - kind: 'story' | 'tip' (optional, filters by kind)
 * - limit: number (optional, defaults to 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') as TimelineFlow | null;
    const search = searchParams.get('search');
    const kind = searchParams.get('kind') as 'story' | 'tip' | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    // Get user's collection name
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const collectionName = config.qdrantCollectionName;
    if (!collectionName) {
      return NextResponse.json({
        success: true,
        stories: [],
        total: 0,
        message: 'No Qdrant collection configured',
      });
    }

    // Build Qdrant filter
    const filterConditions: any[] = [];

    // Filter by flow if specified
    if (flow && ['buy', 'sell', 'browse'].includes(flow)) {
      filterConditions.push({
        key: 'flow',
        match: { any: [flow] },
      });
    }

    // Filter by kind if specified (story vs tip)
    if (kind && ['story', 'tip'].includes(kind)) {
      filterConditions.push({
        key: 'kind',
        match: { value: kind },
      });
    }

    // Build filter object
    const filter = filterConditions.length > 0
      ? { must: filterConditions }
      : undefined;

    // Fetch from Qdrant using scroll
    const result = await qdrant.scroll(collectionName, {
      limit: search ? 200 : limit, // Get more if we need to search
      with_payload: true,
      with_vector: false,
      filter,
    });

    // Map to AvailableStory format (supports both legacy and structured stories)
    let stories: AvailableStory[] = result.points.map((point) => {
      const payload = point.payload as any;
      return {
        id: point.id as string,
        title: payload?.title || 'Untitled',
        advice: payload?.advice || '',
        tags: (payload?.tags as string[]) || [],
        flow: Array.isArray(payload?.flow) ? payload.flow[0] : payload?.flow,
        // Structured story fields (new format)
        situation: payload?.situation,
        action: payload?.action,
        outcome: payload?.outcome,
        // Type discriminator
        kind: payload?.kind as 'story' | 'tip' | undefined,
      };
    });

    // Apply text search filter if provided (searches all text fields)
    if (search) {
      const searchLower = search.toLowerCase();
      stories = stories.filter((story) =>
        story.title.toLowerCase().includes(searchLower) ||
        story.advice.toLowerCase().includes(searchLower) ||
        (story.situation && story.situation.toLowerCase().includes(searchLower)) ||
        (story.action && story.action.toLowerCase().includes(searchLower)) ||
        (story.outcome && story.outcome.toLowerCase().includes(searchLower)) ||
        story.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply limit after search filtering
    stories = stories.slice(0, limit);

    const response: AvailableStoriesResponse = {
      success: true,
      stories,
      total: stories.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[stories/available] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stories/available/[id]
 * Get a single story by ID
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { storyIds } = body as { storyIds: string[] };

    if (!storyIds || !Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json(
        { error: 'storyIds array is required' },
        { status: 400 }
      );
    }

    // Get user's collection name
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const collectionName = config.qdrantCollectionName;
    if (!collectionName) {
      return NextResponse.json({
        success: true,
        stories: [],
      });
    }

    // Fetch specific stories by ID using retrieve
    const result = await qdrant.retrieve(collectionName, {
      ids: storyIds,
      with_payload: true,
      with_vector: false,
    });

    const stories: AvailableStory[] = result.map((point) => {
      const payload = point.payload as any;
      return {
        id: point.id as string,
        title: payload?.title || 'Untitled',
        advice: payload?.advice || '',
        tags: (payload?.tags as string[]) || [],
        flow: Array.isArray(payload?.flow) ? payload.flow[0] : payload?.flow,
        // Structured story fields (new format)
        situation: payload?.situation,
        action: payload?.action,
        outcome: payload?.outcome,
        kind: payload?.kind as 'story' | 'tip' | undefined,
      };
    });

    return NextResponse.json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error('[stories/available] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
