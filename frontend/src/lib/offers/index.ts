// lib/offers/index.ts
/**
 * Barrel export for the Offer System
 * Provides clean imports for the entire system
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
  
  // ==================== CORE CONSTANTS ====================
  export {
    DEFAULT_RETRY_CONFIG,
    DEFAULT_GENERATION_METADATA,
  } from './core/types';
  
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
    generateFromUnifiedOffer,
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
  
  // ==================== FUTURE ENHANCEMENTS ====================
  // Placeholder features (caching, streaming, A/B testing) are not yet implemented
  // These will be added in Phase 3 if needed