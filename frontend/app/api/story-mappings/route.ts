// app/api/story-mappings/route.ts
// API for managing story-to-phase mappings (stored in MongoDB clientConfigs)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { StoryMappings } from '@/types/advice.types';

export const runtime = 'nodejs';

/**
 * GET /api/story-mappings
 * Returns the current story mappings for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      storyMappings: config.storyMappings || {},
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/story-mappings
 * Updates the story mappings for the authenticated user
 * Body: { storyMappings: StoryMappings }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { storyMappings } = body as { storyMappings: StoryMappings };

    if (!storyMappings || typeof storyMappings !== 'object') {
      return NextResponse.json(
        { error: 'storyMappings object is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          storyMappings,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Story mappings updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/story-mappings
 * Updates a single flow's mappings without replacing others
 * Body: { flow: 'buy' | 'sell' | 'browse', mappings: PhaseStoryMapping }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flow, mappings } = body as {
      flow: 'buy' | 'sell' | 'browse';
      mappings: Record<string, string[]>;
    };

    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    if (!mappings || typeof mappings !== 'object') {
      return NextResponse.json(
        { error: 'mappings object is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`storyMappings.${flow}`]: mappings,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Story mappings for ${flow} flow updated successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
