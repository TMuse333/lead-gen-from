// app/api/user/config/route.ts
// API route to get the current user's client configuration

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Get user's client configuration
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId });

    if (!config) {
      return NextResponse.json(
        { 
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    // 3. Return configuration (exclude sensitive data if needed)
    return NextResponse.json({
      success: true,
      config: {
        id: config._id?.toString(),
        userId: config.userId,
        businessName: config.businessName,
        industry: config.industry,
        dataCollection: config.dataCollection,
        selectedIntentions: config.selectedIntentions,
        selectedOffers: config.selectedOffers,
        customOffer: config.customOffer,
        conversationFlows: config.conversationFlows,
        colorConfig: config.colorConfig,
        knowledgeBaseItems: config.knowledgeBaseItems,
        qdrantCollectionName: config.qdrantCollectionName,
        isActive: config.isActive,
        onboardingCompletedAt: config.onboardingCompletedAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user config:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

