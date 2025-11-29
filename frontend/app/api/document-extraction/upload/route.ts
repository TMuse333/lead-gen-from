// app/api/document-extraction/upload/route.ts
// Upload validated document-extracted items to Qdrant

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getEmbedding } from '@/lib/openai/embedding';
import { storeUserAdvice } from '@/lib/qdrant/collections/vector/advice/upsertUser';
import { DEFAULT_ADVICE_TYPE, ensureTypeTag } from '@/types/advice.types';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's collection name
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.qdrantCollectionName) {
      return NextResponse.json(
        {
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    const uploadedIds: string[] = [];
    const errors: string[] = [];

    // Upload each item
    for (const item of items) {
      try {
        const {
          title,
          advice,
          flows = [],
          tags = [],
          ruleGroups,
          type,
        } = item;

        if (!title || !advice) {
          errors.push(`Item missing title or advice: ${title || 'unknown'}`);
          continue;
        }

        // Generate embedding
        const textToEmbed = `${title}. ${advice}`;
        const embedding = await getEmbedding(textToEmbed, {
          userId: session.user.id,
          adviceTitle: title,
          collectionName,
        });

        // Ensure type tag
        const adviceType = type || DEFAULT_ADVICE_TYPE;
        const tagsWithType = ensureTypeTag(tags, adviceType);

        // Store in Qdrant
        const adviceId = await storeUserAdvice({
          collectionName,
          title,
          advice,
          embedding,
          metadata: {
            tags: tagsWithType,
            flow: flows,
            ruleGroups,
            type: adviceType,
            source: 'document', // Mark as document source
          },
        });

        uploadedIds.push(adviceId);
      } catch (error) {
        console.error('Error uploading item:', error);
        errors.push(`Failed to upload: ${item.title || 'unknown'}`);
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedIds.length,
      total: items.length,
      adviceIds: uploadedIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error uploading document items:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

