import { SchemaField } from '../../schemas';

// ------------------------------------------
// Action Plan Schema
// ------------------------------------------

export const ACTION_PLAN_SCHEMA: {
  componentName: string;
  description: string;
  fields: Record<string, SchemaField>;
} = {
  componentName: 'actionPlan',
  description:
    'The action plan is the highest-value component that delivers personalized, actionable guidance. Steps are displayed as a carousel of cards, each representing a specific action the user should take. This component uses Qdrant advice to provide Chris\'s expert recommendations tailored to the user\'s situation.',

  fields: {
    sectionTitle: {
      type: 'string',
      description: 'Main heading for the action plan section',
      required: true,
      constraints: {
        wordCount: '3-6 words',
        tone: 'action-oriented, empowering',
      },
      example: 'Your Personalized Action Plan',
      context:
        'Should feel motivating and make the user excited to take action. Consider their timeline: "Your 3-Month Selling Roadmap" or "Let\'s Get Started on Your Home Search"',
    },

    introText: {
      type: 'string',
      description: 'Brief introduction explaining the action plan',
      required: false,
      constraints: {
        wordCount: '20-35 words',
        tone: 'encouraging, clear, supportive',
      },
      example:
        'Based on your timeline and goals, here are the key steps to ensure a successful sale. Each action is prioritized to help you move efficiently toward your goal.',
      context:
        'Sets expectations and builds confidence. Should reference their specific situation (timeline, goal) and reassure them this plan is personalized.',
    },

    steps: {
      type: 'array',
      description:
        'Array of action steps, each representing a specific task the user should complete',
      required: true,
      constraints: {
        minLength: 1,
        maxLength: 5,
      },
      context:
        'Steps should be ordered by priority/urgency. Number of steps varies based on user complexity: urgent timelines might have 3 focused steps, planned approaches might have 5 detailed steps. Each step must be actionable and clear.',
      example: [
        {
          stepNumber: 1,
          title: 'Get Professional Home Valuation',
          description:
            'Schedule a comprehensive market analysis to understand your home\'s current value. This establishes your baseline and helps set the right listing price.',
          benefit:
            'Accurate pricing from day one means faster sale and maximum value',
          resourceLink: '/book-valuation',
          resourceText: 'Schedule Free Valuation',
          imageUrl: '/images/valuation.jpg',
          priority: 1,
          urgency: 'immediate',
          timeline: 'This week',
        },
      ],
    },

    closingNote: {
      type: 'string',
      description:
        'Optional closing statement that encourages action or offers support',
      required: false,
      constraints: {
        wordCount: '15-25 words',
        tone: 'supportive, available, warm',
      },
      example:
        'I\'m here to guide you through each step. Let\'s connect soon to get started on your journey.',
      context:
        'Should remind them Chris is available to help and create a bridge to taking the first action. Can reference booking a call or asking questions.',
    },

    overallUrgency: {
      type: 'enum',
      description:
        'Overall urgency level of the entire action plan, affects visual styling',
      required: false,
      constraints: {
        options: ['high', 'medium', 'low'],
      },
      context:
        'high = 0-3 month timeline (needs immediate action), medium = 3-6 month timeline (steady progress), low = 6+ months (exploratory, no rush)',
    },
  },
};

// ------------------------------------------
// Action Step Schema (nested within steps array)
// ------------------------------------------

