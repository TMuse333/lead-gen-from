// app/api/admin/qdrant-items/route.ts
// API route to get all items from a Qdrant collection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { qdrant } from '@/lib/qdrant/client';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin check here

    // 2. Get collection name from query params
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');

    if (!collectionName) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // 3. Check if collection exists
    const { collections } = await qdrant.getCollections();
    const collectionExists = collections.some((col) => col.name === collectionName);

    if (!collectionExists) {
      return NextResponse.json({
        success: true,
        count: 0,
        items: [],
        message: 'Collection does not exist or is empty',
      });
    }

    // 4. Fetch all items from Qdrant collection
    const result = await qdrant.scroll(collectionName, {
      limit: 1000, // Get up to 1000 items
      with_payload: true,
      with_vector: false, // Don't need vectors for display
    });

    // 5. Format items
    const items = result.points.map((point) => ({
      id: point.id as string,
      title: (point.payload as any)?.title || 'Untitled',
      advice: (point.payload as any)?.advice || '',
      tags: ((point.payload as any)?.tags as string[]) || [],
      flow: ((point.payload as any)?.flow as string[]) || [],
      conditions: (point.payload as any)?.conditions || {},
      source: (point.payload as any)?.source || 'unknown',
      createdAt: (point.payload as any)?.createdAt || '',
      updatedAt: (point.payload as any)?.updatedAt || '',
      usageCount: (point.payload as any)?.usageCount || 0,
    }));

    return NextResponse.json({
      success: true,
      count: items.length,
      collectionName,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch Qdrant items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

