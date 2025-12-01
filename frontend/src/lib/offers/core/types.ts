// lib/offers/core/types.ts
/**
 * Core type definitions for the Offer System
 * Includes version control, retry logic, and cost estimation
 */

import type { OfferType } from "@/stores/onboardingStore/onboarding.store";
import type { OutputValue } from "@/types/genericOutput.types";

// ==================== BASE TYPES ====================

export interface BaseOfferProps {
  id: string;
  type: OfferType;
  businessName: string;
  flow: string;
  generatedAt: string;
  version: string; // Version of the offer definition used
}

// ==================== INPUT REQUIREMENTS ====================

export interface FieldValidation {
  type?: 'email' | 'phone' | 'number' | 'text';
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}

export interface InputRequirements {
  requiredFields: string[]; // mappingKeys like 'email', 'propertyAddress'
  optionalFields?: string[]; // Nice to have but not required
  fieldValidations?: Record<string, FieldValidation>;
}

// ==================== PROMPT BUILDER ====================

export interface PromptContext {
  flow: string;
  businessName: string;
  qdrantAdvice?: string[];
  additionalContext?: Record<string, any>;
}

export type PromptBuilder = (
  userInput: Record<string, string>,
  context: PromptContext
) => string;

// ==================== OUTPUT SCHEMA ====================

export interface OutputSchemaProperty {
  type: string;
  description: string;
  required?: boolean;
  example?: any;
}

export interface OutputSchema {
  type: 'object';
  properties: Record<string, OutputSchemaProperty>;
  outputType: string; // e.g., "PdfOfferOutput"
}

// ==================== VALIDATOR ====================

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  normalized?: any;
}

export type OutputValidator = (output: unknown) => ValidationResult;

// ==================== RETRY CONFIGURATION ====================

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number; // Initial backoff in milliseconds
  retryableErrors: string[]; // Error messages that should trigger retry
  exponentialBackoff?: boolean; // Whether to use exponential backoff
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  retryableErrors: [
    'rate_limit',
    'timeout',
    'network',
    'service_unavailable',
    'internal_error',
  ],
  exponentialBackoff: true,
};

// ==================== FALLBACK STRATEGY ====================

export type FallbackStrategy = 'use-template' | 'notify-admin' | 'save-draft' | 'throw-error';

export interface FallbackConfig<T extends BaseOfferProps = BaseOfferProps> {
  strategy: FallbackStrategy;
  template?: Partial<T>; // Template to use if strategy is 'use-template'
  notificationEmail?: string; // Email to notify if strategy is 'notify-admin'
  draftStorage?: 'mongodb' | 'local'; // Where to save draft if strategy is 'save-draft'
}

// ==================== COST ESTIMATION ====================

export interface CostEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  estimatedCostUSD: number;
  model: string;
  breakdown?: {
    promptTokens: number;
    contextTokens: number;
    outputTokens: number;
  };
}

export type CostEstimator = (
  userInput: Record<string, string>,
  context: PromptContext,
  outputSchema: OutputSchema
) => CostEstimate;

// ==================== VERSION CONTROL ====================

export interface OfferVersion {
  version: string; // Semantic version: "1.0.0"
  releaseDate: string; // ISO date
  changelog: string;
  deprecated?: boolean;
  deprecationDate?: string;
  migrationGuide?: string;
}

// ==================== GENERATION METADATA ====================

export interface GenerationMetadata {
  model: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet';
  maxTokens: number;
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export const DEFAULT_GENERATION_METADATA: GenerationMetadata = {
  model: 'gpt-4o-mini',
  maxTokens: 4000,
  temperature: 0.7,
};

// ==================== OFFER DEFINITION ====================

export interface OfferDefinition<T extends BaseOfferProps = BaseOfferProps> {
  // Identity
  type: OfferType;
  label: string;
  description: string;
  icon?: string;
  
  // Version Control
  version: OfferVersion;
  
  // Input requirements
  inputRequirements: InputRequirements;
  
  // Prompt generation
  buildPrompt: PromptBuilder;
  
  // Output structure
  outputSchema: OutputSchema;
  outputValidator: OutputValidator;
  
  // Post-processing (optional)
  postProcess?: (output: T, userInput: Record<string, string>) => T;
  
  // Generation metadata
  generationMetadata: GenerationMetadata;
  
  // Retry & Fallback
  retryConfig: RetryConfig;
  fallbackConfig: FallbackConfig<T>;
  
  // Cost Estimation
  estimateCost: CostEstimator;
  
  // Future enhancements (placeholders)
  caching?: any; // Placeholder for caching
  streaming?: any; // Placeholder for streaming
  abTesting?: any; // Placeholder for A/B testing
  ui?: any; // Placeholder for UI metadata
}

// ==================== GENERATION RESULT ====================

export interface GenerationSuccess<T extends BaseOfferProps = BaseOfferProps> {
  success: true;
  data: T;
  metadata: {
    tokensUsed: number;
    promptTokens?: number; // Input tokens
    completionTokens?: number; // Output tokens
    cost: number;
    duration: number;
    retries: number;
    version: string;
    cacheHit?: boolean;
  };
}

export interface GenerationError {
  success: false;
  error: string;
  errors?: string[];
  fallbackUsed?: boolean;
  metadata?: {
    retries: number;
    duration: number;
  };
}

export type GenerationResult<T extends BaseOfferProps = BaseOfferProps> = 
  | GenerationSuccess<T>
  | GenerationError;

// ==================== VALIDATION TYPES ====================

export interface InputValidationResult {
  valid: boolean;
  missing: string[];
  invalid: Array<{
    field: string;
    reason: string;
    value?: string;
  }>;
}

// ==================== HELPER TYPES ====================

export type OfferRegistry = Record<OfferType, OfferDefinition>;

export interface GenerationContext extends PromptContext {
  userId: string;
  agentId: string;
  sessionId?: string;
}

// ==================== TRACKING TYPES ====================

export interface GenerationMetrics {
  offerType: OfferType;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  cost: number;
  model: string;
  success: boolean;
  retries: number;
  cacheHit: boolean;
  version: string;
  timestamp: string;
  error?: string;
}