// This defines the structure for each individual step
const ACTION_STEP_FIELDS = {
  stepNumber: {
    type: 'number',
    description: 'The sequential number of this step (1, 2, 3, etc.)',
    required: true,
    example: 1,
    context:
      'Used for visual display and ordering. Should match the priority order.',
  },

  title: {
    type: 'string',
    description:
      'Clear, action-oriented title for this step using imperative verbs',
    required: true,
    constraints: {
      wordCount: '3-7 words',
      tone: 'direct, actionable, clear',
    },
    example: 'Get Professional Home Valuation',
    context:
      'Start with verbs: "Get", "Schedule", "Prepare", "Review", "Complete". Should tell user exactly what action to take.',
  },

  description: {
    type: 'string',
    description:
      'Detailed explanation of what this step involves and how to accomplish it',
    required: true,
    constraints: {
      wordCount: '25-45 words',
      tone: 'clear, instructive, specific',
    },
    example:
      'Schedule a comprehensive market analysis with me to understand your home\'s current value in today\'s market. This establishes your baseline and helps us set the right listing price from day one.',
    context:
      'Should answer: What exactly do I do? Why is this step necessary? What\'s involved? Keep it actionable and specific to their situation.',
  },

  benefit: {
    type: 'string',
    description:
      'The key benefit or outcome of completing this step - the "why" behind the action',
    required: false,
    constraints: {
      wordCount: '10-20 words',
      tone: 'benefit-focused, motivating, outcome-driven',
    },
    example: 'Accurate pricing from day one means faster sale and maximum value',
    context:
      'Motivates action by showing the value. Start with the outcome: "Prevents costly mistakes", "Saves you $X", "Reduces stress", "Speeds up timeline".',
  },

  resourceLink: {
    type: 'string',
    description: 'Optional URL or route to a helpful resource related to this step',
    required: false,
    example: '/book-valuation',
    context:
      'Can be internal routes (/book-call, /get-valuation) or external URLs (photographer website, mortgage calculator, decluttering guide PDF). Only include if genuinely helpful.',
  },

  resourceText: {
    type: 'string',
    description:
      'Button/link text for the resource - tells user what the link does',
    required: false,
    constraints: {
      wordCount: '2-5 words',
      tone: 'action-oriented, clear',
    },
    example: 'Schedule Free Valuation',
    context:
      'Should clearly state the action: "Schedule Now", "Download Guide", "View Photographers", "Get Pre-Approved", "Book 15-min Call".',
  },

  imageUrl: {
    type: 'string',
    description:
      'Optional image URL that visually represents this step or action',
    required: false,
    example: '/images/steps/valuation.jpg',
    context:
      'Use relevant imagery: handshake for meetings, house for valuations, camera for photos, checklist for preparation. Keep professional and on-brand.',
  },

  priority: {
    type: 'number',
    description:
      'Numeric priority ranking (1 = highest priority, 5 = lowest priority)',
    required: true,
    constraints: {
      minLength: 1,
      maxLength: 5,
    },
    example: 1,
    context:
      'Determines the order steps appear. Priority 1 = most urgent/important. Use Qdrant advice and user timeline to determine priority. Can differ from stepNumber if steps are reorderable.',
  },

  urgency: {
    type: 'enum',
    description:
      'Urgency level for this specific step - affects visual styling',
    required: true,
    constraints: {
      options: ['immediate', 'soon', 'later'],
    },
    example: 'immediate',
    context:
      'immediate = needs to happen this week/ASAP (red/orange styling), soon = within 2-4 weeks (blue styling), later = 1+ months out (green/gray styling). Based on their overall timeline and step importance.',
  },

  timeline: {
    type: 'string',
    description: 'When the user should complete this step by',
    required: true,
    constraints: {
      wordCount: '2-6 words',
      tone: 'specific, clear, realistic',
    },
    example: 'This week',
    context:
      'Be specific but flexible: "This week", "Next 2 weeks", "Within 30 days", "Before listing", "Month 1", "By end of quarter". Should align with their overall timeline and the urgency level.',
  },
};

// ------------------------------------------
// Output Interfaces
// ------------------------------------------

export interface ActionStep {
  stepNumber: number;
  title: string;
  description: string;
  benefit?: string;
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;
  priority: number;
  urgency: 'immediate' | 'soon' | 'later';
  timeline: string;
}

export interface LlmActionPlanProps {
  sectionTitle: string;
  introText?: string;
  steps: ActionStep[];
  closingNote?: string;
  overallUrgency?: 'high' | 'medium' | 'low';
}