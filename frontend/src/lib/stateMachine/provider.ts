// src/lib/stateMachine/provider.ts
/**
 * State Machine Provider — Fetch, cache, and provide StateMachineConfig
 *
 * Mirrors questionProvider.ts pattern:
 * - fetchStateMachineConfig(flow, clientId?) — fetches from GET /api/state-machine
 * - Falls back to questionsToStateMachine() converter when no native config exists
 * - Cache with clientId invalidation
 */

import type { Intent } from '@/lib/offers/unified';
import type { StateMachineConfig } from '@/types/stateMachine.types';
import type { TimelineFlow } from '@/types/timelineBuilder.types';
import { fetchQuestionsForFlow } from '@/lib/chat/questionProvider';
import { questionsToStateMachine } from './questionsToStateMachine';

// Cache for fetched configs per intent
const configCache: Map<string, StateMachineConfig> = new Map();
let cacheClientId: string | null = null;

/**
 * Fetch or build a StateMachineConfig for a given flow/intent.
 *
 * 1. Try to fetch a native config from GET /api/state-machine
 * 2. If none exists, fetch CustomQuestion[] and convert via questionsToStateMachine()
 *
 * Results are cached per flow; cache is invalidated when clientId changes.
 */
export async function fetchStateMachineConfig(
  flow: Intent,
  clientId?: string
): Promise<StateMachineConfig | null> {
  console.log(`[StateMachineProvider] Fetching config for flow: ${flow}, clientId: ${clientId || 'none'}`);

  // Invalidate cache if clientId changed
  if (clientId !== cacheClientId) {
    console.log(`[StateMachineProvider] Cache invalidated (clientId changed: ${cacheClientId} -> ${clientId})`);
    configCache.clear();
    cacheClientId = clientId || null;
  }

  // Return cached if available
  if (configCache.has(flow)) {
    console.log(`[StateMachineProvider] Returning cached config for ${flow}`);
    return configCache.get(flow)!;
  }

  // Step 1: Try native state machine config from API
  try {
    const params = new URLSearchParams({ flow });
    if (clientId) params.set('clientId', clientId);
    const url = `/api/state-machine?${params.toString()}`;

    console.log(`[StateMachineProvider] Trying native config from: ${url}`);
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data.config) {
        console.log(`[StateMachineProvider] Native config found for ${flow}`);
        const config = data.config as StateMachineConfig;
        configCache.set(flow, config);
        return config;
      }
    }
  } catch (error) {
    console.warn(`[StateMachineProvider] Failed to fetch native config:`, error);
  }

  // Step 2: Fallback — fetch questions and convert
  console.log(`[StateMachineProvider] No native config, falling back to question converter for ${flow}`);
  try {
    const questions = await fetchQuestionsForFlow(flow as TimelineFlow, clientId);
    if (questions.length === 0) {
      console.warn(`[StateMachineProvider] No questions found for ${flow}`);
      return null;
    }

    const config = questionsToStateMachine(questions, flow);
    console.log(`[StateMachineProvider] Converted ${questions.length} questions to state machine config`);
    configCache.set(flow, config);
    return config;
  } catch (error) {
    console.error(`[StateMachineProvider] Failed to build config from questions:`, error);
    return null;
  }
}

/**
 * Clear the state machine config cache
 */
export function clearStateMachineCache(): void {
  configCache.clear();
  cacheClientId = null;
}

/**
 * Get cached config (synchronous, returns null if not cached)
 */
export function getCachedConfig(flow: Intent): StateMachineConfig | null {
  return configCache.get(flow) ?? null;
}
