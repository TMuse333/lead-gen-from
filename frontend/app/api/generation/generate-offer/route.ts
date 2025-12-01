// app/api/generation/generate-offer/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth/authConfig";
import { getUserCollectionName } from "@/lib/userConfig/getUserCollection";
import { getClientConfigsCollection, getGenerationsCollection } from "@/lib/mongodb/db";
import { getPersonalizedAdvice } from "@/lib/personalization/context";
import { LlmOutput } from "@/types/componentSchema";
import { QdrantRetrievalMetadata } from "@/types/qdrant.types";
import { KnowledgeSet } from "@/types";
import { ObjectId } from "mongodb";
import type { GenerationDocument } from "@/lib/mongodb/models/generation";
import { createBaseTrackingObject, updateTrackingWithResponse } from "@/lib/tokenUsage/createTrackingObject";
import { trackUsageAsync } from "@/lib/tokenUsage/trackUsage";
import type { OfferGenerationUsage } from "@/types/tokenUsage.types";
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function isValidLlmOutput(obj: unknown): obj is LlmOutput {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  
  // More flexible validation - just check that it's an object with at least one component
  // Exclude _debug from component count
  const componentKeys = Object.keys(o).filter(key => 
    key !== '_debug' && 
    o[key] !== null && 
    o[key] !== undefined && 
    typeof o[key] === 'object'
  );
  
  // Valid if we have at least one component
  return componentKeys.length > 0;
}

/**
 * Build a generic prompt for flexible LLM output
 * Retrieves relevant Qdrant data and asks LLM to generate appropriate content
 */
