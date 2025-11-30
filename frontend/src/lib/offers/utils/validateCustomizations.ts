// frontend/src/lib/offers/utils/validateCustomizations.ts
/**
 * Validation utilities for offer customizations
 */

import type {
  OfferCustomizations,
  InputRequirementsCustomization,
} from '@/types/offers/offerCustomization.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate offer customizations
 */
export function validateCustomizations(
  customizations: OfferCustomizations
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate generation metadata
  if (customizations.generationMetadata) {
    const metaValidation = validateGenerationMetadata(
      customizations.generationMetadata
    );
    errors.push(...metaValidation.errors);
    warnings.push(...metaValidation.warnings);
  }

  // Validate input requirements
  if (customizations.inputRequirements) {
    const inputValidation = validateInputRequirements(
      customizations.inputRequirements
    );
    errors.push(...inputValidation.errors);
    warnings.push(...inputValidation.warnings);
  }

  // Validate prompt modifications
  if (customizations.promptModifications) {
    const promptValidation = validatePromptModifications(
      customizations.promptModifications
    );
    errors.push(...promptValidation.errors);
    warnings.push(...promptValidation.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate generation metadata
 */
function validateGenerationMetadata(metadata: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate model
  if (metadata.model) {
    const validModels = ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'];
    if (!validModels.includes(metadata.model)) {
      errors.push(`Invalid model: ${metadata.model}`);
    }
  }

  // Validate temperature
  if (metadata.temperature !== undefined) {
    if (typeof metadata.temperature !== 'number') {
      errors.push('Temperature must be a number');
    } else if (metadata.temperature < 0 || metadata.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    } else if (metadata.temperature > 1.5) {
      warnings.push('Temperature above 1.5 may produce unpredictable results');
    }
  }

  // Validate maxTokens
  if (metadata.maxTokens !== undefined) {
    if (typeof metadata.maxTokens !== 'number') {
      errors.push('maxTokens must be a number');
    } else if (metadata.maxTokens < 100) {
      errors.push('maxTokens must be at least 100');
    } else if (metadata.maxTokens > 8000) {
      errors.push('maxTokens cannot exceed 8000');
    } else if (metadata.maxTokens < 500) {
      warnings.push('maxTokens below 500 may result in truncated outputs');
    }
  }

  // Validate topP
  if (metadata.topP !== undefined) {
    if (typeof metadata.topP !== 'number') {
      errors.push('topP must be a number');
    } else if (metadata.topP < 0 || metadata.topP > 1) {
      errors.push('topP must be between 0 and 1');
    }
  }

  // Validate penalties
  if (metadata.frequencyPenalty !== undefined) {
    if (typeof metadata.frequencyPenalty !== 'number') {
      errors.push('frequencyPenalty must be a number');
    } else if (
      metadata.frequencyPenalty < -2 ||
      metadata.frequencyPenalty > 2
    ) {
      errors.push('frequencyPenalty must be between -2 and 2');
    }
  }

  if (metadata.presencePenalty !== undefined) {
    if (typeof metadata.presencePenalty !== 'number') {
      errors.push('presencePenalty must be a number');
    } else if (metadata.presencePenalty < -2 || metadata.presencePenalty > 2) {
      errors.push('presencePenalty must be between -2 and 2');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate input requirements customizations
 */
function validateInputRequirements(
  requirements: InputRequirementsCustomization
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate additional required fields
  if (requirements.additionalRequiredFields) {
    if (!Array.isArray(requirements.additionalRequiredFields)) {
      errors.push('additionalRequiredFields must be an array');
    } else {
      requirements.additionalRequiredFields.forEach((field) => {
        if (typeof field !== 'string' || field.trim() === '') {
          errors.push(`Invalid field name: ${field}`);
        }
      });
    }
  }

  // Validate removed required fields
  if (requirements.removedRequiredFields) {
    if (!Array.isArray(requirements.removedRequiredFields)) {
      errors.push('removedRequiredFields must be an array');
    } else if (requirements.removedRequiredFields.includes('email')) {
      warnings.push('Removing email field may cause issues with user identification');
    }
  }

  // Validate custom validations
  if (requirements.customValidations) {
    if (typeof requirements.customValidations !== 'object') {
      errors.push('customValidations must be an object');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate prompt modifications
 */
function validatePromptModifications(modifications: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (modifications.prependText) {
    if (typeof modifications.prependText !== 'string') {
      errors.push('prependText must be a string');
    } else if (modifications.prependText.length > 1000) {
      warnings.push('prependText is very long (>1000 characters)');
    }
  }

  if (modifications.appendText) {
    if (typeof modifications.appendText !== 'string') {
      errors.push('appendText must be a string');
    } else if (modifications.appendText.length > 1000) {
      warnings.push('appendText is very long (>1000 characters)');
    }
  }

  if (modifications.customInstructions) {
    if (typeof modifications.customInstructions !== 'string') {
      errors.push('customInstructions must be a string');
    } else if (modifications.customInstructions.length > 2000) {
      warnings.push('customInstructions is very long (>2000 characters)');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
