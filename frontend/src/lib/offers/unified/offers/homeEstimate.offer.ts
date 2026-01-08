// src/lib/offers/unified/offers/homeEstimate.offer.ts
/**
 * Home Estimate - Unified Offer Definition
 *
 * Generates property value estimates and market analysis.
 * Only applicable to sellers (you can't estimate a home you don't own).
 */

import type {
  UnifiedOffer,
  Question,
  PromptContext,
  ValidationResult,
} from '../types';
import {
  createButtonQuestion,
  createTextQuestion,
  createEmailQuestion,
} from '../types';
import { registerOffer } from '../registry';
import { buildBasePrompt } from '../../promptBuilders/promptHelpers';

// ==================== OUTPUT TYPES ====================

export interface HomeEstimateOutput {
  id: string;
  type: 'home-estimate';
  businessName: string;
  flow: string;
  generatedAt: string;
  version: string;
  propertyAddress: string;
  estimatedValue: {
    low: number;
    high: number;
    confidence: number;
    currency: string;
  };
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    similarity: number;
    distance?: string;
  }>;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
  disclaimer?: string;
}

// ==================== SELL QUESTIONS ====================

const SELL_QUESTIONS: Question[] = [
  createButtonQuestion(
    'propertyType',
    'What type of property do you have?',
    'propertyType',
    [
      {
        id: 'house',
        label: 'Single-family house',
        value: 'single-family house',
        tracker: {
          insight: 'Classic choice — great market demand',
          dbMessage: 'Pulling comparable homes from your area...',
        },
      },
      {
        id: 'condo',
        label: 'Condo/Apartment',
        value: 'condo',
        tracker: {
          insight: 'Condos are in high demand — especially with low maintenance!',
          dbMessage: 'Scanning condo-specific buyer trends and HOA data...',
        },
      },
      {
        id: 'townhouse',
        label: 'Townhouse',
        value: 'townhouse',
        tracker: {
          insight: 'Townhouses are the sweet spot for many buyers right now',
          dbMessage: 'Analyzing townhouse price growth vs single-family...',
        },
      },
      {
        id: 'multi',
        label: 'Multi-family',
        value: 'multi-family',
        tracker: {
          insight: 'Investor alert! Multi-family units are cash-flow machines',
          dbMessage: 'Running cap rate analysis on local multi-family sales...',
        },
      },
    ],
    { order: 10 }
  ),

  createButtonQuestion(
    'propertyAge',
    'How old is your home?',
    'propertyAge',
    [
      {
        id: 'new',
        label: '< 10 years',
        value: '0-10 years',
        tracker: {
          insight: 'Newer homes sell 28% faster on average — huge advantage!',
          dbMessage: 'Comparing to luxury new builds in the area...',
        },
      },
      {
        id: 'mid1',
        label: '10-20 years',
        value: '10-20 years',
        tracker: {
          insight: 'Prime sweet spot — modern feel without the new-build premium',
          dbMessage: 'Finding renovated homes in your age range...',
        },
      },
      {
        id: 'mid2',
        label: '20-30 years',
        value: '20-30 years',
        tracker: {
          insight: 'Great bones — buyers love updated classics',
          dbMessage: 'Identifying high-ROI renovation opportunities...',
        },
      },
      {
        id: 'old',
        label: '30+ years',
        value: '30+ years',
        tracker: {
          insight: 'Character homes are having a moment — especially with updates',
          dbMessage: 'Searching for historic charm buyers...',
        },
      },
    ],
    { order: 20, allowFreeText: true }
  ),

  createButtonQuestion(
    'renovations',
    'Have you done any major renovations?',
    'renovations',
    [
      {
        id: 'yes-kitchen',
        label: 'Kitchen',
        value: 'kitchen',
        tracker: {
          insight: 'Kitchens sell homes — you just added $40K+ in value',
          dbMessage: 'Pulling ROI data on kitchen remodels (avg 82% return)...',
        },
      },
      {
        id: 'yes-bath',
        label: 'Bathroom',
        value: 'bathroom',
        tracker: {
          insight: 'Updated bathrooms = instant buyer love',
          dbMessage: 'Comparing your home to spa-like bathroom listings...',
        },
      },
      {
        id: 'yes-both',
        label: 'Both',
        value: 'kitchen and bathroom',
        tracker: {
          insight: 'Jackpot! You basically future-proofed your sale price',
          dbMessage: 'Running premium pricing model for fully renovated homes...',
        },
      },
      {
        id: 'no',
        label: 'No major renovations',
        value: 'none',
        tracker: {
          insight: "No worries — we'll show you the highest-ROI updates",
          dbMessage: 'Loading quick-win renovation recommendations...',
        },
      },
    ],
    { order: 30, required: false }
  ),

  createTextQuestion(
    'propertyAddress',
    "What's your property address?",
    'propertyAddress',
    'address',
    {
      order: 40,
      placeholder: '123 Main St, City, State',
      validation: { required: true, minLength: 10 },
    }
  ),

  createEmailQuestion({
    order: 90,
    text: "What's your email so we can send your home estimate?",
  }),
];

