// lib/offers/index.ts
/**
 * Barrel export for the Offer System
 * NOW INCLUDES ALL OFFER DEFINITIONS!
 */

// ==================== CORE TYPES ====================
export type {
  BaseOfferProps,
  InputRequirements,
  FieldValidation,
  PromptContext,
  PromptBuilder,
  OutputSchema,
  OutputSchemaProperty,
  ValidationResult,
  OutputValidator,
  RetryConfig,
  FallbackStrategy,
  FallbackConfig,
  CostEstimate,
  CostEstimator,
  OfferVersion,
  GenerationMetadata,
  OfferDefinition,
  GenerationSuccess,
  GenerationError,
  GenerationResult,
  InputValidationResult,
  OfferRegistry,
  GenerationContext,
  GenerationMetrics,
} from './core/types';

// ==================== OFFER OUTPUT TYPES ====================
export type { PdfOfferOutput } from './definitions/pdfOffer';
export type { LandingPageOfferOutput } from './definitions/landingPageOffer';
export type { VideoOfferOutput } from './definitions/videoOffer';
export type { HomeEstimateOfferOutput } from './definitions/homeEstimateOffer';
export type { CustomOfferOutput } from './definitions/customOffer';

// ==================== CORE CONSTANTS ====================
export {
  DEFAULT_RETRY_CONFIG,
  DEFAULT_GENERATION_METADATA,
} from './core/types';

// ==================== OFFER DEFINITIONS ====================
export { PDF_OFFER_DEFINITION } from './definitions/pdfOffer';
export { LANDING_PAGE_OFFER_DEFINITION } from './definitions/landingPageOffer';
export { VIDEO_OFFER_DEFINITION } from './definitions/videoOffer';
export { HOME_ESTIMATE_OFFER_DEFINITION } from './definitions/homeEstimateOffer';
export { CUSTOM_OFFER_DEFINITION } from './definitions/customOffer';

// ==================== REGISTRY ====================
export {
  OFFER_DEFINITIONS,
  getOfferDefinition,
  hasOfferDefinition,
  getAvailableOfferTypes,
  registerOfferDefinition,
  getAllOfferDefinitions,
  validateRegistry,
  getRegistryStatus,
  logRegistryStatus,
} from './core/registry';

// ==================== GENERATOR ====================
export {
  generateOffer,
} from './core/generator';

// ==================== VALIDATORS ====================
export {
  validateOfferInputs,
  getFieldLabel,
  formatValidationErrors,
  isFieldValid,
  getFieldRequirements,
  validateMultipleOffers,
  canGenerateAnyOffer,
} from './validators/inputValidator';

export {
  validateAgainstSchema,
  validateContent,
  validateOutput,
  createValidator,
  isValidJSON,
  extractJSON,
  sanitizeOutput,
} from './validators/outputValidator';

// ==================== COST ESTIMATION ====================
export {
  createCostEstimator,
  formatCostEstimate,
  isWithinBudget,
  getCostSummary,
  calculateActualCost,
  compareCosts,
} from './core/costEstimator';

// ==================== RETRY LOGIC ====================
export {
  withRetry,
  createRetryFunction,
  retryLLMCall,
  shouldRetryError,
  getRetryDelay,
  calculateMaxRetryTime,
  validateRetryConfig,
} from './core/retry';

// ==================== VERSION CONTROL ====================
export {
  parseVersion,
  compareVersions,
  isValidVersion,
  isVersionDeprecated,
  shouldShowDeprecationWarning,
  incrementVersion,
  getLatestVersion,
  getLatestStableVersion,
  createVersion,
  deprecateVersion,
  getDeprecationWarning,
  getMigrationGuide,
  isCompatible,
  isBreakingChange,
  VersionRegistry,
  versionRegistry,
} from './core/versionControl';

// ==================== PROMPT HELPERS ====================
export {
  formatUserInput,
  formatFieldName,
  formatQdrantAdvice,
  formatOutputSchema,
  getPersonalizedGreeting,
  getFlowContext,
  getOutputInstructions,
  getQualityGuidelines,
  buildBasePrompt,
  hasRequiredData,
  extractFields,
  addBusinessContext,
  getPersonalizationHints,
} from './promptBuilders/promptHelpers';

// ==================== FUTURE ENHANCEMENTS (Placeholders) ====================
export type {
  CacheConfig,
  CacheEntry,
} from './future/caching.placeholder';

export {
  checkCache,
  cacheResult,
  invalidateCache,
  clearCache,
} from './future/caching.placeholder';

export type {
  StreamConfig,
  StreamChunk,
} from './future/streaming.placeholder';

export {
  generateOfferStreaming,
  parseStreamingChunks,
  validatePartialResult,
} from './future/streaming.placeholder';

export type {
  PromptVariant,
  ABTestConfig,
  ABTestResult,
} from './future/abTesting.placeholder';

export {
  selectVariant,
  trackABTestResult,
  getABTestStats,
  determineWinner,
} from './future/abTesting.placeholder';