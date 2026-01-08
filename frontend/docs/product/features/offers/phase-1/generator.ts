// lib/offers/core/generator.ts
/**
 * Main offer generation pipeline
 * Orchestrates validation, LLM calls, retry logic, and fallback
 */

import OpenAI from 'openai';
import type {
  OfferDefinition,
  GenerationResult,
  GenerationContext,
  GenerationMetrics,
  BaseOfferProps,
  FallbackStrategy,
} from './types';
import { retryLLMCall } from './retry';
import { validateOfferInputs } from '../validators/inputValidator';
import { extractJSON, sanitizeOutput } from '../validators/outputValidator';
import { calculateActualCost } from './costEstimator';
import { isVersionDeprecated, getDeprecationWarning } from './versionControl';

// ==================== OPENAI CLIENT ====================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ==================== FALLBACK HANDLERS ====================

/**
 * Handle fallback based on strategy
 */
async function handleFallback<T extends BaseOfferProps>(
  definition: OfferDefinition<T>,
  userInput: Record<string, string>,
  error: any,
  context: GenerationContext
): Promise<T | null> {
  const { strategy, template } = definition.fallbackConfig;
  
  console.error(
    `[Fallback] Using ${strategy} fallback for ${definition.type} offer. Error: ${error.message}`
  );
  
  switch (strategy) {
    case 'use-template':
      if (!template) {
        console.error('[Fallback] No template provided for use-template strategy');
        return null;
      }
      
      // Fill template with basic data
      return {
        ...template,
        id: `fallback-${Date.now()}`,
        type: definition.type,
        businessName: context.businessName,
        flow: context.flow,
        generatedAt: new Date().toISOString(),
        version: definition.version.version,
      } as T;
      
    case 'notify-admin':
      // TODO: Implement admin notification
      console.error('[Fallback] Admin notification not yet implemented');
      await notifyAdmin(definition, error, context);
      return null;
      
    case 'save-draft':
      // TODO: Implement draft saving
      console.error('[Fallback] Draft saving not yet implemented');
      await saveDraft(definition, userInput, context);
      return null;
      
    case 'throw-error':
    default:
      return null;
  }
}

/**
 * Notify admin about generation failure (placeholder)
 */
async function notifyAdmin(
  definition: OfferDefinition,
  error: any,
  context: GenerationContext
): Promise<void> {
  // TODO: Implement email notification or logging to admin dashboard
  console.error('[Admin Notification]', {
    offerType: definition.type,
    userId: context.userId,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Save draft for later review (placeholder)
 */
async function saveDraft(
  definition: OfferDefinition,
  userInput: Record<string, string>,
  context: GenerationContext
): Promise<void> {
  // TODO: Implement MongoDB draft storage
  console.log('[Draft Save]', {
    offerType: definition.type,
    userId: context.userId,
    userInput,
    timestamp: new Date().toISOString(),
  });
}

// ==================== LLM CALL ====================

/**
 * Call OpenAI API to generate offer
 */
async function callLLM(
  prompt: string,
  definition: OfferDefinition
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const { model, maxTokens, temperature, topP, frequencyPenalty, presencePenalty } = 
    definition.generationMetadata;
  
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates personalized offers. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  });
  
  const content = completion.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('LLM returned empty response');
  }
  
  return {
    content,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    },
  };
}

// ==================== MAIN GENERATION FUNCTION ====================

/**
 * Generate offer using definition
 */
export async function generateOffer<T extends BaseOfferProps>(
  definition: OfferDefinition<T>,
  userInput: Record<string, string>,
  context: GenerationContext
): Promise<GenerationResult<T>> {
  const startTime = Date.now();
  let retryCount = 0;
  
  try {
    // Check version deprecation
    if (isVersionDeprecated(definition.version)) {
      console.warn(
        `[Version Warning] ${getDeprecationWarning(definition.version)}`
      );
    }
    
    // Step 1: Validate inputs
    const inputValidation = validateOfferInputs(userInput, definition.inputRequirements);
    if (!inputValidation.valid) {
      return {
        success: false,
        error: 'Input validation failed',
        errors: [
          ...inputValidation.missing.map((f) => `Missing required field: ${f}`),
          ...inputValidation.invalid.map((i) => `${i.field}: ${i.reason}`),
        ],
      };
    }
    
    // Step 2: Build prompt
    const prompt = definition.buildPrompt(userInput, {
      flow: context.flow,
      businessName: context.businessName,
      qdrantAdvice: context.qdrantAdvice,
      additionalContext: context.additionalContext,
    });
    
    // Step 3: Call LLM with retry logic
    const { result: llmResponse, attempts, totalDelay } = await retryLLMCall(
      () => callLLM(prompt, definition),
      definition.retryConfig,
      definition.type
    );
    
    retryCount = attempts - 1; // First attempt is not a retry
    
    // Step 4: Extract and parse JSON
    const { success: jsonSuccess, json: parsedOutput, error: jsonError } = 
      extractJSON(llmResponse.content);
    
    if (!jsonSuccess || !parsedOutput) {
      throw new Error(`Failed to parse LLM output as JSON: ${jsonError}`);
    }
    
    // Step 5: Validate output
    const outputValidation = definition.outputValidator(parsedOutput);
    if (!outputValidation.valid) {
      throw new Error(
        `Output validation failed: ${outputValidation.errors?.join(', ')}`
      );
    }
    
    // Step 6: Sanitize output
    const sanitized = sanitizeOutput(parsedOutput);
    
    // Step 7: Post-process
    let finalOutput = sanitized as T;
    if (definition.postProcess) {
      finalOutput = definition.postProcess(finalOutput, userInput);
    }
    
    // Add base properties if not present
    finalOutput = {
      ...finalOutput,
      id: finalOutput.id || `${definition.type}-${Date.now()}`,
      type: definition.type,
      businessName: context.businessName,
      flow: context.flow,
      generatedAt: finalOutput.generatedAt || new Date().toISOString(),
      version: definition.version.version,
    };
    
    // Calculate cost
    const cost = calculateActualCost(
      llmResponse.usage.promptTokens,
      llmResponse.usage.completionTokens,
      definition.generationMetadata.model
    );
    
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      data: finalOutput,
      metadata: {
        tokensUsed: llmResponse.usage.totalTokens,
        cost,
        duration,
        retries: retryCount,
        version: definition.version.version,
        cacheHit: false, // TODO: Implement caching
      },
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('[Generation Error]', {
      offerType: definition.type,
      error: error.message,
      retries: retryCount,
    });
    
    // Try fallback
    const fallbackResult = await handleFallback(definition, userInput, error, context);
    
    if (fallbackResult) {
      const cost = 0; // No cost for fallback
      
      return {
        success: true,
        data: fallbackResult,
        metadata: {
          tokensUsed: 0,
          cost,
          duration,
          retries: retryCount,
          version: definition.version.version,
          cacheHit: false,
        },
      };
    }
    
    return {
      success: false,
      error: error.message || 'Generation failed',
      errors: [error.message],
      fallbackUsed: !!fallbackResult,
      metadata: {
        retries: retryCount,
        duration,
      },
    };
  }
}