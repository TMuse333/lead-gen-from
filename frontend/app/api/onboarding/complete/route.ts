// app/api/onboarding/complete/route.ts
// API route to complete onboarding: create Qdrant collection, upload knowledge base, save to MongoDB

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { ensureUserCollection } from '@/lib/qdrant/userCollections';
import { qdrant } from '@/lib/qdrant/client';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';
import { generateAllDefaultQuestions } from '@/lib/mongodb/seedQuestions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
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

    // 2. Get onboarding data from request body
    const onboardingData = await request.json();

    const {
      // New simplified fields
      agentFirstName,
      agentLastName,
      agentEmail,
      agentPhone,
      businessName,
      wizardSkipped,
      wizardCompleted,
      // Legacy fields (still supported)
      industry,
      dataCollection,
      customDataCollection,
      selectedIntentions,
      selectedOffers,
      customOffer,
      conversationFlows,
      knowledgeBaseItems,
      colorConfig,
    } = onboardingData;

    // Validate required fields (now just businessName and agentFirstName are truly required)
    if (!businessName || !agentFirstName) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName and agentFirstName are required' },
        { status: 400 }
      );
    }

    // Auto-set intentions and offers if not provided (new simplified onboarding)
    const finalIntentions = selectedIntentions?.length ? selectedIntentions : ['buy', 'sell', 'browse'];
    const finalOffers = selectedOffers?.length ? selectedOffers : ['real-estate-timeline'];

    // 3. Create Qdrant collection
    const collectionName = await ensureUserCollection(businessName);

    // 3.5. Check if collection already has items and clear them to prevent duplicates
    try {
      const existingItems = await qdrant.scroll(collectionName, {
        limit: 1,
        with_payload: false,
        with_vector: false,
      });

      if (existingItems.points.length > 0) {
        // Get all point IDs to delete
        const allItems = await qdrant.scroll(collectionName, {
          limit: 10000, // Get all items
          with_payload: false,
          with_vector: false,
        });

        if (allItems.points.length > 0) {
          const pointIds = allItems.points.map((p) => p.id as string);
          await qdrant.delete(collectionName, {
            wait: true,
            points: pointIds,
          });
        }
      }
    } catch (error) {
      // Continue anyway - collection might be new
    }

    // 4. Upload knowledge base items to Qdrant (with embeddings)
    const uploadedItems: string[] = [];

    if (knowledgeBaseItems && knowledgeBaseItems.length > 0) {
      // Deduplicate items by title+advice hash to prevent duplicates in the same batch
      const seenItems = new Set<string>();
      const uniqueItems = knowledgeBaseItems.filter((item: { title: string; advice: string; flows?: string[] }) => {
        const key = `${item.title}|${item.advice}`.toLowerCase().trim();
        if (seenItems.has(key)) {
          return false;
        }
        seenItems.add(key);
        return true;
      });

      for (let i = 0; i < uniqueItems.length; i++) {
        const item = uniqueItems[i];
        
        try {
          // Generate embedding
          const textToEmbed = `${item.title}. ${item.advice}`;
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: textToEmbed,
          });
          const embedding = embeddingResponse.data[0].embedding;
          
          // Convert flows to array format for Qdrant
          const flowArray = item.flows || [];
          
          // Use a deterministic ID based on content to prevent true duplicates
          // This ensures the same content gets the same ID even if uploaded twice
          const contentHash = Buffer.from(`${item.title}|${item.advice}`).toString('base64').substring(0, 32);
          const pointId = `kb-${contentHash}`;
          
          // Store in Qdrant (upsert will replace if ID already exists)
          await qdrant.upsert(collectionName, {
            wait: true,
            points: [
              {
                id: pointId,
                vector: embedding,
                payload: {
                  title: item.title,
                  advice: item.advice,
                  tags: item.tags || [],
                  flow: flowArray,
                  conditions: {}, // Empty conditions = universal advice (unless ruleGroups provided)
                  ruleGroups: (item as any).ruleGroups || undefined, // Optional: complex rules
                  source: item.source,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  usageCount: 0,
                },
              },
            ],
          });
          
          uploadedItems.push(pointId);
        } catch (error) {
          // Continue with other items even if one fails
        }
      }
    }

    // 5. Save configuration to MongoDB

    // Generate default questions for all flows (MongoDB is single source of truth)
    const defaultQuestions = generateAllDefaultQuestions();

    // Build agent full name
    const agentFullName = agentLastName ? `${agentFirstName} ${agentLastName}` : agentFirstName;

    const clientConfig: ClientConfigDocument = {
      userId,
      businessName,
      // New agent profile fields
      agentFirstName,
      agentLastName: agentLastName || undefined,
      notificationEmail: agentEmail, // For lead notifications
      // Legacy/optional fields
      industry: industry || 'real-estate',
      dataCollection: dataCollection?.length ? dataCollection : ['email', 'phone'], // Default if not set
      customDataCollection,
      selectedIntentions: finalIntentions,
      selectedOffers: finalOffers,
      customOffer,
      conversationFlows: conversationFlows || {},
      knowledgeBaseItems: knowledgeBaseItems || [], // Empty array is OK now
      colorConfig: colorConfig || undefined, // Optional: use default if not provided
      customQuestions: defaultQuestions, // Auto-seed with default questions
      qdrantCollectionName: collectionName,
      // Agent profile for settings page and display
      agentProfile: {
        name: agentFullName,
        email: agentEmail,
        phone: agentPhone || undefined,
        company: businessName,
        yearsExperience: 0, // User can fill in later via settings
      },
      // Ending CTA pre-populated with agent info
      endingCTA: {
        displayName: agentFullName,
        email: agentEmail,
        phone: agentPhone || undefined,
        style: 'questions-form',
        responseTimeText: 'I typically respond within 24 hours',
      },
      isActive: true,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getClientConfigsCollection();

    // Check if config already exists (update) or create new
    const existing = await collection.findOne({ userId });

    if (existing) {
      // Update existing config (exclude _id from update)
      // Preserve existing customQuestions if they have any content
      const { _id, customQuestions: newQuestions, ...updateData } = clientConfig;

      // Only overwrite questions if existing ones are empty/missing
      const hasExistingQuestions =
        (existing.customQuestions?.buy?.length || 0) > 0 ||
        (existing.customQuestions?.sell?.length || 0) > 0 ||
        (existing.customQuestions?.browse?.length || 0) > 0;

      await collection.updateOne(
        { userId },
        {
          $set: {
            ...updateData,
            // Only seed questions if none exist
            ...(hasExistingQuestions ? {} : { customQuestions: newQuestions }),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new config with seeded questions
      await collection.insertOne(clientConfig);
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        qdrantCollectionName: collectionName,
        knowledgeBaseItemsUploaded: uploadedItems.length,
        totalKnowledgeBaseItems: knowledgeBaseItems?.length || 0,
        configId: existing?._id || 'new',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

