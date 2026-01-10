// lib/offers/definitions/timeline/fast-timeline-generator.ts
/**
 * Fast Timeline Generator - No LLM Required
 *
 * Generates personalized timelines using:
 * 1. Hardcoded phase templates with variable substitution
 * 2. Conditional phase filtering based on user status
 * 3. Timeline compression based on urgency
 * 4. Story matching from Qdrant (no LLM needed)
 *
 * This eliminates 90% of LLM usage, reducing generation time from 8-10s to <1s
 */

import { getFlowTemplate, getTemplatePhases } from './timeline-templates';
import type { PhaseTemplate, TimelineFlow } from './timeline-types';

// ==================== USER INPUT TYPES ====================

export interface UserTimelineInput {
  flow: TimelineFlow;
  location?: string;
  budget?: string;
  timeline?: string; // '0-3 months', '3-6 months', '6-12 months', '12+ months'
  isFirstTimeBuyer?: boolean;
  isPreApproved?: boolean;
  currentStage?: string; // For sellers: 'just-starting', 'already-prepping', 'ready-to-list'
  motivation?: string;
  additionalContext?: string;
}

// ==================== OUTPUT TYPES ====================

export interface GeneratedPhase {
  id: string;
  name: string;
  timeline: string;
  description: string;
  actionItems: ActionItem[];
  agentAdvice?: string[];
  storySlot?: boolean; // Indicates this phase should show stories
  isSkipped?: boolean;
  skipReason?: string;
}

export interface ActionItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
  details?: string;
}

export interface GeneratedTimeline {
  flow: TimelineFlow;
  title: string;
  subtitle: string;
  totalEstimatedTime: string;
  phases: GeneratedPhase[];
  userSituation: {
    location?: string;
    budget?: string;
    timeline?: string;
    isFirstTimeBuyer?: boolean;
  };
  generatedAt: string;
  generationMethod: 'fast-hardcoded';
}

// ==================== TIMELINE MULTIPLIERS ====================

const TIMELINE_MULTIPLIERS: Record<string, number> = {
  '0-3 months': 0.5,    // Compressed - urgent buyer
  '3-6 months': 0.75,   // Standard-ish
  '6-12 months': 1.0,   // Standard timeline
  '12+ months': 1.25,   // Extended planning
};

// ==================== PERSONALIZED DESCRIPTIONS ====================

/**
 * Generates personalized phase descriptions by substituting variables
 */
function personalizeDescription(
  baseDescription: string,
  input: UserTimelineInput
): string {
  let desc = baseDescription;

  // Add location context
  if (input.location) {
    if (desc.includes('target market') || desc.includes('target area')) {
      desc = desc.replace('target market', `the ${input.location} market`);
      desc = desc.replace('target area', input.location);
    }
  }

  // Add budget context for house hunting
  if (input.budget && desc.includes('budget')) {
    desc = desc.replace('your budget', `your ${input.budget} budget`);
  }

  // Add first-time buyer context
  if (input.isFirstTimeBuyer && desc.includes('your buying power')) {
    desc = desc.replace('your buying power', 'your buying power as a first-time buyer');
  }

  return desc;
}

// ==================== PERSONALIZED ACTION ITEMS ====================

/**
 * Additional action items based on user situation
 */
function getConditionalActionItems(
  phaseId: string,
  input: UserTimelineInput
): ActionItem[] {
  const items: ActionItem[] = [];

  // First-time buyer specific items
  if (input.isFirstTimeBuyer) {
    if (phaseId === 'financial-prep') {
      items.push({
        text: 'Research first-time buyer programs and grants in your area',
        priority: 'high',
        details: 'Many states and cities offer down payment assistance for first-time buyers',
      });
      items.push({
        text: 'Consider FHA loans which require only 3.5% down',
        priority: 'medium',
      });
    }
    if (phaseId === 'house-hunting') {
      items.push({
        text: 'Focus on move-in ready homes to avoid renovation costs',
        priority: 'medium',
        details: 'As a first-time buyer, unexpected repairs can strain your budget',
      });
    }
  }

  // Location-specific items
  if (input.location) {
    if (phaseId === 'market-research' || phaseId === 'house-hunting') {
      items.push({
        text: `Research ${input.location} neighborhood trends and pricing`,
        priority: 'high',
      });
    }
  }

  // Budget-specific items
  if (input.budget) {
    if (phaseId === 'make-offer') {
      items.push({
        text: `Prepare offer strategy for the ${input.budget} price range in your market`,
        priority: 'high',
      });
    }
  }

  // Urgent timeline items
  if (input.timeline === '0-3 months') {
    if (phaseId === 'financial-prep') {
      items.push({
        text: 'Fast-track your pre-approval - contact multiple lenders this week',
        priority: 'high',
        details: 'With your 0-3 month timeline, getting pre-approved immediately is critical',
      });
    }
    if (phaseId === 'house-hunting') {
      items.push({
        text: 'Be ready to make quick decisions - schedule showings ASAP when new listings appear',
        priority: 'high',
      });
    }
  }

  return items;
}

// ==================== PHASE FILTERING ====================

/**
 * Determines which phases to skip or modify based on user status
 */
