// lib/stories/storyUtils.ts
/**
 * Utilities for parsing and matching stories from Qdrant advice
 */

import type { AgentAdviceScenario, AdvicePlacements } from '@/types/advice.types';
import type { MatchedStory } from '@/components/ux/resultsComponents/timeline/components/StoryCard';
import type { OfferType } from '@/lib/offers/unified';

/**
 * Parse a story from the formatted advice string
 * Format: "[CLIENT STORY]\nSituation: X\nWhat I did: Y\nOutcome: Z"
 */
export function parseStoryContent(advice: string): {
  situation: string;
  whatTheyDid: string;
  outcome: string;
} | null {
  // Check if it's a story format
  if (!advice.includes('[CLIENT STORY]') && !advice.toLowerCase().includes('situation:')) {
    return null;
  }

  // Normalize line breaks for consistent parsing
  const normalized = advice.replace(/\r\n/g, '\n');

  // Extract sections by splitting on keywords
  let situation = '';
  let whatTheyDid = '';
  let outcome = '';

  // Try to extract Situation
  const situationStart = normalized.toLowerCase().indexOf('situation:');
  if (situationStart !== -1) {
    const afterSituation = normalized.slice(situationStart + 'situation:'.length);
    const nextSection = afterSituation.search(/what i did:|what they did:|outcome:|result:/i);
    situation = (nextSection !== -1 ? afterSituation.slice(0, nextSection) : afterSituation).trim();
  }

  // Try to extract What I did
  const actionStart = normalized.toLowerCase().indexOf('what i did:');
  if (actionStart !== -1) {
    const afterAction = normalized.slice(actionStart + 'what i did:'.length);
    const nextSection = afterAction.search(/outcome:|result:/i);
    whatTheyDid = (nextSection !== -1 ? afterAction.slice(0, nextSection) : afterAction).trim();
  }

  // Try to extract Outcome
  const outcomeStart = normalized.toLowerCase().indexOf('outcome:');
  const resultStart = normalized.toLowerCase().indexOf('result:');
  const finalStart = outcomeStart !== -1 ? outcomeStart : resultStart;
  if (finalStart !== -1) {
    const label = outcomeStart !== -1 ? 'outcome:' : 'result:';
    outcome = normalized.slice(finalStart + label.length).trim();
  }

  if (!situation && !whatTheyDid && !outcome) {
    // Try alternative parsing - might be freeform
    return {
      situation: advice.replace('[CLIENT STORY]', '').trim(),
      whatTheyDid: '',
      outcome: '',
    };
  }

  return { situation, whatTheyDid, outcome };
}

/**
 * Determine match reasons based on user input and story metadata
 */
export function getMatchReasons(
  story: AgentAdviceScenario,
  userInput: Record<string, string>
): string[] {
  const reasons: string[] = [];

  // Check for location match
  const userLocation = userInput.location?.toLowerCase();
  const storyTags = story.tags.map(t => t.toLowerCase());

  if (userLocation && storyTags.some(t => t.includes(userLocation) || userLocation.includes(t))) {
    reasons.push('Same area');
  }

  // Check for first-time buyer
  if (userInput.isFirstTimeBuyer === 'yes' || userInput.isFirstTime === 'true') {
    if (storyTags.some(t => t.includes('first-time') || t.includes('first time'))) {
      reasons.push('First-time buyer');
    }
  }

  // Check for budget similarity
  if (userInput.budget) {
    if (storyTags.some(t => t.includes('budget') || t.includes(userInput.budget.toLowerCase()))) {
      reasons.push('Similar budget');
    }
  }

  // Check for timeline match
  if (userInput.timeline) {
    if (storyTags.some(t => t.includes('timeline') || t.includes(userInput.timeline.toLowerCase()))) {
      reasons.push('Similar timeline');
    }
  }

  // Check for intent/flow match
  const flow = userInput.flow || userInput.intent;
  if (flow && story.applicableWhen?.flow?.includes(flow)) {
    reasons.push(`${flow.charAt(0).toUpperCase() + flow.slice(1)}ing journey`);
  }

  // Default reason if nothing specific
  if (reasons.length === 0) {
    reasons.push('Similar situation');
  }

  return reasons;
}

/**
 * Transform an AgentAdviceScenario with kind='story' to MatchedStory
 */
