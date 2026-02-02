// app/api/offers/generate-stream/route.ts
/**
 * LEGACY ROUTE - Kept for backwards compatibility and future LLM features
 *
 * This route is NO LONGER USED by the main chat flow.
 * Timeline generation now happens client-side (see useClientSideTimeline hook).
 *
 * WHEN TO USE THIS ROUTE:
 * - Non-timeline offer types that require LLM generation
 * - Future features that need semantic search or LLM processing
 * - Testing/debugging generation with SSE progress events
 *
 * FUTURE LLM INTEGRATION POINTS (see comments at bottom of file):
 * - Personalized phase descriptions
 * - Smart action item prioritization
 * - Semantic story matching
 * - Dynamic tip generation
 * - Personalized offer introductions
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
import { resolveStoriesForFlow } from '@/lib/qdrant/collections/vector/advice/getStoriesByIds';
import type { StoryMappings, StoriesByPhase } from '@/types/advice.types';
import {
  generateFastTimeline,
  type UserTimelineInput,
} from '@/lib/offers/definitions/timeline/fast-timeline-generator';
import type { TimelineOutput, TimelinePhase, ActionItem } from '@/lib/offers/definitions/timeline/timeline-types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Default disclaimer for fast-generated timelines
const DEFAULT_DISCLAIMER = `This timeline is a general guide based on typical real estate transactions.
Actual timelines may vary based on market conditions, financing, and other factors.
Consult with your real estate agent and other professionals for specific advice.`;

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
        let storyMappings: StoryMappings | undefined;
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
              storyMappings = config.storyMappings;
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
              storyMappings = userConfig.storyMappings;
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

        // ========== STEP 5.5: RESOLVE STATIC STORY MAPPINGS ==========
        // Use explicit phase-to-story mappings from dashboard config (no semantic search)
        let storiesByPhase: StoriesByPhase = {};
        let storyCount = 0;

        if (userCollectionName && storyMappings) {
          try {
            // Map browse to buy for MVP (browse is commented out)
            const rawFlow = effectiveIntent === 'browse' ? 'buy' : effectiveIntent;
            const flow = rawFlow as 'buy' | 'sell';
            storiesByPhase = await resolveStoriesForFlow(
              userCollectionName,
              storyMappings,
              flow
            );
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
            // ========== FAST PATH: Use hardcoded templates for timeline offers ==========
            if (offerType === 'real-estate-timeline') {
              // Build input for fast generator
              // Map browse to buy for MVP (browse is commented out)
              const timelineFlow = (effectiveIntent === 'browse' ? 'buy' : effectiveIntent) as 'buy' | 'sell';
              const timelineInput: UserTimelineInput = {
                flow: timelineFlow || 'buy',
                location: mergedUserInput.location,
                budget: mergedUserInput.budget,
                timeline: mergedUserInput.timeline,
                isFirstTimeBuyer: mergedUserInput.isFirstTimeBuyer || mergedUserInput.buyerType === 'first-time',
                isPreApproved: mergedUserInput.preApproval === 'yes' || mergedUserInput.isPreApproved,
                currentStage: mergedUserInput.currentStage,
                motivation: mergedUserInput.motivation,
                additionalContext: mergedUserInput.additionalContext,
              };

              // Generate timeline using fast hardcoded templates (no LLM)
              const generatedTimeline = generateFastTimeline(timelineInput);

              // Convert to TimelineOutput format
              const phases: TimelinePhase[] = generatedTimeline.phases
                .filter(p => !p.isSkipped)
                .map((phase, index) => ({
                  id: phase.id,
                  name: phase.name,
                  timeline: phase.timeline,
                  description: phase.description,
                  actionItems: phase.actionItems.map(item => ({
                    task: item.text,
                    priority: item.priority,
                    details: item.details,
                  })) as ActionItem[],
                  agentAdvice: phase.agentAdvice || [],
                  isOptional: false,
                  conditionalNote: phase.skipReason,
                  order: index + 1,
                }));

              const timelineOutput: TimelineOutput = {
                // BaseOfferProps
                id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'real-estate-timeline',
                businessName: businessName || 'AI Assistant',
                flow: effectiveIntent,
                generatedAt: new Date().toISOString(),
                version: '2.0-fast',
                // TimelineOutput specific
                title: generatedTimeline.title,
                subtitle: generatedTimeline.subtitle,
                userSituation: {
                  flow: generatedTimeline.flow,
                  timeline: generatedTimeline.userSituation.timeline,
                  location: generatedTimeline.userSituation.location,
                  budget: generatedTimeline.userSituation.budget,
                  isFirstTime: generatedTimeline.userSituation.isFirstTimeBuyer,
                  contactName: mergedUserInput.contactName,
                  contactEmail: mergedUserInput.contactEmail,
                },
                phases,
                totalEstimatedTime: generatedTimeline.totalEstimatedTime,
                disclaimer: DEFAULT_DISCLAIMER,
                metadata: {
                  generatedBy: 'fast-hardcoded',
                  phasesCount: phases.length,
                  totalActionItems: phases.reduce((sum, p) => sum + p.actionItems.length, 0),
                },
              };

              results[offerType] = timelineOutput;

              sendEvent('progress', {
                step: 'generating',
                message: `${offerType.replace(/-/g, ' ')} ready! (fast generation)`,
                offer: offerType,
                percent: Math.round(percent),
                offerComplete: true,
              });
              continue;
            }

            // ========== SLOW PATH: Use LLM for other offer types ==========
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

// =============================================================================
// FUTURE LLM INTEGRATION ROADMAP
// =============================================================================
//
// This route is preserved for when you're ready to add LLM-powered features.
// Below are specific integration points with implementation sketches.
//
// -----------------------------------------------------------------------------
// LEVEL 1: ENHANCED PERSONALIZATION (Low complexity)
// -----------------------------------------------------------------------------
//
// 1. PERSONALIZED OFFER INTRO
//    Generate a warm, personalized intro paragraph based on user's situation.
//
//    async function generatePersonalizedIntro(
//      userInput: Record<string, any>,
//      agentProfile: AgentProfile
//    ): Promise<string> {
//      const prompt = `Write a 2-sentence personalized greeting for ${userInput.contactName},
//        a ${userInput.buyerType} looking to ${userInput.flow} in ${userInput.location}.
//        The agent is ${agentProfile.name} with ${agentProfile.yearsExperience} years experience.`;
//      const response = await openai.chat.completions.create({
//        model: 'gpt-4o-mini',
//        messages: [{ role: 'user', content: prompt }],
//        max_tokens: 100,
//      });
//      return response.choices[0].message.content || '';
//    }
//
// 2. CONTEXTUAL PHASE DESCRIPTIONS
//    Rewrite phase descriptions based on user's specific situation.
//
//    async function personalizePhaseDescription(
//      phase: TimelinePhase,
//      userInput: Record<string, any>
//    ): Promise<string> {
//      // Use LLM to adapt generic description to user's context
//    }
//
// -----------------------------------------------------------------------------
// LEVEL 2: SMART CONTENT SELECTION (Medium complexity)
// -----------------------------------------------------------------------------
//
// 3. SEMANTIC STORY MATCHING (re-enable Qdrant vector search)
//    Instead of static mappings, find most relevant stories using embeddings.
//
//    async function findRelevantStories(
//      phase: TimelinePhase,
//      userInput: Record<string, any>,
//      collectionName: string
//    ): Promise<Story[]> {
//      const embedding = await generateEmbedding(
//        `${phase.name} ${userInput.situation} ${userInput.concerns}`
//      );
//      return await qdrant.search(collectionName, {
//        vector: embedding,
//        filter: { kind: 'story', phase: phase.id },
//        limit: 2,
//      });
//    }
//
// 4. DYNAMIC TIP PRIORITIZATION
//    Reorder and filter tips based on user's specific needs.
//
//    async function prioritizeTips(
//      tips: Tip[],
//      userInput: Record<string, any>,
//      phase: TimelinePhase
//    ): Promise<Tip[]> {
//      const prompt = `Given a ${userInput.buyerType} in the "${phase.name}" phase
//        with budget ${userInput.budget}, rank these tips by relevance...`;
//      // Return reordered tips
//    }
//
// -----------------------------------------------------------------------------
// LEVEL 3: DYNAMIC CONTENT GENERATION (High complexity)
// -----------------------------------------------------------------------------
//
// 5. CUSTOM ACTION ITEMS
//    Generate action items tailored to user's specific situation.
//
//    async function generateCustomActionItems(
//      phase: TimelinePhase,
//      userInput: Record<string, any>,
//      baseItems: ActionItem[]
//    ): Promise<ActionItem[]> {
//      // Use LLM to add/modify action items based on user context
//      // e.g., if budget is tight, add cost-saving actions
//      // e.g., if first-time buyer, add educational actions
//    }
//
// 6. AGENT VOICE ADAPTATION
//    Rewrite content in the agent's personal voice/style.
//
//    async function adaptToAgentVoice(
//      content: string,
//      agentProfile: AgentProfile,
//      voiceSamples: string[]
//    ): Promise<string> {
//      // Fine-tune content to match agent's communication style
//    }
//
// -----------------------------------------------------------------------------
// IMPLEMENTATION STRATEGY
// -----------------------------------------------------------------------------
//
// 1. Start with Level 1 features (low risk, high perceived value)
// 2. A/B test personalized vs static content
// 3. Measure engagement metrics (time on page, CTA clicks, lead quality)
// 4. Gradually enable Level 2/3 based on value demonstrated
//
// COST CONSIDERATIONS:
// - gpt-4o-mini: ~$0.15 per 1M input tokens (very cheap for short prompts)
// - Embedding calls: ~$0.02 per 1M tokens
// - Batch multiple LLM calls in parallel to reduce latency
//
// =============================================================================
