// lib/offers/validators/outputValidator.ts
/**
 * Output validation for LLM-generated offers
 * Validates structure and content of generated offers
 */

import type { OutputSchema, ValidationResult } from '../core/types';

// ==================== SCHEMA VALIDATION ====================

/**
 * Validate output against schema
 */
export function validateAgainstSchema(
  output: unknown,
  schema: OutputSchema
): ValidationResult {
  if (!output || typeof output !== 'object') {
    return {
      valid: false,
      errors: ['Output must be an object'],
    };
  }
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const outputObj = output as Record<string, any>;
  
  // Check required properties
  Object.entries(schema.properties).forEach(([propName, propSchema]) => {
    if (propSchema.required && !(propName in outputObj)) {
      errors.push(`Missing required property: ${propName}`);
      return;
    }
    
    const value = outputObj[propName];
    
    // Skip validation if property is not present and not required
    if (value === undefined || value === null) {
      if (propSchema.required) {
        errors.push(`Property '${propName}' is null or undefined`);
      }
      return;
    }
    
    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (propSchema.type !== actualType) {
      errors.push(
        `Property '${propName}' has incorrect type. ` +
        `Expected: ${propSchema.type}, got: ${actualType}`
      );
    }
    
    // Array validation
    if (propSchema.type === 'array' && Array.isArray(value)) {
      if (value.length === 0) {
        warnings.push(`Property '${propName}' is an empty array`);
      }
    }
    
    // String validation
    if (propSchema.type === 'string' && typeof value === 'string') {
      if (value.trim().length === 0) {
        errors.push(`Property '${propName}' is an empty string`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    normalized: errors.length === 0 ? output : undefined,
  };
}

// ==================== CONTENT VALIDATION ====================

/**
 * Validate that output contains meaningful content
 */
export function validateContent(output: Record<string, any>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for placeholder or template values
  const placeholderPatterns = [
    /\{.*?\}/g, // {placeholder}
    /\[.*?\]/g, // [placeholder]
    /TODO/gi,
    /FIXME/gi,
    /XXX/gi,
    /\$\{.*?\}/g, // ${placeholder}
  ];
  
  function checkForPlaceholders(value: any, path: string = ''): void {
    if (typeof value === 'string') {
      placeholderPatterns.forEach((pattern) => {
        if (pattern.test(value)) {
          warnings.push(
            `Possible placeholder found in ${path || 'output'}: ${value.substring(0, 50)}...`
          );
        }
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkForPlaceholders(item, `${path}[${index}]`);
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        checkForPlaceholders(val, path ? `${path}.${key}` : key);
      });
    }
  }
  
  checkForPlaceholders(output);
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    normalized: output,
  };
}

// ==================== COMPOSITE VALIDATION ====================

/**
 * Perform complete validation (schema + content)
 */
export function validateOutput(
  output: unknown,
  schema: OutputSchema
): ValidationResult {
  // First validate against schema
  const schemaResult = validateAgainstSchema(output, schema);
  
  if (!schemaResult.valid) {
    return schemaResult;
  }
  
  // Then validate content
  const contentResult = validateContent(output as Record<string, any>);
  
  // Combine results
  return {
    valid: schemaResult.valid && contentResult.valid,
    errors: [
      ...(schemaResult.errors || []),
      ...(contentResult.errors || []),
    ],
    warnings: [
      ...(schemaResult.warnings || []),
      ...(contentResult.warnings || []),
    ],
    normalized: schemaResult.normalized,
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a validator function from schema
 */
export function createValidator(schema: OutputSchema) {
  return (output: unknown): ValidationResult => {
    return validateOutput(output, schema);
  };
}

/**
 * Check if output is valid JSON
 */
export function isValidJSON(text: string): { valid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(text);
    return { valid: true, parsed };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Extract JSON from LLM response (handles markdown code blocks)
 */
export function extractJSON(text: string): { success: boolean; json?: any; error?: string } {
  // Try parsing as-is first
  const directParse = isValidJSON(text);
  if (directParse.valid) {
    return { success: true, json: directParse.parsed };
  }
  
  // Try extracting from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    const extracted = codeBlockMatch[1].trim();
    const parsedExtracted = isValidJSON(extracted);
    if (parsedExtracted.valid) {
      return { success: true, json: parsedExtracted.parsed };
    }
  }
  
  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsedMatch = isValidJSON(jsonMatch[0]);
    if (parsedMatch.valid) {
      return { success: true, json: parsedMatch.parsed };
    }
  }
  
  return {
    success: false,
    error: `Could not extract valid JSON from LLM response. Error: ${directParse.error}`,
  };
}

/**
 * Sanitize output (remove sensitive data, trim whitespace, etc.)
 */
export function sanitizeOutput(output: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  function sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (typeof value === 'object' && value !== null) {
      const sanitizedObj: Record<string, any> = {};
      Object.entries(value).forEach(([key, val]) => {
        // Skip debug or internal fields
        if (!key.startsWith('_')) {
          sanitizedObj[key] = sanitizeValue(val);
        }
      });
      return sanitizedObj;
    }
    return value;
  }
  
  Object.entries(output).forEach(([key, value]) => {
    if (!key.startsWith('_')) {
      sanitized[key] = sanitizeValue(value);
    }
  });
  
  return sanitized;
}