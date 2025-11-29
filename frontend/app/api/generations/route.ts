// app/api/generations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getGenerationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';
import type { GenerationDocument } from '@/lib/mongodb/models/generation';

/**
 * POST /api/generations
 * Create a new generation record
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      llmOutput,
      debugInfo,
      userInput,
      flow,
      offerType,
      clientIdentifier,
    } = body;

    if (!conversationId || !llmOutput || !debugInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, llmOutput, debugInfo' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversationId' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      // Not authenticated, continue with clientIdentifier
    }

    const collection = await getGenerationsCollection();

    // Calculate output size and component count
    const outputSize = JSON.stringify(llmOutput).length;
    const componentCount = Object.keys(llmOutput).filter(
      key => key !== '_debug' && llmOutput[key] !== null && typeof llmOutput[key] === 'object'
    ).length;

    const generation: Omit<GenerationDocument, '_id'> = {
      conversationId: new ObjectId(conversationId),
      userId,
      clientIdentifier,
      flow: flow || debugInfo.flow,
      offerType,
      generatedAt: new Date(),
      generationTime: debugInfo.generationTime || 0,
      llmOutput,
      debugInfo,
      userInput: userInput || debugInfo.userInput || {},
      status: 'success',
      outputSize,
      componentCount,
    };

    const result = await collection.insertOne(generation as GenerationDocument);

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
      generation: {
        ...generation,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error('Error creating generation:', error);
    return NextResponse.json(
      { error: 'Failed to create generation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generations
 * Get generations for the authenticated user or client
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flow = searchParams.get('flow');
    const offerType = searchParams.get('offerType');
    const conversationId = searchParams.get('conversationId');
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

    const collection = await getGenerationsCollection();

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

    if (flow) {
      filter.flow = flow;
    }
    if (offerType) {
      filter.offerType = offerType;
    }
    if (conversationId && ObjectId.isValid(conversationId)) {
      filter.conversationId = new ObjectId(conversationId);
    }

    const generations = await collection
      .find(filter)
      .sort({ generatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await collection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      generations,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

