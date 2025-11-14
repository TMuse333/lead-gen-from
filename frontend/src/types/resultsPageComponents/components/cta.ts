import { ComponentSchema, SchemaField } from '../schemas';

// ------------------------------------------
// Next Steps CTA Schema
// ------------------------------------------

export const NEXT_STEPS_CTA_SCHEMA: ComponentSchema = {
  componentName: 'nextStepsCTA',
  description: 'Final CTA with momentum, recap, and personal touch',
  fields: {
    hook: {
      type: 'string',
      description: 'Opening line that creates urgency/momentum',
      required: true,
      constraints: { wordCount: '15-25 words', tone: 'urgent but not pushy' },
      example: 'With a 6-12 month timeline, now is the perfect time...'
    },
    keyRecap: {
      type: 'array',
      description: '3-4 key recap points with icon, label, value',
      required: true,
      constraints: { minLength: 3, maxLength: 4 },
      items: {
        type: 'object',
        fields: {
          icon: { type: 'string', description: 'Emoji icon', required: true, example: 'home' },
          label: { type: 'string', description: 'Short label', required: true, example: 'Timeline' },
          value: { type: 'string', description: 'Value', required: true, example: '6-12 months' }
        }
      },
      example: [{ icon: 'clock', label: 'Timeline', value: '0-3 months' }]
    },
    transitionText: {
      type: 'string',
      description: 'Bridge to CTA',
      required: true,
      constraints: { wordCount: '10-15 words' },
      example: 'Now let\'s make it happen. Here\'s how we get started:'
    },
    primaryCTA: {
      type: 'object',
      description: 'Main CTA button',
      required: true,
      fields: {
        text: { type: 'string', required: true, example: 'Schedule a Consultation' },
        subtext: { type: 'string', required: true, example: 'Free 15-min call' },
        urgencyNote: { type: 'string', required: false, example: 'Limited spots this week' }
      }
    },
    secondaryCTA: {
      type: 'object',
      description: 'Alternative CTA',
      required: true,
      fields: {
        text: { type: 'string', required: true, example: 'Browse Listings' },
        subtext: { type: 'string', required: true, example: 'See what’s available now' }
      }
    },
    trustElements: {
      type: 'array',
      description: '2-3 trust signals',
      required: true,
      constraints: { minLength: 2, maxLength: 3 },
      items: { type: 'string' },
      example: ['No obligation', '150+ families helped']
    },
    personalNote: {
      type: 'object',
      description: 'Personal message from Chris',
      required: true,
      fields: {
        message: {
          type: 'string',
          required: true,
          description: 'Warm, authentic message',
          example: "I'm excited to help you find the perfect condo."
        },
        signature: {
          type: 'string',
          required: true,
          description: 'Agent name',
          example: 'Chris'
        }
      }
    }
  }
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