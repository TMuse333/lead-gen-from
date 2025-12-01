// frontend/app/api/offers/[type]/stats/route.ts
/**
 * API route for offer generation statistics
 * GET: Fetch generation stats for an offer type
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferStats } from '@/types/offerCustomization.types';

/**
 * GET /api/offers/[type]/stats
 * Fetch generation statistics for this offer type
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
    const db = await getDatabase();

    // For now, return mock data
    // TODO: Implement actual analytics collection
    const stats: OfferStats = await getOfferStats(
      db,
      session.user.id,
      offerType
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[GET /api/offers/[type]/stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get offer statistics from database
 * Currently returns mock data - implement actual analytics later
 */
async function getOfferStats(
  db: any,
  userId: string,
  offerType: OfferType
): Promise<OfferStats> {
  // TODO: Query actual generation history from analytics collection
  // For now, return mock data
  return {
    offerType,
    totalGenerations: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    averageCost: 0,
    averageDuration: 0,
    averageTokens: 0,
    successRate: 0,
    lastGeneratedAt: undefined,
  };
}
