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

    const collection = await getConversationsCollection();
    const conversation = await collection.findOne({ _id: new ObjectId(id) });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Authorization: Allow access if:
    // 1. Conversation has a clientIdentifier (public bot) - the conversation ID serves as auth
    // 2. Authenticated user matches the conversation's userId
    // 3. Provided clientIdentifier matches conversation's clientIdentifier

    if (conversation.clientIdentifier) {
      // Public bot conversation - allow access (conversation ID is the auth token)
    } else {
      // Non-public conversation - require authentication
      let userId: string | undefined;
      try {
        const session = await auth();
        userId = session?.user?.id;
      } catch (error) {
        // Not authenticated
      }

      if (!userId || conversation.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
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

    console.log('[Conversations PATCH] Received:', {
      id,
      hasMessages: !!body.messages,
      messageCount: body.messages?.length,
      hasAnswer: !!body.answer,
      hasProgress: body.progress !== undefined,
      progress: body.progress,
      hasCurrentNodeId: !!body.currentNodeId,
      currentNodeId: body.currentNodeId,
    });

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    const collection = await getConversationsCollection();

    // Find the existing conversation first
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Authorization: Allow update if:
    // 1. Conversation has a clientIdentifier (public bot) - allow updates from same origin
    // 2. Authenticated user matches the conversation's userId
    // 3. Provided clientIdentifier matches conversation's clientIdentifier

    const { searchParams } = new URL(req.url);
    const clientIdentifierParam = searchParams.get('clientIdentifier') || body.clientIdentifier;

    // If conversation is from a public bot (has clientIdentifier), allow updates
    // This is safe because the conversation ID is only known to the client that created it
    if (existing.clientIdentifier) {
      console.log('[Conversations PATCH] Public bot conversation - allowing update');
    } else {
      // For non-public bot conversations, check authentication
      let userId: string | undefined;
      try {
        const session = await auth();
        userId = session?.user?.id;
      } catch (error) {
        // Not authenticated
      }

      if (!userId || existing.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    console.log('[Conversations PATCH] Body received:', {
      hasMessages: !!body.messages,
      messagesLength: body.messages?.length,
      messagesPreview: body.messages?.map((m: any) => ({ role: m.role, contentPreview: m.content?.substring(0, 50) })),
      hasAnswer: !!body.answer,
      answer: body.answer,
      progress: body.progress,
      currentQuestionId: body.currentQuestionId,
    });

    console.log('[Conversations PATCH] Existing conversation:', {
      existingMessageCount: existing.messageCount,
      existingMessagesLength: existing.messages?.length,
    });

    // Build update object - separate $set fields from $push operations
    const setFields: any = {
      lastActivityAt: new Date(),
    };
    let pushOperation: any = null;

    if (body.messages && body.messages.length > 0) {
      console.log('[Conversations PATCH] Will push', body.messages.length, 'new messages');
      pushOperation = { messages: { $each: body.messages } };
      setFields.messageCount = existing.messageCount + body.messages.length;
    } else {
      console.log('[Conversations PATCH] No messages to push');
    }

    if (body.userInput) {
      setFields.userInput = { ...existing.userInput, ...body.userInput };
    }

    if (body.answer) {
      // Add answer to answers array with timestamp
      const answers = existing.answers || [];
      setFields.answers = [...answers, {
        questionId: body.answer.questionId,
        mappingKey: body.answer.mappingKey,
        value: body.answer.value,
        answeredVia: body.answer.answeredVia,
        timestamp: new Date(),
      }];
    }

    if (body.status) {
      setFields.status = body.status;
      if (body.status === 'completed') {
        setFields.completedAt = new Date();
        if (existing.startedAt) {
          setFields.duration = Math.floor((Date.now() - existing.startedAt.getTime()) / 1000);
        }
      }
      if (body.status === 'abandoned') {
        setFields.abandonedAt = new Date();
      }
    }

    if (body.progress !== undefined) {
      setFields.progress = body.progress;
    }

    if (body.currentNodeId) {
      setFields.currentNodeId = body.currentNodeId;
    }

    // State machine tracking fields
    if (body.currentStateId) {
      setFields.currentStateId = body.currentStateId;
    }
    if (body.stateHistory) {
      setFields.stateHistory = body.stateHistory;
    }
    if (body.stateAttempts) {
      setFields.stateAttempts = body.stateAttempts;
    }

    // Handle contact modal tracking - merge with existing data
    if (body.contactModal) {
      const existingContactModal = existing.contactModal || {
        shown: false,
        completed: false,
        skipped: false,
      };
      setFields.contactModal = {
        ...existingContactModal,
        ...body.contactModal,
        // Preserve the first shownAt timestamp
        shownAt: existingContactModal.shownAt || body.contactModal.shownAt,
        // Track shown as true if it was ever shown
        shown: existingContactModal.shown || body.contactModal.shown || false,
      };
    }

    // Build MongoDB update operation
    const updateOperation: any = { $set: setFields };
    if (pushOperation) {
      updateOperation.$push = pushOperation;
    }

    console.log('[Conversations PATCH] Updating:', {
      id,
      setFields: Object.keys(setFields),
      hasPush: !!pushOperation,
      updateOperation: JSON.stringify(updateOperation).substring(0, 500),
    });

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );

    console.log('[Conversations PATCH] Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

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

