// src/lib/offers/unified/offers/realEstateTimeline.offer.ts
/**
 * Real Estate Timeline - Unified Offer Definition
 *
 * Generates personalized step-by-step timelines for buyers, sellers, and browsers.
 * Supports all three intents with tailored questions for each.
 */

import type {
  UnifiedOffer,
  Question,
  Intent,
  PromptContext,
  ValidationResult,
  KnowledgeRequirements,
} from '../types';
import {
  createButtonQuestion,
  createTextQuestion,
  createEmailQuestion,
  createLocationQuestion,
} from '../types';
import { registerOffer } from '../registry';

// Import existing helpers from the old definition
import { buildBasePrompt } from '../../promptBuilders/promptHelpers';
import {
  getFlowTemplate,
  getTemplatePhases,
} from '../../definitions/timeline/timeline-templates';
import {
  generateDisclaimer,
  calculateTotalTime,
  formatUserSituation,
  formatAgentAdvice,
  adjustPhaseTimelines,
  filterPhasesByStage,
  removeOptionalPhasesIfNeeded,
  parseUserTimeline,
  validateTimelineStructure,
  countActionItems,
} from '../../definitions/timeline/timeline-helpers';
import type {
  TimelineOutput,
  TimelinePhase,
  UserSituation,
} from '../../definitions/timeline/timeline-types';

// ==================== OUTPUT TYPES ====================

export type { TimelineOutput, TimelinePhase, UserSituation };

// ==================== QUESTIONS ====================

// Shared timeline question
const TIMELINE_QUESTION = createButtonQuestion(
  'timeline',
  "What's your timeline?",
  'timeline',
  [
    {
      id: 'asap',
      label: '0-3 months (ASAP)',
      value: '0-3 months',
      tracker: {
        insight: 'Fast-track mode activated!',
        dbMessage: 'Optimizing for quick results...',
      },
    },
    {
      id: 'soon',
      label: '3-6 months',
      value: '3-6 months',
      tracker: {
        insight: "Perfect timing — let's plan this right",
        dbMessage: 'Building your 90-day action plan...',
      },
    },
    {
      id: 'planning',
      label: '6-12 months',
      value: '6-12 months',
      tracker: {
        insight: 'Smart move — time is on your side',
        dbMessage: 'Projecting market conditions...',
      },
    },
    {
      id: 'exploring',
      label: 'Just exploring',
      value: '12+ months',
      tracker: {
        insight: "No rush — let's explore your options",
        dbMessage: 'Loading market insights...',
      },
    },
  ],
  { order: 30 }
);

// ==================== BUY QUESTIONS ====================

