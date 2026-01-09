// app/api/token-usage/stats/route.ts
// Get token usage statistics

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getTokenUsageCollection } from '@/lib/mongodb/db';
import type { TokenUsageStats } from '@/lib/mongodb/models/tokenUsage';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all
    const feature = searchParams.get('feature'); // Optional filter

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const collection = await getTokenUsageCollection();
    
    // Build query
    const query: any = {
      userId,
      timestamp: { $gte: startDate },
    };
    
    if (feature) {
      query.feature = feature;
    }

    // Get all usage records
    const usageRecords = await collection.find(query).toArray();

    // Calculate aggregates
    const stats: TokenUsageStats = {
      userId,
      totalTokens: {
        input: 0,
        output: 0,
        embedding: 0,
        total: 0,
      },
      totalCost: 0,
      featureBreakdown: {},
      modelBreakdown: {},
      period: {
        start: startDate,
        end: now,
      },
    };

    // Aggregate stats
    for (const record of usageRecords) {
      // Total tokens
      stats.totalTokens.input += record.tokens.input;
      stats.totalTokens.output += record.tokens.output;
      stats.totalTokens.embedding += record.tokens.embedding || 0;
      stats.totalTokens.total += record.tokens.total;
      
      // Total cost
      stats.totalCost += record.cost.total;

      // Feature breakdown
      if (!stats.featureBreakdown[record.feature]) {
        stats.featureBreakdown[record.feature] = {
          count: 0,
          tokens: 0,
          cost: 0,
        };
      }
      stats.featureBreakdown[record.feature].count++;
      stats.featureBreakdown[record.feature].tokens += record.tokens.total;
      stats.featureBreakdown[record.feature].cost += record.cost.total;

      // Model breakdown
      if (!stats.modelBreakdown[record.model]) {
        stats.modelBreakdown[record.model] = {
          count: 0,
          tokens: 0,
          cost: 0,
        };
      }
      stats.modelBreakdown[record.model].count++;
      stats.modelBreakdown[record.model].tokens += record.tokens.total;
      stats.modelBreakdown[record.model].cost += record.cost.total;
    }

    // Get recent usage (last 50 records)
    const recentUsage = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      stats,
      recentUsage: recentUsage.map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        feature: r.feature,
        model: r.model,
        tokens: r.tokens.total,
        cost: r.cost.total,
        success: r.performance.success,
        latency: r.performance.latency,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

