// app/api/custom-questions/seed/route.ts
/**
 * Seed Default Questions API
 *
 * Seeds a client's config with default questions from the unified offer system.
 * This is the ONLY time hardcoded questions are used - as initial seed data.
 * After seeding, MongoDB is the single source of truth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import {
  generateAllDefaultQuestions,
  generateDefaultQuestionsForFlow,
  getDefaultQuestionsSummary,
} from '@/lib/mongodb/seedQuestions';
import type { TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * POST /api/custom-questions/seed
 * Seeds the authenticated user's config with default questions
 *
 * Body (optional):
 * - flow: 'buy' | 'sell' | 'browse' - seed only this flow (default: all)
 * - force: boolean - overwrite existing questions (default: false)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { flow, force = false } = body as { flow?: TimelineFlow; force?: boolean };

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found. Complete onboarding first.' },
        { status: 404 }
      );
    }

    const flows: TimelineFlow[] = flow ? [flow] : ['buy', 'sell']; // browse commented out for MVP
    const seeded: string[] = [];
    const skipped: string[] = [];

    for (const f of flows) {
      // Check if questions already exist
      const existingQuestions = config.customQuestions?.[f];
      if (existingQuestions && existingQuestions.length > 0 && !force) {
        skipped.push(f);
        continue;
      }

      // Generate and set default questions
      const defaultQuestions = generateDefaultQuestionsForFlow(f);
      await collection.updateOne(
        { userId: session.user.id },
        {
          $set: {
            [`customQuestions.${f}`]: defaultQuestions,
            updatedAt: new Date(),
          },
        }
      );
      seeded.push(f);
    }

    return NextResponse.json({
      success: true,
      message: seeded.length > 0
        ? `Seeded ${seeded.join(', ')} flow(s) with default questions`
        : 'No flows seeded (already have questions, use force=true to overwrite)',
      seeded,
      skipped,
      summary: getDefaultQuestionsSummary(),
    });
  } catch (error) {
    console.error('[custom-questions/seed] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/custom-questions/seed
 * Preview what would be seeded (shows default questions)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allQuestions = generateAllDefaultQuestions();
    const summary = getDefaultQuestionsSummary();

    return NextResponse.json({
      success: true,
      message: 'Preview of default questions that would be seeded',
      summary,
      questions: allQuestions,
    });
  } catch (error) {
    console.error('[custom-questions/seed] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
