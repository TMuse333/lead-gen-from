// app/api/feedback/route.ts
/**
 * API endpoint to collect MVP feedback from users
 * Stores feedback in MongoDB and optionally sends email notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

interface FeedbackRating {
  setupEasy: number | null;
  setupTime: number | null;
}

interface RatingDetails {
  setupEasyDetail: string;
  setupTimeDetail: string;
}

interface FeedbackPayload {
  ratings: FeedbackRating;
  ratingDetails?: RatingDetails;
  futureFeatures: string;
  improvements: string;
  favoriteFeature: string;
  additionalComments: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user info (optional - feedback can be anonymous)
    const session = await auth();
    const userId = session?.user?.id || 'anonymous';
    const userEmail = session?.user?.email || null;

    const body: FeedbackPayload = await request.json();

    // Validate that there's at least some feedback
    const hasRatings =
      body.ratings?.setupEasy !== null ||
      body.ratings?.setupTime !== null;
    const hasText =
      body.futureFeatures?.trim() ||
      body.improvements?.trim() ||
      body.favoriteFeature?.trim() ||
      body.additionalComments?.trim();

    if (!hasRatings && !hasText) {
      return NextResponse.json(
        { error: 'Please provide at least some feedback' },
        { status: 400 }
      );
    }

    // Store in MongoDB
    const db = await getDatabase();
    const feedbackCollection = db.collection('mvp_feedback');

    const feedbackDoc = {
      userId,
      userEmail,
      ratings: {
        setupEasy: body.ratings?.setupEasy ?? null,
        setupTime: body.ratings?.setupTime ?? null,
      },
      ratingDetails: {
        setupEasyDetail: body.ratingDetails?.setupEasyDetail?.trim() || null,
        setupTimeDetail: body.ratingDetails?.setupTimeDetail?.trim() || null,
      },
      text: {
        favoriteFeature: body.favoriteFeature?.trim() || null,
        improvements: body.improvements?.trim() || null,
        futureFeatures: body.futureFeatures?.trim() || null,
        additionalComments: body.additionalComments?.trim() || null,
      },
      metadata: {
        userAgent: request.headers.get('user-agent') || null,
        timestamp: new Date(),
        source: 'dashboard-feedback-section',
      },
    };

    await feedbackCollection.insertOne(feedbackDoc);

    // Calculate average scores for logging
    const avgRating =
      [body.ratings?.setupEasy, body.ratings?.setupTime]
        .filter((r) => r !== null)
        .reduce((a, b) => a + (b || 0), 0) /
        [body.ratings?.setupEasy, body.ratings?.setupTime].filter(
          (r) => r !== null
        ).length || 0;

    console.log(
      `[Feedback] New feedback received from ${userEmail || 'anonymous'} - Avg rating: ${avgRating.toFixed(1)}/5`
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('[Feedback] Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Admin endpoint to retrieve all feedback (protected)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only allow in dev mode or for specific admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

    if (!isDev && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const feedbackCollection = db.collection('mvp_feedback');

    const feedback = await feedbackCollection
      .find({})
      .sort({ 'metadata.timestamp': -1 })
      .limit(100)
      .toArray();

    // Calculate aggregate stats
    const totalCount = await feedbackCollection.countDocuments();
    const avgSetupEasy =
      await feedbackCollection
        .aggregate([
          { $match: { 'ratings.setupEasy': { $ne: null } } },
          { $group: { _id: null, avg: { $avg: '$ratings.setupEasy' } } },
        ])
        .toArray();

    const avgSetupTime =
      await feedbackCollection
        .aggregate([
          { $match: { 'ratings.setupTime': { $ne: null } } },
          { $group: { _id: null, avg: { $avg: '$ratings.setupTime' } } },
        ])
        .toArray();

    return NextResponse.json({
      success: true,
      totalCount,
      averages: {
        setupEasy: avgSetupEasy[0]?.avg?.toFixed(2) || null,
        setupTime: avgSetupTime[0]?.avg?.toFixed(2) || null,
      },
      feedback,
    });
  } catch (error) {
    console.error('[Feedback] Error retrieving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    );
  }
}
