// app/api/user/knowledge-analytics/route.ts
/**
 * Knowledge Retrieval Analytics API
 *
 * Returns analytics on how Qdrant knowledge is being used in conversations:
 * - Total retrievals and breakdown by intent
 * - Most retrieved knowledge items
 * - Retrieval performance metrics
 * - Time-series data for trends
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection, getKnowledgeRetrievalsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

interface IntentBreakdown {
  intent: string;
  count: number;
  avgRetrievalTime: number;
  avgItemsRetrieved: number;
}

interface PopularItem {
  id: string;
  title: string;
  category: string;
  kind: string;
  retrievalCount: number;
  avgScore: number;
}

interface DailyTrend {
  date: string;
  retrievals: number;
  avgItems: number;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;

    // Get client config to find clientId
    const configsCollection = await getClientConfigsCollection();
    const config = await configsCollection.findOne({ userId });

    if (!config?.businessName) {
      return NextResponse.json({ error: 'Client not configured' }, { status: 404 });
    }

    const clientId = config.businessName;
    const retrievalsCollection = await getKnowledgeRetrievalsCollection();

    // Parse query params for date range
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const environmentParam = searchParams.get('environment') || 'production';
    const environment = (environmentParam === 'test' ? 'test' : 'production') as 'test' | 'production';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const baseFilter = {
      clientId,
      environment,
      createdAt: { $gte: startDate },
    };

    // Get total counts
    const totalRetrievals = await retrievalsCollection.countDocuments(baseFilter);

    // Get breakdown by intent
    const intentBreakdown = await retrievalsCollection
      .aggregate<IntentBreakdown>([
        { $match: baseFilter },
        {
          $group: {
            _id: '$intent',
            count: { $sum: 1 },
            avgRetrievalTime: { $avg: '$retrievalTimeMs' },
            avgItemsRetrieved: { $avg: '$totalRetrieved' },
          },
        },
        {
          $project: {
            intent: '$_id',
            count: 1,
            avgRetrievalTime: { $round: ['$avgRetrievalTime', 0] },
            avgItemsRetrieved: { $round: ['$avgItemsRetrieved', 1] },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Get breakdown by source type
    const sourceBreakdown = await retrievalsCollection
      .aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalAgentKnowledge: { $sum: '$agentKnowledgeCount' },
            totalStories: { $sum: '$storiesCount' },
            totalTips: { $sum: '$tipsCount' },
          },
        },
      ])
      .toArray();

    const sources = sourceBreakdown[0] || {
      totalAgentKnowledge: 0,
      totalStories: 0,
      totalTips: 0,
    };

    // Get most retrieved items (flatten and count)
    const popularItems = await retrievalsCollection
      .aggregate<PopularItem>([
        { $match: baseFilter },
        { $unwind: '$retrievedItems' },
        {
          $group: {
            _id: {
              id: '$retrievedItems.id',
              title: '$retrievedItems.title',
              category: '$retrievedItems.category',
              kind: '$retrievedItems.kind',
            },
            retrievalCount: { $sum: 1 },
            avgScore: { $avg: '$retrievedItems.score' },
          },
        },
        {
          $project: {
            id: '$_id.id',
            title: '$_id.title',
            category: '$_id.category',
            kind: '$_id.kind',
            retrievalCount: 1,
            avgScore: { $round: ['$avgScore', 2] },
          },
        },
        { $sort: { retrievalCount: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Get daily trend for the period
    const dailyTrend = await retrievalsCollection
      .aggregate<DailyTrend>([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            retrievals: { $sum: 1 },
            avgItems: { $avg: '$totalRetrieved' },
          },
        },
        {
          $project: {
            date: '$_id',
            retrievals: 1,
            avgItems: { $round: ['$avgItems', 1] },
          },
        },
        { $sort: { date: 1 } },
      ])
      .toArray();

    // Get objection subtypes breakdown (for objection intent)
    const objectionBreakdown = await retrievalsCollection
      .aggregate([
        { $match: { ...baseFilter, intent: 'objection', objectionType: { $exists: true } } },
        {
          $group: {
            _id: '$objectionType',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Calculate averages
    const avgRetrievalTime =
      intentBreakdown.length > 0
        ? Math.round(
            intentBreakdown.reduce((sum, i) => sum + i.avgRetrievalTime * i.count, 0) / totalRetrievals
          )
        : 0;

    const avgItemsPerRetrieval =
      intentBreakdown.length > 0
        ? Math.round(
            (intentBreakdown.reduce((sum, i) => sum + i.avgItemsRetrieved * i.count, 0) /
              totalRetrievals) *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      success: true,
      period: { days, startDate: startDate.toISOString(), environment },
      summary: {
        totalRetrievals,
        avgRetrievalTime,
        avgItemsPerRetrieval,
      },
      byIntent: intentBreakdown,
      bySource: {
        agentKnowledge: sources.totalAgentKnowledge,
        stories: sources.totalStories,
        tips: sources.totalTips,
      },
      popularItems,
      dailyTrend,
      objectionBreakdown: objectionBreakdown.map((o) => ({
        type: o._id,
        count: o.count,
      })),
    });
  } catch (error) {
    console.error('[Knowledge Analytics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
