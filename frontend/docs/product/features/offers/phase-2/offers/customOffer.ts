// lib/offers/definitions/customOffer.ts
/**
 * Custom Offer Definition
 * Flexible offer type that can be configured by users
 */

import type {
    OfferDefinition,
    BaseOfferProps,
    InputRequirements,
    OutputSchema,
    ValidationResult,
  } from '../core/types';
  import type { OutputValue } from '@/types/genericOutput.types';
  import { createCostEstimator } from '../core/costEstimator';
  import { DEFAULT_RETRY_CONFIG } from '../core/types';
  import { createVersion } from '../core/versionControl';
  import { buildBasePrompt } from '../promptBuilders/promptHelpers';
  
  // ==================== CUSTOM OUTPUT TYPE ====================
  
  export interface CustomOfferOutput extends BaseOfferProps {
    type: 'custom';
    content: Record<string, OutputValue>;
    customFields?: Record<string, any>;
  }
  
  // ==================== INPUT REQUIREMENTS ====================
  
  const INPUT_REQUIREMENTS: InputRequirements = {
    requiredFields: ['email'],
    optionalFields: [
      'firstName',
      'lastName',
      'propertyAddress',
      'timeline',
      'budget',
      'propertyType',
      'customField1',
      'customField2',
      'customField3',
    ],
    fieldValidations: {
      email: {
        type: 'email',
        required: true,
      },
    },
  };
  
  // ==================== OUTPUT SCHEMA ====================
  
  const OUTPUT_SCHEMA: OutputSchema = {
    type: 'object',
    properties: {
      content: {
        type: 'object',
        description: 'Flexible content structure defined by user',
        required: true,
        example: {
          title: 'Custom content title',
          description: 'Custom content description',
          items: ['item1', 'item2'],
        },
      },
      customFields: {
        type: 'object',
        description: 'Additional custom fields',
        required: false,
      },
    },
    outputType: 'CustomOfferOutput',
  };
  
  // ==================== PROMPT BUILDER ====================
  
  function buildCustomPrompt(
    userInput: Record<string, string>,
    context: {
      flow: string;
      businessName: string;
      qdrantAdvice?: string[];
      additionalContext?: Record<string, any>;
    }
  ): string {
    // Check if user provided custom instructions
    const customInstructions = context.additionalContext?.customInstructions;
    const customSchema = context.additionalContext?.customSchema;
  
    const outputSchemaExample = customSchema || {
      content: {
        title: 'Your custom content title',
        summary: 'A summary of the custom content',
        sections: [
          {
            heading: 'Section 1',
            text: 'Content for section 1',
          },
          {
            heading: 'Section 2',
            text: 'Content for section 2',
          },
        ],
        callToAction: 'Next steps or action items',
      },
      customFields: {
        category: 'custom',
        priority: 'high',
      },
    };
  
    const specificInstructions = customInstructions || `
  SPECIFIC INSTRUCTIONS FOR CUSTOM OFFER:
  
  This is a flexible custom offer. Generate content that is:
  
  1. RELEVANT: Based on the user's conversation and context
  2. STRUCTURED: Well-organized with clear sections
  3. ACTIONABLE: Includes specific next steps or recommendations
  4. PERSONALIZED: Uses the user's information throughout
  5. VALUABLE: Provides genuine value and insights
  
  Structure your response to include:
  - A clear title or heading
  - A summary or overview
  - 2-4 main sections with detailed content
  - Specific recommendations or action items
  - A call-to-action or next steps
  
  Make it professional, helpful, and tailored to their specific situation.
  `;
  
    return buildBasePrompt(
      'Custom Offer',
      userInput,
      context,
      outputSchemaExample,
      specificInstructions
    );
  }
  
  // ==================== OUTPUT VALIDATOR ====================
  
  function validateCustomOutput(output: unknown): ValidationResult {
    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        errors: ['Output must be an object'],
      };
    }
  
    const o = output as Partial<CustomOfferOutput>;
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate content field exists
    if (!o.content || typeof o.content !== 'object') {
      errors.push('Missing or invalid content field');
    } else {
      // Check if content has at least some data
      const contentKeys = Object.keys(o.content);
      if (contentKeys.length === 0) {
        errors.push('Content object is empty');
      } else if (contentKeys.length < 2) {
        warnings.push('Content has very few fields - consider adding more structure');
      }
    }
  
    // Validate customFields if present
    if (o.customFields !== undefined && typeof o.customFields !== 'object') {
      errors.push('customFields must be an object if provided');
    }
  
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  }
  
  // ==================== POST-PROCESSOR ====================
  
  function postProcessCustomOutput(
    output: CustomOfferOutput,
    userInput: Record<string, string>
  ): CustomOfferOutput {
    // Add any custom fields from user input that start with 'custom'
    const customFields: Record<string, any> = {};
    
    Object.entries(userInput).forEach(([key, value]) => {
      if (key.startsWith('custom') && value) {
        customFields[key] = value;
      }
    });
  
    return {
      ...output,
      customFields: {
        ...output.customFields,
        ...customFields,
        processedAt: new Date().toISOString(),
      },
    };
  }
  
  // ==================== OFFER DEFINITION ====================
  
  export const CUSTOM_OFFER_DEFINITION: OfferDefinition<CustomOfferOutput> = {
    // Identity
    type: 'custom',
    label: 'Custom Offer',
    description: 'Flexible custom offer with user-defined structure',
    icon: '⚙️',
  
    // Version
    version: createVersion(
      '1.0.0',
      'Initial release of custom offer generation',
      false
    ),
  
    // Input requirements
    inputRequirements: INPUT_REQUIREMENTS,
  
    // Prompt generation
    buildPrompt: buildCustomPrompt,
  
    // Output structure
    outputSchema: OUTPUT_SCHEMA,
    outputValidator: validateCustomOutput,
  
    // Post-processing
    postProcess: postProcessCustomOutput,
  
    // Generation metadata
    generationMetadata: {
      model: 'gpt-4o-mini',
      maxTokens: 3500,
      temperature: 0.7,
    },
  
    // Retry & Fallback
    retryConfig: DEFAULT_RETRY_CONFIG,
    fallbackConfig: {
      strategy: 'use-template',
      template: {
        id: 'custom-fallback',
        type: 'custom',
        businessName: '',
        flow: '',
        generatedAt: '',
        version: '1.0.0',
        content: {
          title: 'Your Custom Content',
          message:
            'We\'re generating personalized content for you. Please check back soon or contact us for immediate assistance.',
          status: 'processing',
        },
        customFields: {
          fallback: true,
        },
      },
    },
  
    // Cost Estimation
    estimateCost: createCostEstimator('gpt-4o-mini', 3500),
  };