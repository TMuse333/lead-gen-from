// lib/llmSchemas.ts

import { availableCollections, ComponentSchema } from "../../../../types/schemas";

// Add to your existing schemas file

// lib/llmSchemas.ts → PROFILE_SUMMARY_SCHEMA

// lib/llmSchemas.ts → PROFILE_SUMMARY_SCHEMA (FINAL VERSION)

export const PROFILE_SUMMARY_SCHEMA: ComponentSchema = {
  componentName: 'profileSummary',
  description:
    'Visual summary of the user’s situation as scannable cards. Validates personalization and shows deep understanding.',
    personalization:{
      retrieveFrom: [availableCollections.find(c => c.name === 'advice')!] ,// rule-based,
    },
  fields: {
    overview: {
      type: 'string',
      description:
        'Narrative summary that weaves answers into a cohesive, empathetic story',
      required: true,
      constraints: {
        wordCount: '30-50 words',
        tone: 'conversational, factual, empathetic',
      },
      example:
        "You're looking to buy your first condo in downtown Toronto within the next 6-12 months...",
    },

    keyHighlights: {
      type: 'array',
      description:
        '4–6 key facts displayed as visual cards with icon, label, and value. ALWAYS include Budget exactly as the user stated it.',
      required: true,
      constraints: {
        minLength: 4,
        maxLength: 6,
      },
      items: {
        type: 'object',
        description: 'Single highlight card',
        required: true,
        fields: {
          icon: {
            type: 'string',
            description: 'Lucide icon name (lowercase, hyphenated)',
            required: true,
            example: 'home',
            context:
              'Common icons: home, calendar, dollar-sign, map-pin, target, clock, trending-up, sparkles',
          },
          label: {
            type: 'string',
            description: 'Short label for the card',
            required: true,
            example: 'Property Type',
          },
          value: {
            type: 'string',
            description:
              'The EXACT value from the user. For budget: copy the user’s answer verbatim (including $, K, ranges, etc.). NEVER use "TBD", "To be discussed", or any placeholder.',
            required: true,
            example: '$600K - $800K',
            context:
              'Budget example: "$600K - $800K", "Under $1M", "$1.2M max", "Flexible" — use exactly what the user said.',
          },
          context: {
            type: 'string',
            description: 'Optional expert insight or implication',
            required: false,
            example: 'Strong buying power for a spacious 2-bedroom downtown',
          },
        },
      },
      // Strong example so the LLM copies the pattern perfectly
      // example: [
      //   { icon: 'home', label: 'Property Type', value: 'Condo/Apartment' },
      //   { icon: 'dollar-sign', label: 'Budget', value: '$600K - $800K' },
      //   { icon: 'calendar', label: 'Timeline', value: '6-12 months' },
      //   { icon: 'target', label: 'Goal', value: 'Upgrading' },
      //   {
      //     icon: 'map-pin',
      //     label: 'Location Preference',
      //     value: 'Downtown Toronto',
      //     context: 'High demand area with excellent appreciation potential',
      //   },
      // ],
    },

    timelineBadge: {
      type: 'object',
      description: 'Optional urgency badge shown at bottom',
      required: false,
      fields: {
        text: {
          type: 'string',
          required: true,
          example: 'Planning Ahead',
          description: 'The string that tells user how much time they are working with',
        },
        variant: {
          type: 'enum',
          required: true,
          constraints: {
            options: ['urgent', 'planned', 'exploring'],
          },
          example: 'planned',
          description: 'The variant for the timeline urgency',
        },
      },
      context:
        'Only include if timeline is extreme: 0-3 months → urgent, 12+ months → exploring, otherwise omit.',
    },
  },
};
  

  export interface ProfileHighlight {
    icon: string;           // Emoji or lucide icon name
    label: string;          // "Property Type", "Timeline", etc.
    value: string;          // "Single-family house", "0-3 months"
    context?: string;       // Optional expert insight
  }
  
  export interface TimelineBadge {
    text: string;           // "Selling Soon", "Planning Ahead"
    variant: 'urgent' | 'planned' | 'exploring';
  }
  
  export interface LlmProfileSummaryProps {
    overview: string;
    keyHighlights: ProfileHighlight[];
    timelineBadge?: TimelineBadge;
  }
