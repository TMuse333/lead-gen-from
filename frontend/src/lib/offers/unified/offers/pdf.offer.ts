// src/lib/offers/unified/offers/pdf.offer.ts
/**
 * PDF Guide - Unified Offer Definition
 *
 * Generates downloadable PDF guides tailored to user's situation.
 * Supports all intents (buy, sell, browse).
 */

import type {
  UnifiedOffer,
  Question,
  PromptContext,
  ValidationResult,
} from '../types';
import { createEmailQuestion } from '../types';
import { registerOffer } from '../registry';
import { buildBasePrompt } from '../../promptBuilders/promptHelpers';

// ==================== OUTPUT TYPES ====================

export interface PdfOutput {
  id: string;
  type: 'pdf';
  businessName: string;
  flow: string;
  generatedAt: string;
  version: string;
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    order: number;
  }>;
  metadata?: {
    pageCount?: number;
    downloadUrl?: string;
    generatedBy?: string;
  };
}

// ==================== BUY QUESTIONS ====================
// PDF relies on other offers (like timeline) to collect data.
// It only needs email to send the guide. Other fields come from merged questions.

const BUY_QUESTIONS: Question[] = [
  createEmailQuestion({
    order: 95, // High order so it comes after other offers' questions
    text: "What's your email so we can send your buyer's guide?",
  }),
];

// ==================== SELL QUESTIONS ====================
// PDF relies on other offers (like timeline, home-estimate) to collect data.
// It only needs email to send the guide. Other fields come from merged questions.

const SELL_QUESTIONS: Question[] = [
  createEmailQuestion({
    order: 95, // High order so it comes after other offers' questions
    text: "What's your email so we can send your seller's guide?",
  }),
];

// ==================== BROWSE QUESTIONS ====================
// PDF relies on other offers (like timeline) to collect data.
// It only needs email (optional for browsers). Other fields come from merged questions.

const BROWSE_QUESTIONS: Question[] = [
  createEmailQuestion({
    order: 95, // High order so it comes after other offers' questions
    text: 'Want a free market report sent to your inbox?',
    required: false, // Optional for browsers
  }),
];

// ==================== PROMPT BUILDER ====================

function buildPdfPrompt(
  userInput: Record<string, string>,
  context: PromptContext
): string {
  const outputSchemaExample = {
    title: `Your ${context.intent === 'buy' ? 'Home Buying' : context.intent === 'sell' ? 'Home Selling' : 'Real Estate'} Guide`,
    sections: [
      { heading: 'Getting Started', content: 'Detailed content...', order: 1 },
      { heading: 'Key Steps', content: 'Detailed content...', order: 2 },
      { heading: 'Expert Tips', content: 'Detailed content...', order: 3 },
    ],
  };

  const specificInstructions = `
SPECIFIC INSTRUCTIONS FOR PDF GUIDE:

Create a comprehensive guide with 5-7 sections.
Each section should have:
- Clear heading
- 2-3 paragraphs of actionable content
- Specific to ${context.intent} intent
- Location-aware if provided: ${userInput.location || 'general'}
- Timeline-appropriate: ${userInput.timeline || 'standard'}

Make content practical, actionable, and valuable.
`;

  return buildBasePrompt(
    'PDF Guide',
    userInput,
    context,
    outputSchemaExample,
    specificInstructions
  );
}

// ==================== OUTPUT VALIDATOR ====================

function validatePdfOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { valid: false, errors: ['Output must be an object'] };
  }

  const o = output as Partial<PdfOutput>;
  const errors: string[] = [];

  if (!o.title || typeof o.title !== 'string') {
    errors.push('Missing or invalid title');
  }

  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    errors.push('Must have at least one section');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    normalized: errors.length === 0 ? output : undefined,
  };
}

// ==================== FALLBACK TEMPLATE ====================

const PDF_FALLBACK: PdfOutput = {
  id: 'pdf-fallback',
  type: 'pdf',
  businessName: '',
  flow: '',
  generatedAt: '',
  version: '2.0.0',
  title: 'Your Real Estate Guide',
  sections: [
    {
      heading: 'Getting Started',
      content: 'Contact us for personalized guidance on your real estate journey.',
      order: 1,
    },
  ],
};

// ==================== UNIFIED OFFER ====================

export const PDF_OFFER: UnifiedOffer<PdfOutput> = {
  // ==================== IDENTITY ====================
  type: 'pdf',
  label: 'Custom PDF Guide',
  description: 'Downloadable guide tailored to your situation',
  icon: '📄',

  // ==================== INTENT SUPPORT ====================
  supportedIntents: ['buy', 'sell', 'browse'],

  // ==================== QUESTIONS ====================
  questions: {
    buy: BUY_QUESTIONS,
    sell: SELL_QUESTIONS,
    browse: BROWSE_QUESTIONS,
  },

  // ==================== TRACKING UI ====================
  tracking: {
    icon: 'FileText',
    color: '#8b5cf6', // Purple
    progressStyle: 'bar',
    fields: {
      buyerType: {
        icon: 'User',
        label: 'Type',
        priority: 1,
        preview: true,
      },
      sellerSituation: {
        icon: 'Target',
        label: 'Situation',
        priority: 1,
        preview: true,
      },
      interest: {
        icon: 'Lightbulb',
        label: 'Interest',
        priority: 1,
        preview: true,
      },
      location: {
        icon: 'MapPin',
        label: 'Location',
        priority: 2,
        preview: true,
      },
      timeline: {
        icon: 'Clock',
        label: 'Timeline',
        priority: 3,
        preview: false,
      },
      email: {
        icon: 'Mail',
        label: 'Contact',
        priority: 10,
        preview: false,
      },
    },
  },

  // ==================== GENERATION ====================
  generation: {
    model: 'gpt-4o-mini',
    maxTokens: 4000,
    temperature: 0.7,
    buildPrompt: buildPdfPrompt,
    outputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Guide title', required: true },
        sections: { type: 'array', description: 'Guide sections', required: true },
      },
      outputType: 'PdfOutput',
    },
    validateOutput: validatePdfOutput,
  },

  // ==================== RESULTS DISPLAY ====================
  results: {
    title: 'Your Custom Guide',
    subtitle: 'Personalized {intent} guide ready for download',
    previewComponent: 'PdfPreview',
    ctaText: 'Download PDF',
    downloadable: true,
    shareable: true,
  },

  // ==================== FALLBACK ====================
  fallback: {
    strategy: 'use-template',
    template: PDF_FALLBACK,
    maxRetries: 2,
  },

  // ==================== METADATA ====================
  version: '2.0.0',
  category: 'content',
  enabledByDefault: false,
  questionPriority: 30,
};

// ==================== REGISTER ====================

registerOffer(PDF_OFFER);
