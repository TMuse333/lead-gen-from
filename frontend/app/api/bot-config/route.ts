// app/api/bot-config/route.ts
// API for managing bot response configurations (linking questions to phases and advice)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type {
  BotQuestionConfig,
  TimelineFlow,
  BotConfigResponse,
} from '@/types/timelineBuilder.types';
import type { ConversationQuestion } from '@/types/conversation.types';

export const runtime = 'nodejs';

/**
 * Merged question data - combines ConversationQuestion with BotQuestionConfig
 */
interface MergedQuestionConfig {
  questionId: string;
  questionText: string;
  order: number;
  mappingKey?: string;
  // Bot config fields
  linkedPhaseId?: string;
  linkedStepId?: string;
  personalAdvice?: string;
  linkedStoryId?: string;
}

/**
 * GET /api/bot-config?flow=buy
 * Returns bot configurations merged with conversation flow questions
 */
export async function GET(request: NextRequest) {
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
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Get conversation flow questions
    const conversationFlow = config.conversationFlows?.[flow];
    const questions: ConversationQuestion[] = conversationFlow?.questions || [];

    // Get bot configurations for this flow
    const botConfigs: BotQuestionConfig[] = config.botResponseConfig?.[flow] || [];
    const configMap = new Map(botConfigs.map(c => [c.questionId, c]));

    // Merge questions with bot configs
    const mergedConfigs: MergedQuestionConfig[] = questions.map(q => {
      const botConfig = configMap.get(q.id);
      return {
        questionId: q.id,
        questionText: q.question,
        order: q.order,
        mappingKey: q.mappingKey,
        linkedPhaseId: botConfig?.linkedPhaseId,
        linkedStepId: botConfig?.linkedStepId,
        personalAdvice: botConfig?.personalAdvice,
        linkedStoryId: botConfig?.linkedStoryId,
      };
    });

    // Sort by order
    mergedConfigs.sort((a, b) => a.order - b.order);

    const isConfigured = botConfigs.length > 0;

    return NextResponse.json({
      success: true,
      flow,
      questions: mergedConfigs,
      isConfigured,
    });
  } catch (error) {
    console.error('[bot-config] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bot-config
 * Updates bot configurations for a specific flow
 * Body: { flow: TimelineFlow, configs: BotQuestionConfig[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flow, configs } = body as {
      flow: TimelineFlow;
      configs: BotQuestionConfig[];
    };

    // Validate flow
    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell, browse) is required' },
        { status: 400 }
      );
    }

    // Validate configs array
    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'configs array is required' },
        { status: 400 }
      );
    }

    // Validate each config has a questionId
    for (const config of configs) {
      if (!config.questionId) {
        return NextResponse.json(
          { error: 'Each config must have a questionId' },
          { status: 400 }
        );
      }
    }

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`botResponseConfig.${flow}`]: configs,
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
      message: `Bot configurations for ${flow} flow saved successfully`,
    });
  } catch (error) {
    console.error('[bot-config] PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bot-config
 * Updates a single question's bot configuration
 * Body: { flow: TimelineFlow, questionId: string, config: Partial<BotQuestionConfig> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flow, questionId, config } = body as {
      flow: TimelineFlow;
      questionId: string;
      config: Partial<BotQuestionConfig>;
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

    const collection = await getClientConfigsCollection();
    const clientConfig = await collection.findOne({ userId: session.user.id });

    if (!clientConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Get existing configs or initialize empty array
    const existingConfigs: BotQuestionConfig[] = clientConfig.botResponseConfig?.[flow] || [];

    // Find existing config for this question
    const existingIndex = existingConfigs.findIndex(c => c.questionId === questionId);

    let updatedConfigs: BotQuestionConfig[];
    if (existingIndex >= 0) {
      // Update existing
      updatedConfigs = [...existingConfigs];
      updatedConfigs[existingIndex] = {
        ...updatedConfigs[existingIndex],
        ...config,
        questionId, // Ensure questionId doesn't change
      };
    } else {
      // Add new config
      updatedConfigs = [
        ...existingConfigs,
        {
          questionId,
          ...config,
        },
      ];
    }

    const result = await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`botResponseConfig.${flow}`]: updatedConfigs,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Bot configuration for question ${questionId} updated successfully`,
    });
  } catch (error) {
    console.error('[bot-config] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bot-config?flow=buy
 * Clears all bot configurations for a flow
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
        $unset: { [`botResponseConfig.${flow}`]: '' },
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
      message: `Bot configurations for ${flow} flow cleared`,
    });
  } catch (error) {
    console.error('[bot-config] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
