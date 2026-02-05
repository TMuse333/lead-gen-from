// app/api/custom-questions/all/route.ts
// Returns all questions for all flows in a single request

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * GET /api/custom-questions/all?clientId=businessName
 * Returns questions for ALL flows in a single request (faster than multiple calls)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const collection = await getClientConfigsCollection();
    let config: any = null;

    // Priority 1: clientId for public bot access
    if (clientId) {
      config = await collection.findOne({ businessName: clientId, isActive: true });
    } else {
      // Priority 2: Authenticated user's config (dashboard)
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      config = await collection.findOne({ userId: session.user.id });
    }

    if (!config) {
      return NextResponse.json(
        {
          error: 'Configuration not found',
          hint: 'Complete onboarding to create your configuration',
        },
        { status: 404 }
      );
    }

    // Get questions for all flows
    const flows: TimelineFlow[] = ['buy', 'sell'];
    const questions: Record<TimelineFlow, CustomQuestion[]> = {
      buy: config.customQuestions?.buy || [],
      sell: config.customQuestions?.sell || [],
    };

    const totalCount = questions.buy.length + questions.sell.length;

    console.log(`[custom-questions/all] Client: ${config.businessName}, Total questions: ${totalCount}`);

    // Cache for 5 minutes, stale-while-revalidate for 1 hour
    return NextResponse.json({
      success: true,
      questions,
      counts: {
        buy: questions.buy.length,
        sell: questions.sell.length,
        total: totalCount,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[custom-questions/all] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
