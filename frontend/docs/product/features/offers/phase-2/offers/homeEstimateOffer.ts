// lib/offers/definitions/homeEstimateOffer.ts
/**
 * Home Estimate Offer Definition
 * Generates property value estimates and market analysis
 */

import type {
    OfferDefinition,
    BaseOfferProps,
    InputRequirements,
    OutputSchema,
    ValidationResult,
  } from '../core/types';
  import { createCostEstimator } from '../core/costEstimator';
  import { DEFAULT_RETRY_CONFIG } from '../core/types';
  import { createVersion } from '../core/versionControl';
  import { buildBasePrompt } from '../promptBuilders/promptHelpers';
  
  // ==================== HOME ESTIMATE OUTPUT TYPE ====================
  
  export interface HomeEstimateOfferOutput extends BaseOfferProps {
    type: 'home-estimate';
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
  
  // ==================== INPUT REQUIREMENTS ====================
  
  const INPUT_REQUIREMENTS: InputRequirements = {
    requiredFields: ['email', 'propertyAddress'],
    optionalFields: [
      'propertyType',
      'bedrooms',
      'bathrooms',
      'squareFeet',
      'yearBuilt',
      'lotSize',
    ],
    fieldValidations: {
      email: {
        type: 'email',
        required: true,
      },
      propertyAddress: {
        type: 'text',
        required: true,
        minLength: 10,
      },
    },
  };
  
  // ==================== OUTPUT SCHEMA ====================
  
  const OUTPUT_SCHEMA: OutputSchema = {
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
        example: {
          low: 450000,
          high: 500000,
          confidence: 75,
          currency: 'USD',
        },
      },
      comparables: {
        type: 'array',
        description: 'Comparable properties sold recently',
        required: true,
        example: [
          {
            address: '123 Main St',
            soldPrice: 475000,
            soldDate: '2024-10-15',
            similarity: 85,
          },
        ],
      },
      factors: {
        type: 'array',
        description: 'Factors affecting property value',
        required: true,
        example: [
          {
            factor: 'Location',
            impact: 'positive',
            description: 'Prime location near schools',
          },
        ],
      },
      recommendations: {
        type: 'array',
        description: 'Recommendations for the property owner',
        required: true,
        example: ['Consider updating kitchen', 'Maintain curb appeal'],
      },
    },
    outputType: 'HomeEstimateOfferOutput',
  };
  
  // ==================== PROMPT BUILDER ====================
  
  function buildHomeEstimatePrompt(
    userInput: Record<string, string>,
    context: {
      flow: string;
      businessName: string;
      qdrantAdvice?: string[];
      additionalContext?: Record<string, any>;
    }
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
        {
          address: 'Third comparable',
          soldPrice: 435000,
          soldDate: '2024-09-20',
          similarity: 75,
          distance: '0.7 miles',
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
        {
          factor: 'Property Condition',
          impact: 'positive',
          description: 'Condition based on available info',
        },
      ],
      recommendations: [
        'Specific recommendation 1',
        'Specific recommendation 2',
        'Specific recommendation 3',
      ],
      disclaimer:
        'This is an AI-generated estimate based on available market data and should not be considered a professional appraisal.',
    };
  
    const propertyDetails = [
      userInput.propertyAddress && `Address: ${userInput.propertyAddress}`,
      userInput.propertyType && `Type: ${userInput.propertyType}`,
      userInput.bedrooms && `Bedrooms: ${userInput.bedrooms}`,
      userInput.bathrooms && `Bathrooms: ${userInput.bathrooms}`,
      userInput.squareFeet && `Square Feet: ${userInput.squareFeet}`,
      userInput.yearBuilt && `Year Built: ${userInput.yearBuilt}`,
      userInput.lotSize && `Lot Size: ${userInput.lotSize}`,
    ]
      .filter(Boolean)
      .join('\n');
  
    const specificInstructions = `
  SPECIFIC INSTRUCTIONS FOR HOME ESTIMATE:
  
  IMPORTANT: This is an AI-generated estimate. DO NOT use real MLS data or actual recent sales.
  Generate realistic but SIMULATED data for demonstration purposes.
  
  1. ESTIMATED VALUE:
     - Provide a range (low to high) based on the property details
     - Confidence should be 60-80% (we don't have actual data)
     - Make the range reasonable (10-15% spread)
     - Use USD as currency
  
  2. COMPARABLES (3-5 properties):
     - Create realistic comparable properties in the same area
     - Include sold prices within 20% of your estimate
     - Use recent dates (within last 3 months)
     - Similarity score: 70-90%
     - Distance: 0.1-1.0 miles from subject property
  
  3. FACTORS (4-6 items):
     - Consider: Location, Market Conditions, Property Features, Age, Size, Condition
     - Impact: positive, negative, or neutral
     - Provide specific descriptions (not generic)
     - Base on the property details provided
  
  4. RECOMMENDATIONS (3-5 items):
     - Specific, actionable advice
     - Relevant to buyer/seller based on flow: ${context.flow}
     - Consider current market conditions
     - Be practical and helpful
  
  5. DISCLAIMER:
     - Always include a disclaimer that this is an AI estimate
     - Not a substitute for professional appraisal
     - Based on limited information
  
  PROPERTY DETAILS PROVIDED:
  ${propertyDetails}
  
  Make the estimate credible but clearly mark it as AI-generated for demonstration.
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
      return {
        valid: false,
        errors: ['Output must be an object'],
      };
    }
  
    const o = output as Partial<HomeEstimateOfferOutput>;
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate property address
    if (!o.propertyAddress || typeof o.propertyAddress !== 'string') {
      errors.push('Missing or invalid property address');
    }
  
    // Validate estimated value
    if (!o.estimatedValue || typeof o.estimatedValue !== 'object') {
      errors.push('Missing or invalid estimated value');
    } else {
      if (typeof o.estimatedValue.low !== 'number') {
        errors.push('Estimated value: Missing or invalid low value');
      }
      if (typeof o.estimatedValue.high !== 'number') {
        errors.push('Estimated value: Missing or invalid high value');
      }
      if (
        typeof o.estimatedValue.low === 'number' &&
        typeof o.estimatedValue.high === 'number' &&
        o.estimatedValue.low >= o.estimatedValue.high
      ) {
        errors.push('Estimated value: Low must be less than high');
      }
      if (typeof o.estimatedValue.confidence !== 'number') {
        errors.push('Estimated value: Missing or invalid confidence');
      } else if (
        o.estimatedValue.confidence < 0 ||
        o.estimatedValue.confidence > 100
      ) {
        errors.push('Estimated value: Confidence must be between 0-100');
      }
    }
  
    // Validate comparables
    if (!Array.isArray(o.comparables)) {
      errors.push('Comparables must be an array');
    } else if (o.comparables.length === 0) {
      errors.push('Must have at least one comparable property');
    } else if (o.comparables.length < 3) {
      warnings.push('Consider adding more comparables (at least 3 recommended)');
    } else {
      o.comparables.forEach((comp, index) => {
        if (!comp.address || typeof comp.address !== 'string') {
          errors.push(`Comparable ${index + 1}: Missing or invalid address`);
        }
        if (typeof comp.soldPrice !== 'number') {
          errors.push(`Comparable ${index + 1}: Missing or invalid sold price`);
        }
        if (!comp.soldDate || typeof comp.soldDate !== 'string') {
          errors.push(`Comparable ${index + 1}: Missing or invalid sold date`);
        }
        if (typeof comp.similarity !== 'number') {
          errors.push(`Comparable ${index + 1}: Missing or invalid similarity`);
        }
      });
    }
  
    // Validate factors
    if (!Array.isArray(o.factors)) {
      errors.push('Factors must be an array');
    } else if (o.factors.length === 0) {
      errors.push('Must have at least one factor');
    } else {
      o.factors.forEach((factor, index) => {
        if (!factor.factor || typeof factor.factor !== 'string') {
          errors.push(`Factor ${index + 1}: Missing or invalid factor name`);
        }
        if (!['positive', 'negative', 'neutral'].includes(factor.impact)) {
          errors.push(`Factor ${index + 1}: Invalid impact (must be positive, negative, or neutral)`);
        }
        if (!factor.description || typeof factor.description !== 'string') {
          errors.push(`Factor ${index + 1}: Missing or invalid description`);
        }
      });
    }
  
    // Validate recommendations
    if (!Array.isArray(o.recommendations)) {
      errors.push('Recommendations must be an array');
    } else if (o.recommendations.length === 0) {
      warnings.push('No recommendations provided');
    }
  
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  }
  
  // ==================== POST-PROCESSOR ====================
  
  function postProcessHomeEstimateOutput(
    output: HomeEstimateOfferOutput,
    userInput: Record<string, string>
  ): HomeEstimateOfferOutput {
    // Sort comparables by similarity (highest first)
    const sortedComparables = [...output.comparables].sort(
      (a, b) => b.similarity - a.similarity
    );
  
    // Ensure disclaimer exists
    const disclaimer =
      output.disclaimer ||
      'This estimate is generated by AI based on available market data and user-provided information. It should not be considered a professional appraisal or used for financial decisions. For an accurate property valuation, please consult a licensed real estate appraiser.';
  
    return {
      ...output,
      comparables: sortedComparables,
      disclaimer,
    };
  }
  
  // ==================== OFFER DEFINITION ====================
  
  export const HOME_ESTIMATE_OFFER_DEFINITION: OfferDefinition<HomeEstimateOfferOutput> = {
    // Identity
    type: 'home-estimate',
    label: 'Home Estimate',
    description: 'AI-generated property value estimate with market analysis',
    icon: '🏡',
  
    // Version
    version: createVersion(
      '1.0.0',
      'Initial release of home estimate offer generation',
      false
    ),
  
    // Input requirements
    inputRequirements: INPUT_REQUIREMENTS,
  
    // Prompt generation
    buildPrompt: buildHomeEstimatePrompt,
  
    // Output structure
    outputSchema: OUTPUT_SCHEMA,
    outputValidator: validateHomeEstimateOutput,
  
    // Post-processing
    postProcess: postProcessHomeEstimateOutput,
  
    // Generation metadata
    generationMetadata: {
      model: 'gpt-4o-mini',
      maxTokens: 3500,
      temperature: 0.6,
    },
  
    // Retry & Fallback
    retryConfig: DEFAULT_RETRY_CONFIG,
    fallbackConfig: {
      strategy: 'notify-admin',
      notificationEmail: 'admin@example.com',
    },
  
    // Cost Estimation
    estimateCost: createCostEstimator('gpt-4o-mini', 3500),
  };