// lib/offers/definitions/pdfOffer.ts
/**
 * PDF Offer Definition
 * Generates personalized PDF guides based on user conversation
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
  
  // ==================== PDF OUTPUT TYPE ====================
  
  export interface PdfOfferOutput extends BaseOfferProps {
    type: 'pdf';
    title: string;
    sections: Array<{
      heading: string;
      content: string;
      order: number;
    }>;
    metadata: {
      pageCount?: number;
      downloadUrl?: string;
      generatedBy?: string;
    };
  }
  
  // ==================== INPUT REQUIREMENTS ====================
  
  const INPUT_REQUIREMENTS: InputRequirements = {
    requiredFields: ['email'],
    optionalFields: ['propertyAddress', 'timeline', 'budget', 'firstName', 'lastName'],
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
      title: {
        type: 'string',
        description: 'PDF guide title',
        required: true,
        example: 'Your Complete Home Buying Guide',
      },
      sections: {
        type: 'array',
        description: 'PDF sections with headings and content',
        required: true,
        example: [
          {
            heading: 'Introduction',
            content: 'Welcome to your personalized guide...',
            order: 1,
          },
        ],
      },
      metadata: {
        type: 'object',
        description: 'PDF metadata',
        required: false,
        example: {
          pageCount: 5,
        },
      },
    },
    outputType: 'PdfOfferOutput',
  };
  
  // ==================== PROMPT BUILDER ====================
  
  function buildPdfPrompt(
    userInput: Record<string, string>,
    context: {
      flow: string;
      businessName: string;
      qdrantAdvice?: string[];
      additionalContext?: Record<string, any>;
    }
  ): string {
    const outputSchemaExample = {
      title: 'Personalized Guide Title',
      sections: [
        {
          heading: 'Section 1 Heading',
          content: 'Detailed content for section 1 (2-3 paragraphs)',
          order: 1,
        },
        {
          heading: 'Section 2 Heading',
          content: 'Detailed content for section 2 (2-3 paragraphs)',
          order: 2,
        },
      ],
      metadata: {
        pageCount: 5,
      },
    };
  
    const specificInstructions = `
  SPECIFIC INSTRUCTIONS FOR PDF GUIDE:
  
  1. Create a comprehensive, actionable PDF guide
  2. Include 4-6 sections covering different aspects relevant to the user's situation
  3. Each section should have:
     - A clear, descriptive heading
     - 2-3 paragraphs of detailed, actionable content
     - Specific recommendations or steps
  4. Make it personal - use their information throughout
  5. Provide value - this should be worth downloading
  6. Keep language professional yet approachable
  7. Include concrete examples and next steps
  
  Suggested sections based on flow:
  - Introduction: Welcome and overview
  - Current Market Analysis: What's happening in their area
  - Key Considerations: Important factors for their situation
  - Step-by-Step Process: What to do next
  - Common Pitfalls to Avoid: What to watch out for
  - Next Steps & Resources: How to move forward
  
  Make each section substantive and valuable.
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
      return {
        valid: false,
        errors: ['Output must be an object'],
      };
    }
  
    const o = output as Partial<PdfOfferOutput>;
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate title
    if (!o.title || typeof o.title !== 'string') {
      errors.push('Missing or invalid title');
    } else if (o.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (o.title.length < 10) {
      warnings.push('Title is very short (less than 10 characters)');
    }
  
    // Validate sections
    if (!Array.isArray(o.sections)) {
      errors.push('Sections must be an array');
    } else if (o.sections.length === 0) {
      errors.push('Must have at least one section');
    } else if (o.sections.length < 3) {
      warnings.push('PDF has fewer than 3 sections - consider adding more content');
    } else {
      // Validate each section
      o.sections.forEach((section, index) => {
        if (!section.heading || typeof section.heading !== 'string') {
          errors.push(`Section ${index + 1}: Missing or invalid heading`);
        }
        if (!section.content || typeof section.content !== 'string') {
          errors.push(`Section ${index + 1}: Missing or invalid content`);
        } else if (section.content.length < 100) {
          warnings.push(`Section ${index + 1}: Content is very short (less than 100 characters)`);
        }
        if (typeof section.order !== 'number') {
          errors.push(`Section ${index + 1}: Missing or invalid order`);
        }
      });
    }
  
    // Validate metadata (optional)
    if (o.metadata && typeof o.metadata !== 'object') {
      errors.push('Metadata must be an object');
    }
  
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  }
  
  // ==================== POST-PROCESSOR ====================
  
  function postProcessPdfOutput(
    output: PdfOfferOutput,
    userInput: Record<string, string>
  ): PdfOfferOutput {
    // Sort sections by order
    const sortedSections = [...output.sections].sort((a, b) => a.order - b.order);
  
    // Estimate page count if not provided
    const totalContentLength = sortedSections.reduce(
      (sum, section) => sum + section.content.length,
      0
    );
    const estimatedPageCount = Math.ceil(totalContentLength / 2000); // ~2000 chars per page
  
    return {
      ...output,
      sections: sortedSections,
      metadata: {
        ...output.metadata,
        pageCount: output.metadata.pageCount || estimatedPageCount,
        generatedBy: 'AI Assistant',
      },
    };
  }
  
  // ==================== OFFER DEFINITION ====================
  
  export const PDF_OFFER_DEFINITION: OfferDefinition<PdfOfferOutput> = {
    // Identity
    type: 'pdf',
    label: 'PDF Guide',
    description: 'Downloadable personalized guide based on user conversation',
    icon: '📄',
  
    // Version
    version: createVersion(
      '1.0.0',
      'Initial release of PDF offer generation',
      false
    ),
  
    // Input requirements
    inputRequirements: INPUT_REQUIREMENTS,
  
    // Prompt generation
    buildPrompt: buildPdfPrompt,
  
    // Output structure
    outputSchema: OUTPUT_SCHEMA,
    outputValidator: validatePdfOutput,
  
    // Post-processing
    postProcess: postProcessPdfOutput,
  
    // Generation metadata
    generationMetadata: {
      model: 'gpt-4o-mini',
      maxTokens: 4000,
      temperature: 0.7,
    },
  
    // Retry & Fallback
    retryConfig: DEFAULT_RETRY_CONFIG,
    fallbackConfig: {
      strategy: 'use-template',
      template: {
        id: 'pdf-fallback',
        type: 'pdf',
        businessName: '',
        flow: '',
        generatedAt: '',
        version: '1.0.0',
        title: 'Your Personalized Guide',
        sections: [
          {
            heading: 'Welcome',
            content:
              'Thank you for your interest. We\'re preparing a personalized guide for you. Please check back soon or contact us directly for immediate assistance.',
            order: 1,
          },
          {
            heading: 'Next Steps',
            content:
              'Our team is reviewing your information to provide the most relevant guidance. In the meantime, feel free to reach out with any questions.',
            order: 2,
          },
        ],
        metadata: {
          pageCount: 1,
        },
      },
    },
  
    // Cost Estimation
    estimateCost: createCostEstimator('gpt-4o-mini', 4000),
  };