import { COLLECTIONS, qdrant } from '@/lib/qdrant/client';
import type { ActionStepScenario, ApplicableWhen } from './types';

// Define your payload type (same as in query.ts)
interface ActionStepPayload {
  stepId: string;
  agentId: string;
  title: string;
  description: string;
  benefit?: string;
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;
  defaultPriority: number;
  defaultUrgency?: 'low' | 'medium' | 'high';
  defaultTimeline?: string;
  category: string;
  tags?: string[];
  applicableWhen: ApplicableWhen;
  prerequisiteStepIds?: string[];
  relatedStepIds?: string[];
}

export async function storeActionStep(
  step: Omit<ActionStepScenario, 'id'>
): Promise<string> {
  const stepId = `${step.category}-${Date.now()}`;

  await qdrant.upsert(COLLECTIONS.ACTION_STEPS, {
    wait: true,
    points: [{
      id: crypto.randomUUID(),
      vector: [0, 0, 0, 0],
      payload: {
        ...step,
        stepId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      },
    }],
  });

  return stepId;
}

export async function deleteActionStep(stepId: string): Promise<void> {
  const result = await qdrant.scroll(COLLECTIONS.ACTION_STEPS, {
    limit: 1,
    with_payload: true,
    filter: { must: [{ key: 'stepId', match: { value: stepId } }] },
  });

  if (result.points.length > 0) {
    await qdrant.delete(COLLECTIONS.ACTION_STEPS, {
      wait: true,
      points: [result.points[0].id as string],
    });
  }
}

export async function getAllActionSteps(agentId?: string): Promise<ActionStepScenario[]> {
  const filter = agentId ? { must: [{ key: 'agentId', match: { value: agentId } }] } : undefined;

  const result = await qdrant.scroll(COLLECTIONS.ACTION_STEPS, {
    limit: 500,
    with_payload: true,
    with_vector: false,
    filter,
  });

  return result.points.map((p) => {
    const payload = p.payload as unknown as ActionStepPayload;
    
    if (!payload) {
      throw new Error('Point missing payload');
    }
    
    return {
      id: payload.stepId,
      agentId: payload.agentId,
      title: payload.title,
      description: payload.description,
      benefit: payload.benefit,
      resourceLink: payload.resourceLink,
      resourceText: payload.resourceText,
      imageUrl: payload.imageUrl,
      defaultPriority: payload.defaultPriority,
      defaultUrgency: payload.defaultUrgency,
      defaultTimeline: payload.defaultTimeline,
      category: payload.category,
      tags: payload.tags,
      applicableWhen: payload.applicableWhen,
      prerequisiteStepIds: payload.prerequisiteStepIds,
      relatedStepIds: payload.relatedStepIds,
    };
  });
}