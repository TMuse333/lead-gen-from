// ============================================
// API ROUTE: /api/stories/add
// Handles adding stories with structured fields (situation, action, outcome)
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getEmbedding } from '@/lib/openai/embedding';
import { storeUserStory } from '@/lib/qdrant/collections/vector/advice/upsertUser';
import type { CreateStoryInput } from '@/types/advice.types';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user's collection name
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.qdrantCollectionName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;

    const body = await request.json() as CreateStoryInput & { flows?: string[] };
    const {
      title,
      situation,
      action,
      outcome,
      tags = [],
      placements = {},
      flows = [],
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    if (!situation?.trim() || !action?.trim() || !outcome?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Situation, action, and outcome are all required' },
        { status: 400 }
      );
    }

    // Validate flows if provided
    if (flows.length > 0) {
      const validFlows = ['sell', 'buy', 'browse'];
      const invalidFlows = flows.filter((f: string) => !validFlows.includes(f));
      if (invalidFlows.length > 0) {
        return NextResponse.json(
          { success: false, error: `Invalid flow(s): ${invalidFlows.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Generate embedding for semantic search
    // Combine all story parts for better semantic matching
    const textToEmbed = `${title}. Situation: ${situation}. Action: ${action}. Outcome: ${outcome}`;
    const embedding = await getEmbedding(textToEmbed, {
      userId: session.user.id,
      adviceTitle: title,
      collectionName,
    });

    // Store in Qdrant with structured fields
    const storyId = await storeUserStory({
      collectionName,
      title: title.trim(),
      situation: situation.trim(),
      action: action.trim(),
      outcome: outcome.trim(),
      embedding,
      metadata: {
        tags,
        flows,
        placements,
      },
    });

    return NextResponse.json({
      success: true,
      storyId,
      message: 'Story added successfully',
    });
  } catch (error) {
    console.error('[stories/add] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
