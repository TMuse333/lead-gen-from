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
import type { CustomPhaseConfig } from '@/types/timelineBuilder.types';

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

// ==================== PERSONALIZED AGENT ADVICE ====================

/**
 * Generate personalized agent advice for each phase based on user situation
 */
function getPersonalizedAdvice(
  phaseId: string,
  input: UserTimelineInput
): string[] {
  const advice: string[] = [];

  // Location-based advice
  if (input.location) {
    const locationAdvice: Record<string, string> = {
      'financial-prep': `In ${input.location}, lenders often have specific programs for local buyers. I can connect you with trusted lenders who know this market well.`,
      'house-hunting': `The ${input.location} market has unique neighborhood dynamics. I'll help you understand which areas match your lifestyle and budget.`,
      'make-offer': `In ${input.location}, offer strategies vary by neighborhood. I know what sellers here respond to and can help craft a competitive offer.`,
      'market-research': `${input.location} has distinct micro-markets. I'll share insights on trends and pricing specific to areas you're interested in.`,
      'home-prep': `Buyers in ${input.location} have specific expectations. I'll help you stage and present your home to appeal to local buyers.`,
      'set-price': `Pricing in ${input.location} requires local expertise. I'll analyze recent comparable sales to find your optimal listing price.`,
      'list-property': `I know what makes listings stand out in ${input.location}. We'll highlight features that local buyers value most.`,
    };
    if (locationAdvice[phaseId]) {
      advice.push(locationAdvice[phaseId]);
    }
  }

  // Budget-based advice
  if (input.budget) {
    const budgetAdvice: Record<string, string> = {
      'financial-prep': `With your ${input.budget} budget, there are financing options that could maximize your buying power. Let's explore what works best for your situation.`,
      'house-hunting': `In your ${input.budget} price range, I know which neighborhoods offer the best value and which properties to prioritize.`,
      'make-offer': `At ${input.budget}, positioning your offer correctly is crucial. I'll help you structure terms that stand out without overextending.`,
    };
    if (budgetAdvice[phaseId]) {
      advice.push(budgetAdvice[phaseId]);
    }
  }

  // Timeline-based advice
  if (input.timeline) {
    const isUrgent = input.timeline === '0-3 months';
    const timelineAdvice: Record<string, string> = {
      'financial-prep': isUrgent
        ? `With your ${input.timeline} timeline, we need to move quickly on pre-approval. I have lender contacts who can expedite this process.`
        : `Your ${input.timeline} timeline gives us room to shop for the best rates. Let's make sure you're positioned for the best terms.`,
      'house-hunting': isUrgent
        ? `Given your urgency, I'll set up instant alerts and prioritize showings. When the right home appears, we'll be ready to act fast.`
        : `With your timeline, we can be strategic about when to act. I'll help you recognize the right opportunity when it comes.`,
      'make-offer': isUrgent
        ? `Speed matters with your timeline. I'll prepare offer documents in advance so we can submit within hours of finding the right home.`
        : `We have time to craft thoughtful offers. I'll help you balance competitive positioning with smart negotiation.`,
    };
    if (timelineAdvice[phaseId]) {
      advice.push(timelineAdvice[phaseId]);
    }
  }

  // First-time buyer advice
  if (input.isFirstTimeBuyer) {
    const firstTimeAdvice: Record<string, string> = {
      'financial-prep': `As a first-time buyer, you may qualify for special programs like FHA loans, down payment assistance, or tax credits. I'll help you explore all available options.`,
      'house-hunting': `First-time buyers often benefit from focusing on move-in ready homes. I'll help you evaluate what's worth your investment vs. what to avoid.`,
      'make-offer': `I'll walk you through every step of the offer process so you feel confident. No question is too basic—that's what I'm here for.`,
      'under-contract': `The inspection and closing process can feel overwhelming the first time. I'll be by your side explaining each step and advocating for your interests.`,
      'closing': `Closing day is exciting! I'll make sure you understand all the documents and that there are no surprises. You're in good hands.`,
    };
    if (firstTimeAdvice[phaseId]) {
      advice.push(firstTimeAdvice[phaseId]);
    }
  }

  // Default advice if none of the above applied
  if (advice.length === 0) {
    const defaultAdvice: Record<string, string[]> = {
      'financial-prep': [
        'Getting pre-approved gives you a clear budget and shows sellers you\'re serious.',
        'I can recommend trusted lenders who offer competitive rates and excellent service.',
      ],
      'house-hunting': [
        'I\'ll help you focus on properties that truly match your needs and avoid wasting time.',
        'My local expertise helps identify hidden gems before they hit the mainstream market.',
      ],
      'make-offer': [
        'A well-crafted offer is about more than just price. I\'ll help you present terms that appeal to sellers.',
        'I negotiate on your behalf to protect your interests while keeping the deal moving forward.',
      ],
      'under-contract': [
        'During this phase, attention to detail is critical. I\'ll coordinate inspections and manage all deadlines.',
        'If issues arise, I\'ll help you navigate solutions that protect your investment.',
      ],
      'closing': [
        'I\'ll ensure all paperwork is in order and you understand every document you sign.',
        'My goal is a smooth closing day with no surprises.',
      ],
      'home-prep': [
        'First impressions matter. I\'ll advise on cost-effective improvements that maximize your sale price.',
        'Professional staging and photography can significantly impact buyer interest.',
      ],
      'set-price': [
        'Pricing right from the start attracts more buyers and often leads to better offers.',
        'I analyze market data to find the sweet spot that maximizes your return.',
      ],
      'list-property': [
        'My marketing strategy puts your home in front of qualified buyers quickly.',
        'Professional photos and compelling descriptions make your listing stand out.',
      ],
      'marketing-showings': [
        'I coordinate showings to minimize disruption while maximizing exposure.',
        'Feedback from showings helps us adjust strategy if needed.',
      ],
      'review-offers': [
        'I\'ll present all offers clearly and help you evaluate the full picture—not just price.',
        'Negotiation is where my experience really pays off for you.',
      ],
    };
    const defaults = defaultAdvice[phaseId] || [
      'I\'ll guide you through this phase with personalized support.',
      'My experience helps anticipate challenges before they become problems.',
    ];
    advice.push(...defaults);
  }

  return advice;
}

