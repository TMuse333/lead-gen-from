import { SchemaField } from '../schemas';

// ------------------------------------------
// Next Steps CTA Schema
// ------------------------------------------

export const NEXT_STEPS_CTA_SCHEMA: {
  componentName: string;
  description: string;
  fields: Record<string, SchemaField>;
} = {
  componentName: 'nextStepsCTA',
  description:
    'The final call-to-action component that creates momentum and drives the user to take action. This is LLM-generated based on all preceding components and user data to ensure perfect personalization and tone consistency.',

  fields: {
    hook: {
      type: 'string',
      description:
        'Opening line that creates urgency/momentum specific to their situation',
      required: true,
      constraints: {
        wordCount: '15-25 words',
        tone: 'urgent but not pushy, specific to their situation',
      },
      example:
        'With homes selling in 28 days and your 3-month timeline, every week counts. Let\'s get you positioned to sell quickly and profitably.',
      context:
        'Must reference: (1) their specific timeline/urgency, (2) market condition, (3) their goal. Should create FOMO without being aggressive.',
    },

    keyRecap: {
      type: 'array',
      description:
        'Quick visual recap of 3-4 key points (their situation + our plan)',
      required: true,
      constraints: {
        minLength: 3,
        maxLength: 4,
      },
      context:
        'Ultra-short bullets that remind them what we learned and what we\'re doing. Visual and scannable with emojis.',
      example: [
        {
          icon: '⏰',
          label: 'Timeline',
          value: '0-3 months',
        },
      ],
    },

    transitionText: {
      type: 'string',
      description: 'Bridge from recap to CTA',
      required: true,
      constraints: {
        wordCount: '10-15 words',
        tone: 'confident, forward-looking',
      },
      example: 'Now let\'s make it happen. Here\'s how we get started:',
      context:
        'Smooth transition that builds confidence and points toward action.',
    },

    primaryCTA: {
      type: 'object',
      description: 'Main call-to-action button',
      required: true,
      context:
        'The primary action you want them to take. Must be flow-specific and compelling.',
    },

    secondaryCTA: {
      type: 'object',
      description: 'Lower-commitment alternative CTA',
      required: true,
      context:
        'Always provide an alternative path. Some users aren\'t ready for primary action.',
    },

    trustElements: {
      type: 'array',
      description: 'Trust/credibility points to overcome objections',
      required: true,
      constraints: {
        minLength: 2,
        maxLength: 3,
      },
      context:
        'Specific, credible statements that build confidence. Use numbers when possible.',
      example: [
        'No obligation, ever',
        '150+ families helped',
        'Free 15-minute consultation',
      ],
    },

    personalNote: {
      type: 'object',
      description: 'Final personal message from Chris',
      required: true,
      context:
        'Warm, authentic, direct message that makes them feel like Chris is personally invested in helping them.',
    },
  },
};

// ------------------------------------------
// Nested Object Schemas
// ------------------------------------------

const KEY_RECAP_ITEM_FIELDS = {
  icon: {
    type: 'string',
    description: 'Emoji representing this point',
    required: true,
    constraints: { maxLength: 2 },
    example: '⏰',
  },
  label: {
    type: 'string',
    description: 'Category label',
    required: true,
    constraints: { wordCount: '1-3 words' },
    example: 'Timeline',
  },
  value: {
    type: 'string',
    description: 'The actual value or fact',
    required: true,
    constraints: { wordCount: '2-6 words' },
    example: '0-3 months',
  },
};

const CTA_BUTTON_FIELDS = {
  text: {
    type: 'string',
    description: 'Button text - action-oriented',
    required: true,
    constraints: { wordCount: '2-5 words' },
    example: 'Schedule Free Valuation',
  },
  subtext: {
    type: 'string',
    description: 'What they get or time commitment',
    required: true,
    constraints: { wordCount: '5-10 words' },
    example: 'Get pricing strategy within 24 hours',
  },
  urgencyNote: {
    type: 'string',
    description: 'Optional urgency indicator',
    required: false,
    constraints: { wordCount: '3-7 words' },
    example: 'Limited availability this week',
  },
};

const PERSONAL_NOTE_FIELDS = {
  message: {
    type: 'string',
    description: 'Personal message from Chris',
    required: true,
    constraints: {
      wordCount: '20-30 words',
      tone: 'warm, authentic, personal',
    },
    example:
      'I\'ve helped over 20 families in tight timelines like yours. Every situation is unique, and I\'d love to understand yours better. Let\'s connect soon.',
  },
  signature: {
    type: 'string',
    description: 'Name signature',
    required: true,
    example: 'Chris',
  },
};

// ------------------------------------------
// Output Interfaces
// ------------------------------------------

export interface KeyRecapItem {
  icon: string;
  label: string;
  value: string;
}

export interface CTAButton {
  text: string;
  subtext: string;
  urgencyNote?: string;
}

export interface PersonalNote {
  message: string;
  signature: string;
}

export interface LlmNextStepsCTA {
  hook: string;
  keyRecap: KeyRecapItem[];
  transitionText: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  trustElements: string[];
  personalNote: PersonalNote;
}