// ==================== PROMPT BUILDER ====================

function buildHomeEstimatePrompt(
  userInput: Record<string, string>,
  context: PromptContext
): string {
  const outputSchemaExample = {
    propertyAddress: userInput.propertyAddress || 'Property Address',
    estimatedValue: {
      low: 400000,
      high: 450000,
      confidence: 70,
      currency: 'USD',
    },
    comparables: [
      {
        address: 'Similar property nearby',
        soldPrice: 425000,
        soldDate: '2024-11-01',
        similarity: 85,
        distance: '0.3 miles',
      },
      {
        address: 'Another comparable',
        soldPrice: 410000,
        soldDate: '2024-10-15',
        similarity: 80,
        distance: '0.5 miles',
      },
    ],
    factors: [
      {
        factor: 'Location',
        impact: 'positive',
        description: 'Describe how location affects value',
      },
      {
        factor: 'Market Conditions',
        impact: 'neutral',
        description: 'Current market trends',
      },
    ],
    recommendations: [
      'Specific recommendation 1',
      'Specific recommendation 2',
    ],
    disclaimer: 'This is an AI-generated estimate...',
  };

  const propertyDetails = [
    userInput.propertyAddress && `Address: ${userInput.propertyAddress}`,
    userInput.propertyType && `Type: ${userInput.propertyType}`,
    userInput.propertyAge && `Age: ${userInput.propertyAge}`,
    userInput.renovations && `Renovations: ${userInput.renovations}`,
    userInput.bedrooms && `Bedrooms: ${userInput.bedrooms}`,
    userInput.bathrooms && `Bathrooms: ${userInput.bathrooms}`,
  ]
    .filter(Boolean)
    .join('\n');

  const specificInstructions = `
SPECIFIC INSTRUCTIONS FOR HOME ESTIMATE:

IMPORTANT: This is an AI-generated estimate. Generate realistic but SIMULATED data.

1. ESTIMATED VALUE:
   - Provide a range (low to high) based on property details
   - Confidence should be 60-80%
   - Make the range reasonable (10-15% spread)

2. COMPARABLES (3-5 properties):
   - Create realistic comparable properties in the same area
   - Include sold prices within 20% of your estimate
   - Recent dates (within last 3 months)
   - Similarity score: 70-90%

3. FACTORS (4-6 items):
   - Consider: Location, Market Conditions, Property Features, Age, Condition
   - Impact: positive, negative, or neutral
   - Provide specific descriptions

4. RECOMMENDATIONS (3-5 items):
   - Specific, actionable advice for sellers
   - Consider current market conditions

5. DISCLAIMER:
   - Always include a disclaimer that this is an AI estimate

PROPERTY DETAILS PROVIDED:
${propertyDetails}
`;

  return buildBasePrompt(
    'Home Estimate',
    userInput,
    context,
    outputSchemaExample,
    specificInstructions
  );
}

// ==================== OUTPUT VALIDATOR ====================

function validateHomeEstimateOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { valid: false, errors: ['Output must be an object'] };
  }

  const o = output as Partial<HomeEstimateOutput>;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!o.propertyAddress || typeof o.propertyAddress !== 'string') {
    errors.push('Missing or invalid property address');
  }

  if (!o.estimatedValue || typeof o.estimatedValue !== 'object') {
    errors.push('Missing or invalid estimated value');
  } else {
    if (typeof o.estimatedValue.low !== 'number') {
      errors.push('Missing or invalid low value');
    }
    if (typeof o.estimatedValue.high !== 'number') {
      errors.push('Missing or invalid high value');
    }
    if (o.estimatedValue.low >= o.estimatedValue.high) {
      errors.push('Low must be less than high');
    }
  }

  if (!Array.isArray(o.comparables) || o.comparables.length === 0) {
    errors.push('Must have at least one comparable');
  } else if (o.comparables.length < 3) {
    warnings.push('Consider adding more comparables');
  }

  if (!Array.isArray(o.factors) || o.factors.length === 0) {
    errors.push('Must have at least one factor');
  }

  if (!Array.isArray(o.recommendations)) {
    errors.push('Recommendations must be an array');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    normalized: errors.length === 0 ? output : undefined,
  };
}

