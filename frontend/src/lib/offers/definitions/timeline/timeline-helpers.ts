// lib/offers/definitions/timeline/timeline-helpers.ts
/**
 * Helper functions for Timeline generation
 * Utilities for adjusting, filtering, and enriching timelines
 */

import type {
  TimelinePhase,
  TimelineFlow,
  UserSituation,
  PhaseTemplate,
  TimelineAdjustment,
  PhaseFilterCriteria,
} from './timeline-types';

// ==================== TIMELINE ADJUSTMENT ====================

/**
 * Parse user's timeline input (e.g., "6 months", "1 year", "3-4 months")
 * Returns number of months
 */
export function parseUserTimeline(timeline: string): number {
  const normalized = timeline.toLowerCase().trim();

  // Match patterns like "6 months", "1 year", "3-4 months"
  const monthsMatch = normalized.match(/(\d+)(?:-\d+)?\s*months?/);
  if (monthsMatch) {
    return parseInt(monthsMatch[1], 10);
  }

  const yearMatch = normalized.match(/(\d+)(?:\.5)?\s*years?/);
  if (yearMatch) {
    const years = parseFloat(yearMatch[1]);
    return Math.round(years * 12);
  }

  // Default to 6 months if can't parse
  return 6;
}

/**
 * Adjust phase timeline based on user's total timeline
 * E.g., if user wants 3 months instead of 6, compress all phases
 */
export function adjustPhaseTimeline(
  baseTimeline: string,
  compressionFactor: number
): string {
  // Parse base timeline (e.g., "Week 1-2", "Month 3-4")
  const weekMatch = baseTimeline.match(/Week\s+(\d+)(?:-(\d+))?/i);
  const monthMatch = baseTimeline.match(/Month\s+(\d+)(?:-(\d+))?/i);

  if (weekMatch) {
    const start = parseInt(weekMatch[1], 10);
    const end = weekMatch[2] ? parseInt(weekMatch[2], 10) : start;

    const adjustedStart = Math.max(1, Math.round(start * compressionFactor));
    const adjustedEnd = Math.max(adjustedStart, Math.round(end * compressionFactor));

    if (adjustedStart === adjustedEnd) {
      return `Week ${adjustedStart}`;
    }
    return `Week ${adjustedStart}-${adjustedEnd}`;
  }

  if (monthMatch) {
    const start = parseInt(monthMatch[1], 10);
    const end = monthMatch[2] ? parseInt(monthMatch[2], 10) : start;

    const adjustedStart = Math.max(1, Math.round(start * compressionFactor));
    const adjustedEnd = Math.max(adjustedStart, Math.round(end * compressionFactor));

    if (adjustedStart === adjustedEnd) {
      return `Month ${adjustedStart}`;
    }
    return `Month ${adjustedStart}-${adjustedEnd}`;
  }

  // If can't parse, return as-is
  return baseTimeline;
}

/**
 * Calculate compression factor based on user's timeline vs default
 */
export function calculateCompressionFactor(
  userTimelineMonths: number,
  defaultTimelineMonths: number
): number {
  if (defaultTimelineMonths === 0) return 1;
  return userTimelineMonths / defaultTimelineMonths;
}

/**
 * Adjust all phase timelines in an array
 */
export function adjustPhaseTimelines(
  phases: PhaseTemplate[],
  adjustment: TimelineAdjustment
): PhaseTemplate[] {
  const userMonths = parseUserTimeline(adjustment.userTimeline);
  const defaultMonths = 6; // Base assumption
  const compressionFactor = adjustment.compressionFactor ||
    calculateCompressionFactor(userMonths, defaultMonths);

  return phases.map((phase) => ({
    ...phase,
    baseTimeline: adjustPhaseTimeline(phase.baseTimeline, compressionFactor),
  }));
}

// ==================== PHASE FILTERING ====================

/**
 * Filter phases based on user's current stage
 * E.g., if already pre-approved, skip financial prep
 */
