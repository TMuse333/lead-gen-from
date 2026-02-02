// app/api/agent-advice/clear-all/route.ts
/**
 * Clear all advice/stories from user's Qdrant collection
 * DEV ONLY - Used for testing and resetting data
 */

import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

async function getUserCollectionName(userId: string): Promise<string | null> {
  try {
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId });
    return userConfig?.qdrantCollectionName || null;
  } catch (error) {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get effective userId (impersonated user if admin is impersonating)
    const userId = await getEffectiveUserId() || session.user.id;

    // Get user's collection name
    const collectionName = await getUserCollectionName(userId);
    if (!collectionName) {
      return NextResponse.json(
        { error: 'No knowledge base collection found' },
        { status: 404 }
      );
    }

    // Get optional kind filter from query params
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind'); // 'story', 'tip', or null for all

    // First, get all points to count them
    const scrollResult = await client.scroll(collectionName, {
      limit: 1000,
      with_payload: true,
      with_vector: false,
    });

    // Filter points by kind if specified
    let pointsToDelete = scrollResult.points;
    if (kind) {
      pointsToDelete = scrollResult.points.filter(
        (point) => point.payload?.kind === kind
      );
    }

    if (pointsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: kind ? `No ${kind}s found to delete` : 'No items found to delete',
        deletedCount: 0,
      });
    }

    // Delete all matching points
    const pointIds = pointsToDelete.map((point) => point.id as string);

    await client.delete(collectionName, {
      wait: true,
      points: pointIds,
    });

    return NextResponse.json({
      success: true,
      message: kind
        ? `Deleted ${pointIds.length} ${kind}(s)`
        : `Deleted ${pointIds.length} item(s)`,
      deletedCount: pointIds.length,
    });
  } catch (error) {
    console.error('Error clearing advice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear advice' },
      { status: 500 }
    );
  }
}
