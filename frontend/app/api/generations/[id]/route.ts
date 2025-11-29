// app/api/generations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getGenerationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

/**
 * GET /api/generations/[id]
 * Get a single generation by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid generation ID' },
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

    const collection = await getGenerationsCollection();
    const generation = await collection.findOne({ _id: new ObjectId(id) });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (userId && generation.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    if (clientIdentifier && generation.clientIdentifier !== clientIdentifier) {
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
      generation,
    });
  } catch (error) {
    console.error('Error fetching generation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