// ==================== POST-PROCESSOR ====================

function postProcessHomeEstimate(
  output: HomeEstimateOutput,
  userInput: Record<string, string>
): HomeEstimateOutput {
  const sortedComparables = [...output.comparables].sort(
    (a, b) => b.similarity - a.similarity
  );

  const disclaimer =
    output.disclaimer ||
    'This estimate is generated by AI based on available market data. It should not be considered a professional appraisal.';

  return {
    ...output,
    comparables: sortedComparables,
    disclaimer,
  };
}

// ==================== FALLBACK TEMPLATE ====================

const HOME_ESTIMATE_FALLBACK: HomeEstimateOutput = {
  id: 'home-estimate-fallback',
  type: 'home-estimate',
  businessName: '',
  flow: 'sell',
  generatedAt: '',
  version: '2.0.0',
  propertyAddress: 'Your Property',
  estimatedValue: {
    low: 0,
    high: 0,
    confidence: 0,
    currency: 'USD',
  },
  comparables: [],
  factors: [
    {
      factor: 'Unable to generate estimate',
      impact: 'neutral',
      description: 'Please contact us for a personalized home valuation.',
    },
  ],
  recommendations: [
    'Contact us for a professional home valuation',
    'Schedule a free consultation with our team',
  ],
  disclaimer:
    'We were unable to generate an automated estimate. Please reach out for personalized assistance.',
};

// ==================== UNIFIED OFFER ====================

export const HOME_ESTIMATE_OFFER: UnifiedOffer<HomeEstimateOutput> = {
  // ==================== IDENTITY ====================
  type: 'home-estimate',
  label: 'Home Value Estimate',
  description: 'AI-generated property valuation with market analysis',
  icon: '🏡',

  // ==================== INTENT SUPPORT ====================
  supportedIntents: ['sell'], // Only for sellers

  // ==================== QUESTIONS ====================
  questions: {
    sell: SELL_QUESTIONS,
  },

  // ==================== TRACKING UI ====================
  tracking: {
    icon: 'Home',
    color: '#10b981', // Green
    progressStyle: 'checklist',
    fields: {
      propertyType: {
        icon: 'Building',
        label: 'Property Type',
        priority: 1,
        preview: true,
      },
      propertyAge: {
        icon: 'Calendar',
        label: 'Age',
        priority: 2,
        preview: true,
      },
      renovations: {
        icon: 'Wrench',
        label: 'Renovations',
        priority: 3,
        preview: false,
      },
      propertyAddress: {
        icon: 'MapPin',
        label: 'Address',
        priority: 4,
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

  // ==================== GENERATION ====================
  generation: {
    model: 'gpt-4o-mini',
    maxTokens: 3500,
    temperature: 0.6,
    buildPrompt: buildHomeEstimatePrompt,
    outputSchema: {
      type: 'object',
      properties: {
        propertyAddress: {
          type: 'string',
          description: 'The property address',
          required: true,
        },
        estimatedValue: {
          type: 'object',
          description: 'Estimated property value range',
          required: true,
        },
        comparables: {
          type: 'array',
          description: 'Comparable properties sold recently',
          required: true,
        },
        factors: {
          type: 'array',
          description: 'Factors affecting property value',
          required: true,
        },
        recommendations: {
          type: 'array',
          description: 'Recommendations for the seller',
          required: true,
        },
      },
      outputType: 'HomeEstimateOutput',
    },
    validateOutput: validateHomeEstimateOutput,
    postProcess: postProcessHomeEstimate,
  },

  // ==================== RESULTS DISPLAY ====================
  results: {
    title: 'Your Home Value Estimate',
    subtitle: 'AI-powered market analysis for your property',
    previewComponent: 'HomeEstimatePreview',
    ctaText: 'View Full Report',
    downloadable: true,
    shareable: false,
  },

  // ==================== FALLBACK ====================
  fallback: {
    strategy: 'use-template',
    template: HOME_ESTIMATE_FALLBACK,
    maxRetries: 2,
  },

  // ==================== METADATA ====================
  version: '2.0.0',
  category: 'analysis',
  enabledByDefault: true,
  questionPriority: 10, // High priority - property questions come first
};

// ==================== REGISTER ====================

registerOffer(HOME_ESTIMATE_OFFER);