// ==================== CUSTOM PHASE CONVERSION ====================

/**
 * Extended PhaseTemplate that includes agent advice from custom steps
 */
interface ExtendedPhaseTemplate extends PhaseTemplate {
  customAgentAdvice?: string[];
  customStepDetails?: { title: string; inlineExperience?: string; description?: string }[];
}

/**
 * Convert CustomPhaseConfig to PhaseTemplate format
 * This allows the generator to use agent-customized phases
 * Now preserves inlineExperience as agent advice
 */
function convertCustomPhasesToTemplates(customPhases: CustomPhaseConfig[]): ExtendedPhaseTemplate[] {
  console.log('\n📋 [Timeline Generator] Converting custom phases to templates...');
  console.log(`   Total phases: ${customPhases.length}`);

  return customPhases.map((custom) => {
    // Extract agent advice from steps' inlineExperience
    const customAgentAdvice = custom.actionableSteps
      .filter((step) => step.inlineExperience)
      .map((step) => step.inlineExperience!);

    // Debug: Log each phase's advice extraction
    console.log(`\n   Phase: "${custom.name}" (${custom.id})`);
    console.log(`   - Actionable steps: ${custom.actionableSteps.length}`);
    custom.actionableSteps.forEach((step, i) => {
      console.log(`     Step ${i + 1}: "${step.title}"`);
      console.log(`       inlineExperience: ${step.inlineExperience ? `"${step.inlineExperience.substring(0, 50)}..."` : '❌ NOT SET'}`);
    });
    console.log(`   - Extracted customAgentAdvice: ${customAgentAdvice.length} items`);
    if (customAgentAdvice.length > 0) {
      customAgentAdvice.forEach((advice, i) => {
        console.log(`     ✅ Advice ${i + 1}: "${advice.substring(0, 60)}..."`);
      });
    }

    return {
      id: custom.id,
      name: custom.name,
      baseTimeline: custom.timeline,
      description: custom.description,
      suggestedActionItems: custom.actionableSteps.map((step) => step.title),
      isOptional: custom.isOptional,
      order: custom.order,
      customAgentAdvice, // Preserve the personalized advice from wizard
      customStepDetails: custom.actionableSteps.map((step) => ({
        title: step.title,
        inlineExperience: step.inlineExperience,
        description: step.description,
      })),
    };
  });
}

