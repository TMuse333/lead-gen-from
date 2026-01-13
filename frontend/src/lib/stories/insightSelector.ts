// lib/stories/insightSelector.ts
/**
 * Utility functions for selecting the best story and tip for each phase
 */

import type { MatchedStory } from '@/types/advice.types';
import type { PhaseTip } from '@/components/ux/resultsComponents/timeline/components/PhaseInsight';

/**
 * Phase insight containing at most 1 story and 1 tip
 */
export interface PhaseInsightData {
  story?: MatchedStory;
  tip?: PhaseTip;
}

/**
 * Map of phase IDs to their insights
 */
export type InsightsByPhase = Record<string, PhaseInsightData>;

/**
 * Select the best story for a phase from available stories
 * Priority:
 * 1. Story with most match reasons (best match)
 * 2. First story in the list (fallback)
 */
export function selectBestStory(stories: MatchedStory[]): MatchedStory | undefined {
  if (!stories || stories.length === 0) {
    return undefined;
  }

  // Sort by number of match reasons (more = better fit)
  const sorted = [...stories].sort((a, b) => {
    const aReasons = a.matchReasons?.length || 0;
    const bReasons = b.matchReasons?.length || 0;
    return bReasons - aReasons;
  });

  return sorted[0];
}

/**
 * Select the best tip for a phase from available advice
 * Priority:
 * 1. Shorter tips (more concise = better for quick reading)
 * 2. First tip in the list (fallback)
 */
export function selectBestTip(advice: string[]): PhaseTip | undefined {
  if (!advice || advice.length === 0) {
    return undefined;
  }

  // Prefer concise tips (under 200 chars) but not too short (over 50 chars)
  const idealTips = advice.filter(a => a.length >= 50 && a.length <= 200);

  if (idealTips.length > 0) {
    return { content: idealTips[0] };
  }

  // Fall back to first tip
  return { content: advice[0] };
}

/**
 * Build insights for all phases
 * Takes storiesByPhase and adviceByPhase and returns combined insights
 */
export function buildInsightsByPhase(
  storiesByPhase: Record<string, MatchedStory[]>,
  adviceByPhase: Record<string, string[]>
): InsightsByPhase {
  const allPhaseIds = new Set([
    ...Object.keys(storiesByPhase),
    ...Object.keys(adviceByPhase),
  ]);

  const insights: InsightsByPhase = {};

  for (const phaseId of allPhaseIds) {
    const stories = storiesByPhase[phaseId] || [];
    const advice = adviceByPhase[phaseId] || [];

    insights[phaseId] = {
      story: selectBestStory(stories),
      tip: selectBestTip(advice),
    };
  }

  return insights;
}

/**
 * Get insight for a single phase
 * Convenience function when you have stories and advice arrays directly
 */
export function getPhaseInsight(
  stories: MatchedStory[],
  advice: string[]
): PhaseInsightData {
  return {
    story: selectBestStory(stories),
    tip: selectBestTip(advice),
  };
}

/**
 * Check if a phase has any insight content
 */
export function hasInsight(insight: PhaseInsightData | undefined): boolean {
  if (!insight) return false;
  return !!(insight.story || insight.tip);
}

/**
 * Count total insights across all phases
 */
export function countInsights(insights: InsightsByPhase): {
  stories: number;
  tips: number;
  phases: number;
} {
  let stories = 0;
  let tips = 0;
  let phases = 0;

  for (const phaseId in insights) {
    const insight = insights[phaseId];
    if (insight.story) stories++;
    if (insight.tip) tips++;
    if (insight.story || insight.tip) phases++;
  }

  return { stories, tips, phases };
}
