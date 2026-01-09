// app/api/agent-advice/update/route.ts
// Update an advice item in Qdrant

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';
import OpenAI from 'openai';
import { DEFAULT_ADVICE_TYPE, ensureTypeTag, isValidAdviceType, getAdviceTypeFromTags } from '@/types/advice.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, advice, tags, type } = await request.json();

    if (!id || !title || !advice) {
      return NextResponse.json(
        { error: 'id, title, and advice are required' },
        { status: 400 }
      );
    }

    // Get user's Qdrant collection name
    const clientConfigsCollection = await getClientConfigsCollection();
    const userConfig = await clientConfigsCollection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'User configuration not found or Qdrant collection not set up' },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;

    // Get existing advice item to preserve metadata
    const retrieveResult = await qdrant.retrieve(collectionName, {
      ids: [id],
      with_payload: true,
      with_vector: true,
    });

    if (retrieveResult.length === 0) {
      return NextResponse.json(
        { error: 'Advice item not found' },
        { status: 404 }
      );
    }

    const existingItem = retrieveResult[0];
    const existingPayload = existingItem.payload as any;

    // Generate new embedding for updated advice
    const textToEmbed = `${title}. ${advice}`;
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: textToEmbed,
    });
    const newEmbedding = embeddingResponse.data[0].embedding;

    // Handle type: use provided type, or extract from existing tags, or default
    const existingTags = existingPayload.tags || [];
    const adviceType = type && isValidAdviceType(type) 
      ? type 
      : getAdviceTypeFromTags(existingTags);
    
    // Ensure type tag is in tags array
    const updatedTags = tags ? ensureTypeTag(tags, adviceType) : ensureTypeTag(existingTags, adviceType);

    // Update the advice item with new title, advice, embedding, tags, type, and updatedAt
    await qdrant.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: id,
          vector: newEmbedding,
          payload: {
            ...existingPayload,
            title,
            advice,
            tags: updatedTags,
            type: adviceType,
            updatedAt: new Date().toISOString(),
          },
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Advice updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update advice',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

