// lib/qdrant/actionSteps.ts

import { QdrantClient } from '@qdrant/js-client-rest';
import { ActionStepScenario } from '@/types';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL! ,
  apiKey: process.env.QDRANT_API_KEY!,
});

const ACTION_STEPS_COLLECTION = 'agent-action-steps';

// ==================== TYPE DEFINITIONS ====================

type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

interface ConditionRule {
  field: string;
  operator: MatchOperator;
  value: string | string[];
  weight?: number;
}

interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

interface UserInput {
  [key: string]: string;
}

interface ActionStepMatch {
  step: ActionStepScenario;
  matchScore: number;
  matchedRules: string[];
}

// ==================== RULE EVALUATION (same logic as AgentAdvice) ====================

/**
 * Evaluate a single condition rule against user input
 */
function evaluateRule(rule: ConditionRule, userInput: UserInput): { matched: boolean; weight: number } {
  const userValue = userInput[rule.field];
  const weight = rule.weight || 1;

  if (!userValue) {
    return { matched: false, weight: 0 };
  }

  switch (rule.operator) {
    case 'equals':
      return { matched: userValue === rule.value, weight };

    case 'includes':
      if (Array.isArray(rule.value)) {
        return { matched: rule.value.includes(userValue), weight };
      }
      return { matched: userValue.includes(rule.value as string), weight };

    case 'not_equals':
      return { matched: userValue !== rule.value, weight };

    case 'greater_than':
      const gtValue = parseFloat(userValue);
      const gtTarget = parseFloat(rule.value as string);
      return { matched: !isNaN(gtValue) && !isNaN(gtTarget) && gtValue > gtTarget, weight };

    case 'less_than':
      const ltValue = parseFloat(userValue);
      const ltTarget = parseFloat(rule.value as string);
      return { matched: !isNaN(ltValue) && !isNaN(ltTarget) && ltValue < ltTarget, weight };

    case 'between':
      if (Array.isArray(rule.value) && rule.value.length === 2) {
        const value = parseFloat(userValue);
        const min = parseFloat(rule.value[0]);
        const max = parseFloat(rule.value[1]);
        return { matched: !isNaN(value) && value >= min && value <= max, weight };
      }
      return { matched: false, weight: 0 };

    default:
      return { matched: false, weight: 0 };
  }
}

/**
 * Evaluate a rule group (supports nested groups)
 */
function evaluateRuleGroup(group: RuleGroup, userInput: UserInput): { matched: boolean; totalWeight: number; matchedWeight: number } {
  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const rule of group.rules) {
    if ('logic' in rule) {
      // Nested rule group
      const nestedResult = evaluateRuleGroup(rule as RuleGroup, userInput);
      totalWeight += nestedResult.totalWeight;
      matchedWeight += nestedResult.matchedWeight;
      if (nestedResult.matched) matchedCount++;
    } else {
      // Single condition rule
      const result = evaluateRule(rule as ConditionRule, userInput);
      const weight = result.weight;
      totalWeight += weight;
      if (result.matched) {
        matchedCount++;
        matchedWeight += weight;
      }
    }
  }

  const allMatched = matchedCount === group.rules.length;
  const anyMatched = matchedCount > 0;

  const matched = group.logic === 'AND' ? allMatched : anyMatched;

  return { matched, totalWeight, matchedWeight };
}

/**
 * Calculate match score for an action step
 */
function calculateMatchScore(step: ActionStepScenario, userInput: UserInput, flow: string): number {
  const { applicableWhen } = step;

  // Check flow match
  if (applicableWhen.flow && !applicableWhen.flow.includes(flow as any)) {
    return 0;
  }

  // If no rule groups, flow match is enough
  if (!applicableWhen.ruleGroups || applicableWhen.ruleGroups.length === 0) {
    return 1.0; // Perfect match based on flow alone
  }

  // Evaluate all rule groups
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const ruleGroup of applicableWhen.ruleGroups) {
    const result = evaluateRuleGroup(ruleGroup, userInput);
    totalWeight += result.totalWeight;
    matchedWeight += result.matchedWeight;
  }

  // Calculate score as percentage of matched weight
  const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

  // Apply minimum match score threshold
  const minScore = applicableWhen.minMatchScore || 0;
  return score >= minScore ? score : 0;
}

