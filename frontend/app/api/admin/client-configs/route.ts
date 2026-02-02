// app/api/admin/client-configs/route.ts
// API route to get all client configurations (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/adminCheck';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

export async function GET(request: NextRequest) {
  try {
    // 1. Check if user is admin
    const session = await checkIsAdmin();
    if (!session) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 2. Get all client configurations
    const collection = await getClientConfigsCollection();
    const configs = await collection
      .find({})
      .sort({ onboardingCompletedAt: -1 })
      .toArray();

    // 3. Format response (remove sensitive data if needed)
    const formattedConfigs = configs.map((config) => ({
      id: config._id?.toString(),
      userId: config.userId,
      businessName: config.businessName,
      industry: config.industry,
      selectedIntentions: config.selectedIntentions,
      selectedOffers: config.selectedOffers,
      conversationFlowsCount: Object.keys(config.conversationFlows || {}).length,
      knowledgeBaseItemsCount: config.knowledgeBaseItems?.length || 0,
      qdrantCollectionName: config.qdrantCollectionName,
      isActive: config.isActive,
      onboardingCompletedAt: config.onboardingCompletedAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: formattedConfigs.length,
      configs: formattedConfigs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch client configurations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 1. Check if user is admin
    const session = await checkIsAdmin();
    if (!session) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { businessName, userId, colorConfig } = body;

    if (!businessName && !userId) {
      return NextResponse.json(
        { error: 'businessName or userId is required' },
        { status: 400 }
      );
    }

    if (!colorConfig) {
      return NextResponse.json(
        { error: 'colorConfig is required' },
        { status: 400 }
      );
    }

    // 3. Update client configuration
    const collection = await getClientConfigsCollection();

    const filter = businessName
      ? { businessName }
      : { userId };

    const result = await collection.updateOne(
      filter,
      {
        $set: {
          colorConfig,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Client configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Color configuration updated successfully',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update client configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

