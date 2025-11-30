// frontend/app/api/offers/[type]/test/route.ts
/**
 * API route for testing offer generation
 * POST: Test offer generation with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb/db';
import {
  getOfferCustomization,
  updateLastTested,
} from '@/lib/mongodb/models/offerCustomization';
import { generateOffer, getOfferDefinition } from '@/lib/offers';
import { mergeOfferDefinition } from '@/lib/offers/utils/mergeCustomizations';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferTestRequest } from '@/types/offerCustomization.types';

/**
 * POST /api/offers/[type]/test
 * Test offer generation with sample data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerType = params.type as OfferType;
    const body: OfferTestRequest = await req.json();
    const { sampleData, context } = body;

    // Get system definition
    const systemDef = getOfferDefinition(offerType);
    if (!systemDef) {
      return NextResponse.json(
        { error: 'Offer type not found' },
        { status: 404 }
      );
    }

    // Get user customizations and merge
    const { db } = await connectToDatabase();
    const customization = await getOfferCustomization(
      db,
      session.user.email,
      offerType
    );
    const mergedDef = mergeOfferDefinition(systemDef, customization);

    // Generate offer
    const startTime = Date.now();
    const result = await generateOffer(
      mergedDef,
      sampleData,
      {
        userId: session.user.email,
        agentId: session.user.email, // Use email as agent ID for testing
        flow: context?.flow || 'buy',
        businessName: context?.businessName || 'Test Business',
        qdrantAdvice: context?.qdrantAdvice || [],
      }
    );
    const duration = Date.now() - startTime;

    // Update last tested timestamp
    await updateLastTested(db, session.user.email, offerType);

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: {
          cost: result.metadata.cost,
          tokensUsed: result.metadata.tokensUsed,
          duration,
          retries: result.metadata.retries,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        metadata: {
          cost: result.metadata?.cost || 0,
          tokensUsed: result.metadata?.tokensUsed || 0,
          duration,
          retries: result.metadata?.retries || 0,
        },
      });
    }
  } catch (error: any) {
    console.error('[POST /api/offers/[type]/test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        metadata: {
          cost: 0,
          tokensUsed: 0,
          duration: 0,
          retries: 0,
        },
      },
      { status: 500 }
    );
  }
}