// ==================== QUERY FUNCTIONS ====================

/**
 * Query relevant action steps for a user
 * This is the main function you'll call from your API
 */
export async function queryActionSteps(
  agentId: string,
  flow: 'sell' | 'buy' | 'browse',
  userInput: UserInput,
  maxSteps: number = 5
): Promise<ActionStepMatch[]> {
  try {

    // console.log('qdrant url',ACTION_STEPS_COLLECTION,)
    console.log('qdrant url',process.env.QDRANT_URL! || 'problem here')
    // Step 1: Get ALL steps for this agent and flow from Qdrant
    // (We can't do rule matching in Qdrant, so we fetch all and filter in code)
    const scrollResult = await qdrant.scroll(ACTION_STEPS_COLLECTION, {
      limit: 100,
      with_payload: true,
      with_vector: false,
      // filter: {
      //   must: [
      //     {
      //       key: 'agentId',
      //       match: { value: agentId },
      //     },
      //   ],
      // },
    });

    
    

    // Step 2: Convert to ActionStepScenario objects
    const allSteps = scrollResult.points.map(point => {
      const payload = point.payload as any;
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
      } as ActionStepScenario;
    });

    // Step 3: Filter by flow first
    const flowSteps = allSteps.filter(step => 
      step.applicableWhen.flow?.includes(flow)
    );

    // Step 4: Calculate match scores for each step
    const matches: ActionStepMatch[] = flowSteps
      .map(step => {
        const matchScore = calculateMatchScore(step, userInput, flow);
        const matchedRules:string[] = []; // TODO: Track which rules matched for debugging
        
        return {
          step,
          matchScore,
          matchedRules
        };
      })
      .filter(match => match.matchScore > 0) // Only keep matches
      .sort((a, b) => {
        // Sort by match score first, then by default priority
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return a.step.defaultPriority - b.step.defaultPriority;
      })
      .slice(0, maxSteps); // Take top N steps

    return matches;

  } catch (error) {
    console.error('Error querying action steps:', error);
    throw error;
  }
}

/**
 * Get all action steps for an agent (for admin UI)
 */
export async function getAllActionSteps(agentId: string): Promise<ActionStepScenario[]> {
  try {
    const scrollResult = await qdrant.scroll(ACTION_STEPS_COLLECTION, {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });

    return scrollResult.points.map(point => {
      const payload = point.payload as any;
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
      } as ActionStepScenario;
    });
  } catch (error) {
    console.error('Error getting all action steps:', error);
    throw error;
  }
}

/**
 * Store a new action step (for admin UI)
 */
export async function storeActionStep(step: Omit<ActionStepScenario, 'id'>): Promise<string> {
  try {
    const stepId = `${step.category}-${Date.now()}`; // Generate unique ID
    
    await qdrant.upsert(ACTION_STEPS_COLLECTION, {
      wait: true,
      points: [
        {
          id: crypto.randomUUID(),
          vector: [0,0,0,0], // Dummy vector
          payload: {
            ...step,
            stepId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          }
        }
      ]
    });

    return stepId;
  } catch (error) {
    console.error('Error storing action step:', error);
    throw error;
  }
}

/**
 * Delete an action step (for admin UI)
 */
export async function deleteActionStep(stepId: string): Promise<void> {
  try {
    // Find the point with this stepId
    const scrollResult = await qdrant.scroll(ACTION_STEPS_COLLECTION, {
      limit: 1,
      with_payload: true,
      filter: {
        must: [
          {
            key: 'stepId',
            match: { value: stepId }
          }
        ]
      }
    });

    if (scrollResult.points.length > 0) {
      const pointId = scrollResult.points[0].id;
      await qdrant.delete(ACTION_STEPS_COLLECTION, {
        wait: true,
        points: [pointId as string]
      });
    }
  } catch (error) {
    console.error('Error deleting action step:', error);
    throw error;
  }
}