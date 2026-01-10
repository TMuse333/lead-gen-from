// ============================================
// API ROUTE: /api/agent-advice/add
// Handles adding agent advice from frontend uploader (NEW FORMAT)
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getEmbedding } from '@/lib/openai/embedding';
import { storeUserAdvice } from '@/lib/qdrant/collections/vector/advice/upsertUser';
import { DEFAULT_ADVICE_TYPE, ensureTypeTag, isValidAdviceType } from '@/types/advice.types';

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

    const body = await request.json();
    const {
      title,
      advice,
      tags = [],
      flow = [],
      conditions = {},
      ruleGroups, // Optional: complex rules (AND/OR logic)
      type, // Optional: advice type (defaults to 'general-advice')
      kind, // Optional: 'tip' or 'story' (defaults to 'tip')
      placements = {}, // Optional: offer-specific placements
    } = body;

    // Validate required fields
    if (!title || !advice) {
      return NextResponse.json(
        { success: false, error: 'Title and advice are required' },
        { status: 400 }
      );
    }

    // Validate flow if provided
    if (flow.length > 0) {
      const validFlows = ['sell', 'buy', 'browse'];
      const invalidFlows = flow.filter((f: string) => !validFlows.includes(f));
      if (invalidFlows.length > 0) {
        return NextResponse.json(
          { success: false, error: `Invalid flow(s): ${invalidFlows.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate and set default type
    const adviceType = type && isValidAdviceType(type) ? type : DEFAULT_ADVICE_TYPE;
    
    // Ensure type tag is in tags array
    const tagsWithType = ensureTypeTag(tags, adviceType);

    // Generate embedding for semantic search
    const textToEmbed = `${title}. ${advice}`;
    const embedding = await getEmbedding(textToEmbed, {
      userId: session.user.id,
      adviceTitle: title,
      collectionName,
    });

    // Store in Qdrant
    const adviceId = await storeUserAdvice({
      collectionName,
      title,
      advice,
      embedding,
      metadata: {
        tags: tagsWithType, // Tags now include type tag
        flow,
        conditions,
        ruleGroups, // Optional: will be undefined if not provided
        type: adviceType, // Include type in metadata
        kind: kind || 'tip', // 'tip' or 'story'
        placements, // Offer-specific placements
      },
    });

    return NextResponse.json({
      success: true,
      adviceId,
      message: 'Advice added successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}