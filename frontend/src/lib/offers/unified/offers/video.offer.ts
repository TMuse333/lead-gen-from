// src/lib/offers/unified/offers/video.offer.ts
/**
 * Video - Unified Offer Definition
 *
 * Generates personalized video scripts/content.
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

export interface VideoOutput {
  id: string;
  type: 'video';
  businessName: string;
  flow: string;
  generatedAt: string;
  version: string;
  title: string;
  script: string;
  sections: Array<{
    timestamp: string;
    heading: string;
    content: string;
    visualNotes?: string;
  }>;
  metadata?: {
    estimatedDuration?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    tone?: string;
  };
}

// ==================== QUESTIONS ====================

const COMMON_QUESTIONS: Question[] = [
  createButtonQuestion(
    'videoTopic',
    'What would you like to learn about?',
    'videoTopic',
    [
      {
        id: 'process',
        label: 'The process explained',
        value: 'process-overview',
        tracker: {
          insight: 'Step-by-step walkthrough coming',
          dbMessage: 'Scripting educational content...',
        },
      },
      {
        id: 'tips',
        label: 'Expert tips & tricks',
        value: 'expert-tips',
        tracker: {
          insight: 'Insider knowledge loading',
          dbMessage: 'Compiling pro strategies...',
        },
      },
      {
        id: 'market',
        label: 'Market update',
        value: 'market-update',
        tracker: {
          insight: 'Fresh market data incoming',
          dbMessage: 'Pulling latest stats...',
        },
      },
      {
        id: 'qa',
        label: 'Common questions answered',
        value: 'faq',
        tracker: {
          insight: 'FAQ video building',
          dbMessage: 'Loading popular questions...',
        },
      },
    ],
    { order: 10 }
  ),
  createLocationQuestion('Which area should we focus on?', { order: 20 }),
  createEmailQuestion({ order: 90 }),
];

const BUY_QUESTIONS = [...COMMON_QUESTIONS];
BUY_QUESTIONS[0] = { ...BUY_QUESTIONS[0], text: 'What buying topic interests you?' };

const SELL_QUESTIONS = [...COMMON_QUESTIONS];
SELL_QUESTIONS[0] = { ...SELL_QUESTIONS[0], text: 'What selling topic interests you?' };

const BROWSE_QUESTIONS = [...COMMON_QUESTIONS];
BROWSE_QUESTIONS[0] = { ...BROWSE_QUESTIONS[0], text: 'What would you like to learn?' };

// ==================== PROMPT BUILDER ====================

function buildVideoPrompt(
  userInput: Record<string, string>,
  context: PromptContext
): string {
  const outputSchemaExample = {
    title: 'Your Personalized Video',
    script: 'Full script text...',
    sections: [
      { timestamp: '0:00', heading: 'Introduction', content: '...', visualNotes: '...' },
      { timestamp: '1:30', heading: 'Key Points', content: '...', visualNotes: '...' },
    ],
    metadata: { estimatedDuration: '3-5 minutes', tone: 'friendly' },
  };

  const specificInstructions = `
Create a video script with:
- Engaging introduction
- 3-5 main sections
- Clear timestamps
- Visual/B-roll suggestions
- Natural, conversational tone
- Focused on ${userInput.videoTopic || 'general topic'}
- Location: ${userInput.location || 'general'}
`;

  return buildBasePrompt('Video', userInput, context, outputSchemaExample, specificInstructions);
}

// ==================== OUTPUT VALIDATOR ====================

function validateVideoOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { valid: false, errors: ['Output must be an object'] };
  }

  const o = output as Partial<VideoOutput>;
  const errors: string[] = [];

  if (!o.title) errors.push('Missing title');
  if (!o.script) errors.push('Missing script');
  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    errors.push('Must have at least one section');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    normalized: errors.length === 0 ? output : undefined,
  };
}

// ==================== FALLBACK ====================

const VIDEO_FALLBACK: VideoOutput = {
  id: 'video-fallback',
  type: 'video',
  businessName: '',
  flow: '',
  generatedAt: '',
  version: '2.0.0',
  title: 'Your Personalized Video',
  script: 'Contact us for your personalized video content.',
  sections: [
    { timestamp: '0:00', heading: 'Introduction', content: 'Welcome!' },
  ],
};

// ==================== UNIFIED OFFER ====================

export const VIDEO_OFFER: UnifiedOffer<VideoOutput> = {
  type: 'video',
  label: 'Personalized Video',
  description: 'Custom video content tailored to your interests',
  icon: '🎥',

  supportedIntents: ['buy', 'sell', 'browse'],

  questions: {
    buy: BUY_QUESTIONS,
    sell: SELL_QUESTIONS,
    browse: BROWSE_QUESTIONS,
  },

  tracking: {
    icon: 'Video',
    color: '#ef4444', // Red
    progressStyle: 'bar',
    fields: {
      videoTopic: {
        icon: 'Play',
        label: 'Topic',
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
    temperature: 0.75,
    buildPrompt: buildVideoPrompt,
    outputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Video title', required: true },
        script: { type: 'string', description: 'Full script', required: true },
        sections: { type: 'array', description: 'Video sections', required: true },
      },
      outputType: 'VideoOutput',
    },
    validateOutput: validateVideoOutput,
  },

  results: {
    title: 'Your Personalized Video',
    subtitle: 'Custom {intent} video ready to watch',
    previewComponent: 'VideoPreview',
    ctaText: 'Watch Video',
    downloadable: false,
    shareable: true,
  },

  fallback: {
    strategy: 'use-template',
    template: VIDEO_FALLBACK,
    maxRetries: 2,
  },

  version: '2.0.0',
  category: 'content',
  enabledByDefault: false,
  questionPriority: 40,
};

registerOffer(VIDEO_OFFER);
