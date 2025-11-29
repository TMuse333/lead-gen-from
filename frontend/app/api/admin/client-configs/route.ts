// app/api/admin/client-configs/route.ts
// API route to get all client configurations (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

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

    // TODO: Add admin check here
    // For now, allow any authenticated user to see all configs
    // In production, you'd check if user is admin:
    // const isAdmin = await checkAdminStatus(session.user.id);
    // if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
    console.error('❌ Error fetching client configs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch client configurations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

