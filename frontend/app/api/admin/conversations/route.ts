// app/api/admin/conversations/route.ts
// Admin API for viewing all conversations across all users

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection, getGenerationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/conversations
 * Get all conversations across all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const flow = searchParams.get('flow');
    const status = searchParams.get('status');
    const clientIdentifier = searchParams.get('clientIdentifier');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const collection = await getConversationsCollection();

    // Build filter
    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (flow) {
      filter.flow = flow;
    }

    if (status) {
      filter.status = status;
    }

    if (clientIdentifier) {
      filter.clientIdentifier = clientIdentifier;
    }

    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) {
        filter.startedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.startedAt.$lte = new Date(endDate);
      }
    }

    // Get conversations
    const conversations = await collection
      .find(filter)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Get generation counts for each conversation
    const generationsCollection = await getGenerationsCollection();
    const conversationIds = conversations.map((c) => c._id);
    
    const generationCounts = await generationsCollection
      .aggregate([
        {
          $match: {
            conversationId: { $in: conversationIds },
          },
        },
        {
          $group: {
            _id: '$conversationId',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const generationMap = new Map(
      generationCounts.map((g: any) => [g._id.toString(), g.count])
    );

    // Add generation count to each conversation
    const conversationsWithGenerations = conversations.map((conv) => ({
      ...conv,
      generationCount: generationMap.get(conv._id?.toString() || '') || 0,
    }));

    return NextResponse.json({
      success: true,
      conversations: conversationsWithGenerations,
      total,
      limit,
      skip,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

