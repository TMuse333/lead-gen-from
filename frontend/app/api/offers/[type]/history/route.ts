// frontend/app/api/offers/[type]/history/route.ts
/**
 * API route for offer generation history
 * GET: Fetch recent generation history for an offer type
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb/db';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferHistoryEntry } from '@/types/offerCustomization.types';

/**
 * GET /api/offers/[type]/history
 * Fetch recent generation history
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerType = params.type as OfferType;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const { db } = await connectToDatabase();

    // For now, return mock data
    // TODO: Implement actual history collection
    const history: OfferHistoryEntry[] = await getOfferHistory(
      db,
      session.user.email,
      offerType,
      limit,
      skip
    );

    return NextResponse.json({
      history,
      total: history.length,
      limit,
      skip,
    });
  } catch (error) {
    console.error('[GET /api/offers/[type]/history] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get offer generation history from database
 * Currently returns empty array - implement actual tracking later
 */
async function getOfferHistory(
  db: any,
  userId: string,
  offerType: OfferType,
  limit: number,
  skip: number
): Promise<OfferHistoryEntry[]> {
  // TODO: Query actual generation history from analytics collection
  // For now, return empty array
  return [];
}
