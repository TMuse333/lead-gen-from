// frontend/src/types/offerCustomization.types.ts
/**
 * Types for offer customization system
 * Defines how users can customize offer definitions
 */

import type { ObjectId } from 'mongodb';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type {
  GenerationMetadata,
  FieldValidation,
  FallbackConfig,
} from '@/lib/offers/core/types';

/**
 * User customizations for input requirements
 */
export interface InputRequirementsCustomization {
  additionalRequiredFields?: string[];
  removedRequiredFields?: string[];
  customValidations?: Record<string, FieldValidation>;
}

/**
 * User customizations for prompt modifications
 */
export interface PromptModifications {
  prependText?: string;
  appendText?: string;
  customInstructions?: string;
}

/**
 * All user customizations for an offer
 */
export interface OfferCustomizations {
  // Override generation settings
  generationMetadata?: Partial<GenerationMetadata>;

  // Override input requirements
  inputRequirements?: InputRequirementsCustomization;

  // Custom prompt modifications
  promptModifications?: PromptModifications;

  // Enable/disable
  enabled?: boolean;

  // Custom fallback config
  fallbackConfig?: Partial<FallbackConfig>;
}

/**
 * MongoDB document for offer customization
 */
export interface OfferCustomizationDocument {
  _id?: ObjectId;
  userId: string;
  offerType: OfferType;

  // User overrides (partial - only what user changed)
  customizations?: OfferCustomizations;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTestedAt?: Date;
  lastGeneratedAt?: Date;
}

/**
 * Offer generation statistics
 */
export interface OfferStats {
  offerType: OfferType;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageCost: number;
  averageDuration: number;
  averageTokens: number;
  successRate: number;
  lastGeneratedAt?: Date;
}

/**
 * Single offer generation history entry
 */
export interface OfferHistoryEntry {
  _id: string;
  offerType: OfferType;
  userId: string;
  success: boolean;
  cost: number;
  tokensUsed: number;
  duration: number;
  error?: string;
  createdAt: Date;
}

/**
 * Test generation request
 */
export interface OfferTestRequest {
  offerType: OfferType;
  sampleData: Record<string, string>;
  context?: {
    flow?: string;
    businessName?: string;
    qdrantAdvice?: string[];
  };
}

/**
 * Test generation response
 */
export interface OfferTestResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    cost: number;
    tokensUsed: number;
    duration: number;
    retries: number;
  };
}

/**
 * Editor tab IDs
 */
export type EditorTab =
  | 'instructions'
  | 'setup-wizard'
  | 'summary'
  | 'live-preview'
  | 'hero-section'
  | 'ending-cta'
  | 'agent-stats'
  | 'settings'
  | 'analytics'
  // Legacy tabs (kept for backwards compatibility)
  | 'timeline-builder'
  | 'questions'
  | 'bot-responses'
  | 'overview'
  | 'knowledge'
  | 'prompt'
  | 'output'
  | 'test';
