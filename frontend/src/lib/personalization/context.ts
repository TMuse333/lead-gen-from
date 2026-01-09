// lib/personalization/context.ts

import { ComponentSchema, KnowledgeSet } from '@/types/schemas';
import { generateUserEmbedding } from '../openai/userEmbedding';
import { queryRelevantAdvice, queryAdviceForLocation, type QueryAdviceOptions } from '../qdrant';
import { getAllActionSteps } from '../qdrant/collections/rules/actionSteps/admin';
import { calculateMatchScore } from '../qdrant/engines/rules';
import { PersonalizedAdviceResult, QdrantRetrievalMetadata } from '@/types/qdrant.types';
import type { OfferType, Intent, KnowledgeRequirements, PhaseKnowledgeRequirement } from '@/lib/offers/unified';
import type { AgentAdviceScenario } from '@/types';

/**
 * Options for personalized advice retrieval
 */
export interface PersonalizationOptions {
  /** Which offer type is being generated */
  offerType?: OfferType;
  /** Specific location within the offer (e.g., phase ID for timeline) */
  location?: string;
  /** Maximum advice items to return */
  limit?: number;
}

export async function getPersonalizedAdvice(
  agentId: string,
  flow: string,
  userInput: Record<string, string>,
  knowledgeSets: KnowledgeSet[] = [],
  options?: PersonalizationOptions
): Promise<PersonalizedAdviceResult> {
  const allAdvice: string[] = [];
  const metadata: QdrantRetrievalMetadata[] = [];

  if (knowledgeSets.length === 0) {
    return { advice: [], metadata: [] };
  }

  for (const knowledgeSet of knowledgeSets) {
    if (knowledgeSet.type === 'vector') {
      try {
        // Generate embedding
        const embedding = await generateUserEmbedding(flow, userInput);

        // Build query options with offer context
        const queryOptions: QueryAdviceOptions = {
          limit: options?.limit ?? 5,
          collectionName: knowledgeSet.name,
          offerType: options?.offerType,
          location: options?.location,
        };

        // Query Qdrant with offer-aware filtering
        const adviceItems = await queryRelevantAdvice(
          agentId,
          embedding,
          flow,
          userInput,
          queryOptions
        );

        allAdvice.push(...adviceItems.map(item => `${item.title}: ${item.advice}`));

        metadata.push({
          collection: knowledgeSet.name,
          type: 'vector',
          count: adviceItems.length,
          items: adviceItems.map(item => ({
            id: item.id,
            title: item.title,
            advice: item.advice,
            tags: item.tags,
            placements: item.applicableWhen?.placements,
          }))
        });
      } catch {
        // Vector search failed - continue with other knowledge sets
      }

    } else if (knowledgeSet.type === 'rule') {
      try {
        // Get all action steps
        const actionSteps = await getAllActionSteps(agentId);

        if (actionSteps.length > 0) {
          const matches = actionSteps
            .map(step => {
              const score = calculateMatchScore(step, userInput, flow as "buy" | "sell" | 'browse');
              return { step, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, options?.limit ?? 5);

          allAdvice.push(...matches.map(({ step }) => `${step.title}: ${step.description}`));

          metadata.push({
            collection: knowledgeSet.name,
            type: 'rule',
            count: matches.length,
            items: matches.map(({ step, score }) => ({
              id: step.id,
              title: step.title,
              description: step.description,
              score,
              matchedRules: step.applicableWhen,
            }))
          });
        }
      } catch {
        // Rule-based search failed - continue with other knowledge sets
      }
    }
  }

  return { advice: allAdvice, metadata };
}

/**
 * Get advice specifically for a location within an offer (e.g., timeline phase)
 * This is useful for phase-by-phase personalization
 */
export async function getAdviceForLocation(
  agentId: string,
  flow: string,
  userInput: Record<string, string>,
  offerType: OfferType,
  location: string,
  collectionName: string,
  limit: number = 3
): Promise<AgentAdviceScenario[]> {
  try {
    const embedding = await generateUserEmbedding(flow, userInput);

    return await queryAdviceForLocation(
      agentId,
      embedding,
      flow,
      userInput,
      offerType,
      location,
      { limit, collectionName }
    );
  } catch {
    return [];
  }
}

/**
 * Get advice grouped by location for an entire offer
 * Useful for timeline generation where we want advice per phase
 */
export async function getAdviceByLocations(
  agentId: string,
  flow: string,
  userInput: Record<string, string>,
  offerType: OfferType,
  locations: string[],
  collectionName: string,
  limitPerLocation: number = 2
): Promise<Record<string, AgentAdviceScenario[]>> {
  const adviceByLocation: Record<string, AgentAdviceScenario[]> = {};

  // Query in parallel for all locations
  const results = await Promise.all(
    locations.map(async (location) => ({
      location,
      advice: await getAdviceForLocation(
        agentId,
        flow,
        userInput,
        offerType,
        location,
        collectionName,
        limitPerLocation
      ),
    }))
  );

  for (const { location, advice } of results) {
    adviceByLocation[location] = advice;
  }

  return adviceByLocation;
}

/**
 * Result of phase-specific knowledge retrieval
 */
export interface PhaseAdviceResult {
  /** Advice items grouped by phase ID */
  byPhase: Map<string, AgentAdviceScenario[]>;
  /** Total advice items retrieved */
  totalItems: number;
  /** Phases that have no advice (may need agent to upload) */
  missingPhases: string[];
  /** Metadata for debugging/analytics */
  metadata: {
    queriedPhases: number;
    successfulQueries: number;
    avgItemsPerPhase: number;
  };
}

/**
 * Get phase-specific advice using the offer's knowledge requirements
 *
 * This is the strategic knowledge retrieval function that:
 * 1. Uses offer-defined requirements to know what each phase needs
 * 2. Queries per-phase with appropriate limits based on priority
 * 3. Returns organized advice for prompt injection
 *
 * @param agentId - The agent's ID for Qdrant queries
 * @param intent - The user's intent (buy/sell/browse)
 * @param userInput - Collected user inputs
 * @param knowledgeRequirements - From the offer's knowledgeRequirements field
 * @param offerType - The offer type for filtering
 * @param collectionName - Qdrant collection name
 */
export async function getPhaseSpecificAdvice(
  agentId: string,
  intent: Intent,
  userInput: Record<string, string>,
  knowledgeRequirements: KnowledgeRequirements,
  offerType: OfferType,
  collectionName: string = 'agent_advice'
): Promise<PhaseAdviceResult> {
  const phaseRequirements = knowledgeRequirements[intent];

  if (!phaseRequirements) {
    console.warn(`[PhaseAdvice] No knowledge requirements for intent: ${intent}`);
    return {
      byPhase: new Map(),
      totalItems: 0,
      missingPhases: [],
      metadata: { queriedPhases: 0, successfulQueries: 0, avgItemsPerPhase: 0 },
    };
  }

  const byPhase = new Map<string, AgentAdviceScenario[]>();
  const missingPhases: string[] = [];
  let totalItems = 0;
  let successfulQueries = 0;

  // Generate embedding once for all queries
  let embedding: number[];
  try {
    embedding = await generateUserEmbedding(intent, userInput);
  } catch {
    return {
      byPhase: new Map(),
      totalItems: 0,
      missingPhases: Object.keys(phaseRequirements),
      metadata: { queriedPhases: 0, successfulQueries: 0, avgItemsPerPhase: 0 },
    };
  }

  // Query each phase in parallel
  const phaseEntries = Object.entries(phaseRequirements);
  const queryPromises = phaseEntries.map(async ([phaseId, requirement]) => {
    const limit = getLimitForPriority(requirement.priority, requirement.minItems);

    try {
      const advice = await queryAdviceForLocation(
        agentId,
        embedding,
        intent,
        userInput,
        offerType,
        phaseId,
        {
          limit,
          collectionName,
        }
      );

      return { phaseId, advice, success: true };
    } catch {
      return { phaseId, advice: [], success: false };
    }
  });

  const results = await Promise.all(queryPromises);

  // Process results
  for (const { phaseId, advice, success } of results) {
    byPhase.set(phaseId, advice);
    totalItems += advice.length;

    if (success) {
      successfulQueries++;
    }

    // Track phases with insufficient advice
    const requirement = phaseRequirements[phaseId];
    if (advice.length < (requirement?.minItems ?? 1)) {
      missingPhases.push(phaseId);
    }
  }

  return {
    byPhase,
    totalItems,
    missingPhases,
    metadata: {
      queriedPhases: phaseEntries.length,
      successfulQueries,
      avgItemsPerPhase: phaseEntries.length > 0 ? totalItems / phaseEntries.length : 0,
    },
  };
}

/**
 * Get query limit based on priority level
 */
function getLimitForPriority(
  priority: PhaseKnowledgeRequirement['priority'],
  minItems?: number
): number {
  // Use minItems if specified, otherwise base on priority
  if (minItems && minItems > 0) {
    return minItems;
  }

  switch (priority) {
    case 'critical':
      return 3;
    case 'high':
      return 2;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 2;
  }
}

/**
 * Format phase-specific advice for prompt injection
 *
 * This creates a formatted string that can be inserted into the LLM prompt,
 * organized by phase with clear labeling.
 */
export function formatPhaseAdviceForPrompt(
  phaseAdvice: PhaseAdviceResult,
  phaseNames?: Record<string, string> // Optional mapping of phaseId -> display name
): string {
  if (phaseAdvice.totalItems === 0) {
    return 'No phase-specific knowledge available.';
  }

  const sections: string[] = [];

  for (const [phaseId, advice] of phaseAdvice.byPhase) {
    if (advice.length === 0) continue;

    const phaseName = phaseNames?.[phaseId] || phaseId;
    const adviceText = advice
      .map((item, i) => `  ${i + 1}. [${item.tags.join(', ')}] ${item.advice}`)
      .join('\n');

    sections.push(`**${phaseName}:**\n${adviceText}`);
  }

  return sections.join('\n\n');
}

export async function getComponentAdvice(
  agentId: string,
  schema: ComponentSchema,
  flow: string,
  userInput: Record<string, string>
): Promise<string[]> {
  if (!schema.personalization?.retrieveFrom) {
    return [];
  }

  const { advice } = await getPersonalizedAdvice(
    agentId,
    flow,
    userInput,
    schema.personalization.retrieveFrom
  );

  return advice;
}

export function formatAdviceForPrompt(advice: string[]): string {
  if (advice.length === 0) {
    return 'None provided';
  }

  return advice.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
