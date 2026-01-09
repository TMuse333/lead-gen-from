// app/api/admin/conversations/analytics/route.ts
// Admin API for conversation analytics

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection, getGenerationsCollection } from '@/lib/mongodb/db';

/**
 * GET /api/admin/conversations/analytics
 * Get aggregated analytics for all conversations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const collection = await getConversationsCollection();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const matchFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.startedAt = dateFilter;
    }

    // Aggregate analytics
    const analytics = await collection
      .aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalConversations: { $sum: 1 },
            completedConversations: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            abandonedConversations: {
              $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] },
            },
            inProgressConversations: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
            },
            avgDuration: { $avg: '$duration' },
            totalDuration: { $sum: '$duration' },
            totalMessages: { $sum: '$messageCount' },
            flowBreakdown: {
              $push: '$flow',
            },
          },
        },
      ])
      .toArray();

    const stats = analytics[0] || {
      totalConversations: 0,
      completedConversations: 0,
      abandonedConversations: 0,
      inProgressConversations: 0,
      avgDuration: 0,
      totalDuration: 0,
      totalMessages: 0,
      flowBreakdown: [],
    };

    // Calculate completion rate
    const completionRate =
      stats.totalConversations > 0
        ? (stats.completedConversations / stats.totalConversations) * 100
        : 0;

    // Flow breakdown
    const flowCounts: Record<string, number> = {};
    stats.flowBreakdown.forEach((flow: string) => {
      flowCounts[flow] = (flowCounts[flow] || 0) + 1;
    });

    // Get unique users
    const uniqueUsers = await collection.distinct('userId', matchFilter);
    const uniqueClients = await collection.distinct('clientIdentifier', matchFilter);

    // Get generations count
    const generationsCollection = await getGenerationsCollection();
    const totalGenerations = await generationsCollection.countDocuments(
      Object.keys(dateFilter).length > 0
        ? {
            generatedAt: dateFilter,
          }
        : {}
    );

    return NextResponse.json({
      success: true,
      analytics: {
        totalConversations: stats.totalConversations,
        completedConversations: stats.completedConversations,
        abandonedConversations: stats.abandonedConversations,
        inProgressConversations: stats.inProgressConversations,
        completionRate: Math.round(completionRate * 100) / 100,
        avgDuration: Math.round((stats.avgDuration || 0) * 100) / 100, // seconds
        totalDuration: stats.totalDuration || 0, // seconds
        totalMessages: stats.totalMessages || 0,
        totalGenerations,
        uniqueUsers: uniqueUsers.filter((u) => u).length,
        uniqueClients: uniqueClients.filter((c) => c).length,
        flowBreakdown: flowCounts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

