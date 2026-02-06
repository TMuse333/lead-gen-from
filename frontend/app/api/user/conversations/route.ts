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

    console.log('[User Conversations GET] Found:', total, 'conversations,', uniqueVisitors.length, 'unique visitors');

    return NextResponse.json({
      success: true,
      conversations,
      total,
      uniqueVisitors: uniqueVisitors.length,
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
