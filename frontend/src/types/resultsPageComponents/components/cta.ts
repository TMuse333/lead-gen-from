import { ComponentSchema, SchemaField } from '../schemas';

// ------------------------------------------
// Next Steps CTA Schema
// ------------------------------------------

// Updated NEXT_STEPS_CTA_SCHEMA
// lib/llmSchemas.ts → NEXT_STEPS_CTA_SCHEMA (FINAL VERSION)

export const NEXT_STEPS_CTA_SCHEMA: ComponentSchema = {
  componentName: 'nextStepsCTA',
  description: 'Final CTA section with momentum, recap, and personal touch from Chris',
  fields: {
    hook: {
      type: 'string',
      description: 'Opening hook that creates urgency and momentum based on user timeline and market',
      required: true,
      constraints: {
        wordCount: '15-25 words',
        tone: 'confident, personalized, forward-looking',
      },
      example: 'With a 6-12 month timeline and rising condo demand, now is the perfect window to find your ideal home.',
    },

    keyRecap: {
      type: 'array',
      description: '3–4 visual recap cards summarizing the user’s situation and our plan',
      required: true,
      constraints: { minLength: 3, maxLength: 4 },
      items: {
        type: 'object',
        description: 'Single recap card',
        required: true,
        fields: {
          icon: {
            type: 'string',
            description: 'Lucide icon name (e.g. home, calendar, dollar-sign, target)',
            required: true,
            example: 'home',
            context: 'Use lowercase hyphenated names: home, calendar, dollar-sign, map-pin, target, clock',
          },
          label: {
            type: 'string',
            description: 'Short descriptive label',
            required: true,
            example: 'Property Type',
          },
          value: {
            type: 'string',
            description: 'Exact value from user input',
            required: true,
            example: 'Condo/Apartment',
          },
        },
      },
      example: [
        { icon: 'home', label: 'Property Type', value: 'Condo/Apartment' },
        { icon: 'dollar-sign', label: 'Budget', value: '$600K - $800K' },
        { icon: 'calendar', label: 'Timeline', value: '6-12 months' },
        { icon: 'target', label: 'Goal', value: 'Upgrading' },
      ],
    },

    transitionText: {
      type: 'string',
      description: 'Confident bridge from recap to action',
      required: true,
      constraints: { wordCount: '8-15 words' },
      example: "Now let's make it happen. Here's how we get started:",
    },

    primaryCTA: {
      type: 'object',
      description: 'Main call-to-action button (highest commitment)',
      required: true,
      fields: {
        text: {
          type: 'string',
          description: 'Button text',
          required: true,
          example: 'Schedule a Free Consultation',
        },
        subtext: {
          type: 'string',
          description: 'Small text below button',
          required: true,
          example: '15-minute call · No obligation',
        },
        urgencyNote: {
          type: 'string',
          description: 'Optional urgency line (only if truly limited)',
          required: false,
          example: 'Limited spots this week',
        },
      },
    },

    secondaryCTA: {
      type: 'object',
      description: 'Lower-commitment alternative CTA',
      required: true,
      fields: {
        text: {
          type: 'string',
          required: true,
          example: 'Browse Current Listings',
          description:'Call to action'
        },
        subtext: {
          type: 'string',
          required: true,
          example: 'See what’s available in your range',
          description:'Call to action'
        },
      },
    },

    trustElements: {
      type: 'array',
      description: '2–3 trust signals to reduce hesitation',
      required: true,
      constraints: { minLength: 2, maxLength: 3 },
      items: { type: 'string',
      description:'Call to action',
      required:true
    },
      example: [
        '100% free consultation',
        'No pressure, ever',
        'Local market expert since 2015',
      ],
    },

    personalNote: {
      type: 'object',
      description: 'Warm, authentic closing message from the agent',
      required: true,
      fields: {
        message: {
          type: 'string',
          description: 'Personal, caring message that makes the user feel seen',
          required: true,
          constraints: { wordCount: '25-45 words', tone: 'warm, genuine, excited' },
          example: "Jonathan, I’m truly excited to help you find the perfect condo that fits your lifestyle and budget. I’ve helped dozens of buyers just like you — let’s make this smooth and stress-free.",
        },
        signature: {
          type: 'string',
          description: 'Agent name (usually "chris")',
          required: true,
          example: 'Chris',
        },
      },
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

export interface LlmNextStepsCTAProps {
  hook: string;
  keyRecap: KeyRecapItem[];
  transitionText: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  trustElements: string[];
  personalNote: PersonalNote;
}