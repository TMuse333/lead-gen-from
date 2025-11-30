// lib/offers/definitions/videoOffer.ts
/**
 * Video Offer Definition
 * Generates personalized video scripts based on user conversation
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
  
  // ==================== VIDEO OUTPUT TYPE ====================
  
  export interface VideoOfferOutput extends BaseOfferProps {
    type: 'video';
    title: string;
    script: string;
    sections: Array<{
      timestamp: string;
      heading: string;
      content: string;
      visualNotes?: string;
    }>;
    metadata: {
      estimatedDuration?: number; // in seconds
      videoUrl?: string;
      thumbnailUrl?: string;
      tone?: string;
    };
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
      title: {
        type: 'string',
        description: 'Video title',
        required: true,
        example: 'Your Personalized Home Buying Journey',
      },
      script: {
        type: 'string',
        description: 'Complete video script',
        required: true,
        example: 'Hello! Welcome to your personalized video...',
      },
      sections: {
        type: 'array',
        description: 'Video sections with timestamps',
        required: true,
        example: [
          {
            timestamp: '0:00',
            heading: 'Introduction',
            content: 'Script for introduction section',
            visualNotes: 'Show welcome screen',
          },
        ],
      },
      metadata: {
        type: 'object',
        description: 'Video metadata',
        required: false,
        example: {
          estimatedDuration: 180,
          tone: 'professional',
        },
      },
    },
    outputType: 'VideoOfferOutput',
  };
  
  // ==================== PROMPT BUILDER ====================
  
  function buildVideoPrompt(
    userInput: Record<string, string>,
    context: {
      flow: string;
      businessName: string;
      qdrantAdvice?: string[];
      additionalContext?: Record<string, any>;
    }
  ): string {
    const outputSchemaExample = {
      title: 'Engaging Video Title',
      script: 'Full script text with all sections combined...',
      sections: [
        {
          timestamp: '0:00',
          heading: 'Welcome & Introduction',
          content: 'Script for this section (2-3 sentences)',
          visualNotes: 'Show host on camera, professional background',
        },
        {
          timestamp: '0:30',
          heading: 'Your Situation',
          content: 'Script addressing their specific needs (3-4 sentences)',
          visualNotes: 'Show relevant graphics or property images',
        },
        {
          timestamp: '1:00',
          heading: 'Key Insights',
          content: 'Important information for them (3-4 sentences)',
          visualNotes: 'Show data charts or market information',
        },
        {
          timestamp: '1:30',
          heading: 'Recommendations',
          content: 'Specific next steps (3-4 sentences)',
          visualNotes: 'Show checklist or action items',
        },
        {
          timestamp: '2:00',
          heading: 'Closing & Call-to-Action',
          content: 'Wrap-up and next steps (2-3 sentences)',
          visualNotes: 'Show contact information',
        },
      ],
      metadata: {
        estimatedDuration: 150,
        tone: 'professional yet friendly',
      },
    };
  
    const specificInstructions = `
  SPECIFIC INSTRUCTIONS FOR VIDEO SCRIPT:
  
  1. STRUCTURE:
     - Create 4-6 sections for a 2-3 minute video
     - Each section should be 20-40 seconds
     - Use timestamps (0:00, 0:30, 1:00, etc.)
  
  2. SCRIPT CONTENT:
     - Write in a conversational, spoken style
     - Use short sentences and natural pauses
     - Address the viewer directly ("you", "your")
     - Be warm and personable
     - Include specific details from their conversation
  
  3. SECTIONS TO INCLUDE:
     - Welcome: Brief introduction (15-20 seconds)
     - Their Situation: Acknowledge their specific needs (30-40 seconds)
     - Key Insights: Important information for them (40-50 seconds)
     - Recommendations: Actionable next steps (40-50 seconds)
     - Closing: Call-to-action (15-20 seconds)
  
  4. VISUAL NOTES:
     - Suggest what should be shown on screen
     - Keep it simple and achievable
     - Examples: host on camera, graphics, text overlays, property images
  
  5. TONE:
     - Professional but approachable
     - Enthusiastic but not over-the-top
     - Confident and reassuring
     - Personalized to their situation
  
  6. FULL SCRIPT:
     - Combine all sections into one complete script
     - This is what the host will read/say
     - Should flow naturally from section to section
  
  Make it feel like a real person talking to them, not reading from a script.
  `;
  
    return buildBasePrompt(
      'Video Script',
      userInput,
      context,
      outputSchemaExample,
      specificInstructions
    );
  }
  
  // ==================== OUTPUT VALIDATOR ====================
  
  function validateVideoOutput(output: unknown): ValidationResult {
    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        errors: ['Output must be an object'],
      };
    }
  
    const o = output as Partial<VideoOfferOutput>;
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate title
    if (!o.title || typeof o.title !== 'string') {
      errors.push('Missing or invalid title');
    } else if (o.title.length < 5) {
      warnings.push('Title is very short');
    }
  
    // Validate script
    if (!o.script || typeof o.script !== 'string') {
      errors.push('Missing or invalid script');
    } else if (o.script.length < 100) {
      errors.push('Script is too short (must be at least 100 characters)');
    }
  
    // Validate sections
    if (!Array.isArray(o.sections)) {
      errors.push('Sections must be an array');
    } else if (o.sections.length === 0) {
      errors.push('Must have at least one section');
    } else if (o.sections.length < 3) {
      warnings.push('Consider adding more sections (at least 4-5 recommended)');
    } else {
      o.sections.forEach((section, index) => {
        if (!section.timestamp || typeof section.timestamp !== 'string') {
          errors.push(`Section ${index + 1}: Missing or invalid timestamp`);
        }
        if (!section.heading || typeof section.heading !== 'string') {
          errors.push(`Section ${index + 1}: Missing or invalid heading`);
        }
        if (!section.content || typeof section.content !== 'string') {
          errors.push(`Section ${index + 1}: Missing or invalid content`);
        } else if (section.content.length < 20) {
          warnings.push(`Section ${index + 1}: Content is very short`);
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
  
  function postProcessVideoOutput(
    output: VideoOfferOutput,
    userInput: Record<string, string>
  ): VideoOfferOutput {
    // Calculate estimated duration from sections
    const estimatedDuration = output.sections.length * 30; // ~30 seconds per section
  
    // Ensure metadata exists
    return {
      ...output,
      metadata: {
        ...output.metadata,
        estimatedDuration: output.metadata.estimatedDuration || estimatedDuration,
        tone: output.metadata.tone || 'professional',
      },
    };
  }
  
  // ==================== OFFER DEFINITION ====================
  
  export const VIDEO_OFFER_DEFINITION: OfferDefinition<VideoOfferOutput> = {
    // Identity
    type: 'video',
    label: 'Video Script',
    description: 'Personalized video script with timestamps and visual notes',
    icon: '🎥',
  
    // Version
    version: createVersion(
      '1.0.0',
      'Initial release of video offer generation',
      false
    ),
  
    // Input requirements
    inputRequirements: INPUT_REQUIREMENTS,
  
    // Prompt generation
    buildPrompt: buildVideoPrompt,
  
    // Output structure
    outputSchema: OUTPUT_SCHEMA,
    outputValidator: validateVideoOutput,
  
    // Post-processing
    postProcess: postProcessVideoOutput,
  
    // Generation metadata
    generationMetadata: {
      model: 'gpt-4o-mini',
      maxTokens: 3000,
      temperature: 0.75,
    },
  
    // Retry & Fallback
    retryConfig: DEFAULT_RETRY_CONFIG,
    fallbackConfig: {
      strategy: 'use-template',
      template: {
        id: 'video-fallback',
        type: 'video',
        businessName: '',
        flow: '',
        generatedAt: '',
        version: '1.0.0',
        title: 'Welcome to Your Personalized Video',
        script:
          'Hello! Thank you for your interest. We\'re creating a personalized video just for you. In the meantime, feel free to reach out with any questions.',
        sections: [
          {
            timestamp: '0:00',
            heading: 'Welcome',
            content:
              'Hello! Thank you for your interest. We\'re creating a personalized video just for you.',
            visualNotes: 'Show welcome screen with logo',
          },
          {
            timestamp: '0:15',
            heading: 'Next Steps',
            content:
              'Our team is reviewing your information to create the most relevant content for you. Please check back soon.',
            visualNotes: 'Show contact information',
          },
        ],
        metadata: {
          estimatedDuration: 30,
          tone: 'professional',
        },
      },
    },
  
    // Cost Estimation
    estimateCost: createCostEstimator('gpt-4o-mini', 3000),
  };