function filterPhases(
  phases: PhaseTemplate[],
  input: UserTimelineInput
): { phase: PhaseTemplate; skip: boolean; skipReason?: string }[] {
  return phases.map(phase => {
    // Skip financial-prep if already pre-approved
    if (phase.id === 'financial-prep' && input.isPreApproved) {
      return {
        phase,
        skip: true,
        skipReason: 'You\'re already pre-approved! Great head start.',
      };
    }

    return { phase, skip: false };
  });
}

// ==================== TIMELINE ADJUSTMENT ====================

/**
 * Adjusts phase timelines based on user's urgency
 */
function adjustTimeline(baseTimeline: string, multiplier: number): string {
  // Parse "Week X-Y" format
  const match = baseTimeline.match(/Week\s+(\d+)(?:-(\d+))?/i);
  if (!match) return baseTimeline;

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : start;

  // Apply multiplier
  const adjustedStart = Math.max(1, Math.round(start * multiplier));
  const adjustedEnd = Math.max(adjustedStart, Math.round(end * multiplier));

  if (adjustedStart === adjustedEnd) {
    return `Week ${adjustedStart}`;
  }
  return `Week ${adjustedStart}-${adjustedEnd}`;
}

// ==================== STORY PHASE MAPPING ====================

/**
 * Phases that should prominently feature stories
 */
const STORY_EMPHASIS_PHASES = [
  'financial-prep',   // "Here's how I helped a first-time buyer..."
  'house-hunting',    // "A client in your area found their dream home..."
  'make-offer',       // "In a competitive market, my client won because..."
  'under-contract',   // "During inspection, we discovered..."
  'closing',          // "On closing day, everything came together..."
  'home-prep',        // "This seller's staging transformed their home..."
  'review-offers',    // "We received 5 offers and here's how we chose..."
];

// ==================== MAIN GENERATOR ====================

/**
 * Generate a complete timeline without LLM
 * This is the main export - use this instead of LLM generation
 */
export function generateFastTimeline(input: UserTimelineInput): GeneratedTimeline {
  const template = getFlowTemplate(input.flow);
  const basePhases = getTemplatePhases(input.flow);

  // Get timeline multiplier
  const multiplier = TIMELINE_MULTIPLIERS[input.timeline || '6-12 months'] || 1.0;

  // Filter phases based on user status
  const filteredPhases = filterPhases(basePhases, input);

  // Generate each phase
  const phases: GeneratedPhase[] = filteredPhases.map(({ phase, skip, skipReason }) => {
    // Convert suggested action items to ActionItem format
    const baseActionItems: ActionItem[] = (phase.suggestedActionItems || []).map((text, i) => ({
      text,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    }));

    // Add conditional items based on user situation
    const conditionalItems = getConditionalActionItems(phase.id, input);

    // Merge and limit to 5-6 items
    const allItems = [...conditionalItems, ...baseActionItems].slice(0, 6);

    return {
      id: phase.id,
      name: phase.name,
      timeline: adjustTimeline(phase.baseTimeline, multiplier),
      description: personalizeDescription(phase.description, input),
      actionItems: allItems,
      storySlot: STORY_EMPHASIS_PHASES.includes(phase.id),
      isSkipped: skip,
      skipReason,
    };
  });

  // Calculate total time based on non-skipped phases
  const activePhases = phases.filter(p => !p.isSkipped);
  const lastPhase = activePhases[activePhases.length - 1];
  const timelineMatch = lastPhase?.timeline.match(/Week\s+\d+(?:-(\d+))?/i);
  const lastWeek = timelineMatch?.[1] || timelineMatch?.[0]?.replace('Week ', '') || '16';
  const totalWeeks = parseInt(lastWeek, 10);
  const totalMonths = Math.ceil(totalWeeks / 4);

  // Generate title and subtitle
  const title = generateTitle(input);
  const subtitle = generateSubtitle(input);

  return {
    flow: input.flow,
    title,
    subtitle,
    totalEstimatedTime: `${totalMonths} month${totalMonths > 1 ? 's' : ''}`,
    phases,
    userSituation: {
      location: input.location,
      budget: input.budget,
      timeline: input.timeline,
      isFirstTimeBuyer: input.isFirstTimeBuyer,
    },
    generatedAt: new Date().toISOString(),
    generationMethod: 'fast-hardcoded',
  };
}

// ==================== TITLE GENERATION ====================

function generateTitle(input: UserTimelineInput): string {
  const flowTitles = {
    buy: 'Your Home Buying Journey',
    sell: 'Your Home Selling Journey',
    browse: 'Your Real Estate Exploration',
  };

  let title = flowTitles[input.flow] || 'Your Real Estate Timeline';

  if (input.location) {
    title = `${title} in ${input.location}`;
  }

  return title;
}

function generateSubtitle(input: UserTimelineInput): string {
  const parts: string[] = [];

  if (input.isFirstTimeBuyer) {
    parts.push('First-time buyer');
  }

  if (input.budget) {
    parts.push(input.budget);
  }

  if (input.timeline) {
    parts.push(`${input.timeline} timeline`);
  }

  if (parts.length === 0) {
    return 'Personalized step-by-step guide';
  }

  return `Personalized for: ${parts.join(' • ')}`;
}

// ==================== UTILITY EXPORTS ====================

export { TIMELINE_MULTIPLIERS, STORY_EMPHASIS_PHASES };
