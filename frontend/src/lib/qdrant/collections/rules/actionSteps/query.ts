// lib/qdrant/query.ts
import type { ActionStepScenario, ActionStepMatch } from './types';
import { COLLECTIONS, qdrant } from '@/lib/qdrant/client';
import { calculateMatchScore } from '@/lib/qdrant/engines/rules';
import { criticalError } from '@/lib/logger';
import { getUserProfileState } from '@/stores/profileStore/userProfile.store';
import type { UserProfile } from '@/types';

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
  applicableWhen: any;
  prerequisiteStepIds?: string[];
  relatedStepIds?: string[];
}

export async function queryActionSteps(
  agentId: string,
  flow: 'sell' | 'buy' | 'browse',
  sessionId?: string,
  maxSteps = 5
): Promise<ActionStepMatch[]> {
  try {
    // Use the canonical profile from Zustand (normalized by chat-smart API)
    const { userProfile } = getUserProfileState();

    const canonicalProfile = userProfile || { intent: flow };

    const result = await qdrant.scroll(COLLECTIONS.ACTION_STEPS, {
      filter: { must: [{ key: 'agentId', match: { value: agentId } }] },
      with_payload: true,
      with_vector: false,
      limit: 200,
    });

    const steps: ActionStepScenario[] = result.points
      .map((p) => {
        const payload = p.payload as unknown as ActionStepPayload;
        if (!payload) return null;
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
      })
      .filter(Boolean) as ActionStepScenario[];

    const matches = steps
      .map((step) => ({
        step,
        matchScore: calculateMatchScore(step, canonicalProfile as any, flow),
        matchedRules: [],
      }))
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return (a.step.defaultPriority ?? 0) - (b.step.defaultPriority ?? 0);
      })
      .slice(0, maxSteps);

    return matches;
  } catch (error) {
    criticalError('QdrantActionSteps', error);
    throw error;
  }
}