async function buildGenericPrompt(
  flow: string,
  userInput: Record<string, string>,
  collectionName: string | null,
  agentId: string
): Promise<{ prompt: string; metadata: QdrantRetrievalMetadata[] }> {
  const userName = userInput.email
    ? userInput.email.split('@')[0].charAt(0).toUpperCase() + userInput.email.split('@')[0].slice(1)
    : null;

  // Build knowledge sets - use user's collection if available
  const knowledgeSets: KnowledgeSet[] = collectionName
    ? [
        {
          type: 'vector',
          name: collectionName,
        },
      ]
    : [];

  // Get personalized advice with metadata
  const { advice, metadata } = await getPersonalizedAdvice(
    agentId,
    flow,
    userInput,
    knowledgeSets
  );

  // Format advice for prompt
  const adviceSection = advice.length > 0
    ? `\n\nRELEVANT KNOWLEDGE & ADVICE:\n${advice.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n`
    : '\n\n(No specific knowledge base items found, but use your expertise to provide helpful information.)\n';

  // Build user context summary
  const userContext = Object.entries(userInput)
    .filter(([_, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const prompt = `You are an AI assistant generating personalized content based on user information and relevant knowledge.

USER INFORMATION:
Flow Type: ${flow}
${userName ? `Name: ${userName}` : ''}
${userContext}

${adviceSection}

INSTRUCTIONS:
Generate a JSON object with relevant, personalized content based on the user's information and the knowledge provided above.

The structure should be flexible and appropriate for their situation. You can include sections like:
- A personalized greeting or summary
- Key insights or recommendations
- Action items or next steps
- Any other relevant information

IMPORTANT:
- Output ONLY valid JSON (no markdown, no code blocks, no extra text)
- Make it personal and relevant to their specific situation
- Use the knowledge/advice provided to inform your recommendations
- Structure the JSON in a way that makes sense for their flow type (${flow})
- Include 2-5 main sections/components
- Each section should have a clear purpose and valuable content
- Be specific and actionable

Example structure (adapt as needed):
{
  "summary": {
    "title": "Personalized title",
    "content": "Relevant summary text"
  },
  "insights": {
    "title": "Key Insights",
    "items": ["insight 1", "insight 2"]
  },
  "recommendations": {
    "title": "Recommendations",
    "actions": [
      {"label": "Action 1", "description": "Why this matters"}
    ]
  }
}

Generate the JSON now:`;

  return { prompt, metadata };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("POST /api/generation/generate-offer – Request received");

  try {
    // Check rate limits
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      // Not authenticated, continue
    }

    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit('offerGeneration', userId, ip);

    if (!rateLimit.allowed) {
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

    // 1. Parse request body
    let body: unknown;
    try {
      body = await req.json();
      console.log("Parsed request body:", body);
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // 2. Validate input shape
    if (!body || typeof body !== "object") {
      console.error("Request body is not an object");
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { flow, userInput, clientIdentifier } = body as {
      flow?: unknown;
      userInput?: unknown;
      clientIdentifier?: string;
    };

    if (typeof flow !== "string" || !flow) {
      console.error("Invalid 'flow':", flow);
      return NextResponse.json(
        { error: "'flow' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!userInput || typeof userInput !== "object" || userInput === null) {
      console.error("Invalid 'userInput':", userInput);
      return NextResponse.json(
        { error: "'userInput' is required and must be a non-null object" },
        { status: 400 }
      );
    }

    const typedUserInput = userInput as Record<string, string>;
    console.log(`Valid input → flow: "${flow}"`);
    console.log(`userInput keys: [${Object.keys(typedUserInput).join(", ")}]`);

    // 3. Get collection name (authenticated user OR public bot client)
    let userCollectionName: string | null = null;
    let clientConfig: any = null;
    
    // Check for public bot client identifier (from request body or query)
    const { searchParams } = new URL(req.url);
    const clientId = clientIdentifier || searchParams.get('client') || (body as any)?.clientId;
    
    if (clientId) {
      // Public bot: fetch client config by business name
      console.log(`📦 Public bot detected, client: ${clientId}`);
      try {
        const collection = await getClientConfigsCollection();
        const config = await collection.findOne({ 
          businessName: clientId,
          isActive: true 
        });
        if (config) {
          clientConfig = config;
          userCollectionName = config.qdrantCollectionName;
          console.log(`✅ Client config found, collection: ${userCollectionName}`);
        } else {
          console.log(`❌ Client config not found for: ${clientId}`);
        }
      } catch (error) {
        console.log('⚠️ Error fetching client config:', error);
      }
    } else {
      // Authenticated user: get from session
      try {
        const session = await auth();
        if (session?.user?.id) {
          userCollectionName = await getUserCollectionName(session.user.id);
          console.log(`📦 User collection: ${userCollectionName || 'not found'}`);
        }
      } catch (error) {
        console.log('⚠️ Could not get user collection (may be public route):', error);
      }
    }

    // 4. Build generic prompt with Qdrant retrieval
    console.log("Building generic prompt with Qdrant retrieval...");
    const { prompt, metadata } = await buildGenericPrompt(
      flow,
      typedUserInput,
      userCollectionName,
      process.env.AGENT_ID || 'default-agent'
    );

    console.log(`\n📊 Qdrant Retrieval Summary:`);
    if (metadata.length > 0) {
      metadata.forEach((meta) => {
        console.log(`   📦 ${meta.collection} (${meta.type}): ${meta.count} items`);
        meta.items.forEach((item, i) => {
          if (meta.type === "rule") {
            console.log(`      ${i + 1}. ${item.title} (score: ${item.score?.toFixed(2)})`);
          } else {
            console.log(`      ${i + 1}. ${item.title}`);
          }
        });
      });
    } else {
      console.log("   ⚠️ No Qdrant collections found or no matches");
    }

    console.log(`Prompt built. Length: ${prompt.length} characters`);

    // 5. Call OpenAI with tracking
    console.log("Calling OpenAI (gpt-4o-mini)...");
    
    const llmStartTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });
    const llmEndTime = Date.now();

    const raw = completion.choices[0].message.content?.trim() ?? "";
    console.log(`Raw LLM response received. Length: ${raw.length}`);

    if (!raw) {
      console.error("LLM returned empty response");
      return NextResponse.json(
        { error: "LLM returned an empty response" },
        { status: 500 }
      );
    }

    // 6. Parse JSON (handle markdown code blocks if present)
    let parsed: LlmOutput;
    try {
      // Remove markdown code blocks if present
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
      console.log("JSON parsed successfully");
      console.log("Output keys:", Object.keys(parsed).filter(k => k !== '_debug'));
    } catch (parseErr) {
      console.error("Failed to parse LLM JSON:", parseErr);
      console.error("Raw response:", raw.substring(0, 500));
      return NextResponse.json(
        {
          error: "LLM did not return valid JSON",
          raw: raw.substring(0, 1000), // First 1000 chars for debugging
        },
        { status: 500 }
      );
    }

    // 7. Validate output shape
    if (!isValidLlmOutput(parsed)) {
      console.error("LLM output does not match LlmOutput schema");
      return NextResponse.json(
        {
          error: "LLM output does not match expected schema",
          received: parsed,
        },
        { status: 500 }
      );
    }

    // Track usage (after parsing so we can calculate component count)
    const baseTracking = createBaseTrackingObject({
      userId,
      sessionId: (body as any)?.conversationId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiType: 'chat',
      startTime: llmStartTime,
    });
    
    const usage: OfferGenerationUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        finishReason: completion.choices[0].finish_reason || undefined,
        contentLength: raw.length,
        endTime: llmEndTime,
      }),
      feature: 'offerGeneration',
      apiType: 'chat',
      model: 'gpt-4o-mini',
      featureData: {
        generationId: (body as any)?.conversationId,
        conversationId: (body as any)?.conversationId,
        flow,
        clientIdentifier: clientId,
        qdrantRetrieval: {
          collectionsQueried: metadata.map(m => m.collection),
          itemsRetrieved: metadata.reduce((sum, m) => sum + m.count, 0),
          adviceUsed: metadata.reduce((sum, m) => sum + m.count, 0),
        },
        outputComponents: Object.keys(parsed).filter(k => k !== '_debug'),
        componentCount: Object.keys(parsed).filter(k => k !== '_debug').length,
      },
    };
    
    trackUsageAsync(usage);

    // 8. Calculate generation time
    const generationTime = Date.now() - startTime;

    console.log("LLM output validated. Returning result with debug info.");
    console.log(`Total generation time: ${(generationTime / 1000).toFixed(2)}s`);

    // 9. Save generation to database
    const conversationId = (body as any)?.conversationId;
    console.log('📝 Generation save check:', { 
      conversationId, 
      isValid: conversationId && ObjectId.isValid(conversationId) 
    });
    
    if (conversationId && ObjectId.isValid(conversationId)) {
      try {
        // userId is already available from the rate limit check above
        console.log('👤 User ID from session:', userId || 'not authenticated');

        const generationsCollection = await getGenerationsCollection();

        // Calculate output size and component count
        const outputSize = JSON.stringify(parsed).length;
        const componentCount = Object.keys(parsed).filter(
          key => key !== '_debug' && parsed[key] !== null && typeof parsed[key] === 'object'
        ).length;

        const debugInfo = {
          qdrantRetrieval: metadata,
          promptLength: prompt.length,
          adviceUsed: metadata.reduce((sum, m) => sum + m.count, 0),
          generationTime,
          userInput: typedUserInput,
          flow: flow,
        };

        const generation: Omit<GenerationDocument, '_id'> = {
          conversationId: new ObjectId(conversationId),
          userId,
          clientIdentifier: clientId || undefined,
          flow: flow,
          generatedAt: new Date(),
          generationTime: generationTime,
          llmOutput: parsed,
          debugInfo: debugInfo,
          userInput: typedUserInput,
          status: 'success',
          outputSize,
          componentCount,
        };

        console.log('💾 Saving generation to MongoDB:', {
          conversationId: conversationId,
          userId: userId || 'none',
          clientIdentifier: clientId || 'none',
          generationTime: `${(generationTime / 1000).toFixed(2)}s`,
          componentCount,
          outputSize,
        });

        const result = await generationsCollection.insertOne(generation as GenerationDocument);
        console.log('✅ Generation saved to database successfully!', {
          generationId: result.insertedId.toString(),
          conversationId: conversationId,
        });
      } catch (genError) {
        console.error('❌ Error saving generation:', genError);
        console.error('Error details:', {
          message: genError instanceof Error ? genError.message : 'Unknown error',
          stack: genError instanceof Error ? genError.stack : undefined,
        });
        // Don't fail the request if generation save fails
      }
    } else {
      console.log('ℹ️ No valid conversationId provided, skipping generation save', {
        conversationId,
        reason: !conversationId ? 'missing' : 'invalid format',
      });
    }

    // 10. Return with debug info
    return NextResponse.json({
      ...parsed,
      _debug: {
        qdrantRetrieval: metadata,
        promptLength: prompt.length,
        adviceUsed: metadata.reduce((sum, m) => sum + m.count, 0),
        generationTime,
        userInput: typedUserInput,
        flow: flow,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Unexpected error in /api/generation/generate-offer:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