const BUY_QUESTIONS: Question[] = [
  createButtonQuestion(
    'buyingReason',
    'Why are you looking to buy right now?',
    'buyingReason',
    [
      {
        id: 'first',
        label: 'First-time buyer',
        value: 'first-time',
        tracker: {
          insight: "Welcome to the club! Let's make this smooth",
          dbMessage: 'Loading first-time buyer grants & programs...',
        },
      },
      {
        id: 'moveup',
        label: 'Moving up',
        value: 'moving-up',
        tracker: {
          insight: "Time for more space — let's find your forever home",
          dbMessage: 'Analyzing equity from your current home...',
        },
      },
      {
        id: 'downsize',
        label: 'Downsizing',
        value: 'downsizing',
        tracker: {
          insight: 'Smart move — more freedom, less stress',
          dbMessage: 'Finding low-maintenance gems...',
        },
      },
      {
        id: 'invest',
        label: 'Investment property',
        value: 'investment',
        tracker: {
          insight: 'Investor mode activated',
          dbMessage: 'Running cash-flow + appreciation models...',
        },
      },
    ],
    { order: 10 }
  ),

  createLocationQuestion('Where are you looking to buy?', { order: 20 }),

  createButtonQuestion(
    'budget',
    "What's your budget range?",
    'budget',
    [
      {
        id: 'b1',
        label: 'Under $400k',
        value: 'under $400,000',
        tracker: {
          insight: 'Great starter range',
          dbMessage: 'Finding hidden gems under budget...',
        },
      },
      {
        id: 'b2',
        label: '$400k-$600k',
        value: '$400,000-$600,000',
        tracker: {
          insight: 'Sweet spot — most inventory here',
          dbMessage: 'Filtering active listings...',
        },
      },
      {
        id: 'b3',
        label: '$600k-$800k',
        value: '$600,000-$800,000',
        tracker: {
          insight: 'Moving up nicely',
          dbMessage: 'Unlocking premium neighborhoods...',
        },
      },
      {
        id: 'b4',
        label: '$800k+',
        value: 'over $800,000',
        tracker: {
          insight: 'Luxury buyer detected',
          dbMessage: 'Accessing off-market & pocket listings...',
        },
      },
    ],
    { order: 25 }
  ),

  createButtonQuestion(
    'preApproved',
    'Are you pre-approved for a mortgage?',
    'preApproved',
    [
      {
        id: 'yes',
        label: 'Yes, I am',
        value: 'yes',
        tracker: {
          insight: 'Great! One step ahead',
          dbMessage: 'Skipping financing phase...',
        },
      },
      {
        id: 'no',
        label: 'Not yet',
        value: 'no',
        tracker: {
          insight: "No worries — we'll guide you",
          dbMessage: 'Adding pre-approval steps...',
        },
      },
      {
        id: 'working',
        label: 'Working on it',
        value: 'in-progress',
        tracker: {
          insight: 'Almost there!',
          dbMessage: 'Optimizing financing timeline...',
        },
      },
    ],
    { order: 35, required: false }
  ),

  { ...TIMELINE_QUESTION, text: 'When do you want to move in?' },

  createEmailQuestion({ order: 90 }),
];

// ==================== SELL QUESTIONS ====================

const SELL_QUESTIONS: Question[] = [
  createButtonQuestion(
    'sellingReason',
    "What's your main reason for selling?",
    'sellingReason',
    [
      {
        id: 'relocate',
        label: 'Relocating',
        value: 'relocating',
        tracker: {
          insight: "Big move coming — let's make this transition seamless",
          dbMessage: 'Matching you with top agents in your new city...',
        },
      },
      {
        id: 'upsize',
        label: 'Upsizing',
        value: 'upsizing',
        tracker: {
          insight: "Growing family? Let's get you more space",
          dbMessage: 'Finding homes with extra bedrooms in your budget...',
        },
      },
      {
        id: 'downsize',
        label: 'Downsizing',
        value: 'downsizing',
        tracker: {
          insight: "Ready for easier living — let's unlock your equity",
          dbMessage: 'Searching low-maintenance luxury options...',
        },
      },
      {
        id: 'investment',
        label: 'Investment',
        value: 'investment',
        tracker: {
          insight: "Time to cash in — let's maximize your return",
          dbMessage: 'Running full investment analysis and 1031 exchange options...',
        },
      },
    ],
    { order: 10 }
  ),

  createLocationQuestion('Where is your property located?', { order: 20 }),

  createButtonQuestion(
    'budget',
    'What do you think your home is worth?',
    'budget',
    [
      {
        id: 'b1',
        label: 'Under $400k',
        value: 'under $400,000',
        tracker: {
          insight: "Let's see if we can get you more",
          dbMessage: 'Running comparable analysis...',
        },
      },
      {
        id: 'b2',
        label: '$400k-$600k',
        value: '$400,000-$600,000',
        tracker: {
          insight: 'Solid range — strong buyer pool here',
          dbMessage: 'Analyzing recent sales in your range...',
        },
      },
      {
        id: 'b3',
        label: '$600k-$800k',
        value: '$600,000-$800,000',
        tracker: {
          insight: 'Premium territory — qualified buyers only',
          dbMessage: 'Finding luxury comps...',
        },
      },
      {
        id: 'b4',
        label: '$800k+',
        value: 'over $800,000',
        tracker: {
          insight: 'High-end market — different playbook applies',
          dbMessage: 'Accessing luxury market data...',
        },
      },
    ],
    { order: 25 }
  ),

  { ...TIMELINE_QUESTION, text: 'When are you looking to sell?' },

  createEmailQuestion({ order: 90 }),
];

