// frontend/app/api/offers/[type]/test/route.ts
/**
 * API route for testing offer generation
 * POST: Test offer generation with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';
import {
  getOfferCustomization,
  updateLastTested,
} from '@/lib/mongodb/models/offerCustomization';
import { generateOffer, getOfferDefinition } from '@/lib/offers';
import { mergeOfferDefinition } from '@/lib/offers/utils/mergeCustomizations';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferTestRequest } from '@/types/offers/offerCustomization.types';
import OpenAI from 'openai';
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { OfferGenerationUsage } from '@/types/tokenUsage.types';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';

/**
 * POST /api/offers/[type]/test
 * Test offer generation with sample data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15+ requirement)
    const { type } = await params;
    const offerType = type as OfferType;
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

    // Check rate limits
    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit('offerGeneration', session.user.id, ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${rateLimit.resetAt.toISOString()}`,
          resetAt: rateLimit.resetAt,
          remaining: rateLimit.remaining,
          metadata: {
            cost: 0,
            tokensUsed: 0,
            duration: 0,
            retries: 0,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get user customizations and merge
    const db = await getDatabase();
    const customization = await getOfferCustomization(
      db,
      session.user.id,
      offerType
    );
    const mergedDef = mergeOfferDefinition(systemDef, customization);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
    });

    if (!openai.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key not configured',
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

    // Generate offer
    const startTime = Date.now();
    const result = await generateOffer(
      mergedDef,
      sampleData,
      {
        userId: session.user.id,
        agentId: session.user.id, // Use id as agent ID for testing
        flow: context?.flow || 'buy',
        businessName: context?.businessName || 'Test Business',
        qdrantAdvice: context?.qdrantAdvice || [],
      },
      openai
    );
    const duration = Date.now() - startTime;

    // Track token usage
    if (result.success && result.metadata) {
      const promptTokens = (result.metadata as any).promptTokens || Math.round((result.metadata.tokensUsed || 0) * 0.7);
      const completionTokens = (result.metadata as any).completionTokens || Math.round((result.metadata.tokensUsed || 0) * 0.3);

      const baseTracking = createBaseTrackingObject({
        userId: session.user.id,
        provider: 'openai',
        model: mergedDef.generationMetadata.model,
        apiType: 'chat',
        startTime,
      });

      const usage: OfferGenerationUsage = {
        ...updateTrackingWithResponse(baseTracking, {
          inputTokens: promptTokens,
          outputTokens: completionTokens,
          finishReason: undefined,
          contentLength: result.data ? JSON.stringify(result.data).length : 0,
          endTime: Date.now(),
        }),
        feature: 'offerGeneration',
        apiType: 'chat',
        model: mergedDef.generationMetadata.model,
        featureData: {
          generationId: undefined,
          conversationId: undefined,
          flow: context?.flow || 'buy',
          clientIdentifier: undefined,
          qdrantRetrieval: {
            collectionsQueried: [],
            itemsRetrieved: 0,
            adviceUsed: context?.qdrantAdvice?.length || 0,
          },
          outputComponents: result.data ? Object.keys(result.data).filter(k => k !== '_debug') : [],
          componentCount: result.data ? Object.keys(result.data).filter(k => k !== '_debug').length : 0,
        },
      };

      trackUsageAsync(usage);
    }

    // Update last tested timestamp
    await updateLastTested(db, session.user.id, offerType);

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
          cost: 0,
          tokensUsed: 0,
          duration,
          retries: result.metadata?.retries || 0,
        },
      });
    }
  } catch (error: any) {
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
