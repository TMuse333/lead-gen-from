// src/lib/offers/unified/offers/landingPage.offer.ts
/**
 * Landing Page - Unified Offer Definition
 *
 * Generates personalized landing page content.
 * Supports all intents (buy, sell, browse).
 */

import type {
  UnifiedOffer,
  Question,
  PromptContext,
  ValidationResult,
} from '../types';
import {
  createButtonQuestion,
  createEmailQuestion,
  createLocationQuestion,
} from '../types';
import { registerOffer } from '../registry';
import { buildBasePrompt } from '../../promptBuilders/promptHelpers';

// ==================== OUTPUT TYPES ====================

export interface LandingPageOutput {
  id: string;
  type: 'landingPage';
  businessName: string;
  flow: string;
  generatedAt: string;
  version: string;
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  summary: {
    title: string;
    content: string;
  };
  insights: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionUrl?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  metadata?: {
    theme?: string;
    targetAudience?: string;
  };
}

// ==================== QUESTIONS ====================

const COMMON_QUESTIONS: Question[] = [
  createButtonQuestion(
    'pageGoal',
    'What do you want to achieve?',
    'pageGoal',
    [
      {
        id: 'learn',
        label: 'Learn about the market',
        value: 'education',
        tracker: {
          insight: 'Educational content focus',
          dbMessage: 'Building informative sections...',
        },
      },
      {
        id: 'compare',
        label: 'Compare options',
        value: 'comparison',
        tracker: {
          insight: 'Comparison view building',
          dbMessage: 'Creating side-by-side analysis...',
        },
      },
      {
        id: 'action',
        label: 'Take next steps',
        value: 'action-focused',
        tracker: {
          insight: 'Action-oriented page',
          dbMessage: 'Adding clear CTAs...',
        },
      },
    ],
    { order: 10 }
  ),
  createLocationQuestion('Which area should we focus on?', { order: 20 }),
  createEmailQuestion({ order: 90 }),
];

const BUY_QUESTIONS = [...COMMON_QUESTIONS];
BUY_QUESTIONS[0] = { ...BUY_QUESTIONS[0], text: 'What do you want from your buyer page?' };

const SELL_QUESTIONS = [...COMMON_QUESTIONS];
SELL_QUESTIONS[0] = { ...SELL_QUESTIONS[0], text: 'What do you want from your seller page?' };

const BROWSE_QUESTIONS = [...COMMON_QUESTIONS];
BROWSE_QUESTIONS[0] = { ...BROWSE_QUESTIONS[0], text: 'What interests you most?' };

// ==================== PROMPT BUILDER ====================

function buildLandingPagePrompt(
  userInput: Record<string, string>,
  context: PromptContext
): string {
  const outputSchemaExample = {
    hero: {
      title: 'Your Personalized Real Estate Hub',
      subtitle: 'Everything you need to know',
      ctaText: 'Get Started',
    },
    summary: { title: 'Overview', content: 'Detailed summary...' },
    insights: [
      { title: 'Key Insight 1', description: '...', icon: 'TrendingUp' },
    ],
    recommendations: [
      { title: 'Next Step', description: '...', priority: 'high' },
    ],
  };

  const specificInstructions = `
Create landing page content with:
- Compelling hero section
- Clear value proposition
- 3-5 key insights
- 3-5 actionable recommendations
- Focused on ${userInput.pageGoal || 'education'}
- Location: ${userInput.location || 'general'}
`;

  return buildBasePrompt('Landing Page', userInput, context, outputSchemaExample, specificInstructions);
}

// ==================== OUTPUT VALIDATOR ====================

function validateLandingPageOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { valid: false, errors: ['Output must be an object'] };
  }

  const o = output as Partial<LandingPageOutput>;
  const errors: string[] = [];

  if (!o.hero) errors.push('Missing hero section');
  if (!o.summary) errors.push('Missing summary');
  if (!Array.isArray(o.insights) || o.insights.length === 0) {
    errors.push('Must have at least one insight');
  }
  if (!Array.isArray(o.recommendations) || o.recommendations.length === 0) {
    errors.push('Must have at least one recommendation');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    normalized: errors.length === 0 ? output : undefined,
  };
}

// ==================== FALLBACK ====================

const LANDING_PAGE_FALLBACK: LandingPageOutput = {
  id: 'landing-fallback',
  type: 'landingPage',
  businessName: '',
  flow: '',
  generatedAt: '',
  version: '2.0.0',
  hero: {
    title: 'Your Real Estate Journey Starts Here',
    subtitle: 'Personalized guidance for your next move',
    ctaText: 'Get Started',
  },
  summary: {
    title: 'Welcome',
    content: 'Contact us for personalized real estate guidance.',
  },
  insights: [
    { title: 'Expert Guidance', description: 'Work with experienced professionals' },
  ],
  recommendations: [
    { title: 'Schedule a Call', description: 'Discuss your goals with us', priority: 'high' },
  ],
};

// ==================== UNIFIED OFFER ====================

export const LANDING_PAGE_OFFER: UnifiedOffer<LandingPageOutput> = {
  type: 'landingPage',
  label: 'Personal Landing Page',
  description: 'Custom landing page with your insights and recommendations',
  icon: '🌐',

  supportedIntents: ['buy', 'sell', 'browse'],

  questions: {
    buy: BUY_QUESTIONS,
    sell: SELL_QUESTIONS,
    browse: BROWSE_QUESTIONS,
  },

  tracking: {
    icon: 'Globe',
    color: '#f59e0b', // Amber
    progressStyle: 'bar',
    fields: {
      pageGoal: {
        icon: 'Target',
        label: 'Goal',
        priority: 1,
        preview: true,
      },
      location: {
        icon: 'MapPin',
        label: 'Area',
        priority: 2,
        preview: true,
      },
      email: {
        icon: 'Mail',
        label: 'Contact',
        priority: 10,
        preview: false,
      },
    },
  },

  generation: {
    model: 'gpt-4o-mini',
    maxTokens: 3000,
    temperature: 0.8,
    buildPrompt: buildLandingPagePrompt,
    outputSchema: {
      type: 'object',
      properties: {
        hero: { type: 'object', description: 'Hero section', required: true },
        summary: { type: 'object', description: 'Summary section', required: true },
        insights: { type: 'array', description: 'Key insights', required: true },
        recommendations: { type: 'array', description: 'Recommendations', required: true },
      },
      outputType: 'LandingPageOutput',
    },
    validateOutput: validateLandingPageOutput,
  },

  results: {
    title: 'Your Personal Landing Page',
    subtitle: 'Custom {intent} page ready to view',
    previewComponent: 'LandingPagePreview',
    ctaText: 'View Page',
    downloadable: false,
    shareable: true,
  },

  fallback: {
    strategy: 'use-template',
    template: LANDING_PAGE_FALLBACK,
    maxRetries: 2,
  },

  version: '2.0.0',
  category: 'content',
  enabledByDefault: false,
  questionPriority: 35,
};

registerOffer(LANDING_PAGE_OFFER);
