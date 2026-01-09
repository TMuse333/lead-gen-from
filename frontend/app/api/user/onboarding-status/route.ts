// app/api/user/onboarding-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

/**
 * GET /api/user/onboarding-status
 * Check if the authenticated user has completed onboarding
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    const hasCompletedOnboarding = !!config?.onboardingCompletedAt;

    return NextResponse.json({
      success: true,
      hasCompletedOnboarding,
      onboardingCompletedAt: config?.onboardingCompletedAt || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check onboarding status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

