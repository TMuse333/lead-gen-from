// lib/offers/definitions/landingPageOffer.ts
/**
 * Landing Page Offer Definition
 * Generates personalized landing page content based on user conversation
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
  
  // ==================== LANDING PAGE OUTPUT TYPE ====================
  
  export interface LandingPageOfferOutput extends BaseOfferProps {
    type: 'landingPage';
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
      priority?: number;
    }>;
    metadata?: {
      theme?: string;
      targetAudience?: string;
    };
  }
  
  // ==================== INPUT REQUIREMENTS ====================
  
  const INPUT_REQUIREMENTS: InputRequirements = {
    requiredFields: ['email'],
    optionalFields: [
      'propertyAddress',
      'timeline',
      'budget',
      'firstName',
      'lastName',
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
      hero: {
        type: 'object',
        description: 'Hero section with main title, subtitle, and CTA',
        required: true,
        example: {
          title: 'Your Dream Home Awaits',
          subtitle: 'Personalized guidance for your home buying journey',
          ctaText: 'Get Started',
        },
      },
      summary: {
        type: 'object',
        description: 'Summary section with overview',
        required: true,
        example: {
          title: 'About Your Journey',
          content: 'Based on your conversation...',
        },
      },
      insights: {
        type: 'array',
        description: 'Key insights or features',
        required: true,
        example: [
          {
            title: 'Market Analysis',
            description: 'Current market conditions in your area',
            icon: '📊',
          },
        ],
      },
      recommendations: {
        type: 'array',
        description: 'Personalized recommendations',
        required: true,
        example: [
          {
            title: 'Pre-Approval',
            description: 'Get pre-approved for a mortgage',
            priority: 1,
          },
        ],
      },
      metadata: {
        type: 'object',
        description: 'Optional metadata',
        required: false,
      },
    },
    outputType: 'LandingPageOfferOutput',
  };
  
  // ==================== PROMPT BUILDER ====================
  
  function buildLandingPagePrompt(
    userInput: Record<string, string>,
    context: {
      flow: string;
      businessName: string;
      qdrantAdvice?: string[];
      additionalContext?: Record<string, any>;
    }
  ): string {
    const outputSchemaExample = {
      hero: {
        title: 'Compelling Main Headline',
        subtitle: 'Supporting subtitle that resonates with the user',
        ctaText: 'Take Action Now',
      },
      summary: {
        title: 'Your Personalized Overview',
        content:
          'A 2-3 paragraph summary of their situation and how we can help...',
      },
      insights: [
        {
          title: 'Key Insight 1',
          description: 'Relevant information based on their conversation',
          icon: '🏡',
        },
        {
          title: 'Key Insight 2',
          description: 'Another important consideration',
          icon: '💰',
        },
        {
          title: 'Key Insight 3',
          description: 'Third key point',
          icon: '📈',
        },
      ],
      recommendations: [
        {
          title: 'First Recommendation',
          description: 'Specific, actionable recommendation',
          priority: 1,
        },
        {
          title: 'Second Recommendation',
          description: 'Another important step',
          priority: 2,
        },
        {
          title: 'Third Recommendation',
          description: 'Additional recommendation',
          priority: 3,
        },
      ],
      metadata: {
        theme: 'professional',
        targetAudience: 'first-time buyers',
      },
    };
  
    const specificInstructions = `
  SPECIFIC INSTRUCTIONS FOR LANDING PAGE:
  
  1. HERO SECTION:
     - Title: Compelling, benefit-focused headline (5-10 words)
     - Subtitle: Supporting text that speaks to their specific situation (10-20 words)
     - CTA Text: Action-oriented button text (2-4 words)
  
  2. SUMMARY:
     - Title: Personalized section heading
     - Content: 2-3 paragraph overview of their situation and value proposition
     - Make it conversational and reassuring
  
  3. INSIGHTS (3-5 items):
     - Each should highlight a key benefit or consideration
     - Use relevant icons (emoji): 🏡 💰 📊 📈 🔑 ⭐ ✅ 🎯
     - Keep descriptions concise but valuable (1-2 sentences)
  
  4. RECOMMENDATIONS (3-5 items):
     - Specific, actionable next steps
     - Prioritize them (1 = highest priority)
     - Each should be clear and achievable
     - Descriptions should explain why it's important (2-3 sentences)
  
  5. TONE:
     - Professional yet approachable
     - Confident and reassuring
     - Personalized to their specific situation
     - Action-oriented
  
  Make the landing page feel like it was created specifically for them.
  `;
  
    return buildBasePrompt(
      'Landing Page',
      userInput,
      context,
      outputSchemaExample,
      specificInstructions
    );
  }
  
  // ==================== OUTPUT VALIDATOR ====================
  
  function validateLandingPageOutput(output: unknown): ValidationResult {
    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        errors: ['Output must be an object'],
      };
    }
  
    const o = output as Partial<LandingPageOfferOutput>;
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate hero section
    if (!o.hero || typeof o.hero !== 'object') {
      errors.push('Missing or invalid hero section');
    } else {
      if (!o.hero.title || typeof o.hero.title !== 'string') {
        errors.push('Hero: Missing or invalid title');
      } else if (o.hero.title.length < 5) {
        warnings.push('Hero title is very short');
      }
      if (!o.hero.subtitle || typeof o.hero.subtitle !== 'string') {
        errors.push('Hero: Missing or invalid subtitle');
      }
      if (!o.hero.ctaText || typeof o.hero.ctaText !== 'string') {
        errors.push('Hero: Missing or invalid CTA text');
      }
    }
  
    // Validate summary section
    if (!o.summary || typeof o.summary !== 'object') {
      errors.push('Missing or invalid summary section');
    } else {
      if (!o.summary.title || typeof o.summary.title !== 'string') {
        errors.push('Summary: Missing or invalid title');
      }
      if (!o.summary.content || typeof o.summary.content !== 'string') {
        errors.push('Summary: Missing or invalid content');
      } else if (o.summary.content.length < 100) {
        warnings.push('Summary content is very short');
      }
    }
  
    // Validate insights
    if (!Array.isArray(o.insights)) {
      errors.push('Insights must be an array');
    } else if (o.insights.length === 0) {
      errors.push('Must have at least one insight');
    } else if (o.insights.length < 3) {
      warnings.push('Consider adding more insights (at least 3 recommended)');
    } else {
      o.insights.forEach((insight, index) => {
        if (!insight.title || typeof insight.title !== 'string') {
          errors.push(`Insight ${index + 1}: Missing or invalid title`);
        }
        if (!insight.description || typeof insight.description !== 'string') {
          errors.push(`Insight ${index + 1}: Missing or invalid description`);
        }
      });
    }
  
    // Validate recommendations
    if (!Array.isArray(o.recommendations)) {
      errors.push('Recommendations must be an array');
    } else if (o.recommendations.length === 0) {
      errors.push('Must have at least one recommendation');
    } else if (o.recommendations.length < 3) {
      warnings.push('Consider adding more recommendations (at least 3 recommended)');
    } else {
      o.recommendations.forEach((rec, index) => {
        if (!rec.title || typeof rec.title !== 'string') {
          errors.push(`Recommendation ${index + 1}: Missing or invalid title`);
        }
        if (!rec.description || typeof rec.description !== 'string') {
          errors.push(`Recommendation ${index + 1}: Missing or invalid description`);
        }
      });
    }
  
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  }
  
  // ==================== POST-PROCESSOR ====================
  
  function postProcessLandingPageOutput(
    output: LandingPageOfferOutput,
    userInput: Record<string, string>
  ): LandingPageOfferOutput {
    // Sort recommendations by priority
    const sortedRecommendations = [...output.recommendations].sort(
      (a, b) => (a.priority || 99) - (b.priority || 99)
    );
  
    return {
      ...output,
      recommendations: sortedRecommendations,
      metadata: {
        ...output.metadata,
        targetAudience: userInput.firstName ? 'personalized' : 'general',
      },
    };
  }
  
  // ==================== OFFER DEFINITION ====================
  
  export const LANDING_PAGE_OFFER_DEFINITION: OfferDefinition<LandingPageOfferOutput> = {
    // Identity
    type: 'landingPage',
    label: 'Landing Page',
    description: 'Personalized landing page with hero, insights, and recommendations',
    icon: '🌐',
  
    // Version
    version: createVersion(
      '1.0.0',
      'Initial release of landing page offer generation',
      false
    ),
  
    // Input requirements
    inputRequirements: INPUT_REQUIREMENTS,
  
    // Prompt generation
    buildPrompt: buildLandingPagePrompt,
  
    // Output structure
    outputSchema: OUTPUT_SCHEMA,
    outputValidator: validateLandingPageOutput,
  
    // Post-processing
    postProcess: postProcessLandingPageOutput,
  
    // Generation metadata
    generationMetadata: {
      model: 'gpt-4o-mini',
      maxTokens: 3000,
      temperature: 0.8,
    },
  
    // Retry & Fallback
    retryConfig: DEFAULT_RETRY_CONFIG,
    fallbackConfig: {
      strategy: 'use-template',
      template: {
        id: 'landing-fallback',
        type: 'landingPage',
        businessName: '',
        flow: '',
        generatedAt: '',
        version: '1.0.0',
        hero: {
          title: 'Your Personalized Experience Awaits',
          subtitle: 'We\'re preparing something special for you',
          ctaText: 'Get Started',
        },
        summary: {
          title: 'Welcome',
          content:
            'We\'re creating a personalized experience based on your unique needs and preferences. Our team is reviewing your information to provide the most relevant recommendations and insights.',
        },
        insights: [
          {
            title: 'Personalized Approach',
            description: 'Every recommendation is tailored to your specific situation',
            icon: '🎯',
          },
          {
            title: 'Expert Guidance',
            description: 'Backed by industry expertise and local market knowledge',
            icon: '⭐',
          },
        ],
        recommendations: [
          {
            title: 'Contact Us',
            description:
              'Reach out to discuss your needs in detail and get immediate assistance',
            priority: 1,
          },
        ],
      },
    },
  
    // Cost Estimation
    estimateCost: createCostEstimator('gpt-4o-mini', 3000),
  };