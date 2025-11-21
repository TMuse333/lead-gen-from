// lib/qdrant/query.ts
import type { ActionStepScenario, ActionStepMatch } from './types';
import { COLLECTIONS, qdrant } from '@/lib/qdrant/client';
import { calculateMatchScore } from '@/lib/qdrant/engines/rules';
import { normalizeToRealEstateSchema } from '@/lib/openai/normalizers/normalizeToRealEstateSchema';
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

// In-memory cache (you can move to Redis later)
const normalizationCache = new Map<string, { profile: UserProfile; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function queryActionSteps(
  agentId: string,
  flow: 'sell' | 'buy' | 'browse',
  userInput: Record<string, string>,
  sessionId?: string,
  maxSteps = 5
): Promise<ActionStepMatch[]> {


  
  try {
    console.log('Querying action steps → agent:', agentId, '| flow:', flow);

    // ——————————————————————————————
    // 1. Normalize → Canonical Profile (FIXED: Initialized to undefined)
    // ——————————————————————————————
    let canonicalProfile: UserProfile | undefined;

    const cacheKey = sessionId ? `${sessionId}:${flow}` : null;

    if (cacheKey && normalizationCache.has(cacheKey)) {
      const cached = normalizationCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Using cached canonical profile');
        canonicalProfile = cached.profile;
      } else {
        normalizationCache.delete(cacheKey);
      }
    }

    // Only run LLM if not cached (This check now passes TypeScript's definite assignment rule)
    if (!canonicalProfile) {
      console.log('Running LLM normalizer on user input...');
      const normalized = await normalizeToRealEstateSchema(userInput, flow);
      canonicalProfile = {
        intent: flow, // always fallback to flow
        ...normalized,
      };

      if (cacheKey) {
        normalizationCache.set(cacheKey, {
          profile: canonicalProfile,
          timestamp: Date.now(),
        });
      }
    }

    console.log('Final canonical profile:', canonicalProfile);

    // ——————————————————————————————
    // 2. Fetch action steps
    // ——————————————————————————————
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

    // ——————————————————————————————
    // 3. Score with your rule engine (now 100% reliable)
    // ——————————————————————————————
    const matches = steps
      .map((step) => ({
        step,
        matchScore: calculateMatchScore(step, canonicalProfile as any, flow), // safe cast — your engine expects Record<string, any>
        matchedRules: [],
      }))
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return (a.step.defaultPriority ?? 0) - (b.step.defaultPriority ?? 0);
      })
      .slice(0, maxSteps);

    console.log(`Matched ${matches.length} action steps`);
    matches.forEach((m, i) =>
      console.log(`   #${i + 1} "${m.step.title}" → score: ${m.matchScore.toFixed(2)}`)
    );

    return matches;
  } catch (error) {
    console.error('queryActionSteps failed:', error);
    throw error;
  }
}