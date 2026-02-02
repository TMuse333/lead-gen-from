// app/api/custom-phases/route.ts
// API for managing custom timeline phase configurations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getFlowTemplate } from '@/lib/offers/definitions/timeline/timeline-templates';
import type {
  CustomPhaseConfig,
  CustomActionableStep,
  TimelineFlow,
  CustomPhasesResponse,
  PHASE_CONSTRAINTS,
} from '@/types/timelineBuilder.types';
import { validatePhases } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

/**
 * Convert template phases to CustomPhaseConfig format
 */
function templateToCustomPhases(flow: TimelineFlow): CustomPhaseConfig[] {
  const template = getFlowTemplate(flow);

  return template.phases.map((phase, phaseIndex) => ({
    id: phase.id,
    name: phase.name,
    timeline: phase.baseTimeline,
    description: phase.description,
    order: phase.order,
    isOptional: phase.isOptional || false,
    actionableSteps: phase.suggestedActionItems.map((item, stepIndex): CustomActionableStep => ({
      id: `${phase.id}-step-${stepIndex + 1}`,
      title: item,
      priority: stepIndex === 0 ? 'high' : stepIndex < 3 ? 'medium' : 'low',
      order: stepIndex + 1,
    })),
  }));
}

/**
 * GET /api/custom-phases?flow=buy
 * Returns custom phases for a flow, or defaults if none configured
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support admin impersonation
    const userId = await getEffectiveUserId() || session.user.id;

    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') as TimelineFlow | null;

    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow parameter (buy, sell) is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if user has custom phases for this flow
    const customPhases = config.customPhases?.[flow];
    const isCustom = !!customPhases && customPhases.length > 0;

    const response: CustomPhasesResponse = {
      success: true,
      flow,
      phases: isCustom ? customPhases : templateToCustomPhases(flow),
      isCustom,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[custom-phases] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/custom-phases
 * Replaces all phases for a specific flow
 * Body: { flow: TimelineFlow, phases: CustomPhaseConfig[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support admin impersonation
    const userId = await getEffectiveUserId() || session.user.id;

    const body = await request.json();
    const { flow, phases } = body as {
      flow: TimelineFlow;
      phases: CustomPhaseConfig[];
    };

    // Validate flow
    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell) is required' },
        { status: 400 }
      );
    }

    // Validate phases array
    if (!phases || !Array.isArray(phases)) {
      return NextResponse.json(
        { error: 'phases array is required' },
        { status: 400 }
      );
    }

    // Validate phase content
    const validationErrors = validatePhases(phases);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      );
    }

    // Ensure phases have correct order values
    const orderedPhases = phases.map((phase, index) => ({
      ...phase,
      order: index + 1,
      actionableSteps: phase.actionableSteps.map((step, stepIndex) => ({
        ...step,
        order: stepIndex + 1,
      })),
    }));

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId },
      {
        $set: {
          [`customPhases.${flow}`]: orderedPhases,
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
      message: `Custom phases for ${flow} flow saved successfully`,
      phases: orderedPhases,
    });
  } catch (error) {
    console.error('[custom-phases] PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/custom-phases
 * Updates a single phase within a flow
 * Body: { flow: TimelineFlow, phaseId: string, updates: Partial<CustomPhaseConfig> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support admin impersonation
    const userId = await getEffectiveUserId() || session.user.id;

    const body = await request.json();
    const { flow, phaseId, updates } = body as {
      flow: TimelineFlow;
      phaseId: string;
      updates: Partial<CustomPhaseConfig>;
    };

    // Validate flow
    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow (buy, sell) is required' },
        { status: 400 }
      );
    }

    if (!phaseId) {
      return NextResponse.json(
        { error: 'phaseId is required' },
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
    const config = await collection.findOne({ userId });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Get existing phases (or defaults)
    let currentPhases = config.customPhases?.[flow];
    if (!currentPhases || currentPhases.length === 0) {
      currentPhases = templateToCustomPhases(flow);
    }

    // Find and update the phase
    const phaseIndex = currentPhases.findIndex((p) => p.id === phaseId);
    if (phaseIndex === -1) {
      return NextResponse.json(
        { error: `Phase with id ${phaseId} not found` },
        { status: 404 }
      );
    }

    const updatedPhases = [...currentPhases];
    updatedPhases[phaseIndex] = {
      ...updatedPhases[phaseIndex],
      ...updates,
      id: phaseId, // Ensure ID doesn't change
    };

    // Validate after update
    const validationErrors = validatePhases(updatedPhases);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { userId },
      {
        $set: {
          [`customPhases.${flow}`]: updatedPhases,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Phase ${phaseId} updated successfully`,
      phase: updatedPhases[phaseIndex],
    });
  } catch (error) {
    console.error('[custom-phases] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/custom-phases?flow=buy
 * Resets a flow to default phases (removes custom configuration)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support admin impersonation
    const userId = await getEffectiveUserId() || session.user.id;

    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') as TimelineFlow | null;

    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Valid flow parameter (buy, sell) is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId },
      {
        $unset: { [`customPhases.${flow}`]: '' },
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
      message: `Custom phases for ${flow} flow reset to defaults`,
      phases: templateToCustomPhases(flow),
    });
  } catch (error) {
    console.error('[custom-phases] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
