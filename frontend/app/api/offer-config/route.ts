// app/api/offer-config/route.ts
// Simple endpoint to get offer configuration for client-side generation
// No LLM calls - just returns config data from MongoDB

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

/**
 * GET /api/offer-config
 *
 * Query params:
 * - clientId: (optional) Business name for public bot access
 *
 * Returns config needed for client-side offer generation:
 * - businessName
 * - agentProfile
 * - storyMappings
 * - selectedOffers
 * - qdrantCollectionName (for story fetching)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let config: any = null;

    // Priority 1: clientId for public bot access
    if (clientId) {
      const collection = await getClientConfigsCollection();
      config = await collection.findOne({ businessName: clientId, isActive: true });
    } else {
      // Priority 2: Authenticated user's config
      const session = await auth();
      if (session?.user?.id) {
        const collection = await getClientConfigsCollection();
        config = await collection.findOne({ userId: session.user.id });
      }
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Return only what's needed for client-side generation
    return NextResponse.json({
      success: true,
      config: {
        businessName: config.businessName,
        agentProfile: config.agentProfile || null,
        storyMappings: config.storyMappings || {},
        selectedOffers: config.selectedOffers || [],
        qdrantCollectionName: config.qdrantCollectionName,
        colorConfig: config.colorConfig || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
