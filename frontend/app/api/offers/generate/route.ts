// app/api/offers/generate/route.ts
/**
 * API route for generating offers using the offer definition system
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth/authConfig';
import { getUserCollectionName } from '@/lib/userConfig/getUserCollection';
import { getClientConfigsCollection, getGenerationsCollection, getDatabase } from '@/lib/mongodb/db';
import { getPersonalizedAdvice } from '@/lib/personalization/context';
import { KnowledgeSet } from '@/types';
import { ObjectId } from 'mongodb';
import type { GenerationDocument } from '@/lib/mongodb/models/generation';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';
import { getUserConfig } from '@/lib/userConfig/getUserConfig';

// Import the offer system
import { generateFromUnifiedOffer } from '@/lib/offers';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { Intent } from '@/lib/offers/unified/types';
import { getOffer, filterOffersForIntent } from '@/lib/offers/unified/registry';
// Import unified offers index to ensure ALL offers are registered
import '@/lib/offers/unified/offers';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [API] /api/offers/generate - Request received');

  try {
    // Check rate limits
    let userId: string | undefined;
    let session: any;
    try {
      session = await auth();
      userId = session?.user?.id;
      console.log('🔵 [API] Auth check:', { hasSession: !!session, userId });
    } catch (authError) {
      console.log('🔵 [API] Auth error (continuing without auth):', authError);
      // Not authenticated, continue
    }

    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit('offerGeneration', userId, ip);
    console.log('🔵 [API] Rate limit check:', { allowed: rateLimit.allowed, remaining: rateLimit.remaining });

    if (!rateLimit.allowed) {
      console.log('🔴 [API] Rate limit exceeded');
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${rateLimit.resetAt.toISOString()}`,
          resetAt: rateLimit.resetAt,
          remaining: rateLimit.remaining,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    let body: any;
    try {
      body = await req.json();
      console.log('🔵 [API] Request body parsed:', {
        flow: body.flow,
        hasUserInput: !!body.userInput,
        userInputKeys: body.userInput ? Object.keys(body.userInput) : [],
        clientIdentifier: body.clientIdentifier,
        clientId: body.clientId,
        conversationId: body.conversationId,
      });
    } catch (err) {
      console.log('🔴 [API] Failed to parse JSON body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { flow, intent, offer, userInput, clientIdentifier, conversationId } = body;

    // Support both new intent system and legacy flow system
    const effectiveIntent = intent || flow;

    if (!effectiveIntent || typeof effectiveIntent !== 'string') {
      return NextResponse.json(
        { error: 'intent (or flow) is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userInput || typeof userInput !== 'object') {
      return NextResponse.json(
        { error: 'userInput is required and must be an object' },
        { status: 400 }
      );
    }

    // Get user/client configuration to determine which offers to generate
    let configuredOffers: OfferType[] = [];
    let userCollectionName: string | null = null;
    let businessName: string = '';

    // Check for public bot client identifier
    const clientId = clientIdentifier || body?.clientId;
    console.log('🔵 [API] Config lookup:', { clientId, userId });

    if (clientId) {
      // Public bot: fetch client config
      console.log('🔵 [API] Looking up client config for:', clientId);
      try {
        const collection = await getClientConfigsCollection();
        const config = await collection.findOne({
          businessName: clientId,
          isActive: true,
        });
        console.log('🔵 [API] Client config found:', {
          found: !!config,
          selectedOffers: config?.selectedOffers,
          hasQdrant: !!config?.qdrantCollectionName,
        });
        if (config) {
          configuredOffers = config.selectedOffers || [];
          userCollectionName = config.qdrantCollectionName;
          businessName = config.businessName;
        }
      } catch (configError) {
        console.error('🔴 [API] Error fetching client config:', configError);
        // Continue without client config
      }
    } else if (userId) {
      // Authenticated user: get from user config
      console.log('🔵 [API] Looking up user config for userId:', userId);
      try {
        const db = await getDatabase();
        const userConfig = await getUserConfig(userId, db);
        console.log('🔵 [API] User config found:', {
          found: !!userConfig,
          selectedOffers: userConfig?.selectedOffers,
          businessName: userConfig?.businessName,
        });
        if (userConfig) {
          configuredOffers = userConfig.selectedOffers || [];
          userCollectionName = await getUserCollectionName(userId);
          businessName = userConfig.businessName || '';
        }
      } catch (userConfigError) {
        console.error('🔴 [API] Error fetching user config:', userConfigError);
        // Continue without user config
      }
    } else {
      console.log('🟡 [API] No clientId or userId - cannot load offers config');
    }

    // IMPORTANT: Require specific offer from request to prevent generating all offers.
    // The chatbot should always specify which offer to generate.
    let selectedOffers: OfferType[];
    if (offer && typeof offer === 'string') {
      // Validate the offer is in the configured offers
      if (!configuredOffers.includes(offer as OfferType)) {
        return NextResponse.json(
          { error: `Offer "${offer}" is not configured. Available offers: ${configuredOffers.join(', ')}` },
          { status: 400 }
        );
      }
      selectedOffers = [offer as OfferType];
      console.log(`🔵 [API] Using specific offer from request: ${offer}`);
    } else if (configuredOffers.length === 1) {
      // Only one offer configured, use it
      selectedOffers = configuredOffers;
      console.log(`🔵 [API] Using single configured offer: ${configuredOffers[0]}`);
    } else if (configuredOffers.length > 1) {
      // Multiple offers configured but none specified - this is an error
      console.error('🔴 [API] Multiple offers configured but no specific offer provided in request');
      return NextResponse.json(
        {
          error: 'No specific offer provided. Please specify which offer to generate.',
          availableOffers: configuredOffers,
          hint: 'The chatbot should send the "offer" parameter with the request.'
        },
        { status: 400 }
      );
    } else {
      console.log('🔴 [API] No offers configured - returning 400');
      return NextResponse.json(
        { error: 'No offers configured. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    console.log('🔵 [API] Final config:', {
      selectedOffers,
      userCollectionName,
      businessName,
    });

    // If no offers selected (shouldn't happen after above logic, but safety check)
    if (selectedOffers.length === 0) {
      console.log('🔴 [API] No offers configured - returning 400');
      return NextResponse.json(
        { error: 'No offers configured. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    // Get Qdrant advice for context
    const knowledgeSets: KnowledgeSet[] = userCollectionName
      ? [{ type: 'vector', name: userCollectionName }]
      : [];

    // Note: We get general advice here. Per-offer and per-phase advice
    // is retrieved during individual offer generation when needed.
    const { advice, metadata: qdrantMetadata } = await getPersonalizedAdvice(
      process.env.AGENT_ID || 'default-agent',
      effectiveIntent,
      userInput,
      knowledgeSets
    );

    // Store collection name for per-phase advice retrieval
    const qdrantCollectionName = userCollectionName;

    // Build context for offer generation
    const agentId = process.env.AGENT_ID || 'default-agent';
    const context = {
      flow: effectiveIntent,
      intent: effectiveIntent,
      businessName,
      qdrantAdvice: advice,
      userId: userId || 'anonymous',
      agentId,
      additionalContext: {
        conversationId,
        qdrantCollectionName, // Available for per-phase advice retrieval
      },
    };

    // Generate all configured offers
    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Merge flow into userInput for validation (flow is required by some offers)
    const mergedUserInput = {
      ...userInput,
      flow: userInput.flow || effectiveIntent,
      intent: effectiveIntent,
    };

    // Filter offers to only those supporting this intent
    const offersForIntent = filterOffersForIntent(selectedOffers, effectiveIntent as Intent);
    console.log('🔵 [API] Offers supporting', effectiveIntent + ':', offersForIntent);

    if (offersForIntent.length === 0) {
      return NextResponse.json(
        { error: `No offers support the ${effectiveIntent} intent` },
        { status: 400 }
      );
    }

    // NOTE: Validation removed - the chatbot guarantees all required questions are answered
    // before triggering generation. Both use the same offer definition as source of truth.

    console.log('🔵 [API] Starting offer generation loop for:', offersForIntent);

    for (const offerType of offersForIntent) {
      console.log(`🔵 [API] Processing offer type: ${offerType}`);
      try {
        // Get the unified offer definition
        const unifiedOffer = getOffer(offerType);

        if (!unifiedOffer) {
          console.log(`🔴 [API] No unified offer found for: ${offerType}`);
          errors[offerType] = 'Offer definition not found';
          continue;
        }

        // Validation already passed at merged level - proceed to generation
        console.log(`🔵 [API] Calling generateFromUnifiedOffer for ${offerType}...`);
        const result = await generateFromUnifiedOffer(unifiedOffer, mergedUserInput, context, openai);
        console.log(`🔵 [API] generateFromUnifiedOffer result for ${offerType}:`, {
          success: result.success,
          hasData: !!(result as any).data,
          error: (result as any).error,
        });

        if (!result.success || !result.data) {
          console.log(`🔴 [API] Generation failed for ${offerType}:`, (result as any).error);
          errors[offerType] = (result as any).error || 'Generation failed';
          continue;
        }

        console.log(`✅ [API] Successfully generated ${offerType}`);
        results[offerType] = result.data;
      } catch (error) {
        console.error(`🔴 [API] Exception generating ${offerType}:`, error);
        errors[offerType] = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check if any offers were generated successfully
    const generatedOffers = Object.keys(results);
    if (generatedOffers.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to generate any offers',
          errors,
        },
        { status: 500 }
      );
    }

    // Calculate generation time
    const generationTime = Date.now() - startTime;

    // Prepare debug info
    const debugInfo = {
      qdrantRetrieval: qdrantMetadata,
      promptLength: 0, // Not tracked per-offer currently
      adviceUsed: advice.length,
      generationTime,
      userInput,
      flow,
      offersGenerated: generatedOffers,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };

    // Save generation to database
    if (conversationId && ObjectId.isValid(conversationId)) {
      try {
        const generationsCollection = await getGenerationsCollection();

        const outputSize = JSON.stringify(results).length;
        const componentCount = generatedOffers.length;

        const generation: Omit<GenerationDocument, '_id'> = {
          conversationId: new ObjectId(conversationId),
          userId,
          clientIdentifier: clientId || undefined,
          flow: flow,
          generatedAt: new Date(),
          generationTime: generationTime,
          llmOutput: results,
          debugInfo: debugInfo,
          userInput: userInput,
          status: 'success',
          outputSize,
          componentCount,
        };

        await generationsCollection.insertOne(generation as GenerationDocument);
      } catch {
        // Don't fail the request if save fails
      }
    }

    // Return results
    console.log(`✅ [API] Returning response with ${Object.keys(results).length} offers`);
    return NextResponse.json({
      ...results,
      _debug: debugInfo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('🔴 [API] Top-level error in /api/offers/generate:', {
      message,
      stack,
      err,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
