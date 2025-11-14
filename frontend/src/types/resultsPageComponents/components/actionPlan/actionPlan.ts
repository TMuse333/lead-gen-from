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

    // actionPlan.ts

steps: {
  type: 'array',
  description: 'Array of personalized action steps in priority order',
  required: true,
  constraints: {
    minLength: 2,
    maxLength: 5,
  },
  items: {
    type: 'object',
    description: 'A single action step card',
    required: true,
    fields: {
      stepNumber: {
        type: 'number',
        description: 'Step number (1, 2, 3...)',
        required: true,
        example: 1,
      },
      title: {
        type: 'string',
        description: 'Clear, action-oriented title',
        required: true,
        constraints: { wordCount: '4-10 words' },
        example: 'Define Your Budget and Preferences',
      },
      description: {
        type: 'string',
        description: 'Detailed explanation of what to do and why',
        required: true,
        constraints: { wordCount: '25-50 words' },
        example: 'Consider your must-haves, nice-to-haves, and budget range...',
      },
      benefit: {
        type: 'string',
        description: 'Why this step matters — creates motivation',
        required: false,
        example: 'Helps you avoid falling in love with condos outside your range',
      },
      timeline: {
        type: 'string',
        description: 'When this should be done',
        required: true,
        example: 'Next 2-4 weeks',
      },
      urgency: {
        type: 'enum',
        description: 'Visual urgency styling',
        required: true,
        constraints: {
          options: ['immediate', 'soon', 'later'],
        },
        example: 'soon',
      },
      priority: {
        type: 'number',
        description: 'Used for ordering (lower = higher priority)',
        required: true,
        example: 1,
      },
      resourceText: {
        type: 'string',
        description: 'CTA button text',
        required: false,
        example: 'Schedule a Consultation',
      },
      resourceLink: {
        type: 'string',
        description: 'URL or path for the CTA',
        required: false,
        example: '/schedule-consultation',
      },
      imageUrl: {
        type: 'string',
        description: 'Optional image for the card',
        required: false,
        example: '/images/budget.jpg',
      },
    },
  },
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