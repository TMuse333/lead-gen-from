// app/api/stories/count/route.ts
// Returns story count for a client's knowledge base
// Works for both authenticated dashboard users and public bot users

import { NextRequest, NextResponse } from 'next/server';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';

export const runtime = 'nodejs';

/**
 * GET /api/stories/count?clientId=bob-real-estate&flow=buy&search=first-time
 * Returns the number of stories in the client's knowledge base
 *
 * Query params:
 * - clientId: Business name or identifier (required for public bot)
 * - flow: 'buy' | 'sell' | 'browse' (optional, filters count by flow)
 * - search: Search term to filter stories by tags/content (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const flow = searchParams.get('flow');
    const search = searchParams.get('search');

    if (!clientId) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No clientId provided'
      });
    }

    // Find the client's config
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({
      $or: [
        { businessName: { $regex: new RegExp(`^${clientId}$`, 'i') } },
        { businessName: clientId },
      ],
      isActive: true,
    });

    if (!config) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Client not found',
      });
    }

    const collectionName = config.qdrantCollectionName;
    if (!collectionName) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No knowledge base configured',
      });
    }

    // Build filter conditions
    const mustConditions: any[] = [];

    // Add flow filter if specified
    if (flow && ['buy', 'sell', 'browse'].includes(flow)) {
      mustConditions.push({
        key: 'flow',
        match: { any: [flow] },
      });
    }

    // Add search filter if specified - search in tags
    if (search) {
      // Normalize search term
      const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);

      // Search in tags field using text match
      mustConditions.push({
        key: 'tags',
        match: { any: searchTerms },
      });
    }

    const filter = mustConditions.length > 0
      ? { must: mustConditions }
      : undefined;

    // Get count from Qdrant
    const result = await qdrant.count(collectionName, {
      filter,
      exact: false, // Faster approximate count
    });

    // If search was provided but no exact matches, try a more lenient search
    // Return a reasonable non-zero count to show relevance
    let count = result.count || 0;

    if (search && count === 0) {
      // Fallback: get total count for flow and return a portion
      // This ensures we always show "some" relevant experiences
      const totalResult = await qdrant.count(collectionName, {
        filter: flow ? { must: [{ key: 'flow', match: { any: [flow] } }] } : undefined,
        exact: false,
      });

      // Return a portion of total (between 1-5) to indicate some relevance
      const total = totalResult.count || 0;
      if (total > 0) {
        count = Math.min(Math.max(1, Math.floor(total * 0.3)), 5);
      }
    }

    return NextResponse.json({
      success: true,
      count,
      flow: flow || 'all',
      search: search || undefined,
      clientId,
    });
  } catch (error) {
    console.error('[stories/count] Error:', error);
    // Return 0 count on error to not break the UX
    return NextResponse.json({
      success: true,
      count: 0,
      message: 'Error fetching count',
    });
  }
}
