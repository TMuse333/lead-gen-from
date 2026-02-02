// lib/offers/definitions/realEstateTimeline.ts
/**
 * Real Estate Timeline Offer Definition
 * Generates personalized timelines for buyers/sellers based on conversation
 */

import type {
  OfferDefinition,
  InputRequirements,
  OutputSchema,
  ValidationResult,
} from '../core/types';
import { createCostEstimator } from '../core/costEstimator';
import { DEFAULT_RETRY_CONFIG } from '../core/types';
import { createVersion } from '../core/versionControl';
import { buildBasePrompt } from '../promptBuilders/promptHelpers';

import type {
  TimelineOutput,
  TimelineInput,
  TimelinePhase,
  UserSituation,
} from './timeline/timeline-types';
import {
  getFlowTemplate,
  getTemplatePhases,
} from './timeline/timeline-templates';
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
} from './timeline/timeline-helpers';

// ==================== INPUT REQUIREMENTS ====================

const INPUT_REQUIREMENTS: InputRequirements = {
  requiredFields: [
    'flow',      // Must know: buy/sell/browse
    'timeline',  // Must know: 3 months? 12 months? (affects timeline compression)
    // Note: location and budget are optional with fallbacks in prompt builder
  ],
  optionalFields: [
    'location',        // Different markets = different timelines/advice (fallback: propertyAddress or "your area")
    'budget',          // Affects property search, financing options (fallback: "not specified")
    'propertyAddress', // Useful for sellers, can substitute for location
    'isFirstTime',     // Adds more educational detail if first-time buyer/seller
    'currentStage',    // Allows skipping phases (e.g., already pre-approved)
    'preApproved',     // Skips financial preparation phase if already done
    'hasAgent',        // Skips finding agent phase if already working with one
    'propertyType',    // Single-family vs condo affects timeline
    'firstName',       // Personalization
    'lastName',        // Personalization
    'email',           // Contact information
    'buyingReason',    // Context for buyers
    'sellingReason',   // Context for sellers
    'bedrooms',        // Property requirements
  ],
  fieldValidations: {
    flow: {
      type: 'text',
      required: true,
    },
    timeline: {
      type: 'text',
      required: true,
    },
    location: {
      type: 'text',
      required: false,
      minLength: 2,
    },
    budget: {
      type: 'text',
      required: false,
    },
    email: {
      type: 'email',
      required: false,
    },
  },
};

// ==================== OUTPUT SCHEMA ====================

const OUTPUT_SCHEMA: OutputSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Timeline title (e.g., "Your Personal Home Buying Timeline")',
      required: true,
      example: 'Your Personal Home Buying Timeline',
    },
    subtitle: {
      type: 'string',
      description: 'Descriptive subtitle with user context',
      required: true,
      example: 'Customized for first-time buyers in Austin, TX',
    },
    userSituation: {
      type: 'object',
      description: 'User\'s specific situation and context',
      required: true,
      example: {
        flow: 'buy',
        timeline: '6 months',
        location: 'Austin, TX',
        budget: '$450,000',
        isFirstTime: true,
      },
    },
    phases: {
      type: 'array',
      description: 'Timeline phases with action items and advice',
      required: true,
      example: [
        {
          id: 'financial-prep',
          name: 'Financial Preparation',
          timeline: 'Week 1-2',
          description: 'Get your finances in order...',
          actionItems: [
            { task: 'Get pre-approved', priority: 'high' },
            { task: 'Review credit score', priority: 'high' },
          ],
          agentAdvice: [
            'In the Austin market, pre-approval is crucial...',
          ],
          order: 1,
        },
      ],
    },
    totalEstimatedTime: {
      type: 'string',
      description: 'Total estimated timeline',
      required: true,
      example: '5-7 months',
    },
    disclaimer: {
      type: 'string',
      description: 'Important disclaimer about timeline variability',
      required: true,
      example: 'This timeline is a general guide...',
    },
  },
  outputType: 'TimelineOutput',
};

// ==================== PROMPT BUILDER ====================

