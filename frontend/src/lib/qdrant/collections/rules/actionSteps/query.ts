import type { ActionStepScenario, UserInput, ActionStepMatch, ApplicableWhen } from './types';

import { COLLECTIONS, qdrant } from '@/lib/qdrant/client';
import { calculateMatchScore } from '@/lib/qdrant/engines/rules';

// Define your payload type
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

export async function queryActionSteps(
  agentId: string,
  flow: 'sell' | 'buy' | 'browse',
  userInput: UserInput,
  maxSteps = 5
): Promise<ActionStepMatch[]> {
  try {
    console.log('Qdrant URL:', process.env.QDRANT_URL || 'NOT SET');

    const result = await qdrant.scroll(COLLECTIONS.ACTION_STEPS, {
      filter: {
        must: [{ key: 'agentId', match: { value: agentId } }],
      },
      with_payload: true,
      with_vector: false,
      limit: 200,
    });

    const steps: ActionStepScenario[] = result.points.map((p) => {
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

    const matches = steps
      .map((step) => ({
        step,
        matchScore: calculateMatchScore(step, userInput, flow),
        matchedRules: [],
      }))
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.step.defaultPriority - b.step.defaultPriority;
      })
      .slice(0, maxSteps);

    return matches;
  } catch (error) {
    console.error('Error querying action steps:', error);
    throw error;
  }
}