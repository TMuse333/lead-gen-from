// lib/offers/validators/inputValidator.ts
/**
 * Input validation for offer generation
 * Validates user input against offer requirements
 */

import type {
    InputRequirements,
    FieldValidation,
    InputValidationResult,
  } from '../core/types';
  
  // ==================== VALIDATION PATTERNS ====================
  
  const VALIDATION_PATTERNS: Record<string, RegExp | undefined> = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\-\+\(\)]+$/,
    number: /^-?\d+\.?\d*$/,
    text: undefined, // Text has no special validation
  };
  
  // ==================== FIELD VALIDATION ====================
  
  /**
   * Validate a single field value
   */
  function validateField(
    fieldName: string,
    value: string,
    validation?: FieldValidation
  ): { valid: boolean; reason?: string } {
    if (!validation) {
      return { valid: true };
    }
    
    // Check if required and empty
    if (validation.required && (!value || value.trim() === '')) {
      return {
        valid: false,
        reason: 'Field is required',
      };
    }
    
    // If empty and not required, skip other validations
    if (!value || value.trim() === '') {
      return { valid: true };
    }
    
    // Type validation
    if (validation.type) {
      const pattern = VALIDATION_PATTERNS[validation.type];
      
      if (pattern && !pattern.test(value)) {
        return {
          valid: false,
          reason: `Invalid ${validation.type} format`,
        };
      }
    }
    
    // Custom pattern validation
    if (validation.pattern) {
      try {
        const customPattern = new RegExp(validation.pattern);
        if (!customPattern.test(value)) {
          return {
            valid: false,
            reason: 'Does not match required pattern',
          };
        }
      } catch {
        // Invalid regex pattern - skip validation
      }
    }
    
    // Length validation
    if (validation.minLength !== undefined && value.length < validation.minLength) {
      return {
        valid: false,
        reason: `Must be at least ${validation.minLength} characters`,
      };
    }
    
    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return {
        valid: false,
        reason: `Must be at most ${validation.maxLength} characters`,
      };
    }
    
    return { valid: true };
  }
  
  // ==================== INPUT VALIDATION ====================
  
  /**
   * Validate user input against offer requirements
   */
  export function validateOfferInputs(
    userInput: Record<string, string>,
    requirements: InputRequirements
  ): InputValidationResult {
    const missing: string[] = [];
    const invalid: Array<{
      field: string;
      reason: string;
      value?: string;
    }> = [];
    
    // Check required fields
    requirements.requiredFields.forEach((field) => {
      const value = userInput[field];
      
      if (!value || value.trim() === '') {
        missing.push(field);
        return;
      }
      
      // Validate field if validation rules exist
      const validation = requirements.fieldValidations?.[field];
      if (validation) {
        const result = validateField(field, value, validation);
        if (!result.valid) {
          invalid.push({
            field,
            reason: result.reason || 'Invalid value',
            value,
          });
        }
      }
    });
    
    // Check optional fields (only if provided)
    requirements.optionalFields?.forEach((field) => {
      const value = userInput[field];
      
      // Skip if not provided
      if (!value || value.trim() === '') {
        return;
      }
      
      // Validate field if validation rules exist
      const validation = requirements.fieldValidations?.[field];
      if (validation) {
        const result = validateField(field, value, validation);
        if (!result.valid) {
          invalid.push({
            field,
            reason: result.reason || 'Invalid value',
            value,
          });
        }
      }
    });
    
    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
    };
  }
  
  // ==================== HELPER FUNCTIONS ====================
  
  /**
   * Get human-readable field name
   */
  export function getFieldLabel(fieldName: string): string {
    // Convert camelCase or snake_case to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  
  /**
   * Format validation errors for display
   */
  export function formatValidationErrors(
    result: InputValidationResult
  ): string[] {
    const errors: string[] = [];
    
    // Missing fields
    if (result.missing.length > 0) {
      errors.push(
        `Missing required fields: ${result.missing.map(getFieldLabel).join(', ')}`
      );
    }
    
    // Invalid fields
    result.invalid.forEach((invalid) => {
      errors.push(`${getFieldLabel(invalid.field)}: ${invalid.reason}`);
    });
    
    return errors;
  }
  
  /**
   * Check if specific field is valid
   */
  export function isFieldValid(
    fieldName: string,
    value: string,
    requirements: InputRequirements
  ): { valid: boolean; reason?: string } {
    const validation = requirements.fieldValidations?.[fieldName];
    return validateField(fieldName, value, validation);
  }
  
  /**
   * Get validation requirements for a field
   */
  export function getFieldRequirements(
    fieldName: string,
    requirements: InputRequirements
  ): {
    required: boolean;
    validation?: FieldValidation;
  } {
    const isRequired = requirements.requiredFields.includes(fieldName);
    const validation = requirements.fieldValidations?.[fieldName];
    
    return {
      required: isRequired,
      validation,
    };
  }
  
  // ==================== BATCH VALIDATION ====================
  
  /**
   * Validate multiple inputs for different offer types
   */
  export function validateMultipleOffers(
    userInput: Record<string, string>,
    offerRequirements: Array<{
      offerType: string;
      requirements: InputRequirements;
    }>
  ): Record<string, InputValidationResult> {
    const results: Record<string, InputValidationResult> = {};
    
    offerRequirements.forEach(({ offerType, requirements }) => {
      results[offerType] = validateOfferInputs(userInput, requirements);
    });
    
    return results;
  }
  
  /**
   * Check if any offer can be generated with current input
   */
  export function canGenerateAnyOffer(
    userInput: Record<string, string>,
    offerRequirements: Array<{
      offerType: string;
      requirements: InputRequirements;
    }>
  ): {
    canGenerate: boolean;
    validOffers: string[];
    invalidOffers: string[];
  } {
    const results = validateMultipleOffers(userInput, offerRequirements);
    const validOffers: string[] = [];
    const invalidOffers: string[] = [];
    
    Object.entries(results).forEach(([offerType, result]) => {
      if (result.valid) {
        validOffers.push(offerType);
      } else {
        invalidOffers.push(offerType);
      }
    });
    
    return {
      canGenerate: validOffers.length > 0,
      validOffers,
      invalidOffers,
    };
  }