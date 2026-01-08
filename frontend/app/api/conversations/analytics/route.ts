// app/api/conversations/analytics/route.ts
/**
 * Conversation Analytics API
 *
 * Provides aggregated analytics including:
 * - Completion rates by flow
 * - Funnel drop-off analysis
 * - Question-level performance
 * - Time-based trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getConversationsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

interface FunnelStep {
  questionId: string;
  questionLabel: string;
  reached: number;
  answered: number;
  dropOff: number;
  dropOffRate: number;
}

interface FlowStats {
  flow: string;
  total: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
  abandonmentRate: number;
  avgDuration: number;
  avgProgress: number;
}

interface AnalyticsResponse {
  overview: {
    totalConversations: number;
    completedCount: number;
    abandonedCount: number;
    inProgressCount: number;
    overallCompletionRate: number;
    avgDuration: number;
    avgMessages: number;
  };
  byFlow: FlowStats[];
  funnel: FunnelStep[];
  dropOffPoints: Array<{
    questionId: string;
    label: string;
    abandonedCount: number;
    percentage: number;
  }>;
  trends: {
    daily: Array<{
      date: string;
      started: number;
      completed: number;
      abandoned: number;
    }>;
  };
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const flow = searchParams.get('flow'); // Optional filter

    const collection = await getConversationsCollection();

    // Build base filter
    const baseFilter: any = { userId: session.user.id };
    if (flow && flow !== 'all') {
      baseFilter.flow = flow;
    }

    // Date range filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    baseFilter.startedAt = { $gte: startDate };

    // Fetch all conversations for the period
    const conversations = await collection
      .find(baseFilter)
      .sort({ startedAt: -1 })
      .toArray();

    // ==================== OVERVIEW ====================
    const totalConversations = conversations.length;
    const completedCount = conversations.filter(c => c.status === 'completed').length;
    const abandonedCount = conversations.filter(c => c.status === 'abandoned').length;
    const inProgressCount = conversations.filter(c => c.status === 'in-progress').length;

    const completedWithDuration = conversations.filter(c => c.status === 'completed' && c.duration);
    const avgDuration = completedWithDuration.length > 0
      ? Math.round(completedWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / completedWithDuration.length)
      : 0;

    const avgMessages = totalConversations > 0
      ? Math.round(conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0) / totalConversations)
      : 0;

    const overview = {
      totalConversations,
      completedCount,
      abandonedCount,
      inProgressCount,
      overallCompletionRate: totalConversations > 0 ? Math.round((completedCount / totalConversations) * 100) : 0,
      avgDuration,
      avgMessages,
    };

    // ==================== BY FLOW ====================
    const flowGroups = new Map<string, typeof conversations>();
    for (const conv of conversations) {
      const f = conv.flow || 'unknown';
      if (!flowGroups.has(f)) {
        flowGroups.set(f, []);
      }
      flowGroups.get(f)!.push(conv);
    }

    const byFlow: FlowStats[] = [];
    for (const [flowName, flowConvs] of flowGroups) {
      const total = flowConvs.length;
      const completed = flowConvs.filter(c => c.status === 'completed').length;
      const abandoned = flowConvs.filter(c => c.status === 'abandoned').length;
      const inProgress = flowConvs.filter(c => c.status === 'in-progress').length;

      const withDuration = flowConvs.filter(c => c.duration);
      const avgDur = withDuration.length > 0
        ? Math.round(withDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / withDuration.length)
        : 0;

      const avgProg = total > 0
        ? Math.round(flowConvs.reduce((sum, c) => sum + (c.progress || 0), 0) / total)
        : 0;

      byFlow.push({
        flow: flowName,
        total,
        completed,
        abandoned,
        inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        abandonmentRate: total > 0 ? Math.round((abandoned / total) * 100) : 0,
        avgDuration: avgDur,
        avgProgress: avgProg,
      });
    }

    // ==================== FUNNEL ANALYSIS ====================
    // Analyze which questions users answered and where they dropped
    const questionCounts = new Map<string, { reached: number; answered: number; label: string }>();

    for (const conv of conversations) {
      const answers = conv.answers || [];

      // Track each question that was answered
      for (const answer of answers) {
        const qId = answer.questionId || answer.mappingKey;
        if (!qId) continue;

        if (!questionCounts.has(qId)) {
          questionCounts.set(qId, {
            reached: 0,
            answered: 0,
            label: answer.mappingKey || qId
          });
        }

        const counts = questionCounts.get(qId)!;
        counts.reached++;
        counts.answered++;
      }

      // If abandoned, mark the last question as reached but not answered
      if (conv.status === 'abandoned' && conv.currentNodeId) {
        const lastQ = conv.currentNodeId;
        if (!questionCounts.has(lastQ)) {
          questionCounts.set(lastQ, { reached: 0, answered: 0, label: lastQ });
        }
        questionCounts.get(lastQ)!.reached++;
      }
    }

    // Convert to funnel steps
    const funnel: FunnelStep[] = Array.from(questionCounts.entries())
      .map(([questionId, counts]) => ({
        questionId,
        questionLabel: counts.label,
        reached: counts.reached,
        answered: counts.answered,
        dropOff: counts.reached - counts.answered,
        dropOffRate: counts.reached > 0
          ? Math.round(((counts.reached - counts.answered) / counts.reached) * 100)
          : 0,
      }))
      .sort((a, b) => b.reached - a.reached); // Sort by most reached

    // ==================== DROP-OFF POINTS ====================
    // Find where users abandon most frequently
    const abandonedByQuestion = new Map<string, number>();

    for (const conv of conversations) {
      if (conv.status === 'abandoned' && conv.currentNodeId) {
        const qId = conv.currentNodeId;
        abandonedByQuestion.set(qId, (abandonedByQuestion.get(qId) || 0) + 1);
      }
    }

    const dropOffPoints = Array.from(abandonedByQuestion.entries())
      .map(([questionId, count]) => ({
        questionId,
        label: questionCounts.get(questionId)?.label || questionId,
        abandonedCount: count,
        percentage: abandonedCount > 0 ? Math.round((count / abandonedCount) * 100) : 0,
      }))
      .sort((a, b) => b.abandonedCount - a.abandonedCount)
      .slice(0, 5); // Top 5 drop-off points

    // ==================== DAILY TRENDS ====================
    const dailyMap = new Map<string, { started: number; completed: number; abandoned: number }>();

    for (const conv of conversations) {
      const dateKey = new Date(conv.startedAt).toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { started: 0, completed: 0, abandoned: 0 });
      }

      const day = dailyMap.get(dateKey)!;
      day.started++;

      if (conv.status === 'completed') {
        day.completed++;
      } else if (conv.status === 'abandoned') {
        day.abandoned++;
      }
    }

    // Fill in missing days
    const daily: Array<{ date: string; started: number; completed: number; abandoned: number }> = [];
    const endDate = new Date();
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      daily.push({
        date: dateKey,
        ...(dailyMap.get(dateKey) || { started: 0, completed: 0, abandoned: 0 }),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const response: AnalyticsResponse = {
      overview,
      byFlow,
      funnel,
      dropOffPoints,
      trends: { daily },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching conversation analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