export function transformToMatchedStory(
  scenario: AgentAdviceScenario,
  userInput: Record<string, string>
): MatchedStory | null {
  if (scenario.kind !== 'story') {
    return null;
  }

  const parsed = parseStoryContent(scenario.advice);
  if (!parsed) {
    return null;
  }

  return {
    id: scenario.id,
    title: scenario.title,
    situation: parsed.situation,
    whatTheyDid: parsed.whatTheyDid,
    outcome: parsed.outcome,
    clientType: extractClientType(scenario.tags),
    location: extractLocation(scenario.tags, userInput),
    budget: extractBudget(scenario.tags),
    matchReasons: getMatchReasons(scenario, userInput),
  };
}

/**
 * Extract client type from tags
 */
function extractClientType(tags: string[]): string | undefined {
  const clientTypeTags = [
    'first-time buyer',
    'first-time',
    'relocating',
    'investor',
    'downsizing',
    'upsizing',
    'empty nester',
  ];

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const clientType of clientTypeTags) {
      if (lowerTag.includes(clientType)) {
        return tag.charAt(0).toUpperCase() + tag.slice(1);
      }
    }
  }
  return undefined;
}

/**
 * Extract location from tags or user input
 */
function extractLocation(tags: string[], userInput: Record<string, string>): string | undefined {
  // First check if any tag looks like a location
  const locationIndicators = ['area', 'city', 'neighborhood', 'region'];
  for (const tag of tags) {
    if (locationIndicators.some(ind => tag.toLowerCase().includes(ind))) {
      return tag;
    }
  }
  // Fall back to user's location
  return userInput.location;
}

/**
 * Extract budget from tags
 */
function extractBudget(tags: string[]): string | undefined {
  for (const tag of tags) {
    if (tag.includes('$') || tag.toLowerCase().includes('budget')) {
      return tag;
    }
  }
  return undefined;
}

/**
 * Filter stories from advice and group by phase
 *
 * @param advice - Array of advice scenarios from Qdrant
 * @param offerType - The offer type to filter placements for
 * @param userInput - User input for generating match reasons
 * @returns Record mapping phase IDs to matched stories
 */
export function groupStoriesByPhase(
  advice: AgentAdviceScenario[],
  offerType: OfferType,
  userInput: Record<string, string>
): Record<string, MatchedStory[]> {
  const storiesByPhase: Record<string, MatchedStory[]> = {};

  // Filter to only stories
  const stories = advice.filter(a => a.kind === 'story');

  for (const story of stories) {
    const matchedStory = transformToMatchedStory(story, userInput);
    if (!matchedStory) continue;

    // Get phases this story is placed in for this offer type
    const placements = story.applicableWhen?.placements as AdvicePlacements | undefined;
    const phases = placements?.[offerType] || [];

    // If no specific placements, try to infer from tags
    const effectivePhases = phases.length > 0 ? phases : inferPhasesFromTags(story.tags);

    for (const phaseId of effectivePhases) {
      if (!storiesByPhase[phaseId]) {
        storiesByPhase[phaseId] = [];
      }
      storiesByPhase[phaseId].push(matchedStory);
    }
  }

  return storiesByPhase;
}

/**
 * Infer applicable phases from story tags when no explicit placement exists
 */
function inferPhasesFromTags(tags: string[]): string[] {
  const phaseMapping: Record<string, string[]> = {
    'pre-approval': ['financial-prep'],
    'mortgage': ['financial-prep'],
    'financing': ['financial-prep'],
    'agent': ['find-agent'],
    'house hunting': ['house-hunting'],
    'search': ['house-hunting'],
    'offer': ['make-offer'],
    'negotiation': ['make-offer'],
    'inspection': ['under-contract', 'inspection'],
    'appraisal': ['under-contract'],
    'closing': ['closing'],
    'move': ['move-in', 'post-closing'],
  };

  const phases: string[] = [];
  const lowerTags = tags.map(t => t.toLowerCase());

  for (const [keyword, mappedPhases] of Object.entries(phaseMapping)) {
    if (lowerTags.some(t => t.includes(keyword))) {
      phases.push(...mappedPhases);
    }
  }

  // Deduplicate
  return [...new Set(phases)];
}

/**
 * Get the best stories for each phase (limit per phase)
 */
export function getTopStoriesPerPhase(
  storiesByPhase: Record<string, MatchedStory[]>,
  limitPerPhase: number = 1
): Record<string, MatchedStory[]> {
  const result: Record<string, MatchedStory[]> = {};

  for (const [phaseId, stories] of Object.entries(storiesByPhase)) {
    // Sort by number of match reasons (more reasons = better match)
    const sorted = [...stories].sort(
      (a, b) => b.matchReasons.length - a.matchReasons.length
    );
    result[phaseId] = sorted.slice(0, limitPerPhase);
  }

  return result;
}
