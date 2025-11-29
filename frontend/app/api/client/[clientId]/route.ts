// app/api/client/[clientId]/route.ts
// Public API route to fetch client configuration by business name

import { NextRequest, NextResponse } from 'next/server';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Unwrap params (Next.js 15+)
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching config for client: ${clientId}`);

    // Get client configuration from MongoDB
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ 
      businessName: clientId,
      isActive: true // Only return active configurations
    });

    if (!config) {
      console.log(`❌ Config not found for client: ${clientId}`);
      return NextResponse.json(
        { 
          error: 'Configuration not found',
          message: `No active bot configuration found for "${clientId}"`,
        },
        { status: 404 }
      );
    }

    // Return configuration (exclude sensitive data if needed)
    return NextResponse.json({
      success: true,
      config: {
        id: config._id?.toString(),
        businessName: config.businessName,
        industry: config.industry,
        dataCollection: config.dataCollection,
        selectedIntentions: config.selectedIntentions,
        selectedOffers: config.selectedOffers,
        customOffer: config.customOffer,
        conversationFlows: config.conversationFlows,
        colorConfig: config.colorConfig,
        qdrantCollectionName: config.qdrantCollectionName,
        isActive: config.isActive,
        onboardingCompletedAt: config.onboardingCompletedAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching client config:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch client configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

