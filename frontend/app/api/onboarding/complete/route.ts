// app/api/onboarding/complete/route.ts
// API route to complete onboarding: create Qdrant collection, upload knowledge base, save to MongoDB

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { ensureUserCollection } from '@/lib/qdrant/userCollections';
import { qdrant } from '@/lib/qdrant/client';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';
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
      businessName,
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

    // Validate required fields
    if (!businessName || !selectedIntentions.length || !selectedOffers.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting onboarding completion for user: ${userId}`);
    console.log(`   Business: ${businessName}`);
    console.log(`   Knowledge base items: ${knowledgeBaseItems?.length || 0}`);

    // 3. Create Qdrant collection
    console.log('📦 Creating Qdrant collection...');
    const collectionName = await ensureUserCollection(businessName);
    console.log(`✅ Collection created: ${collectionName}`);

    // 3.5. Check if collection already has items and clear them to prevent duplicates
    try {
      const existingItems = await qdrant.scroll(collectionName, {
        limit: 1,
        with_payload: false,
        with_vector: false,
      });
      
      if (existingItems.points.length > 0) {
        console.log(`⚠️ Collection already has ${existingItems.points.length} items. Clearing to prevent duplicates...`);
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
          console.log(`✅ Cleared ${pointIds.length} existing items from collection`);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not check/clear existing items (collection might be new):', error);
      // Continue anyway - collection might be new
    }

    // 4. Upload knowledge base items to Qdrant (with embeddings)
    const uploadedItems: string[] = [];
    
    if (knowledgeBaseItems && knowledgeBaseItems.length > 0) {
      console.log(`📤 Uploading ${knowledgeBaseItems.length} knowledge base items...`);
      
      // Deduplicate items by title+advice hash to prevent duplicates in the same batch
      const seenItems = new Set<string>();
      const uniqueItems = knowledgeBaseItems.filter((item) => {
        const key = `${item.title}|${item.advice}`.toLowerCase().trim();
        if (seenItems.has(key)) {
          console.log(`   ⚠️ Skipping duplicate item: "${item.title}"`);
          return false;
        }
        seenItems.add(key);
        return true;
      });
      
      console.log(`   📊 Deduplicated: ${uniqueItems.length} unique items (${knowledgeBaseItems.length - uniqueItems.length} duplicates removed)`);
      
      for (let i = 0; i < uniqueItems.length; i++) {
        const item = uniqueItems[i];
        console.log(`   [${i + 1}/${uniqueItems.length}] Processing: "${item.title}"`);
        
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
          console.log(`   ✅ Uploaded: ${item.title}`);
        } catch (error) {
          console.error(`   ❌ Failed to upload "${item.title}":`, error);
          // Continue with other items even if one fails
        }
      }
      
      console.log(`✅ Uploaded ${uploadedItems.length}/${uniqueItems.length} items to Qdrant`);
    }

    // 5. Save configuration to MongoDB
    console.log('💾 Saving configuration to MongoDB...');
    
    const clientConfig: ClientConfigDocument = {
      userId,
      businessName,
      industry: industry || 'real-estate',
      dataCollection: dataCollection || [],
      customDataCollection,
      selectedIntentions,
      selectedOffers,
      customOffer,
      conversationFlows: conversationFlows || {},
      knowledgeBaseItems: knowledgeBaseItems || [],
      colorConfig: colorConfig || undefined, // Optional: use default if not provided
      qdrantCollectionName: collectionName,
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
      const { _id, ...updateData } = clientConfig;
      await collection.updateOne(
        { userId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );
      console.log('✅ Updated existing client configuration');
    } else {
      // Create new config
      const result = await collection.insertOne(clientConfig);
      console.log('✅ Created new client configuration:', result.insertedId);
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
    console.error('❌ Error completing onboarding:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

