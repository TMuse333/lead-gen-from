// src/lib/offers/unified/index.ts
/**
 * Unified Offer System
 *
 * Single source of truth for all offers in the system.
 *
 * Usage:
 *   import {
 *     getOffer,
 *     getMergedQuestions,
 *     getProgress,
 *     isComplete,
 *   } from '@/lib/offers/unified';
 */

// ==================== TYPES ====================

export type {
  // Core types
  Intent,
  OfferType,

  // Question types
  QuestionInputType,
  QuestionButton,
  QuestionValidation,
  Question,

  // Tracking types
  TrackingIconName,
  ProgressStyle,
  TrackingField,
  TrackingConfig,

  // Generation types
  PromptAdviceItem,
  PromptContext,
  OutputSchemaProperty,
  OutputSchema,
  ValidationResult,
  GenerationConfig,

  // Results types
  ResultsConfig,

  // Fallback types
  FallbackStrategy,
  FallbackConfig,

  // Offer types
  OfferCategory,
  UnifiedOffer,

  // Registry types
  OfferRegistry,
  MergedQuestions,

  // Knowledge requirements types
  KnowledgePriority,
  PhaseKnowledgeRequirement,
  KnowledgeRequirements,
} from './types';

// ==================== CONSTANTS ====================

export { ALL_INTENTS, ALL_OFFER_TYPES } from './types';

// ==================== TYPE GUARDS ====================

export {
  isValidIntent,
  isValidOfferType,
  offerSupportsIntent,
  isButtonQuestion,
  isTextQuestion,
} from './types';

// ==================== FACTORY HELPERS ====================

export {
  createButtonQuestion,
  createTextQuestion,
  createEmailQuestion,
  createLocationQuestion,
} from './types';

// ==================== REGISTRY ====================

export { OFFERS, registerOffer } from './registry';

// ==================== LOOKUP FUNCTIONS ====================

export {
  getOffer,
  hasOffer,
  getAllOffers,
  getRegisteredOfferTypes,
} from './registry';

// ==================== INTENT-BASED FUNCTIONS ====================

export {
  getOffersForIntent,
  getOfferTypesForIntent,
  getSupportedIntents,
  filterOffersForIntent,
} from './registry';

// ==================== QUESTION FUNCTIONS ====================

export {
  getQuestionsForOffer,
  getMergedQuestions,
  getMappingKeysForIntent,
  getNextQuestion,
  getQuestion,
  getFirstQuestion,
  getQuestionCount,
} from './registry';

// ==================== PROGRESS FUNCTIONS ====================

export {
  isComplete,
  getProgress,
  getUnansweredRequired,
} from './registry';

// ==================== TRACKING FUNCTIONS ====================

export {
  getTrackingConfig,
  getTrackingField,
  getPreviewFields,
} from './registry';

// ==================== VALIDATION FUNCTIONS ====================

export { validateOfferCoverage, deriveInputRequirements } from './registry';

// ==================== DEBUG FUNCTIONS ====================

export { getRegistryStatus, logRegistryStatus } from './registry';

// ==================== OFFERS ====================

// Import offers to register them
import './offers';

// Re-export individual offers (only timeline is active)
export { TIMELINE_OFFER } from './offers';

// Re-export output types (only timeline is active)
export type { TimelineOutput, TimelinePhase, UserSituation } from './offers';