function buildTimelinePrompt(
  userInput: Record<string, string>,
  context: {
    flow: string;
    businessName: string;
    qdrantAdvice?: string[];
    additionalContext?: Record<string, any>;
  }
): string {
  // Get the base template for this flow
  // Note: 'browse' commented out for MVP - defaults to 'buy' if browse is encountered
  const rawFlow = userInput.flow || context.flow || 'buy';
  const flow = (rawFlow === 'browse' ? 'buy' : rawFlow) as 'buy' | 'sell';
  const template = getFlowTemplate(flow);
  let phases = getTemplatePhases(flow);

  // Adjust phases based on user's timeline
  if (userInput.timeline) {
    const userMonths = parseUserTimeline(userInput.timeline);
    phases = adjustPhaseTimelines(phases, {
      userTimeline: userInput.timeline,
    });
    phases = removeOptionalPhasesIfNeeded(phases, userMonths);
  }

  // Filter phases based on current stage
  if (userInput.currentStage || userInput.preApproved || userInput.hasAgent) {
    phases = filterPhasesByStage(phases, {
      currentStage: userInput.currentStage,
      userResponses: userInput,
    });
  }

  // Format agent advice
  const agentAdviceFormatted = formatAgentAdvice(context.qdrantAdvice);

  // Create user situation description with fallbacks
  const userSituation: Partial<UserSituation> = {
    flow,
    timeline: userInput.timeline,
    location: userInput.location || userInput.propertyAddress || 'your area',
    budget: userInput.budget || 'flexible',
    currentStage: userInput.currentStage,
    isFirstTime: userInput.isFirstTime === 'true' || userInput.firstTimeHomebuyer === 'yes' || userInput.buyingReason === 'first-time',
  };

  const situationDescription = formatUserSituation(userSituation as UserSituation);

  // Build output schema example
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
      agentAdvice: [
        'Agent-specific tip for this phase (pull from agent advice context)',
      ],
      order: index + 1,
    })),
    totalEstimatedTime: template.defaultTotalTime,
    disclaimer: generateDisclaimer(flow),
  };

  const specificInstructions = `
SPECIFIC INSTRUCTIONS FOR REAL ESTATE TIMELINE:

**Context:**
User is a ${situationDescription}

**Agent's Knowledge Base:**
${agentAdviceFormatted}

**Base Template:**
${JSON.stringify(phases.map(p => ({
  id: p.id,
  name: p.name,
  timeline: p.baseTimeline,
  description: p.description,
  suggestedActionItems: p.suggestedActionItems,
  conditionalNote: p.conditionalNote,
})), null, 2)}

**Your Task:**
1. **Use the base template** as your starting structure
2. **Customize each phase** based on:
   - User's specific situation (location, budget, timeline, etc.)
   - User's current stage (skip irrelevant phases)
   - Agent's knowledge from the advice context above
3. **For each phase, provide:**
   - Clear name and timeline estimate
   - 2-3 paragraph description (what happens, why it matters)
   - 3-5 action items (mix of high/medium/low priority)
   - 2-3 agent-specific advice tips (from the agent's knowledge base)
   - Optional resources if relevant
4. **Personalize the content:**
   - Reference their location (${userInput.location || userInput.propertyAddress || 'their area'})
   - Reference their budget (${userInput.budget || 'their budget range'})
   - Use their name if provided (${userInput.firstName || 'you'})
   - Make it encouraging and actionable
5. **Adjust timeline estimates** if user specified a timeline (${userInput.timeline || 'standard'})
6. **Pull agent's advice** from the knowledge base and integrate it naturally into relevant phases
7. **Keep it realistic:** Include variability notes where timelines can vary
8. **Make it valuable:** This should feel like a personalized roadmap, not a generic checklist

**Important:**
- Skip phases that don't apply (e.g., if user is pre-approved, skip financial prep)
- Include ${phases.length} phases total
- Each phase should have 3-5 action items
- Prioritize actionable, specific advice over generic tips
- Use the agent's voice and knowledge throughout

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
    return {
      valid: false,
      errors: ['Output must be an object'],
    };
  }

  const o = output as Partial<TimelineOutput>;
  const { valid, errors, warnings } = validateTimelineStructure(o);

  // Additional specific validations
  const allErrors = [...errors];
  const allWarnings = [...warnings];

  // Validate title
  if (o.title && o.title.length < 10) {
    allWarnings.push('Title is very short (less than 10 characters)');
  }

  // Validate phases count
  if (o.phases && o.phases.length > 10) {
    allWarnings.push('Timeline has more than 10 phases - consider consolidating');
  }

  // Validate action items
  if (o.phases) {
    const totalActionItems = countActionItems(o.phases);
    if (totalActionItems < 10) {
      allWarnings.push(`Only ${totalActionItems} total action items - consider adding more detail`);
    }
  }

  // Validate user situation
  if (o.userSituation) {
    if (!o.userSituation.flow) {
      allErrors.push('User situation must include flow type');
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    normalized: allErrors.length === 0 ? output : undefined,
  };
}

// ==================== POST-PROCESSOR ====================

function postProcessTimelineOutput(
  output: TimelineOutput,
  userInput: Record<string, string>
): TimelineOutput {
  // Ensure phases are sorted by order
  const sortedPhases = [...output.phases].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Calculate total time if not provided
  const totalTime = output.totalEstimatedTime || calculateTotalTime(sortedPhases);

  // Generate disclaimer if not provided
  const disclaimer = output.disclaimer || generateDisclaimer(output.userSituation.flow);

  // Add metadata
  const metadata = {
    generatedBy: 'AI Assistant',
    phasesCount: sortedPhases.length,
    totalActionItems: countActionItems(sortedPhases),
  };

  // Ensure each phase has required fields
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
      ...metadata,
    },
  };
}

// ==================== OFFER DEFINITION ====================

export const REAL_ESTATE_TIMELINE_DEFINITION: OfferDefinition<TimelineOutput> = {
  // Identity
  type: 'real-estate-timeline',
  label: 'Real Estate Timeline',
  description: 'Personalized timeline for buyers/sellers showing step-by-step process',
  icon: '📅',

  // Version
  version: createVersion(
    '1.0.0',
    'Initial release of Real Estate Timeline generator',
    false
  ),

  // Input requirements
  inputRequirements: INPUT_REQUIREMENTS,

  // Prompt generation
  buildPrompt: buildTimelinePrompt,

  // Output structure
  outputSchema: OUTPUT_SCHEMA,
  outputValidator: validateTimelineOutput,

  // Post-processing
  postProcess: postProcessTimelineOutput,

  // Generation metadata
  generationMetadata: {
    model: 'gpt-4o-mini',
    maxTokens: 6000, // Longer for detailed timelines
    temperature: 0.7,
  },

  // Retry & Fallback
  retryConfig: DEFAULT_RETRY_CONFIG,
  fallbackConfig: {
    strategy: 'use-template',
    template: {
      id: 'timeline-fallback',
      type: 'real-estate-timeline',
      businessName: '',
      flow: '',
      generatedAt: '',
      version: '1.0.0',
      title: 'Your Real Estate Timeline',
      subtitle: 'General guide to the process',
      userSituation: {
        flow: 'buy',
      },
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
          agentAdvice: [
            'Reach out to discuss your specific needs and goals.',
          ],
          order: 1,
        },
        {
          id: 'taking-action',
          name: 'Taking Action',
          timeline: 'Week 2+',
          description: 'Work with your agent to move forward with your real estate goals.',
          actionItems: [
            { task: 'Schedule a consultation with your agent', priority: 'high' },
            { task: 'Prepare your questions and requirements', priority: 'medium' },
          ],
          agentAdvice: [
            'Contact us to create a personalized plan for your situation.',
          ],
          order: 2,
        },
      ],
      totalEstimatedTime: '4-6 months',
      disclaimer: 'This is a general timeline. Contact us for a personalized plan based on your specific situation.',
    },
  },

  // Cost Estimation
  estimateCost: createCostEstimator('gpt-4o-mini', 6000),
};