// ==================== MAIN GENERATOR ====================

/**
 * Generate a complete timeline without LLM
 * This is the main export - use this instead of LLM generation
 *
 * @param input - User's timeline input (flow, location, budget, etc.)
 * @param customPhases - Optional custom phases from agent configuration
 *                       If provided, uses these instead of default templates
 */
export function generateFastTimeline(
  input: UserTimelineInput,
  customPhases?: CustomPhaseConfig[]
): GeneratedTimeline {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 [Timeline Generator] Starting generation...');
  console.log('='.repeat(60));
  console.log('User Input:', JSON.stringify(input, null, 2));
  console.log(`Custom phases provided: ${customPhases ? customPhases.length : 0}`);

  if (customPhases && customPhases.length > 0) {
    console.log('\n📦 [Raw Custom Phases Data]:');
    customPhases.forEach((phase, i) => {
      console.log(`\n  Phase ${i + 1}: ${phase.name}`);
      console.log(`    Steps with inlineExperience:`);
      phase.actionableSteps.forEach((step) => {
        if (step.inlineExperience) {
          console.log(`      ✅ "${step.title}": has advice`);
        } else {
          console.log(`      ❌ "${step.title}": NO advice`);
        }
      });
    });
  }

  const template = getFlowTemplate(input.flow);

  // Use custom phases if provided, otherwise use default templates
  const basePhases = customPhases && customPhases.length > 0
    ? convertCustomPhasesToTemplates(customPhases)
    : getTemplatePhases(input.flow);

  console.log(`\n📊 Using ${customPhases && customPhases.length > 0 ? 'CUSTOM' : 'DEFAULT'} phases`);

  // Get timeline multiplier
  const multiplier = TIMELINE_MULTIPLIERS[input.timeline || '6-12 months'] || 1.0;

  // Filter phases based on user status
  const filteredPhases = filterPhases(basePhases, input);

  // Generate each phase
  const phases: GeneratedPhase[] = filteredPhases.map(({ phase, skip, skipReason }) => {
    // Cast to extended type to access custom advice if available
    const extendedPhase = phase as ExtendedPhaseTemplate;

    // Convert suggested action items to ActionItem format
    const baseActionItems: ActionItem[] = (phase.suggestedActionItems || []).map((text, i) => ({
      text,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    }));

    // Add conditional items based on user situation
    const conditionalItems = getConditionalActionItems(phase.id, input);

    // Merge and limit to 5-6 items
    const allItems = [...conditionalItems, ...baseActionItems].slice(0, 6);

    // Use custom agent advice from wizard if available, otherwise generate defaults
    // Priority: 1) Custom advice from inlineExperience, 2) Fallback to generated advice
    const hasCustomAdvice = extendedPhase.customAgentAdvice && extendedPhase.customAgentAdvice.length > 0;
    const agentAdvice = hasCustomAdvice
      ? extendedPhase.customAgentAdvice
      : getPersonalizedAdvice(phase.id, input);

    // Debug: Log advice source for each phase
    console.log(`\n🎯 [Phase: ${phase.name}] Advice source: ${hasCustomAdvice ? '✅ CUSTOM (from wizard)' : '⚙️ FALLBACK (generated)'}`);
    if (hasCustomAdvice) {
      console.log(`   Custom advice items: ${extendedPhase.customAgentAdvice!.length}`);
    } else {
      console.log(`   Generated ${agentAdvice.length} advice items based on user input`);
    }

    return {
      id: phase.id,
      name: phase.name,
      timeline: adjustTimeline(phase.baseTimeline, multiplier),
      description: personalizeDescription(phase.description, input),
      actionItems: allItems,
      agentAdvice, // Uses custom advice from wizard OR generated fallback
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
