// app/api/provision/route.ts
// API route to provision a chatbot from an external app (next-js-template)
// This creates the client config and uploads stories to Qdrant

import { NextRequest, NextResponse } from 'next/server';
import { ensureUserCollection } from '@/lib/qdrant/userCollections';
import { qdrant } from '@/lib/qdrant/client';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';
import { generateAllDefaultQuestions } from '@/lib/mongodb/seedQuestions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Simple API key auth for external apps
const PROVISION_API_KEY = process.env.PROVISION_API_KEY || 'dev-provision-key';

interface ProvisionRequest {
  // Required
  slug: string; // URL-safe business name (e.g., "sarah-johnson-real-estate")
  agentInfo: {
    name: string;
    email: string;
    phone?: string;
    serviceArea?: string;
  };
  // Optional
  stories?: {
    title: string;
    situation?: string;
    action?: string;
    outcome?: string;
    flow: 'buy' | 'sell' | 'browse';
    kind: 'story' | 'tip';
  }[];
  colorConfig?: {
    primary: string;
    background: string;
    text: string;
  };
  greeting?: string;
  // For linking to external user
  externalUserId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== PROVISION_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: ProvisionRequest = await request.json();
    const { slug, agentInfo, stories, colorConfig, greeting, externalUserId } = body;

    // 3. Validate required fields
    if (!slug || !agentInfo?.name || !agentInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, agentInfo.name, and agentInfo.email are required' },
        { status: 400 }
      );
    }

    // Sanitize slug (ensure it's URL-safe)
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!sanitizedSlug) {
      return NextResponse.json(
        { error: 'Invalid slug' },
        { status: 400 }
      );
    }

    // 4. Create Qdrant collection
    const collectionName = await ensureUserCollection(sanitizedSlug);

    // 5. Clear existing items in collection (fresh start)
    try {
      const existingItems = await qdrant.scroll(collectionName, {
        limit: 1,
        with_payload: false,
        with_vector: false,
      });

      if (existingItems.points.length > 0) {
        const allItems = await qdrant.scroll(collectionName, {
          limit: 10000,
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
    } catch {
      // Continue - collection might be new
    }

    // 6. Upload stories to Qdrant with embeddings
    const uploadedStories: string[] = [];

    if (stories && stories.length > 0) {
      for (const story of stories) {
        if (!story.title) continue;

        try {
          // Build text for embedding based on story type
          let textToEmbed = story.title;
          if (story.kind === 'story') {
            textToEmbed = `${story.title}. ${story.situation || ''} ${story.action || ''} ${story.outcome || ''}`.trim();
          } else {
            textToEmbed = `${story.title}. ${story.outcome || ''}`.trim();
          }

          // Generate embedding
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: textToEmbed,
          });
          const embedding = embeddingResponse.data[0].embedding;

          // Create deterministic ID
          const contentHash = Buffer.from(textToEmbed).toString('base64').substring(0, 32);
          const pointId = `story-${contentHash}`;

          // Build advice text (for display)
          const adviceText = story.kind === 'story'
            ? [story.situation, story.action, story.outcome].filter(Boolean).join(' ')
            : story.outcome || '';

          // Store in Qdrant
          await qdrant.upsert(collectionName, {
            wait: true,
            points: [
              {
                id: pointId,
                vector: embedding,
                payload: {
                  title: story.title,
                  advice: adviceText,
                  situation: story.situation || undefined,
                  action: story.action || undefined,
                  outcome: story.outcome || undefined,
                  kind: story.kind,
                  flow: [story.flow], // Array format for Qdrant filtering
                  tags: [],
                  source: 'provision-api',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  usageCount: 0,
                },
              },
            ],
          });

          uploadedStories.push(pointId);
        } catch (error) {
          console.error(`Failed to upload story "${story.title}":`, error);
          // Continue with other stories
        }
      }
    }

    // 7. Generate default questions
    const defaultQuestions = generateAllDefaultQuestions();

    // 8. Build client config
    const clientConfig: Partial<ClientConfigDocument> = {
      // Use externalUserId if provided, otherwise generate from slug
      userId: externalUserId || `external-${sanitizedSlug}`,
      businessName: sanitizedSlug,
      agentFirstName: agentInfo.name.split(' ')[0],
      agentLastName: agentInfo.name.split(' ').slice(1).join(' ') || undefined,
      notificationEmail: agentInfo.email,
      industry: 'real-estate',
      dataCollection: ['email', 'phone'],
      selectedIntentions: ['buy', 'sell', 'browse'],
      selectedOffers: ['real-estate-timeline'],
      conversationFlows: {},
      knowledgeBaseItems: stories?.map(s => ({
        title: s.title,
        advice: s.kind === 'story'
          ? [s.situation, s.action, s.outcome].filter(Boolean).join(' ')
          : s.outcome || '',
        flows: [s.flow],
      })) || [],
      colorConfig: colorConfig || undefined,
      customQuestions: defaultQuestions,
      qdrantCollectionName: collectionName,
      agentProfile: {
        name: agentInfo.name,
        email: agentInfo.email,
        phone: agentInfo.phone || undefined,
        company: sanitizedSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      },
      endingCTA: {
        displayName: agentInfo.name,
        email: agentInfo.email,
        phone: agentInfo.phone || undefined,
        style: 'questions-form',
        responseTimeText: 'I typically respond within 24 hours',
      },
      // Custom greeting if provided
      ...(greeting ? { customGreeting: greeting } : {}),
      isActive: true,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 9. Save to MongoDB (upsert by businessName)
    const collection = await getClientConfigsCollection();

    const existing = await collection.findOne({ businessName: sanitizedSlug });

    if (existing) {
      // Update existing - preserve questions if they exist
      const hasExistingQuestions =
        (existing.customQuestions?.buy?.length || 0) > 0 ||
        (existing.customQuestions?.sell?.length || 0) > 0 ||
        (existing.customQuestions?.browse?.length || 0) > 0;

      await collection.updateOne(
        { businessName: sanitizedSlug },
        {
          $set: {
            ...clientConfig,
            ...(hasExistingQuestions ? {} : { customQuestions: defaultQuestions }),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await collection.insertOne(clientConfig as ClientConfigDocument);
    }

    // 10. Return success with chatbot URL
    const chatbotUrl = `https://chatbot.focusflowsoftware.com/bot/${sanitizedSlug}`;

    return NextResponse.json({
      success: true,
      message: 'Chatbot provisioned successfully',
      data: {
        slug: sanitizedSlug,
        chatbotUrl,
        qdrantCollection: collectionName,
        storiesUploaded: uploadedStories.length,
        totalStories: stories?.length || 0,
      },
    });
  } catch (error) {
    console.error('Provision error:', error);
    return NextResponse.json(
      {
        error: 'Failed to provision chatbot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a slug is available
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== PROVISION_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const collection = await getClientConfigsCollection();
    const existing = await collection.findOne({ businessName: slug });

    return NextResponse.json({
      available: !existing,
      slug,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a provisioned chatbot (for testing/reset)
export async function DELETE(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== PROVISION_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    // Delete from MongoDB
    const collection = await getClientConfigsCollection();
    const deleteResult = await collection.deleteOne({ businessName: slug });

    // Delete Qdrant collection
    let qdrantDeleted = false;
    try {
      await qdrant.deleteCollection(slug);
      qdrantDeleted = true;
    } catch {
      // Collection might not exist, that's OK
    }

    return NextResponse.json({
      success: true,
      message: 'Chatbot deleted',
      data: {
        slug,
        mongoDeleted: deleteResult.deletedCount > 0,
        qdrantDeleted,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete chatbot', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
