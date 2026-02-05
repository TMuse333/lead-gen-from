// app/api/agent-knowledge/route.ts
/**
 * Agent Knowledge API
 *
 * Manages agent knowledge entries (website copy, FAQs, value propositions)
 * that are chunked, embedded, and stored in Qdrant for contextual responses.
 *
 * GET - List all agent knowledge entries for the user
 * POST - Add new agent knowledge (chunks, embeds, and stores)
 * DELETE - Remove agent knowledge entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { storeAgentKnowledge, deleteAgentKnowledge } from '@/lib/qdrant/collections/vector/agentKnowledge';
import { chunkText, estimateChunkCount, generateContentHash } from '@/lib/text/chunker';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

export const runtime = 'nodejs';

// ==================== TYPES ====================

interface AgentKnowledgeEntry {
  id: string;
  title: string;
  category?: string;
  text: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PostRequestBody {
  text: string;
  title: string;
  category?: string;
}

interface DeleteRequestBody {
  entryId: string;
}

// ==================== HELPERS ====================

async function getUserConfig(userId: string): Promise<ClientConfigDocument | null> {
  try {
    const collection = await getClientConfigsCollection();
    return await collection.findOne({ userId }) as ClientConfigDocument | null;
  } catch {
    return null;
  }
}

// ==================== GET ====================

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig?.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'Configuration not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // Get entries from MongoDB (metadata storage)
    const entries = userConfig.agentKnowledgeEntries || [];

    return NextResponse.json({
      success: true,
      entries,
      businessName: userConfig.businessName || 'Agent',
    });
  } catch (error) {
    console.error('[agent-knowledge/GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==================== POST ====================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig?.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'Configuration not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const body: PostRequestBody = await request.json();
    const { text, title, category } = body;

    // Validate required fields
    if (!text?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: 'Title and text are required' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 50,000 characters' },
        { status: 400 }
      );
    }

    // Generate entry ID
    const entryId = `ak-${generateContentHash(title + text)}-${Date.now()}`;

    // Chunk the text
    const chunks = chunkText(text, {
      chunkSize: 600,
      overlap: 100,
      minChunkSize: 100,
    });

    // Store in Qdrant
    await storeAgentKnowledge({
      collectionName: userConfig.qdrantCollectionName,
      entryId,
      title: title.trim(),
      chunks,
      category: category?.trim() || 'general',
      userId: session.user.id,
    });

    // Create entry metadata
    const newEntry: AgentKnowledgeEntry = {
      id: entryId,
      title: title.trim(),
      category: category?.trim() || 'general',
      text: text.trim(),
      chunkCount: chunks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save metadata to MongoDB
    const collection = await getClientConfigsCollection();
    await collection.updateOne(
      { userId },
      {
        $push: { agentKnowledgeEntries: newEntry },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      entry: newEntry,
      message: `Knowledge added successfully (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})`,
    });
  } catch (error) {
    console.error('[agent-knowledge/POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==================== DELETE ====================

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig?.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'Configuration not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const body: DeleteRequestBody = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Delete from Qdrant
    await deleteAgentKnowledge(userConfig.qdrantCollectionName, entryId);

    // Remove from MongoDB
    const collection = await getClientConfigsCollection();
    await collection.updateOne(
      { userId },
      {
        $pull: { agentKnowledgeEntries: { id: entryId } },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Knowledge deleted successfully',
    });
  } catch (error) {
    console.error('[agent-knowledge/DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
