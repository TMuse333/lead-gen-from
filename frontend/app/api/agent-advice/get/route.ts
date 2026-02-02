// app/api/agent-advice/get/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getAdviceTypeFromTags, DEFAULT_ADVICE_TYPE } from '@/types/advice.types';

export const runtime = "nodejs";

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

async function getUserCollectionName(userId: string): Promise<string | null> {
  try {
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId });
    return userConfig?.qdrantCollectionName || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      console.error('[agent-advice/get] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get effective userId (impersonated user if admin is impersonating)
    const userId = await getEffectiveUserId() || session.user.id;
    console.log('[agent-advice/get] User authenticated:', session.user.id, 'effective:', userId);

    // 2. Get user's collection name
    const COLLECTION_NAME = await getUserCollectionName(userId);

    if (!COLLECTION_NAME) {
      console.error('[agent-advice/get] No Qdrant collection found for user:', session.user.id);
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    console.log('[agent-advice/get] Fetching from collection:', COLLECTION_NAME);

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch from Qdrant
    let response;
    try {
      response = await client.scroll(COLLECTION_NAME, {
        limit,
        with_payload: true,
        with_vector: false,
      });
      console.log('[agent-advice/get] Fetched', response.points.length, 'points from Qdrant');
    } catch (qdrantError) {
      console.error('[agent-advice/get] Qdrant error:', qdrantError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch from Qdrant',
          message: qdrantError instanceof Error ? qdrantError.message : 'Unknown Qdrant error',
        },
        { status: 500 }
      );
    }

    // Transform to friendly format (FIXED - properly extract applicableWhen)
    const adviceList = response.points
      .filter((point) => {
        // Filter by agentId if provided
        if (agentId && point.payload?.agentId !== agentId) {
          return false;
        }
        return true;
      })
      .map((point) => {
        const payload = point.payload;
        const tags = (payload?.tags as string[]) || [];
        
        // Extract type from tags or use default
        const type = payload?.type || getAdviceTypeFromTags(tags);

        // Build applicableWhen from payload structure
        // Qdrant stores ruleGroups directly in payload, not nested in applicableWhen
        const applicableWhen = {
          flow: payload?.flow as string[] | undefined,
          ruleGroups: payload?.ruleGroups as any[] | undefined,
          conditions: payload?.conditions as Record<string, string[]> | undefined,
          minMatchScore: payload?.minMatchScore as number | undefined,
        };

        return {
          id: point.id,
          title: payload?.title as string,
          advice: payload?.advice as string,
          tags,
          type, // Include type in response
          kind: (payload?.kind as 'tip' | 'story') || 'tip', // Include kind (tip/story)
          placements: payload?.placements as Record<string, string[]> | undefined, // Direct placements for StoriesDashboard
          applicableWhen,
          createdAt: payload?.createdAt as string,
          updatedAt: payload?.updatedAt as string | undefined,
          usageCount: payload?.usageCount as number | undefined,
        };
      });

    return NextResponse.json({
      success: true,
      count: adviceList.length,
      advice: adviceList,
    });
  } catch (error) {
    console.error('[agent-advice/get] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get effective userId (impersonated user if admin is impersonating)
    const userId = await getEffectiveUserId() || session.user.id;

    // 2. Get user's collection name
    const COLLECTION_NAME = await getUserCollectionName(userId);
    
    if (!COLLECTION_NAME) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const adviceId = searchParams.get('id');

    if (!adviceId) {
      return NextResponse.json(
        { success: false, error: 'Advice ID is required' },
        { status: 400 }
      );
    }

    await client.delete(COLLECTION_NAME, {
      wait: true,
      points: [adviceId],
    });

    return NextResponse.json({
      success: true,
      message: 'Advice deleted successfully',
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