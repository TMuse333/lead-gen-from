// lib/offers/core/generator.ts
/**
 * Main offer generation pipeline
 * Orchestrates validation, LLM calls, retry logic, and fallback
 */

import type OpenAI from 'openai';
import type {
  OfferDefinition,
  GenerationResult,
  GenerationContext,
  GenerationMetrics,
  BaseOfferProps,
  FallbackStrategy,
  GenerationMetadata,
  RetryConfig,
} from './types';
import { DEFAULT_RETRY_CONFIG } from './types';
import { retryLLMCall } from './retry';
import { validateOfferInputs } from '../validators/inputValidator';
import { extractJSON, sanitizeOutput } from '../validators/outputValidator';
import { calculateActualCost } from './costEstimator';
import { isVersionDeprecated } from './versionControl';
import { hasOffer } from '../unified/registry';
import type { UnifiedOffer, PromptContext as UnifiedPromptContext, Intent } from '../unified/types';

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
  
  switch (strategy) {
    case 'use-template':
      if (!template) {
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
      await notifyAdmin(definition, error, context);
      return null;

    case 'save-draft':
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
async function notifyAdmin<T extends BaseOfferProps>(
  _definition: OfferDefinition<T>,
  _error: any,
  _context: GenerationContext
): Promise<void> {
  // TODO: Implement email notification or logging to admin dashboard
}

/**
 * Save draft for later review (placeholder)
 */
async function saveDraft<T extends BaseOfferProps>(
  _definition: OfferDefinition<T>,
  _userInput: Record<string, string>,
  _context: GenerationContext
): Promise<void> {
  // TODO: Implement MongoDB draft storage
}

// ==================== LLM CALL ====================

/**
 * Call OpenAI API to generate offer
 */
async function callLLM(
  prompt: string,
  metadata: GenerationMetadata,
  openai: OpenAI
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const { model, maxTokens, temperature, topP, frequencyPenalty, presencePenalty } = metadata;
  
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
  context: GenerationContext,
  openai: OpenAI
): Promise<GenerationResult<T>> {
  const startTime = Date.now();
  let retryCount = 0;
  
  try {
    // Check version deprecation (no-op for now)
    if (isVersionDeprecated(definition.version)) {
      // Version is deprecated but still functional
    }
    
    // Step 1: Validate inputs
    // Prefer unified offer's derived requirements (from questions) over legacy inputRequirements
    const inputRequirements = hasOffer(definition.type as any)
      ? deriveInputRequirements(definition.type as any)
      : definition.inputRequirements;

    const inputValidation = validateOfferInputs(userInput, inputRequirements);
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
      () => callLLM(prompt, definition.generationMetadata, openai),
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
        promptTokens: llmResponse.usage.promptTokens,
        completionTokens: llmResponse.usage.completionTokens,
        cost,
        duration,
        retries: retryCount,
        version: definition.version.version,
        cacheHit: false, // TODO: Implement caching
      },
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;

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

// ==================== UNIFIED OFFER GENERATION ====================

/**
 * Handle fallback for unified offers
 */
async function handleUnifiedFallback(
  offer: UnifiedOffer<unknown>,
  userInput: Record<string, string>,
  error: any,
  context: GenerationContext
): Promise<BaseOfferProps | null> {
  const { strategy, template } = offer.fallback;

  switch (strategy) {
    case 'use-template':
      if (!template) {
        return null;
      }

      return {
        ...(template as BaseOfferProps),
        id: `fallback-${Date.now()}`,
        type: offer.type,
        businessName: context.businessName,
        flow: context.flow,
        generatedAt: new Date().toISOString(),
        version: offer.version,
      };

    case 'retry':
      // Retry is handled by retryLLMCall, if we get here all retries failed
      return null;

    case 'error':
    default:
      return null;
  }
}

/**
 * Generate an offer using the unified offer definition
 * This is the new generation function that uses UnifiedOffer directly
 *
 * Note: We accept UnifiedOffer<unknown> to work with the registry's return type,
 * then cast internally. The output type is BaseOfferProps at minimum.
 */
export async function generateFromUnifiedOffer(
  offer: UnifiedOffer<unknown>,
  userInput: Record<string, string>,
  context: GenerationContext,
  openai: OpenAI
): Promise<GenerationResult<BaseOfferProps>> {
  const startTime = Date.now();
  let retryCount = 0;

  try {
    // NOTE: Input validation removed - the chatbot guarantees all required questions
    // are answered before triggering generation. Both use the same offer definition
    // as source of truth. The old validation was also broken because deriveInputRequirements
    // collected from ALL intents, not just the current one.

    // Step 1: Build prompt using unified offer's generation config
    // Convert GenerationContext to UnifiedPromptContext
    const unifiedContext: UnifiedPromptContext = {
      intent: (context.flow || 'buy') as Intent,
      flow: context.flow, // backwards compatibility
      businessName: context.businessName,
      qdrantAdvice: context.qdrantAdvice,
      additionalContext: context.additionalContext,
    };

    const prompt = offer.generation.buildPrompt(userInput, unifiedContext);

    // Step 3: Build generation metadata from unified config
    const generationMetadata: GenerationMetadata = {
      model: offer.generation.model as GenerationMetadata['model'],
      maxTokens: offer.generation.maxTokens,
      temperature: offer.generation.temperature,
    };

    // Step 4: Build retry config (use defaults, allow override from fallback.maxRetries)
    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetries: offer.fallback.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries,
    };

    // Step 5: Call LLM with retry logic
    const { result: llmResponse, attempts, totalDelay } = await retryLLMCall(
      () => callLLM(prompt, generationMetadata, openai),
      retryConfig,
      offer.type
    );

    retryCount = attempts - 1;

    // Step 6: Extract and parse JSON
    const { success: jsonSuccess, json: parsedOutput, error: jsonError } =
      extractJSON(llmResponse.content);

    if (!jsonSuccess || !parsedOutput) {
      throw new Error(`Failed to parse LLM output as JSON: ${jsonError}`);
    }

    // Step 7: Validate output using unified offer's validator
    const outputValidation = offer.generation.validateOutput(parsedOutput);
    if (!outputValidation.valid) {
      throw new Error(
        `Output validation failed: ${outputValidation.errors?.join(', ')}`
      );
    }

    // Step 8: Sanitize output
    const sanitized = sanitizeOutput(parsedOutput);

    // Step 9: Post-process if defined
    let finalOutput = sanitized as BaseOfferProps;
    if (offer.generation.postProcess) {
      finalOutput = offer.generation.postProcess(finalOutput, userInput) as BaseOfferProps;
    }

    // Step 10: Add base properties if not present
    finalOutput = {
      ...finalOutput,
      id: finalOutput.id || `${offer.type}-${Date.now()}`,
      type: offer.type,
      businessName: context.businessName,
      flow: context.flow,
      generatedAt: finalOutput.generatedAt || new Date().toISOString(),
      version: offer.version,
    };

    // Calculate cost
    const cost = calculateActualCost(
      llmResponse.usage.promptTokens,
      llmResponse.usage.completionTokens,
      generationMetadata.model
    );

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: finalOutput,
      metadata: {
        tokensUsed: llmResponse.usage.totalTokens,
        promptTokens: llmResponse.usage.promptTokens,
        completionTokens: llmResponse.usage.completionTokens,
        cost,
        duration,
        retries: retryCount,
        version: offer.version,
        cacheHit: false,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Try fallback using unified offer's fallback config
    const fallbackResult = await handleUnifiedFallback(offer, userInput, error, context);

    if (fallbackResult) {
      return {
        success: true,
        data: fallbackResult,
        metadata: {
          tokensUsed: 0,
          cost: 0,
          duration,
          retries: retryCount,
          version: offer.version,
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