// ==================== BROWSE QUESTIONS ====================

const BROWSE_QUESTIONS: Question[] = [
  createButtonQuestion(
    'interest',
    'What are you most curious about?',
    'interest',
    [
      {
        id: 'prices',
        label: 'Current home prices',
        value: 'prices',
        tracker: {
          insight: 'People love talking numbers',
          dbMessage: 'Loading latest MLS data...',
        },
      },
      {
        id: 'trends',
        label: 'Market trends',
        value: 'trends',
        tracker: {
          insight: 'The crystal ball is warming up...',
          dbMessage: 'Analyzing 18-month price velocity...',
        },
      },
      {
        id: 'hot',
        label: 'Hot neighborhoods',
        value: 'hot-areas',
        tracker: {
          insight: 'Time for the heat map',
          dbMessage: 'Ranking areas by days-on-market and appreciation...',
        },
      },
      {
        id: 'worth',
        label: 'What my home is worth',
        value: 'valuation',
        tracker: {
          insight: "Everyone's favorite question",
          dbMessage: 'Running instant CMA with 47 data points...',
        },
      },
    ],
    { order: 10 }
  ),

  createLocationQuestion('Which area are you curious about?', { order: 20 }),

  createButtonQuestion(
    'budget',
    'What price range interests you?',
    'budget',
    [
      {
        id: 'b1',
        label: 'Under $400k',
        value: 'under $400,000',
        tracker: {
          insight: 'Entry-level market insights coming up',
          dbMessage: 'Loading starter home data...',
        },
      },
      {
        id: 'b2',
        label: '$400k-$600k',
        value: '$400,000-$600,000',
        tracker: {
          insight: 'The most active price band',
          dbMessage: 'Analyzing mid-market trends...',
        },
      },
      {
        id: 'b3',
        label: '$600k-$800k',
        value: '$600,000-$800,000',
        tracker: {
          insight: 'Move-up market territory',
          dbMessage: 'Finding premium market insights...',
        },
      },
      {
        id: 'b4',
        label: '$800k+',
        value: 'over $800,000',
        tracker: {
          insight: 'Luxury market deep dive',
          dbMessage: 'Accessing high-end market analytics...',
        },
      },
    ],
    { order: 25 }
  ),

  { ...TIMELINE_QUESTION, text: 'Are you planning to act on this soon?' },

  {
    ...createEmailQuestion({ order: 90 }),
    required: false,
    text: 'Want weekly market reports sent to your inbox?',
  },
];

// ==================== KNOWLEDGE REQUIREMENTS ====================

/**
 * Defines what Qdrant knowledge is needed for each phase
 * This drives:
 * - Phase-specific queries during generation
 * - Dashboard guidance for agent uploads
 * - Knowledge coverage tracking
 */
