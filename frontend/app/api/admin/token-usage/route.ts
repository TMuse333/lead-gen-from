// app/api/admin/token-usage/route.ts
// Get aggregated token usage across ALL users (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getTokenUsageCollection } from '@/lib/mongodb/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user (should restrict to admin in production)

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all

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
    
    // Get all usage records across all users
    const usageRecords = await collection
      .find({
        timestamp: { $gte: startDate },
      })
      .toArray();

    // Aggregate stats across all users
    const stats = {
      totalTokens: {
        input: 0,
        output: 0,
        embedding: 0,
        total: 0,
      },
      totalCost: 0,
      totalUsers: new Set<string>(),
      totalCalls: 0,
      featureBreakdown: {} as Record<string, {
        count: number;
        tokens: number;
        cost: number;
        users: Set<string>;
      }>,
      modelBreakdown: {} as Record<string, {
        count: number;
        tokens: number;
        cost: number;
        users: Set<string>;
      }>,
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

      // Total users
      if (record.userId) {
        stats.totalUsers.add(record.userId);
      }

      // Total calls
      stats.totalCalls++;

      // Feature breakdown
      const feature = record.feature || 'unknown';
      if (!stats.featureBreakdown[feature]) {
        stats.featureBreakdown[feature] = {
          count: 0,
          tokens: 0,
          cost: 0,
          users: new Set<string>(),
        };
      }
      stats.featureBreakdown[feature].count++;
      stats.featureBreakdown[feature].tokens += record.tokens.total;
      stats.featureBreakdown[feature].cost += record.cost.total;
      if (record.userId) {
        stats.featureBreakdown[feature].users.add(record.userId);
      }

      // Model breakdown
      const model = record.model || 'unknown';
      if (!stats.modelBreakdown[model]) {
        stats.modelBreakdown[model] = {
          count: 0,
          tokens: 0,
          cost: 0,
          users: new Set<string>(),
        };
      }
      stats.modelBreakdown[model].count++;
      stats.modelBreakdown[model].tokens += record.tokens.total;
      stats.modelBreakdown[model].cost += record.cost.total;
      if (record.userId) {
        stats.modelBreakdown[model].users.add(record.userId);
      }
    }

    // Convert Sets to counts for JSON response
    const response = {
      success: true,
      stats: {
        totalTokens: stats.totalTokens,
        totalCost: stats.totalCost,
        totalUsers: stats.totalUsers.size,
        totalCalls: stats.totalCalls,
        featureBreakdown: Object.fromEntries(
          Object.entries(stats.featureBreakdown).map(([feature, data]) => [
            feature,
            {
              count: data.count,
              tokens: data.tokens,
              cost: data.cost,
              users: data.users.size,
            },
          ])
        ),
        modelBreakdown: Object.fromEntries(
          Object.entries(stats.modelBreakdown).map(([model, data]) => [
            model,
            {
              count: data.count,
              tokens: data.tokens,
              cost: data.cost,
              users: data.users.size,
            },
          ])
        ),
        period: stats.period,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

