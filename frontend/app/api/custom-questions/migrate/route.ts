// app/api/custom-questions/migrate/route.ts
// Migration endpoint to fix custom questions missing mappingKey
// This ensures all questions have mappingKey set for proper flow navigation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * POST /api/custom-questions/migrate
 * Fixes all custom questions by ensuring mappingKey is set
 * Uses question id as fallback if mappingKey is missing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const flows: TimelineFlow[] = ['buy', 'sell']; // browse commented out for MVP
    const updates: Record<string, any> = {};
    const stats = {
      flowsChecked: 0,
      questionsFixed: 0,
      flowsFixed: [] as string[],
    };

    for (const flow of flows) {
      const customQuestions = config.customQuestions?.[flow];
      if (!customQuestions || customQuestions.length === 0) {
        continue;
      }

      stats.flowsChecked++;
      let fixedCount = 0;

      // Fix questions missing mappingKey
      const fixedQuestions = customQuestions.map((q: CustomQuestion) => {
        if (!q.mappingKey) {
          fixedCount++;
          return {
            ...q,
            mappingKey: q.id, // Use id as mappingKey
          };
        }
        return q;
      });

      if (fixedCount > 0) {
        updates[`customQuestions.${flow}`] = fixedQuestions;
        stats.questionsFixed += fixedCount;
        stats.flowsFixed.push(flow);
      }
    }

    // If nothing to fix, return early
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All questions already have mappingKey set',
        stats,
      });
    }

    // Apply updates
    updates.updatedAt = new Date();
    await collection.updateOne(
      { userId: session.user.id },
      { $set: updates }
    );

    return NextResponse.json({
      success: true,
      message: `Fixed ${stats.questionsFixed} questions across ${stats.flowsFixed.length} flows`,
      stats,
    });
  } catch (error) {
    console.error('[custom-questions/migrate] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/custom-questions/migrate
 * Check status - shows which questions are missing mappingKey
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const flows: TimelineFlow[] = ['buy', 'sell']; // browse commented out for MVP
    const issues: Array<{ flow: string; questionId: string; question: string }> = [];

    for (const flow of flows) {
      const customQuestions = config.customQuestions?.[flow];
      if (!customQuestions) continue;

      for (const q of customQuestions as CustomQuestion[]) {
        if (!q.mappingKey) {
          issues.push({
            flow,
            questionId: q.id,
            question: q.question.substring(0, 50) + (q.question.length > 50 ? '...' : ''),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      needsMigration: issues.length > 0,
      issueCount: issues.length,
      issues,
    });
  } catch (error) {
    console.error('[custom-questions/migrate] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