export function filterPhasesByStage(
  phases: PhaseTemplate[],
  criteria: PhaseFilterCriteria
): PhaseTemplate[] {
  let filtered = [...phases];

  // Skip explicitly requested phases
  if (criteria.skipPhases && criteria.skipPhases.length > 0) {
    filtered = filtered.filter((phase) => !criteria.skipPhases!.includes(phase.id));
  }

  // Filter based on current stage
  if (criteria.currentStage) {
    const stage = criteria.currentStage.toLowerCase();

    // If pre-approved, skip financial prep
    if (stage.includes('pre-approved') || stage.includes('preapproved')) {
      filtered = filtered.filter((phase) => phase.id !== 'financial-prep');
    }

    // If have agent, skip find agent
    if (stage.includes('have agent') || stage.includes('working with agent')) {
      filtered = filtered.filter((phase) => phase.id !== 'find-agent' && phase.id !== 'choose-agent-price');
    }

    // If house hunting, skip early phases
    if (stage.includes('house hunting') || stage.includes('looking')) {
      filtered = filtered.filter((phase) =>
        !['financial-prep', 'find-agent'].includes(phase.id)
      );
    }
  }

  // Filter based on user responses
  if (criteria.userResponses) {
    const responses = criteria.userResponses;

    // Check for pre-approval
    if (responses.preApproved === 'yes' || responses.hasPreApproval === true) {
      filtered = filtered.filter((phase) => phase.id !== 'financial-prep');
    }

    // Check for existing agent
    if (responses.hasAgent === 'yes' || responses.workingWithAgent === true) {
      filtered = filtered.filter((phase) => phase.id !== 'find-agent' && phase.id !== 'choose-agent-price');
    }
  }

  return filtered;
}

/**
 * Remove optional phases if timeline is compressed
 */
export function removeOptionalPhasesIfNeeded(
  phases: PhaseTemplate[],
  userTimelineMonths: number
): PhaseTemplate[] {
  // If timeline is very short (< 3 months), remove optional phases
  if (userTimelineMonths < 3) {
    return phases.filter((phase) => !phase.isOptional);
  }

  return phases;
}

// ==================== DISCLAIMER GENERATION ====================

/**
 * Generate appropriate disclaimer based on flow
 */
export function generateDisclaimer(flow: TimelineFlow): string {
  const baseDisclaimer = `This timeline is a general guide based on typical real estate transactions and your agent's experience. Actual timelines can vary significantly based on:`;

  const factors = [
    'Local market conditions and competition',
    'Property type and condition',
    'Financing complexity and approval speed',
    'Inspection findings and negotiations',
    'Title issues or legal complexities',
    'Seasonal factors and holidays',
  ];

  const flowSpecific = {
    buy: 'For buyers, timeline can be affected by inventory availability and offer competition.',
    sell: 'For sellers, timeline depends heavily on market demand and property condition.',
    browse: 'This exploratory timeline is flexible - adjust based on your personal readiness.',
  };

  return `${baseDisclaimer}\n\n${factors.map((f) => `• ${f}`).join('\n')}\n\n${flowSpecific[flow]}\n\nUse this timeline as a roadmap, not a guarantee. Your agent can provide more specific guidance based on your unique situation.`;
}

// ==================== TOTAL TIME CALCULATION ====================

/**
 * Calculate total estimated time from phases
 */
