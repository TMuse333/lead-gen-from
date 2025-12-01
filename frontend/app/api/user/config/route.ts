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

/**
 * PUT /api/user/config
 * Update user configuration (e.g., add offer to selectedOffers)
 */
export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { selectedOffers } = body;

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

    // 3. Update selectedOffers if provided
    if (selectedOffers && Array.isArray(selectedOffers)) {
      await collection.updateOne(
        { userId },
        {
          $set: {
            selectedOffers,
            updatedAt: new Date(),
          },
        }
      );
    }

    // 4. Fetch updated config
    const updatedConfig = await collection.findOne({ userId });

    return NextResponse.json({
      success: true,
      config: {
        id: updatedConfig?._id?.toString(),
        userId: updatedConfig?.userId,
        businessName: updatedConfig?.businessName,
        industry: updatedConfig?.industry,
        dataCollection: updatedConfig?.dataCollection,
        selectedIntentions: updatedConfig?.selectedIntentions,
        selectedOffers: updatedConfig?.selectedOffers,
        customOffer: updatedConfig?.customOffer,
        conversationFlows: updatedConfig?.conversationFlows,
        colorConfig: updatedConfig?.colorConfig,
        knowledgeBaseItems: updatedConfig?.knowledgeBaseItems,
        qdrantCollectionName: updatedConfig?.qdrantCollectionName,
        isActive: updatedConfig?.isActive,
        onboardingCompletedAt: updatedConfig?.onboardingCompletedAt,
        createdAt: updatedConfig?.createdAt,
        updatedAt: updatedConfig?.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error updating user config:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

