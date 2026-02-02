// app/api/user/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection, getGenerationsCollection } from '@/lib/mongodb/db';
import { getEffectiveUserId } from '@/lib/auth/impersonation';

/**
 * GET /api/analytics
 * Get analytics for the authenticated user (or impersonated user)
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

    // Get effective userId (impersonated user if admin is impersonating, otherwise actual user)
    const userId = await getEffectiveUserId() || session.user.id;

    // Get environment filter from query params (default to production)
    const { searchParams } = new URL(req.url);
    const environment = searchParams.get('environment') || 'production';

    const conversationsCollection = await getConversationsCollection();
    const generationsCollection = await getGenerationsCollection();

    // Build query filter
    const conversationFilter: Record<string, unknown> = { userId };
    if (environment !== 'all') {
      conversationFilter.environment = environment;
    }

    // Get all conversations for this user (filtered by environment)
    const conversations = await conversationsCollection
      .find(conversationFilter)
      .toArray();

    // Get all generations for this user
    const generations = await generationsCollection
      .find({ userId })
      .toArray();

    // Calculate stats
    const totalConversations = conversations.length;
    const completedConversations = conversations.filter(c => c.status === 'completed').length;
    const abandonedConversations = conversations.filter(c => c.status === 'abandoned').length;
    const inProgressConversations = conversations.filter(c => c.status === 'in-progress').length;
    
    const completionRate = totalConversations > 0 
      ? (completedConversations / totalConversations) * 100 
      : 0;

    // Flow distribution
    const flowDistribution = conversations.reduce((acc, conv) => {
      const flow = conv.flow || 'unknown';
      acc[flow] = (acc[flow] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average conversation length
    const avgMessageCount = totalConversations > 0
      ? conversations.reduce((sum, c) => sum + (c.messageCount || c.messages?.length || 0), 0) / totalConversations
      : 0;

    // Average conversation duration (for completed ones)
    const completedWithDuration = conversations.filter(c => c.status === 'completed' && (c.duration || (c.completedAt && c.startedAt)));
    const avgDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, c) => {
          if (c.duration) return sum + c.duration;
          if (c.completedAt && c.startedAt) {
            return sum + Math.floor((new Date(c.completedAt).getTime() - new Date(c.startedAt).getTime()) / 1000);
          }
          return sum;
        }, 0) / completedWithDuration.length
      : 0;

    // Generation stats
    const totalGenerations = generations.length;
    const successfulGenerations = generations.filter(g => g.status === 'success').length;
    const avgGenerationTime = totalGenerations > 0
      ? generations.reduce((sum, g) => sum + (g.generationTime || 0), 0) / totalGenerations
      : 0;

    // Average advice used per generation
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

    // Contact modal analytics
    const conversationsWithModal = conversations.filter(c => c.contactModal?.shown);
    const contactModalStats = {
      shown: conversationsWithModal.length,
      completed: conversationsWithModal.filter(c => c.contactModal?.completed).length,
      skipped: conversationsWithModal.filter(c => c.contactModal?.skipped && !c.contactModal?.completed).length,
      conversionRate: conversationsWithModal.length > 0
        ? Math.round((conversationsWithModal.filter(c => c.contactModal?.completed).length / conversationsWithModal.length) * 100)
        : 0,
      // Average skips before completing (for those who eventually completed)
      avgSkipsBeforeComplete: (() => {
        const completedWithSkips = conversationsWithModal.filter(c => c.contactModal?.completed && c.contactModal?.skippedCount);
        if (completedWithSkips.length === 0) return 0;
        return Math.round(
          completedWithSkips.reduce((sum, c) => sum + (c.contactModal?.skippedCount || 0), 0) / completedWithSkips.length * 10
        ) / 10;
      })(),
    };

    // Visitor tracking analytics
    const conversationsWithTracking = conversations.filter(c => c.visitorTracking);
    const visitorStats = {
      total: conversationsWithTracking.length,
      returning: conversationsWithTracking.filter(c => c.visitorTracking?.isReturningVisitor).length,
      newVisitors: conversationsWithTracking.filter(c => !c.visitorTracking?.isReturningVisitor).length,
      deviceBreakdown: {
        mobile: conversationsWithTracking.filter(c => c.visitorTracking?.deviceType === 'mobile').length,
        tablet: conversationsWithTracking.filter(c => c.visitorTracking?.deviceType === 'tablet').length,
        desktop: conversationsWithTracking.filter(c => c.visitorTracking?.deviceType === 'desktop').length,
      },
      // Top referral sources
      referralSources: conversationsWithTracking
        .filter(c => c.visitorTracking?.referralSource?.source)
        .reduce((acc, c) => {
          const source = c.visitorTracking?.referralSource?.source || 'direct';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      // Average session duration
      avgSessionDuration: conversationsWithTracking.length > 0
        ? Math.round(
            conversationsWithTracking
              .filter(c => c.visitorTracking?.sessionDuration)
              .reduce((sum, c) => sum + (c.visitorTracking?.sessionDuration || 0), 0) /
            conversationsWithTracking.filter(c => c.visitorTracking?.sessionDuration).length || 1
          )
        : 0,
      // Returning visitor completion rate
      returningCompletionRate: (() => {
        const returningConvos = conversationsWithTracking.filter(c => c.visitorTracking?.isReturningVisitor);
        if (returningConvos.length === 0) return 0;
        const completed = returningConvos.filter(c => c.status === 'completed').length;
        return Math.round((completed / returningConvos.length) * 100);
      })(),
    };

    return NextResponse.json({
      success: true,
      analytics: {
        conversations: {
          total: totalConversations,
          completed: completedConversations,
          abandoned: abandonedConversations,
          inProgress: inProgressConversations,
          completionRate: Math.round(completionRate * 100) / 100,
          avgMessageCount: Math.round(avgMessageCount * 10) / 10,
          avgDuration: Math.round(avgDuration),
          flowDistribution,
          recent: recentConversations,
        },
        generations: {
          total: totalGenerations,
          successful: successfulGenerations,
          successRate: totalGenerations > 0
            ? Math.round((successfulGenerations / totalGenerations) * 100 * 100) / 100
            : 0,
          avgGenerationTime: Math.round(avgGenerationTime),
          avgAdviceUsed: Math.round(avgAdviceUsed * 10) / 10,
          recent: recentGenerations,
        },
        visitors: visitorStats,
        contactModal: contactModalStats,
        timeline: timelineData,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

