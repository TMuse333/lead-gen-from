// app/api/user/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection } from '@/lib/mongodb/db';
import { getEffectiveUserId } from '@/lib/auth/impersonation';

/**
 * GET /api/user/conversations
 * Get all conversations for the authenticated user (or impersonated user)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    console.log('[User Conversations GET] Session:', session?.user?.id, session?.user?.email);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get effective userId (impersonated user if admin is impersonating, otherwise actual user)
    const userId = await getEffectiveUserId() || session.user.id;
    console.log('[User Conversations GET] Effective userId:', userId);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status');
    const flow = searchParams.get('flow');
    const environment = searchParams.get('environment') || 'production'; // Default to production (hide test data)
    const excludeInternal = searchParams.get('excludeInternal') === 'true';
    const timeRange = searchParams.get('timeRange'); // '24h', '7d', '30d', or null for all

    // Known internal visitor IDs (testing/development)
    const internalVisitorIds = [
      '1ad461c3-a77f-4986-bbd7-d3e3b58790a9', // Thomas - main
      'b728f84f-7dca-4228-81d6-73ce2eae4635', // Thomas - secondary
    ];

    const conversationsCollection = await getConversationsCollection();

    // Build query filter
    const filter: Record<string, unknown> = { userId };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (flow) {
      filter.flow = flow;
    }
    // Filter by environment (all, production, test)
    // Treat missing environment field as 'production' (legacy records)
    if (environment !== 'all') {
      if (environment === 'production') {
        // Match both explicit 'production' and missing environment (legacy)
        filter.$or = [
          { environment: 'production' },
          { environment: { $exists: false } }
        ];
      } else {
        filter.environment = environment;
      }
    }

    // Exclude internal/testing traffic
    if (excludeInternal) {
      filter['visitorTracking.visitorId'] = { $nin: internalVisitorIds };
    }

    // Time range filter
    if (timeRange) {
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }
      filter.startedAt = { $gte: startDate };
    }

    console.log('[User Conversations GET] Query filter:', filter);

    // Get conversations
    const conversations = await conversationsCollection
      .find(filter)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await conversationsCollection.countDocuments(filter);

    // Get unique visitor count (distinct non-null visitor IDs)
    const uniqueVisitors = await conversationsCollection.distinct('visitorTracking.visitorId', {
      ...filter,
      'visitorTracking.visitorId': { $ne: null, ...(excludeInternal ? { $nin: internalVisitorIds } : {}) }
    });

    // Mark stale in-progress conversations as abandoned (idle > 10 minutes)
    const ABANDONED_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    const now = new Date();
    const processedConversations = conversations.map(conv => {
      if (conv.status === 'in-progress') {
        const lastActivity = new Date(conv.lastActivityAt || conv.startedAt);
        const idleTime = now.getTime() - lastActivity.getTime();
        if (idleTime > ABANDONED_THRESHOLD_MS) {
          return {
            ...conv,
            status: 'abandoned' as const,
            abandonedAt: lastActivity,
            autoAbandoned: true, // Flag to indicate this was auto-detected
          };
        }
      }
      return conv;
    });

    // Recalculate stats based on effective status
    const stats = {
      completed: processedConversations.filter(c => c.status === 'completed').length,
      abandoned: processedConversations.filter(c => c.status === 'abandoned').length,
      inProgress: processedConversations.filter(c => c.status === 'in-progress').length,
    };

    console.log('[User Conversations GET] Found:', total, 'conversations,', uniqueVisitors.length, 'unique visitors');

    return NextResponse.json({
      success: true,
      conversations: processedConversations,
      total,
      uniqueVisitors: uniqueVisitors.length,
      stats,
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
