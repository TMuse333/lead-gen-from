// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection, getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ConversationDocument } from '@/lib/mongodb/models/conversation';

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flow, messages, userInput, clientIdentifier, sessionId, visitorData, environment } = body;

    console.log('[Conversations POST] Received request:', {
      flow,
      messageCount: messages?.length,
      clientIdentifier,
      sessionId,
      hasUserInput: !!userInput,
      hasVisitorData: !!visitorData,
      visitorId: visitorData?.visitorId,
      environment,
    });

    // Determine userId based on context:
    // - If clientIdentifier is provided (public bot page), ALWAYS use the agent's userId from client_configs
    // - Otherwise, use the authenticated user's userId (for dashboard/internal use)
    let userId: string | undefined;

    if (clientIdentifier) {
      // Public bot page - look up the agent's userId from clientIdentifier
      console.log('[Conversations POST] Public bot page - looking up agent userId for:', clientIdentifier);
      try {
        const configCollection = await getClientConfigsCollection();
        const clientConfig = await configCollection.findOne({ businessName: clientIdentifier });
        console.log('[Conversations POST] Found clientConfig:', clientConfig ? { userId: clientConfig.userId, businessName: clientConfig.businessName } : null);
        if (clientConfig?.userId) {
          userId = clientConfig.userId;
          console.log('[Conversations POST] Set userId from clientConfig:', userId);
        }
      } catch (error) {
        console.error('[Conversations POST] Error looking up userId from clientIdentifier:', error);
      }
    } else {
      // No clientIdentifier - use authenticated user's ID (dashboard/internal)
      try {
        const session = await auth();
        userId = session?.user?.id;
        console.log('[Conversations POST] Auth session userId:', userId);
      } catch (error) {
        console.log('[Conversations POST] Not authenticated');
      }
    }

    if (!flow || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: flow, messages' },
        { status: 400 }
      );
    }

    const collection = await getConversationsCollection();
    
    // Build visitor tracking data if provided
    const visitorTracking = visitorData ? {
      visitorId: visitorData.visitorId,
      isReturningVisitor: visitorData.isReturningVisitor,
      lastVisit: visitorData.lastVisit,
      deviceType: visitorData.deviceType,
      referralSource: visitorData.referralSource ? JSON.parse(visitorData.referralSource) : null,
      pagesViewed: visitorData.pagesViewed,
      previousIntent: visitorData.userIntent,
      sessionStart: visitorData.sessionStart,
      messagesSent: visitorData.messagesSent,
      sessionDuration: visitorData.sessionDuration,
    } : undefined;

    const conversation: Omit<ConversationDocument, '_id'> = {
      userId,
      clientIdentifier,
      sessionId,
      flow,
      environment: environment || 'production', // Default to production if not specified
      status: 'in-progress',
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messages,
      userInput: userInput || {},
      answers: [], // Initialize answers array
      progress: 0,
      messageCount: messages.length,
      currentFlowId: flow,
      currentNodeId: messages[messages.length - 1]?.questionId,
      visitorTracking,
    };

    console.log('[Conversations POST] Creating conversation with:', {
      userId,
      clientIdentifier,
      flow,
      messageCount: messages.length,
    });

    const result = await collection.insertOne(conversation as ConversationDocument);

    console.log('[Conversations POST] Conversation created with _id:', result.insertedId.toString());

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
      conversation: {
        ...conversation,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create conversation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations
 * Get conversations for the authenticated user or client
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const flow = searchParams.get('flow');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get user ID if authenticated
    let userId: string | undefined;
    let clientIdentifier: string | undefined;
    
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      // Not authenticated, check for client identifier
      clientIdentifier = searchParams.get('clientIdentifier') || undefined;
    }

    const collection = await getConversationsCollection();

    // Build query filter
    const filter: any = {};
    if (userId) {
      filter.userId = userId;
    } else if (clientIdentifier) {
      filter.clientIdentifier = clientIdentifier;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized: Must be authenticated or provide clientIdentifier' },
        { status: 401 }
      );
    }

    if (status) {
      filter.status = status;
    }
    if (flow) {
      filter.flow = flow;
    }

    const conversations = await collection
      .find(filter)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await collection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      conversations,
      total,
      limit,
      skip,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