export function calculateTotalTime(phases: TimelinePhase[]): string {
  // Extract max week/month from each phase
  let maxWeeks = 0;
  let maxMonths = 0;

  phases.forEach((phase) => {
    const weekMatch = phase.timeline.match(/Week\s+(?:\d+-)??(\d+)/i);
    const monthMatch = phase.timeline.match(/Month\s+(?:\d+-)??(\d+)/i);

    if (weekMatch) {
      const weeks = parseInt(weekMatch[1], 10);
      maxWeeks = Math.max(maxWeeks, weeks);
    }

    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      maxMonths = Math.max(maxMonths, months);
    }
  });

  // Convert weeks to months if needed
  const totalMonths = maxMonths + Math.ceil(maxWeeks / 4);

  if (totalMonths <= 1) {
    return `${maxWeeks} weeks`;
  } else if (totalMonths < 12) {
    const min = Math.max(1, totalMonths - 1);
    const max = totalMonths + 1;
    return `${min}-${max} months`;
  } else {
    const years = Math.round(totalMonths / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
}

// ==================== CONTEXT FORMATTING ====================

/**
 * Format user situation into a readable string
 */
export function formatUserSituation(situation: UserSituation): string {
  const parts: string[] = [];

  if (situation.isFirstTime) {
    parts.push('first-time ' + (situation.flow === 'buy' ? 'buyer' : 'seller'));
  } else {
    parts.push(situation.flow === 'buy' ? 'buyer' : situation.flow === 'sell' ? 'seller' : 'browser');
  }

  if (situation.location) {
    parts.push(`in ${situation.location}`);
  }

  if (situation.budget) {
    parts.push(`with ${situation.budget} budget`);
  }

  if (situation.timeline) {
    parts.push(`targeting ${situation.timeline}`);
  }

  if (situation.currentStage) {
    parts.push(`(${situation.currentStage})`);
  }

  return parts.join(' ');
}

/**
 * Format agent advice array into a structured string for prompts
 */
export function formatAgentAdvice(advice: string[] | undefined): string {
  if (!advice || advice.length === 0) {
    return 'No specific agent advice available. Use general real estate best practices.';
  }

  return advice.map((tip, index) => `${index + 1}. ${tip}`).join('\n');
}

/**
 * Extract relevant advice for a specific phase
 * (Simple keyword matching - can be enhanced with embeddings)
 */
export function extractRelevantAdvice(
  phaseId: string,
  phaseName: string,
  allAdvice: string[]
): string[] {
  if (!allAdvice || allAdvice.length === 0) return [];

  // Keywords for each phase type
  const phaseKeywords: Record<string, string[]> = {
    'financial-prep': ['pre-approval', 'mortgage', 'credit', 'financing', 'loan', 'budget'],
    'find-agent': ['agent', 'realtor', 'representation'],
    'house-hunting': ['property', 'house', 'home', 'search', 'tour', 'viewing'],
    'make-offer': ['offer', 'negotiate', 'bid', 'price'],
    'under-contract': ['inspection', 'appraisal', 'contingenc'],
    'closing': ['closing', 'escrow', 'title', 'deed'],
    'home-prep': ['stage', 'repair', 'prepare', 'fix'],
    'marketing-showings': ['showing', 'open house', 'market'],
  };

  const keywords = phaseKeywords[phaseId] || [];

  // Filter advice that contains any of the phase keywords
  const relevant = allAdvice.filter((advice) => {
    const lowerAdvice = advice.toLowerCase();
    return keywords.some((keyword) => lowerAdvice.includes(keyword));
  });

  // If we found relevant advice, return it; otherwise return a few general tips
  if (relevant.length > 0) {
    return relevant.slice(0, 3); // Max 3 tips per phase
  }

  // Return first 2 general tips as fallback
  return allAdvice.slice(0, 2);
}

// ==================== VALIDATION HELPERS ====================

/**
 * Validate timeline output structure
 */
export function validateTimelineStructure(timeline: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!timeline.title || timeline.title.trim().length === 0) {
    errors.push('Timeline must have a title');
  }

  if (!timeline.phases || !Array.isArray(timeline.phases)) {
    errors.push('Timeline must have phases array');
  } else if (timeline.phases.length === 0) {
    errors.push('Timeline must have at least one phase');
  } else if (timeline.phases.length < 3) {
    warnings.push('Timeline has fewer than 3 phases - consider adding more detail');
  }

  // Validate each phase
  if (timeline.phases && Array.isArray(timeline.phases)) {
    timeline.phases.forEach((phase: any, index: number) => {
      if (!phase.name) {
        errors.push(`Phase ${index + 1}: Missing name`);
      }
      if (!phase.timeline) {
        errors.push(`Phase ${index + 1}: Missing timeline`);
      }
      if (!phase.description) {
        errors.push(`Phase ${index + 1}: Missing description`);
      }
      if (!phase.actionItems || !Array.isArray(phase.actionItems)) {
        errors.push(`Phase ${index + 1}: Missing action items`);
      } else if (phase.actionItems.length === 0) {
        warnings.push(`Phase ${index + 1}: No action items`);
      }
    });
  }

  if (!timeline.disclaimer) {
    warnings.push('Timeline missing disclaimer');
  }

  if (!timeline.userSituation) {
    warnings.push('Timeline missing user situation context');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Count total action items across all phases
 */
export function countActionItems(phases: TimelinePhase[]): number {
  return phases.reduce((total, phase) => {
    return total + (phase.actionItems?.length || 0);
  }, 0);
}
