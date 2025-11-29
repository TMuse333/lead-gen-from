# Offer System - Concrete Implementation Example

## Complete Example: PDF Offer Definition

This shows how all pieces fit together in one cohesive object.

```typescript
// lib/offers/definitions/pdfOffer.ts

import type { OfferType } from "@/stores/onboardingStore/onboarding.store";
import type { OfferDefinition, BaseOfferProps, InputRequirements, OutputSchema } from "../types";

// ==================== OUTPUT TYPE ====================

export interface PdfOfferOutput extends BaseOfferProps {
  type: 'pdf';
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    order: number;
  }>;
  metadata: {
    pageCount: number;
    estimatedReadTime: number; // minutes
  };
  downloadUrl?: string; // Generated after PDF creation
}

// ==================== COMPLETE OFFER DEFINITION ====================

export const PDF_OFFER_DEFINITION: OfferDefinition<PdfOfferOutput> = {
  // ========== IDENTITY ==========
  type: 'pdf',
  label: 'PDF Guide',
  description: 'Downloadable resource guide personalized for the user',
  icon: '📄',
  
  // ========== REQUIRED INPUTS ==========
  inputRequirements: {
    requiredFields: ['email'],
    optionalFields: ['propertyAddress', 'timeline', 'propertyType'],
    fieldValidations: {
      email: {
        type: 'email',
        pattern: '^[^@]+@[^@]+\\.[^@]+$',
      },
    },
  },
  
  // ========== PROMPT BUILDER ==========
  buildPrompt: (userInput, context) => {
    const userName = userInput.email?.split('@')[0] || 'there';
    const flow = context.flow;
    const businessName = context.businessName;
    
    // Extract relevant context
    const propertyContext = userInput.propertyAddress 
      ? `\nProperty: ${userInput.propertyAddress}`
      : '';
    const timelineContext = userInput.timeline
      ? `\nTimeline: ${userInput.timeline}`
      : '';
    
    // Build Qdrant advice section
    const adviceSection = context.qdrantAdvice && context.qdrantAdvice.length > 0
      ? `\n\nRELEVANT EXPERT ADVICE:\n${context.qdrantAdvice.map((a, i) => `${i + 1}. ${a}`).join('\n\n')}\n`
      : '\n\n(Use your expertise to provide valuable, actionable guidance.)\n';
    
    return `You are ${businessName}'s AI assistant creating a personalized PDF guide.

USER INFORMATION:
Name: ${userName}
Flow: ${flow}${propertyContext}${timelineContext}
${Object.entries(userInput)
  .filter(([k, v]) => k !== 'email' && v && v.trim())
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

${adviceSection}

TASK:
Create a comprehensive, actionable PDF guide tailored to ${userName}'s situation.

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Personalized guide title (50-70 characters)",
  "sections": [
    {
      "heading": "Section heading (clear and specific)",
      "content": "Detailed content (2-4 paragraphs, actionable advice)",
      "order": 1
    }
  ],
  "metadata": {
    "pageCount": 5,
    "estimatedReadTime": 10
  }
}

REQUIREMENTS:
- Title should be specific to their situation
- Include 4-6 sections covering key topics
- Content should be actionable and specific
- Use the expert advice provided to inform recommendations
- Make it valuable enough that they'd want to download it
- Write in a professional but friendly tone

Generate the JSON now:`;
  },
  
  // ========== OUTPUT SCHEMA ==========
  outputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'PDF title',
        required: true,
        example: 'Your Complete Guide to Selling Your Home in 2024',
      },
      sections: {
        type: 'array',
        description: 'PDF sections with headings and content',
        required: true,
        example: [
          {
            heading: 'Understanding Your Market',
            content: 'Based on your timeline and property type...',
            order: 1,
          },
        ],
      },
      metadata: {
        type: 'object',
        description: 'PDF metadata',
        required: true,
        example: {
          pageCount: 5,
          estimatedReadTime: 10,
        },
      },
    },
    outputType: 'PdfOfferOutput',
  },
  
  // ========== OUTPUT VALIDATOR ==========
  outputValidator: (output: unknown) => {
    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        errors: ['Output must be a valid object'],
      };
    }
    
    const o = output as Partial<PdfOfferOutput>;
    const errors: string[] = [];
    
    // Validate title
    if (!o.title || typeof o.title !== 'string' || o.title.trim().length === 0) {
      errors.push('Missing or invalid title');
    } else if (o.title.length > 100) {
      errors.push('Title too long (max 100 characters)');
    }
    
    // Validate sections
    if (!Array.isArray(o.sections) || o.sections.length === 0) {
      errors.push('Missing or empty sections array');
    } else {
      o.sections.forEach((section, index) => {
        if (!section.heading) {
          errors.push(`Section ${index + 1} missing heading`);
        }
        if (!section.content || section.content.trim().length < 50) {
          errors.push(`Section ${index + 1} content too short (min 50 characters)`);
        }
        if (typeof section.order !== 'number') {
          errors.push(`Section ${index + 1} missing or invalid order`);
        }
      });
    }
    
    // Validate metadata
    if (!o.metadata || typeof o.metadata !== 'object') {
      errors.push('Missing metadata object');
    } else {
      if (typeof o.metadata.pageCount !== 'number' || o.metadata.pageCount < 1) {
        errors.push('Invalid pageCount in metadata');
      }
      if (typeof o.metadata.estimatedReadTime !== 'number' || o.metadata.estimatedReadTime < 1) {
        errors.push('Invalid estimatedReadTime in metadata');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      normalized: errors.length === 0 ? (output as PdfOfferOutput) : undefined,
    };
  },
  
  // ========== POST-PROCESSING ==========
  postProcess: (output, userInput) => {
    // Add generated metadata
    return {
      ...output,
      id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'pdf' as const,
      businessName: userInput.businessName || 'Unknown',
      flow: userInput.flow || 'unknown',
      generatedAt: new Date().toISOString(),
      // Ensure sections are sorted by order
      sections: output.sections.sort((a, b) => a.order - b.order),
    };
  },
  
  // ========== GENERATION CONFIG ==========
  model: 'gpt-4o-mini',
  maxTokens: 4000,
  temperature: 0.7,
};
```