const KNOWLEDGE_REQUIREMENTS: KnowledgeRequirements = {
  buy: {
    'financial-prep': {
      description: 'Pre-approval process and financing tips',
      searchTags: ['pre-approval', 'mortgage', 'credit', 'financing', 'loan', 'down-payment'],
      priority: 'critical',
      minItems: 3,
      exampleContent: 'In Austin, getting pre-approved typically takes 3-5 days. I recommend starting with a local lender because they often have better relationships with title companies and can close faster.',
      usageHint: 'Use this to help buyers understand the pre-approval timeline, lender recommendations, and financing options for their area',
    },
    'house-hunting': {
      description: 'Property search strategies and neighborhood insights',
      searchTags: ['house-hunting', 'neighborhoods', 'property-search', 'open-house', 'search-strategy'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'In the Austin market, homes typically go pending within 5-7 days. Set up instant alerts and be ready to tour homes the same day they hit the market.',
      usageHint: 'Help buyers understand the pace of their market and effective search strategies',
    },
    'make-offer': {
      description: 'Offer strategy and negotiation tactics',
      searchTags: ['offer', 'negotiation', 'bidding', 'contingencies', 'earnest-money', 'escalation'],
      priority: 'critical',
      minItems: 3,
      exampleContent: 'In competitive markets, consider writing a personal letter to the seller. It might sound old-fashioned, but I\'ve seen it make the difference in multiple-offer situations.',
      usageHint: 'Provide specific negotiation tactics and offer-writing tips for the local market',
    },
    'under-contract': {
      description: 'Inspection, appraisal, and due diligence guidance',
      searchTags: ['inspection', 'appraisal', 'due-diligence', 'repairs', 'contingency', 'option-period'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'Always attend your home inspection in person. The inspector will point out things that aren\'t in the report, and you\'ll get a much better sense of the home\'s condition.',
      usageHint: 'Guide buyers through the due diligence process with practical advice',
    },
    'closing': {
      description: 'Closing process and final steps',
      searchTags: ['closing', 'title', 'escrow', 'final-walkthrough', 'wire-fraud', 'closing-costs'],
      priority: 'critical',
      minItems: 2,
      exampleContent: 'Wire fraud is a real threat. Never wire money based on email instructions alone. Always call your title company using a number you found independently to verify wiring instructions.',
      usageHint: 'Prepare buyers for closing day with practical tips and important warnings',
    },
    'post-closing': {
      description: 'Move-in tips and new homeowner advice',
      searchTags: ['move-in', 'homeowner', 'maintenance', 'warranty', 'utilities', 'homestead'],
      priority: 'low',
      minItems: 1,
      exampleContent: 'Don\'t forget to file your homestead exemption! In Texas, this can save you thousands on property taxes, but you have to apply within the first year.',
      usageHint: 'Help new homeowners get settled and avoid common mistakes',
    },
  },
  sell: {
    'home-prep': {
      description: 'Home preparation and staging advice',
      searchTags: ['staging', 'home-prep', 'declutter', 'repairs', 'curb-appeal', 'updates'],
      priority: 'critical',
      minItems: 3,
      exampleContent: 'The best ROI improvements are usually paint, flooring, and landscaping. A fresh coat of neutral paint can make a home feel 10 years newer.',
      usageHint: 'Guide sellers on which improvements are worth the investment for their price point',
    },
    'set-price': {
      description: 'Pricing strategy and market analysis',
      searchTags: ['pricing', 'cma', 'market-analysis', 'listing-price', 'valuation'],
      priority: 'critical',
      minItems: 2,
      exampleContent: 'Price it right the first time. Homes that sit on the market over 30 days often end up selling for less than if they had been priced correctly from the start.',
      usageHint: 'Help sellers understand pricing strategy and market dynamics',
    },
    'list-property': {
      description: 'Listing optimization and photography tips',
      searchTags: ['listing', 'photography', 'mls', 'description', 'marketing-materials'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'Professional photography is non-negotiable. Listings with professional photos get 118% more views online and sell 32% faster.',
      usageHint: 'Emphasize the importance of professional marketing materials',
    },
    'marketing-showings': {
      description: 'Marketing strategy and showing preparation',
      searchTags: ['showings', 'open-house', 'marketing', 'feedback', 'price-adjustment'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'For showings, remove personal photos and family heirlooms. Buyers need to envision themselves in the space, which is hard when they\'re looking at your wedding photos.',
      usageHint: 'Help sellers maximize showing effectiveness and handle feedback',
    },
    'review-offers': {
      description: 'Offer evaluation and negotiation strategy',
      searchTags: ['offers', 'negotiation', 'counter-offer', 'multiple-offers', 'terms'],
      priority: 'critical',
      minItems: 2,
      exampleContent: 'Don\'t just look at the price. A cash offer at $10k less might actually net you more than a financed offer at full price after factoring in appraisal risk and faster closing.',
      usageHint: 'Guide sellers through evaluating and negotiating offers',
    },
    'under-contract-sell': {
      description: 'Managing buyer due diligence as seller',
      searchTags: ['inspection-response', 'repairs', 'appraisal', 'seller-disclosure', 'negotiations'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'When responding to repair requests, offering credits is often better than making repairs yourself. It costs you the same but gives you more control over the timeline.',
      usageHint: 'Help sellers navigate the contract period and repair negotiations',
    },
    'closing-sell': {
      description: 'Closing process from seller perspective',
      searchTags: ['closing', 'proceeds', 'moving', 'possession', 'final-walkthrough'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'Leave the home cleaner than you found it. Remove all personal items, sweep the garage, and leave any manuals or warranties for appliances you\'re leaving behind.',
      usageHint: 'Prepare sellers for a smooth closing and transition',
    },
  },
  browse: {
    'understand-options': {
      description: 'Real estate options overview',
      searchTags: ['rent-vs-buy', 'options', 'getting-started', 'real-estate-101'],
      priority: 'medium',
      minItems: 2,
      exampleContent: 'The rent-vs-buy decision depends on how long you plan to stay. Generally, if you\'ll be somewhere less than 3 years, renting often makes more financial sense.',
      usageHint: 'Help browsers understand their options without being pushy',
    },
    'financial-education': {
      description: 'Real estate financial education',
      searchTags: ['mortgage-basics', 'down-payment', 'credit-score', 'affordability', 'costs'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'A common rule of thumb: your monthly housing payment (including taxes and insurance) shouldn\'t exceed 28% of your gross monthly income.',
      usageHint: 'Educate browsers on financial aspects of homeownership',
    },
    'market-research': {
      description: 'Market research guidance',
      searchTags: ['market-trends', 'neighborhoods', 'appreciation', 'inventory', 'schools'],
      priority: 'high',
      minItems: 2,
      exampleContent: 'Don\'t just look at price trends. Look at days on market, price per square foot, and how many listings are going pending vs expiring.',
      usageHint: 'Guide browsers on how to research and understand the market',
    },
    'decision-time': {
      description: 'Decision-making guidance',
      searchTags: ['readiness', 'timing', 'decision', 'pre-qualification', 'next-steps'],
      priority: 'medium',
      minItems: 1,
      exampleContent: 'There\'s never a "perfect" time to buy. What matters most is your personal financial situation and timeline, not trying to time the market.',
      usageHint: 'Help browsers evaluate their readiness and make informed decisions',
    },
    'next-steps': {
      description: 'Taking action guidance',
      searchTags: ['getting-started', 'agent-consultation', 'action-plan'],
      priority: 'low',
      minItems: 1,
      exampleContent: 'Ready to take the next step? A no-pressure consultation with a local agent can help you understand your options without any commitment.',
      usageHint: 'Provide a clear path forward for browsers ready to take action',
    },
  },
};

// ==================== PROMPT BUILDER ====================

/**
 * Format phase-specific advice for prompt injection
 * Creates a structured section showing advice for each phase
 */
function formatPhaseSpecificAdvice(
  phases: { id: string; name: string }[],
  phaseAdvice?: Map<string, { advice: string; tags: string[] }[]>
): string {
  if (!phaseAdvice || phaseAdvice.size === 0) {
    return 'No phase-specific knowledge available. Use general best practices.';
  }

  const sections: string[] = [];

  for (const phase of phases) {
    const adviceItems = phaseAdvice.get(phase.id);
    if (!adviceItems || adviceItems.length === 0) continue;

    const adviceText = adviceItems
      .map((item, i) => `  ${i + 1}. [${item.tags.slice(0, 3).join(', ')}] ${item.advice}`)
      .join('\n');

    sections.push(`**${phase.name} (${phase.id}):**\n${adviceText}`);
  }

  if (sections.length === 0) {
    return 'No phase-specific knowledge available. Use general best practices.';
  }

  return sections.join('\n\n');
}

function buildTimelinePrompt(
  userInput: Record<string, string>,
  context: PromptContext
): string {
  // Map browse to buy for MVP (browse is commented out)
  const rawFlow = userInput.intent || context.intent || 'buy';
  const flow = (rawFlow === 'browse' ? 'buy' : rawFlow) as 'buy' | 'sell';
  const template = getFlowTemplate(flow);
  let phases = getTemplatePhases(flow);

  // Adjust phases based on user's timeline
  if (userInput.timeline) {
    const userMonths = parseUserTimeline(userInput.timeline);
    phases = adjustPhaseTimelines(phases, { userTimeline: userInput.timeline });
    phases = removeOptionalPhasesIfNeeded(phases, userMonths);
  }

  // Filter phases based on current stage
  if (userInput.currentStage || userInput.preApproved) {
    phases = filterPhasesByStage(phases, {
      currentStage: userInput.currentStage,
      userResponses: userInput,
    });
  }

  // Format advice - prefer phase-specific, fall back to legacy format
  const hasPhaseAdvice = context.phaseAdvice && context.phaseAdvice.size > 0;
  const phaseAdviceFormatted = hasPhaseAdvice
    ? formatPhaseSpecificAdvice(phases, context.phaseAdvice)
    : formatAgentAdvice(context.qdrantAdvice);

  const userSituation: Partial<UserSituation> = {
    flow,
    timeline: userInput.timeline,
    location: userInput.location || userInput.propertyAddress || 'your area',
    budget: userInput.budget || 'flexible',
    currentStage: userInput.currentStage,
    isFirstTime:
      userInput.isFirstTime === 'true' ||
      userInput.firstTimeHomebuyer === 'yes' ||
      userInput.buyingReason === 'first-time',
  };

  const situationDescription = formatUserSituation(userSituation as UserSituation);

  const outputSchemaExample = {
    title: `Your Personal ${flow === 'buy' ? 'Home Buying' : flow === 'sell' ? 'Home Selling' : 'Real Estate'} Timeline`,
    subtitle: `Customized for ${situationDescription}`,
    userSituation,
    phases: phases.slice(0, 2).map((phase, index) => ({
      id: phase.id,
      name: phase.name,
      timeline: phase.baseTimeline,
      description: phase.description,
      actionItems: phase.suggestedActionItems.slice(0, 3).map((task) => ({
        task,
        priority: 'high' as const,
      })),
      agentAdvice: ['Agent-specific tip for this phase'],
      order: index + 1,
    })),
    totalEstimatedTime: template.defaultTotalTime,
    disclaimer: generateDisclaimer(flow),
  };

  // Build instructions with phase-specific or general knowledge section
  const knowledgeSection = hasPhaseAdvice
    ? `**Phase-Specific Agent Knowledge:**
${phaseAdviceFormatted}

IMPORTANT: For each phase, you MUST incorporate the relevant advice shown above into that phase's agentAdvice array.
The advice is organized by phase ID - use it for the matching phase.`
    : `**Agent's Knowledge Base (General):**
${phaseAdviceFormatted}`;

  const specificInstructions = `
SPECIFIC INSTRUCTIONS FOR REAL ESTATE TIMELINE:

**Context:**
User is a ${situationDescription}

${knowledgeSection}

**Base Template:**
${JSON.stringify(
  phases.map((p) => ({
    id: p.id,
    name: p.name,
    timeline: p.baseTimeline,
    description: p.description,
    suggestedActionItems: p.suggestedActionItems,
    conditionalNote: p.conditionalNote,
  })),
  null,
  2
)}

**Your Task:**
1. **Use the base template** as your starting structure
2. **Customize each phase** based on user's situation
3. **For each phase, provide:** name, timeline, description, 3-5 action items, 2-3 agent advice tips
4. **CRITICAL: Include phase-specific knowledge** - if advice is provided for a phase, weave it into the agentAdvice array
5. **Personalize** for their location (${userInput.location || 'their area'}), budget (${userInput.budget || 'their range'})
6. **Adjust timeline** if specified (${userInput.timeline || 'standard'})
7. **Make it valuable:** This should feel like a personalized roadmap with expert agent insights

Generate a complete timeline JSON matching the schema exactly.
`;

  return buildBasePrompt(
    'Real Estate Timeline',
    userInput,
    context,
    outputSchemaExample,
    specificInstructions
  );
}

// ==================== OUTPUT VALIDATOR ====================

function validateTimelineOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { valid: false, errors: ['Output must be an object'] };
  }

  const o = output as Partial<TimelineOutput>;
  const { valid, errors, warnings } = validateTimelineStructure(o);

  const allErrors = [...errors];
  const allWarnings = [...warnings];

  if (o.title && o.title.length < 10) {
    allWarnings.push('Title is very short');
  }

  if (o.phases && o.phases.length > 10) {
    allWarnings.push('Timeline has more than 10 phases');
  }

  if (o.phases) {
    const totalActionItems = countActionItems(o.phases);
    if (totalActionItems < 10) {
      allWarnings.push(`Only ${totalActionItems} action items`);
    }
  }

  if (o.userSituation && !o.userSituation.flow) {
    allErrors.push('User situation must include flow type');
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    normalized: allErrors.length === 0 ? output : undefined,
  };
}

// ==================== POST-PROCESSOR ====================

function postProcessTimeline(
  output: TimelineOutput,
  userInput: Record<string, string>
): TimelineOutput {
  const sortedPhases = [...output.phases].sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalTime = output.totalEstimatedTime || calculateTotalTime(sortedPhases);
  const disclaimer = output.disclaimer || generateDisclaimer(output.userSituation.flow);

  const processedPhases: TimelinePhase[] = sortedPhases.map((phase, index) => ({
    ...phase,
    order: phase.order || index + 1,
    agentAdvice: phase.agentAdvice || [],
    actionItems: phase.actionItems || [],
  }));

  return {
    ...output,
    phases: processedPhases,
    totalEstimatedTime: totalTime,
    disclaimer,
    metadata: {
      ...output.metadata,
      generatedBy: 'AI Assistant',
      phasesCount: processedPhases.length,
      totalActionItems: countActionItems(processedPhases),
    },
  };
}

// ==================== FALLBACK TEMPLATE ====================

const TIMELINE_FALLBACK: TimelineOutput = {
  id: 'timeline-fallback',
  type: 'real-estate-timeline',
  businessName: '',
  flow: '',
  generatedAt: '',
  version: '2.0.0',
  title: 'Your Real Estate Timeline',
  subtitle: 'General guide to the process',
  userSituation: { flow: 'buy' },
  phases: [
    {
      id: 'getting-started',
      name: 'Getting Started',
      timeline: 'Week 1-2',
      description: 'Begin your real estate journey with proper preparation.',
      actionItems: [
        { task: 'Connect with a real estate agent', priority: 'high' },
        { task: 'Understand your budget and financing options', priority: 'high' },
        { task: 'Research your target area', priority: 'medium' },
      ],
      agentAdvice: ['Reach out to discuss your specific needs and goals.'],
      order: 1,
    },
    {
      id: 'taking-action',
      name: 'Taking Action',
      timeline: 'Week 2+',
      description: 'Work with your agent to move forward.',
      actionItems: [
        { task: 'Schedule a consultation', priority: 'high' },
        { task: 'Prepare your questions', priority: 'medium' },
      ],
      agentAdvice: ['Contact us for a personalized plan.'],
      order: 2,
    },
  ],
  totalEstimatedTime: '4-6 months',
  disclaimer: 'This is a general timeline. Contact us for personalized guidance.',
};

// ==================== UNIFIED OFFER ====================

export const TIMELINE_OFFER: UnifiedOffer<TimelineOutput> = {
  // ==================== IDENTITY ====================
  type: 'real-estate-timeline',
  label: 'Personalized Timeline',
  description: 'Step-by-step guide tailored to your timeline and goals',
  icon: '📅',

  // ==================== INTENT SUPPORT ====================
  supportedIntents: ['buy', 'sell', 'browse'],

  // ==================== QUESTIONS ====================
  questions: {
    buy: BUY_QUESTIONS,
    sell: SELL_QUESTIONS,
    browse: BROWSE_QUESTIONS,
  },

  // ==================== TRACKING UI ====================
  tracking: {
    icon: 'Calendar',
    color: '#3b82f6', // Blue
    progressStyle: 'steps',
    fields: {
      buyingReason: {
        icon: 'Target',
        label: 'Goal',
        priority: 1,
        preview: true,
      },
      sellingReason: {
        icon: 'Target',
        label: 'Goal',
        priority: 1,
        preview: true,
      },
      interest: {
        icon: 'Lightbulb',
        label: 'Interest',
        priority: 1,
        preview: true,
      },
      location: {
        icon: 'MapPin',
        label: 'Location',
        priority: 2,
        preview: true,
      },
      budget: {
        icon: 'DollarSign',
        label: 'Budget',
        priority: 3,
        preview: true,
      },
      timeline: {
        icon: 'Clock',
        label: 'Timeline',
        priority: 4,
        preview: true,
      },
      preApproved: {
        icon: 'CheckCircle',
        label: 'Pre-Approved',
        priority: 5,
        preview: false,
      },
      email: {
        icon: 'Mail',
        label: 'Contact',
        priority: 10,
        preview: false,
      },
    },
  },

  // ==================== GENERATION ====================
  generation: {
    model: 'gpt-4o-mini',
    maxTokens: 6000,
    temperature: 0.7,
    buildPrompt: buildTimelinePrompt,
    outputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Timeline title',
          required: true,
          example: 'Your Personal Home Buying Timeline',
        },
        subtitle: {
          type: 'string',
          description: 'Descriptive subtitle',
          required: true,
          example: 'Customized for first-time buyers in Austin, TX',
        },
        phases: {
          type: 'array',
          description: 'Timeline phases with action items',
          required: true,
        },
        totalEstimatedTime: {
          type: 'string',
          description: 'Total timeline estimate',
          required: true,
          example: '5-7 months',
        },
        disclaimer: {
          type: 'string',
          description: 'Legal disclaimer',
          required: true,
        },
      },
      outputType: 'TimelineOutput',
    },
    validateOutput: validateTimelineOutput,
    postProcess: postProcessTimeline,
  },

  // ==================== RESULTS DISPLAY ====================
  results: {
    title: 'Your Personalized Timeline',
    subtitle: 'Step-by-step guide for your {intent} journey',
    previewComponent: 'TimelinePreview',
    ctaText: 'View Full Timeline',
    downloadable: true,
    shareable: true,
  },

  // ==================== FALLBACK ====================
  fallback: {
    strategy: 'use-template',
    template: TIMELINE_FALLBACK,
    maxRetries: 2,
  },

  // ==================== KNOWLEDGE REQUIREMENTS ====================
  knowledgeRequirements: KNOWLEDGE_REQUIREMENTS,

  // ==================== METADATA ====================
  version: '2.0.0',
  category: 'lead-generation',
  enabledByDefault: true,
  questionPriority: 20,
};

// ==================== REGISTER ====================

registerOffer(TIMELINE_OFFER);
