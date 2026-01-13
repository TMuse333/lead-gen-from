// app/api/custom-questions/route.ts
// API for managing custom chatbot question configurations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type {
  CustomQuestion,
  TimelineFlow,
} from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * IMPORTANT: No fallbacks to hardcoded questions!
 * MongoDB is the single source of truth.
 *
 * If questions don't exist, use:
 * - POST /api/custom-questions/seed to seed defaults
 * - Or complete onboarding which auto-seeds questions
 */

/**
 * Validate custom questions
 */
function validateQuestions(questions: CustomQuestion[]): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  const { MIN_QUESTIONS, MAX_QUESTIONS, MIN_BUTTONS, MAX_BUTTONS } = {
    MIN_QUESTIONS: 3,
    MAX_QUESTIONS: 15,
    MIN_BUTTONS: 2,
    MAX_BUTTONS: 6,
  };

  // Check question count
  if (questions.length < MIN_QUESTIONS) {
    errors.push({
      field: 'questions',
      message: `Minimum ${MIN_QUESTIONS} questions required`,
    });
  }
  if (questions.length > MAX_QUESTIONS) {
    errors.push({
      field: 'questions',
      message: `Maximum ${MAX_QUESTIONS} questions allowed`,
    });
  }

  // Check each question
  questions.forEach((q, index) => {
    if (!q.question.trim()) {
      errors.push({
        field: `questions[${index}].question`,
        message: 'Question text is required',
      });
    }

    // Validate buttons for button-type questions
    if (q.inputType === 'buttons') {
      if (!q.buttons || q.buttons.length < MIN_BUTTONS) {
        errors.push({
          field: `questions[${index}].buttons`,
          message: `At least ${MIN_BUTTONS} button options required`,
        });
      }
      if (q.buttons && q.buttons.length > MAX_BUTTONS) {
        errors.push({
          field: `questions[${index}].buttons`,
          message: `Maximum ${MAX_BUTTONS} button options allowed`,
        });
      }

      // Validate each button
      q.buttons?.forEach((btn, btnIndex) => {
        if (!btn.label.trim()) {
          errors.push({
            field: `questions[${index}].buttons[${btnIndex}].label`,
            message: 'Button label is required',
          });
        }
      });
    }
  });

  return errors;
}

/**
 * GET /api/custom-questions?flow=buy&clientId=businessName
 * Returns questions for a flow from MongoDB (NO FALLBACKS)
 *
 * Supports two access modes:
 * 1. Authenticated user (dashboard) - uses session
 * 2. Public bot access - uses clientId parameter
 *
 * If questions don't exist, returns error with instructions to seed.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') as TimelineFlow | null;
    const clientId = searchParams.get('clientId');

    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow parameter (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    let config: any = null;

    // Priority 1: clientId for public bot access
    if (clientId) {
      config = await collection.findOne({ businessName: clientId, isActive: true });
    } else {
      // Priority 2: Authenticated user's config (dashboard)
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      config = await collection.findOne({ userId: session.user.id });
    }

    if (!config) {
      return NextResponse.json(
        {
          error: 'Configuration not found',
          hint: 'Complete onboarding to create your configuration',
        },
        { status: 404 }
      );
    }

    // Get questions from MongoDB - NO FALLBACK
    const questions = config.customQuestions?.[flow] || [];

    console.log(`[custom-questions API] 📋 Flow: ${flow}, Client: ${config.businessName}`);
    console.log(`[custom-questions API] Questions found: ${questions.length}`);
    if (questions.length > 0) {
      questions.forEach((q: any, i: number) => {
        console.log(`  ${i + 1}. ${q.id} | type: ${q.inputType} | buttons: ${q.buttons?.length || 0} | mappingKey: ${q.mappingKey || 'MISSING'} | linkedPhaseId: ${q.linkedPhaseId || 'NONE'}`);
      });
    } else {
      console.log(`[custom-questions API] ⚠️ customQuestions.${flow} is empty or missing`);
      console.log(`[custom-questions API] Available flows in config:`, Object.keys(config.customQuestions || {}));
    }

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No questions configured for ${flow} flow`,
        hint: 'Call POST /api/custom-questions/seed to populate with defaults',
        flow,
        questions: [],
        needsSeeding: true,
      });
    }

    return NextResponse.json({
      success: true,
      flow,
      questions,
      questionCount: questions.length,
    });
  } catch (error) {
    console.error('[custom-questions] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/custom-questions
 * Replaces all questions for a specific flow
 * Body: { flow: TimelineFlow, questions: CustomQuestion[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flow, questions } = body as {
      flow: TimelineFlow;
      questions: CustomQuestion[];
    };

    // Validate flow
    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'questions array is required' },
        { status: 400 }
      );
    }

    // Validate question content
    const validationErrors = validateQuestions(questions);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      );
    }

    // Ensure questions have correct order values and mappingKey is set
    const orderedQuestions = questions.map((q, index) => ({
      ...q,
      order: index + 1,
      // Auto-populate mappingKey from id if not provided (critical for flow navigation)
      mappingKey: q.mappingKey || q.id,
    }));

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`customQuestions.${flow}`]: orderedQuestions,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Custom questions for ${flow} flow saved successfully`,
      questions: orderedQuestions,
    });
  } catch (error) {
    console.error('[custom-questions] PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/custom-questions
 * Updates a single question within a flow
 * Body: { flow: TimelineFlow, questionId: string, updates: Partial<CustomQuestion> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flow, questionId, updates } = body as {
      flow: TimelineFlow;
      questionId: string;
      updates: Partial<CustomQuestion>;
    };

    // Validate flow
    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Get existing questions - NO FALLBACK
    const currentQuestions = config.customQuestions?.[flow];
    if (!currentQuestions || currentQuestions.length === 0) {
      return NextResponse.json(
        {
          error: `No questions configured for ${flow} flow`,
          hint: 'Call POST /api/custom-questions/seed to populate with defaults first',
        },
        { status: 400 }
      );
    }

    // Find and update the question
    const questionIndex = currentQuestions.findIndex((q: CustomQuestion) => q.id === questionId);
    if (questionIndex === -1) {
      return NextResponse.json(
        { error: `Question with id ${questionId} not found` },
        { status: 404 }
      );
    }

    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      ...updates,
      id: questionId, // Ensure ID doesn't change
    };

    // Validate after update
    const validationErrors = validateQuestions(updatedQuestions);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`customQuestions.${flow}`]: updatedQuestions,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Question ${questionId} updated successfully`,
      question: updatedQuestions[questionIndex],
    });
  } catch (error) {
    console.error('[custom-questions] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/custom-questions?flow=buy
 * Removes questions for a flow (must re-seed to get defaults)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') as TimelineFlow | null;

    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow parameter (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $unset: { [`customQuestions.${flow}`]: '' },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Questions for ${flow} flow removed`,
      hint: 'Call POST /api/custom-questions/seed to repopulate with defaults',
    });
  } catch (error) {
    console.error('[custom-questions] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
