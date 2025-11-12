// lib/llmSchemas.ts

import { ComponentSchema } from "../schemas";

// Add to your existing schemas file

export const PROFILE_SUMMARY_SCHEMA: ComponentSchema = {
    componentName: 'profileSummary',
    description: 'Visual summary of the user\'s situation displayed as scannable cards. This validates that the page is personalized for them and shows Chris understands their needs.',
    fields: {
      overview: {
        type: 'string',
        description: 'Narrative summary that weaves their answers into a cohesive story',
        required: true,
        constraints: {
          wordCount: '30-50 words',
          tone: 'conversational, factual, empathetic'
        },
        example: 'You\'re preparing to sell a 10-20 year old single-family home in Halifax with a recently renovated kitchen. You\'re planning to relocate within the next 3 months, which means timing and efficiency are your top priorities.',
        context: 'Connect their key answers into a story that shows you understand their complete situation'
      },
      keyHighlights: {
        type: 'array',
        description: 'Array of 4-6 key facts displayed as visual cards',
        required: true,
        constraints: {
          minLength: 4,
          maxLength: 6
        },
        context: 'Each highlight should be a distinct, important aspect: property details, timeline, goals, etc. Include optional context that adds Chris\'s expertise'
      },
      timelineBadge: {
        type: 'object',
        description: 'Optional badge highlighting timeline urgency',
        required: false,
        context: 'Only include if timeline is notably urgent (0-3 months) or notably relaxed (12+ months). Omit for medium timelines.'
      }
    }
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
