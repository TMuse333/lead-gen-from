// app/api/admin/rate-limits/route.ts
// Admin API for managing rate limit configurations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getRateLimitConfigsCollection } from '@/lib/mongodb/db';
import { DEFAULT_RATE_LIMITS, type RateLimitConfigDocument } from '@/lib/mongodb/models/rateLimitConfig';
import { invalidateRateLimitCache } from '@/lib/rateLimit/getRateLimit';
import { getTokenUsageCollection } from '@/lib/mongodb/db';
import type { FeatureType } from '@/types/tokenUsage.types';

/**
 * GET /api/admin/rate-limits
 * Get all rate limit configurations with current usage stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user

    const collection = await getRateLimitConfigsCollection();
    const tokenCollection = await getTokenUsageCollection();

    // Get all configured limits
    const configs = await collection.find({}).toArray();

    // Get current usage stats (last hour) for each feature
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const usageStats = await tokenCollection
      .aggregate([
        {
          $match: {
            timestamp: { $gte: oneHourAgo },
          },
        },
        {
          $group: {
            _id: {
              feature: '$feature',
              userId: '$userId',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.feature',
            authenticated: {
              $sum: {
                $cond: [{ $ifNull: ['$_id.userId', false] }, '$count', 0],
              },
            },
            unauthenticated: {
              $sum: {
                $cond: [{ $ifNull: ['$_id.userId', false] }, 0, '$count'],
              },
            },
          },
        },
      ])
      .toArray();

    const usageMap = new Map(
      usageStats.map((stat: any) => [
        stat._id,
        {
          authenticated: stat.authenticated || 0,
          unauthenticated: stat.unauthenticated || 0,
        },
      ])
    );

    // Merge configs with defaults and usage stats
    const allFeatures = Object.keys(DEFAULT_RATE_LIMITS) as FeatureType[];
    const result = allFeatures.map((feature) => {
      const config = configs.find((c) => c.feature === feature);
      const usage = usageMap.get(feature) || { authenticated: 0, unauthenticated: 0 };

      return {
        feature,
        authenticated: {
          ...(config?.authenticated || DEFAULT_RATE_LIMITS[feature].authenticated),
          current: usage.authenticated,
        },
        unauthenticated: {
          ...(config?.unauthenticated || DEFAULT_RATE_LIMITS[feature].unauthenticated),
          current: usage.unauthenticated,
        },
        enabled: config?.enabled ?? DEFAULT_RATE_LIMITS[feature].enabled,
        updatedAt: config?.updatedAt || null,
        updatedBy: config?.updatedBy || null,
      };
    });

    return NextResponse.json({ success: true, configs: result });
  } catch (error) {
    console.error('Error fetching rate limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limits' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/rate-limits
 * Update rate limit configuration for a feature
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here

    const body = await req.json();
    const { feature, authenticated, unauthenticated, enabled } = body;

    if (!feature || !authenticated || !unauthenticated) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (
      typeof authenticated.requests !== 'number' ||
      authenticated.requests < 0 ||
      !['1h', '24h'].includes(authenticated.window)
    ) {
      return NextResponse.json(
        { error: 'Invalid authenticated limits' },
        { status: 400 }
      );
    }

    if (
      typeof unauthenticated.requests !== 'number' ||
      unauthenticated.requests < 0 ||
      !['1h', '24h'].includes(unauthenticated.window)
    ) {
      return NextResponse.json(
        { error: 'Invalid unauthenticated limits' },
        { status: 400 }
      );
    }

    const collection = await getRateLimitConfigsCollection();

    // Upsert configuration
    const result = await collection.updateOne(
      { feature },
      {
        $set: {
          feature,
          authenticated,
          unauthenticated,
          enabled: enabled !== undefined ? enabled : true,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Invalidate cache
    invalidateRateLimitCache(feature as FeatureType);

    return NextResponse.json({
      success: true,
      message: 'Rate limit updated successfully',
    });
  } catch (error) {
    console.error('Error updating rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to update rate limit' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rate-limits/reset
 * Reset all rate limits to defaults
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature');

    const collection = await getRateLimitConfigsCollection();

    if (feature) {
      // Reset single feature
      const defaultConfig = DEFAULT_RATE_LIMITS[feature as FeatureType];
      if (!defaultConfig) {
        return NextResponse.json(
          { error: 'Invalid feature' },
          { status: 400 }
        );
      }

      await collection.updateOne(
        { feature: feature as FeatureType },
        {
          $set: {
            ...defaultConfig,
            updatedAt: new Date(),
            updatedBy: session.user!.id,
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      invalidateRateLimitCache(feature as FeatureType);
    } else {
      // Reset all features
      const operations = Object.entries(DEFAULT_RATE_LIMITS).map(
        ([feature, config]) => ({
          updateOne: {
            filter: { feature },
            update: {
              $set: {
                ...config,
                updatedAt: new Date(),
                updatedBy: session.user!.id,
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            upsert: true,
          },
        })
      );

      await collection.bulkWrite(operations);
      invalidateRateLimitCache();
    }

    return NextResponse.json({
      success: true,
      message: 'Rate limits reset successfully',
    });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    );
  }
}

