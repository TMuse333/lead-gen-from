// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection, getGenerationsCollection, getClientConfigsCollection } from '@/lib/mongodb/db';

/**
 * GET /api/admin/analytics
 * Get overall analytics for all users (admin only)
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

    // TODO: Add admin role check here

    const conversationsCollection = await getConversationsCollection();
    const generationsCollection = await getGenerationsCollection();
    const clientConfigsCollection = await getClientConfigsCollection();

    // Get all data (no user filter for admin)
    const conversations = await conversationsCollection.find({}).toArray();
    const generations = await generationsCollection.find({}).toArray();
    const clientConfigs = await clientConfigsCollection.find({}).toArray();

    // Overall stats
    const totalUsers = new Set(conversations.map(c => c.userId).filter(Boolean)).size;
    const totalConversations = conversations.length;
    const totalGenerations = generations.length;
    const totalActiveBots = clientConfigs.filter(c => c.isActive).length;

    // Conversation stats
    const completedConversations = conversations.filter(c => c.status === 'completed').length;
    const abandonedConversations = conversations.filter(c => c.status === 'abandoned').length;
    const completionRate = totalConversations > 0 
      ? (completedConversations / totalConversations) * 100 
      : 0;

    // Flow distribution
    const flowDistribution = conversations.reduce((acc, conv) => {
      const flow = conv.flow || 'unknown';
      acc[flow] = (acc[flow] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generation stats
    const successfulGenerations = generations.filter(g => g.status === 'success').length;
    const avgGenerationTime = totalGenerations > 0
      ? generations.reduce((sum, g) => sum + (g.generationTime || 0), 0) / totalGenerations
      : 0;

    // Average advice used
    const avgAdviceUsed = totalGenerations > 0
      ? generations.reduce((sum, g) => sum + (g.debugInfo?.adviceUsed || 0), 0) / totalGenerations
      : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentConversations = conversations.filter(
      c => c.startedAt && new Date(c.startedAt) >= sevenDaysAgo
    ).length;

    const recentGenerations = generations.filter(
      g => g.generatedAt && new Date(g.generatedAt) >= sevenDaysAgo
    ).length;

    // Timeline data (conversations per day for last 7 days)
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = conversations.filter(c => {
        const startedAt = new Date(c.startedAt);
        return startedAt >= date && startedAt < nextDate;
      }).length;
      
      timelineData.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    // Top users by conversation count
    const userConversationCounts = conversations.reduce((acc, conv) => {
      if (conv.userId) {
        acc[conv.userId] = (acc[conv.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userConversationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, conversationCount: count }));

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalConversations,
          totalGenerations,
          totalActiveBots,
          recentConversations,
          recentGenerations,
        },
        conversations: {
          total: totalConversations,
          completed: completedConversations,
          abandoned: abandonedConversations,
          completionRate: Math.round(completionRate * 100) / 100,
          flowDistribution,
        },
        generations: {
          total: totalGenerations,
          successful: successfulGenerations,
          successRate: totalGenerations > 0 
            ? Math.round((successfulGenerations / totalGenerations) * 100 * 100) / 100 
            : 0,
          avgGenerationTime: Math.round(avgGenerationTime),
          avgAdviceUsed: Math.round(avgAdviceUsed * 10) / 10,
        },
        timeline: timelineData,
        topUsers,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

