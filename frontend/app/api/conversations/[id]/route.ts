// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';
import type { ConversationDocument } from '@/lib/mongodb/models/conversation';

/**
 * GET /api/conversations/[id]
 * Get a single conversation by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated
    let userId: string | undefined;
    let clientIdentifier: string | undefined;
    
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      // Not authenticated, check for client identifier
      const { searchParams } = new URL(req.url);
      clientIdentifier = searchParams.get('clientIdentifier') || undefined;
    }

    const collection = await getConversationsCollection();
    const conversation = await collection.findOne({ _id: new ObjectId(id) });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (userId && conversation.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    if (clientIdentifier && conversation.clientIdentifier !== clientIdentifier) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    if (!userId && !clientIdentifier) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update a conversation (add messages, update status, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated
    let userId: string | undefined;
    let clientIdentifier: string | undefined;
    
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      const { searchParams } = new URL(req.url);
      clientIdentifier = searchParams.get('clientIdentifier') || undefined;
    }

    const collection = await getConversationsCollection();
    
    // Check authorization
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (userId && existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    if (clientIdentifier && existing.clientIdentifier !== clientIdentifier) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Build update object
    const update: any = {
      lastActivityAt: new Date(),
    };

    if (body.messages) {
      update.$push = { messages: { $each: body.messages } };
      update.messageCount = existing.messageCount + body.messages.length;
    }

    if (body.userInput) {
      update.userInput = { ...existing.userInput, ...body.userInput };
    }

    if (body.answer) {
      // Add answer to answers array with timestamp
      const answers = existing.answers || [];
      update.answers = [...answers, {
        questionId: body.answer.questionId,
        mappingKey: body.answer.mappingKey,
        value: body.answer.value,
        answeredVia: body.answer.answeredVia,
        timestamp: new Date(),
      }];
    }

    if (body.status) {
      update.status = body.status;
      if (body.status === 'completed') {
        update.completedAt = new Date();
        if (existing.startedAt) {
          update.duration = Math.floor((Date.now() - existing.startedAt.getTime()) / 1000);
        }
      }
      if (body.status === 'abandoned') {
        update.abandonedAt = new Date();
      }
    }

    if (body.progress !== undefined) {
      update.progress = body.progress;
    }

    if (body.currentNodeId) {
      update.currentNodeId = body.currentNodeId;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update, ...(update.$push ? { $push: update.$push } : {}) }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      conversation: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update conversation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

