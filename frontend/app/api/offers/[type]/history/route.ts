// frontend/app/api/offers/[type]/history/route.ts
/**
 * API route for offer generation history
 * GET: Fetch recent generation history for an offer type
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferHistoryEntry } from '@/types/offers/offerCustomization.types';

/**
 * GET /api/offers/[type]/history
 * Fetch recent generation history
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15+ requirement)
    const { type } = await params;
    const offerType = type as OfferType;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const db = await getDatabase();

    // For now, return mock data
    // TODO: Implement actual history collection
    const history: OfferHistoryEntry[] = await getOfferHistory(
      db,
      session.user.id,
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
