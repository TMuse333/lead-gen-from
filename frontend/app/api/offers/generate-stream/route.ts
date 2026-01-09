// app/api/offers/generate-stream/route.ts
/**
 * Streaming API route for generating offers with Server-Sent Events
 */

import { NextRequest } from 'next/server';
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

import { generateFromUnifiedOffer } from '@/lib/offers';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { Intent } from '@/lib/offers/unified/types';
import { getOffer, filterOffersForIntent } from '@/lib/offers/unified/registry';
import '@/lib/offers/unified/offers';
import { groupStoriesByPhase, getTopStoriesPerPhase } from '@/lib/stories/storyUtils';
import { queryRelevantAdvice } from '@/lib/qdrant/collections/vector/advice/queries';
import { generateUserEmbedding } from '@/lib/openai/userEmbedding';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function formatSSE(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(formatSSE(event, data)));
      };

      const sendError = (error: string, details?: any) => {
        sendEvent('error', { error, ...details });
        controller.close();
      };

      try {
        // ========== STEP 1: PARSE REQUEST ==========
        let body: any;
        try {
          body = await req.json();
        } catch (err) {
          return sendError('Invalid JSON in request body');
        }

        const { flow, intent, offer, userInput, clientIdentifier, conversationId } = body;
        const effectiveIntent = intent || flow;

        // Validate required fields
        if (!effectiveIntent || typeof effectiveIntent !== 'string') {
          return sendError('intent (or flow) is required and must be a string');
        }
        if (!userInput || typeof userInput !== 'object') {
          return sendError('userInput is required and must be an object');
        }

        sendEvent('progress', { step: 'config', message: 'Loading configuration...', percent: 10 });

        // ========== STEP 2: AUTH & RATE LIMIT ==========
        let userId: string | undefined;
        try {
          const session = await auth();
          userId = session?.user?.id;
        } catch {
          // Not authenticated
        }

        const ip = getClientIP(req);
        const rateLimit = await checkRateLimit('offerGeneration', userId, ip);
        if (!rateLimit.allowed) {
          return sendError('Rate limit exceeded. Please try again later.');
        }

        // ========== STEP 3: LOAD USER CONFIG ==========
        let configuredOffers: OfferType[] = [];
        let userCollectionName: string | null = null;
        let businessName: string = '';
        const clientId = clientIdentifier || body?.clientId;

        // IMPORTANT: Prioritize clientId if provided - this allows authenticated users
        // to test their public bot configs from the dashboard
        if (clientId) {
          try {
            const collection = await getClientConfigsCollection();
            const config = await collection.findOne({ businessName: clientId, isActive: true });
            if (config) {
              configuredOffers = config.selectedOffers || [];
              userCollectionName = config.qdrantCollectionName;
              businessName = config.businessName;
            }
          } catch (e) {
            // Failed to load client config
          }
        } else if (userId) {
          try {
            const db = await getDatabase();
            const userConfig = await getUserConfig(userId, db);
            if (userConfig) {
              configuredOffers = userConfig.selectedOffers || [];
              userCollectionName = await getUserCollectionName(userId);
              businessName = userConfig.businessName || '';
            }
          } catch (e) {
            // Failed to load user config
          }
        }

        // ========== STEP 4: DETERMINE WHICH OFFER TO GENERATE ==========
        let selectedOffers: OfferType[];

        if (offer && typeof offer === 'string') {
          // Specific offer provided - validate it
          if (!configuredOffers.includes(offer as OfferType)) {
            return sendError(`Offer "${offer}" is not configured`, {
              availableOffers: configuredOffers,
            });
          }
          selectedOffers = [offer as OfferType];
        } else if (configuredOffers.length === 1) {
          // Only one configured - use it
          selectedOffers = configuredOffers;
        } else if (configuredOffers.length > 1) {
          // Multiple configured but none specified - ERROR
          return sendError('No specific offer provided in request', {
            availableOffers: configuredOffers,
            hint: 'The chatbot must send the "offer" parameter. Check that selectedOffer is set in the chat store.',
          });
        } else {
          return sendError('No offers configured. Please complete onboarding first.');
        }

        // Filter by intent support
        const offersForIntent = filterOffersForIntent(selectedOffers, effectiveIntent as Intent);

        if (offersForIntent.length === 0) {
          return sendError(`No offers support the "${effectiveIntent}" intent`, {
            selectedOffers,
            intent: effectiveIntent,
          });
        }

        sendEvent('progress', { step: 'config', message: 'Configuration loaded', percent: 20 });

        // ========== STEP 5: GET KNOWLEDGE BASE ADVICE ==========
        sendEvent('progress', { step: 'advice', message: 'Searching knowledge base...', percent: 30 });

        const knowledgeSets: KnowledgeSet[] = userCollectionName
          ? [{ type: 'vector', name: userCollectionName }]
          : [];

        const { advice, metadata: qdrantMetadata } = await getPersonalizedAdvice(
          process.env.AGENT_ID || 'default-agent',
          effectiveIntent,
          userInput,
          knowledgeSets
        );

        // ========== STEP 5.5: QUERY AND PROCESS STORIES ==========
        // Query full advice objects to get stories with kind field
        let storiesByPhase: Record<string, any[]> = {};
        let storyCount = 0;

        if (userCollectionName) {
          try {
            // Generate embedding for story search
            const embedding = await generateUserEmbedding(effectiveIntent, userInput);

            // Query full advice scenarios including stories
            const fullAdvice = await queryRelevantAdvice(
              process.env.AGENT_ID || 'default-agent',
              embedding,
              effectiveIntent,
              userInput,
              { limit: 20, collectionName: userCollectionName }
            );

            // Extract and group stories by phase
            const primaryOfferType = offersForIntent[0] as OfferType || 'real-estate-timeline';
            const allStoriesByPhase = groupStoriesByPhase(fullAdvice, primaryOfferType, userInput);
            storiesByPhase = getTopStoriesPerPhase(allStoriesByPhase, 1); // 1 story per phase

            storyCount = Object.values(storiesByPhase).flat().length;
          } catch (storyError) {
            // Continue without stories
          }
        }

        sendEvent('progress', { step: 'advice', message: `Found ${advice.length} insights, ${storyCount} stories`, percent: 40 });

        // ========== STEP 6: GENERATE OFFER ==========
        const context = {
          flow: effectiveIntent,
          intent: effectiveIntent,
          businessName,
          qdrantAdvice: advice,
          userId: userId || 'anonymous',
          agentId: process.env.AGENT_ID || 'default-agent',
          additionalContext: { conversationId, qdrantCollectionName: userCollectionName },
        };

        const mergedUserInput = {
          ...userInput,
          flow: userInput.flow || effectiveIntent,
          intent: effectiveIntent,
        };

        const results: Record<string, any> = {};
        const errors: Record<string, string> = {};

        for (let i = 0; i < offersForIntent.length; i++) {
          const offerType = offersForIntent[i];
          const percent = 45 + ((i + 1) / offersForIntent.length) * 40;

          sendEvent('progress', {
            step: 'generating',
            message: `Creating ${offerType.replace(/-/g, ' ')}...`,
            offer: offerType,
            percent: Math.round(percent - 20),
          });

          try {
            const unifiedOffer = getOffer(offerType);
            if (!unifiedOffer) {
              errors[offerType] = 'Offer definition not found in registry';
              continue;
            }

            const result = await generateFromUnifiedOffer(unifiedOffer, mergedUserInput, context, openai);

            if (!result.success || !result.data) {
              errors[offerType] = (result as any).error || 'Generation failed';
              continue;
            }

            results[offerType] = result.data;

            sendEvent('progress', {
              step: 'generating',
              message: `${offerType.replace(/-/g, ' ')} ready!`,
              offer: offerType,
              percent: Math.round(percent),
              offerComplete: true,
            });
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            errors[offerType] = errMsg;
          }
        }

        // Check results
        if (Object.keys(results).length === 0) {
          return sendError('Failed to generate any offers', { errors });
        }

        // ========== STEP 7: SAVE & COMPLETE ==========
        sendEvent('progress', { step: 'finalizing', message: 'Saving results...', percent: 90 });

        const generationTime = Date.now() - startTime;
        const debugInfo = {
          qdrantRetrieval: qdrantMetadata,
          adviceUsed: advice.length,
          storiesMatched: storyCount,
          generationTime,
          promptLength: 0, // Not tracked in streaming route
          flow: effectiveIntent,
          userInput,
          intent: effectiveIntent,
          offersGenerated: Object.keys(results),
          errors: Object.keys(errors).length > 0 ? errors : undefined,
        };

        // Save to DB (non-blocking)
        if (conversationId && ObjectId.isValid(conversationId)) {
          try {
            const generationsCollection = await getGenerationsCollection();
            await generationsCollection.insertOne({
              conversationId: new ObjectId(conversationId),
              userId,
              clientIdentifier: clientId || undefined,
              flow: effectiveIntent,
              generatedAt: new Date(),
              generationTime,
              llmOutput: results,
              debugInfo,
              userInput,
              status: 'success',
              outputSize: JSON.stringify(results).length,
              componentCount: Object.keys(results).length,
            } as GenerationDocument);
          } catch {
            // Don't fail if save fails
          }
        }

        sendEvent('progress', { step: 'complete', message: 'Ready!', percent: 100 });
        sendEvent('complete', { ...results, _debug: debugInfo, _stories: storiesByPhase });
        controller.close();

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown server error';
        sendEvent('error', { error: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