---

## Usage in Generation API

```typescript
// app/api/generation/generate-offer/route.ts

import { getOfferDefinition } from "@/lib/offers/registry";
import { validateOfferInputs } from "@/lib/offers/validators";

export async function POST(req: NextRequest) {
  const { flow, userInput, offerType } = await req.json();
  
  // Get offer definition
  const offerDef = getOfferDefinition(offerType);
  
  // Validate inputs
  const inputValidation = validateOfferInputs(offerType, userInput);
  if (!inputValidation.valid) {
    return NextResponse.json({
      error: 'Missing required inputs',
      missing: inputValidation.missing,
    }, { status: 400 });
  }
  
  // Get Qdrant advice
  const { advice } = await getPersonalizedAdvice(/* ... */);
  
  // Build prompt using definition
  const prompt = offerDef.buildPrompt(userInput, {
    flow,
    businessName: config.businessName,
    qdrantAdvice: advice,
  });
  
  // Call LLM
  const completion = await openai.chat.completions.create({
    model: offerDef.model || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: offerDef.maxTokens || 4000,
    temperature: offerDef.temperature || 0.7,
  });
  
  // Parse and validate output
  const rawOutput = JSON.parse(completion.choices[0].message.content);
  const validation = offerDef.outputValidator(rawOutput);
  
  if (!validation.valid) {
    return NextResponse.json({
      error: 'Invalid output from LLM',
      errors: validation.errors,
    }, { status: 500 });
  }
  
  // Post-process
  const finalOutput = offerDef.postProcess
    ? offerDef.postProcess(validation.normalized!, userInput)
    : validation.normalized!;
  
  return NextResponse.json({
    success: true,
    output: finalOutput,
  });
}
```

---

## Benefits of This Structure

1. **Single Source of Truth**: Everything about an offer is in one place
2. **Type Safety**: TypeScript ensures input/output types match
3. **Easy Testing**: Test each offer definition independently
4. **Easy Extension**: Add new offers by creating new definition files
5. **Flexible**: Each offer can have different models, temperatures, etc.
6. **Maintainable**: Clear separation - change prompt? Just update buildPrompt
7. **Reusable**: Prompt builders, validators can be shared utilities

---

## Alternative: More Dynamic Prompt Building

If prompts need to be more dynamic, you could use a template system:

```typescript
buildPrompt: (userInput, context) => {
  const template = `
    Create a PDF guide for {{userName}}.
    Flow: {{flow}}
    {{#if propertyAddress}}Property: {{propertyAddress}}{{/if}}
    {{#if timeline}}Timeline: {{timeline}}{{/if}}
    
    {{#if qdrantAdvice}}
    Expert Advice:
    {{#each qdrantAdvice}}
    - {{this}}
    {{/each}}
    {{/if}}
  `;
  
  return renderTemplate(template, {
    userName: userInput.email?.split('@')[0],
    flow: context.flow,
    propertyAddress: userInput.propertyAddress,
    timeline: userInput.timeline,
    qdrantAdvice: context.qdrantAdvice,
  });
}
```

---

## Registry Pattern

```typescript
// lib/offers/registry.ts

import { PDF_OFFER_DEFINITION } from './definitions/pdfOffer';
import { LANDING_PAGE_OFFER_DEFINITION } from './definitions/landingPageOffer';
import { HOME_ESTIMATE_OFFER_DEFINITION } from './definitions/homeEstimateOffer';
// ... etc

export const OFFER_REGISTRY = new Map<OfferType, OfferDefinition>([
  ['pdf', PDF_OFFER_DEFINITION],
  ['landingPage', LANDING_PAGE_OFFER_DEFINITION],
  ['home-estimate', HOME_ESTIMATE_OFFER_DEFINITION],
  // ... etc
]);

export function getOfferDefinition(type: OfferType): OfferDefinition {
  const definition = OFFER_REGISTRY.get(type);
  if (!definition) {
    throw new Error(`Unknown offer type: ${type}`);
  }
  return definition;
}

export function getAllOfferTypes(): OfferType[] {
  return Array.from(OFFER_REGISTRY.keys());
}
```

