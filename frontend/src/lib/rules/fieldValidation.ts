// lib/rules/fieldValidation.ts
// Validation utilities for user fields to detect placeholder values

import type { RuleGroup, ConditionRule } from '@/types/rules.types';

/**
 * Check if a value is a placeholder (e.g., "button-1", "btn-123", etc.)
 */
export function isPlaceholderValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  // Check for common placeholder patterns
  const placeholderPatterns = [
    /^(button-\d+|btn-\d+|button\d+|option-\d+|option\d+)$/i,
    /^(placeholder|temp|test|example)$/i,
    /^(re|btn|opt)$/i, // Common short placeholders
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(value));
}

/**
 * Check if a value is too generic (e.g., single letters, very short values)
 */
export function isGenericValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  // Very short values that are likely placeholders
  if (value.length <= 2 && /^[a-z]+$/i.test(value)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a field has placeholder values (for string arrays)
 */
export function hasPlaceholderValues(values: string[]): boolean {
  if (!Array.isArray(values)) return false;
  return values.some(v => isPlaceholderValue(v) || isGenericValue(v));
}

/**
 * Check if a RuleGroup contains placeholder values
 */
export function hasPlaceholderValuesInRuleGroup(ruleGroup: RuleGroup): boolean {
  if (!ruleGroup || !ruleGroup.rules) return false;

  for (const rule of ruleGroup.rules) {
    // If it's a nested RuleGroup, recurse
    if ('logic' in rule) {
      if (hasPlaceholderValuesInRuleGroup(rule as RuleGroup)) {
        return true;
      }
    } else {
      // It's a ConditionRule - check the value
      const conditionRule = rule as ConditionRule;
      const value = conditionRule.value;
      
      if (Array.isArray(value)) {
        if (hasPlaceholderValues(value)) {
          return true;
        }
      } else if (typeof value === 'string') {
        if (isPlaceholderValue(value) || isGenericValue(value)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get placeholder values from a RuleGroup
 */
function getPlaceholderValuesFromRuleGroup(ruleGroup: RuleGroup): string[] {
  const placeholders: string[] = [];

  if (!ruleGroup || !ruleGroup.rules) return placeholders;

  for (const rule of ruleGroup.rules) {
    // If it's a nested RuleGroup, recurse
    if ('logic' in rule) {
      placeholders.push(...getPlaceholderValuesFromRuleGroup(rule as RuleGroup));
    } else {
      // It's a ConditionRule - check the value
      const conditionRule = rule as ConditionRule;
      const value = conditionRule.value;
      
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (isPlaceholderValue(v) || isGenericValue(v)) {
            placeholders.push(v);
          }
        });
      } else if (typeof value === 'string') {
        if (isPlaceholderValue(value) || isGenericValue(value)) {
          placeholders.push(value);
        }
      }
    }
  }

  return placeholders;
}

/**
 * Get a warning message for a RuleGroup with placeholder values
 */
export function getPlaceholderWarning(ruleGroup: RuleGroup): string | null {
  const placeholders = getPlaceholderValuesFromRuleGroup(ruleGroup);
  if (placeholders.length === 0) return null;
  
  const uniquePlaceholders = [...new Set(placeholders)];
  return `This client situation contains ${uniquePlaceholders.length} placeholder value(s): ${uniquePlaceholders.join(', ')}. Please configure proper button values in your conversation flow.`;
}

/**
 * Filter out placeholder values from an array
 */
export function filterPlaceholderValues(values: string[]): string[] {
  return values.filter(v => !isPlaceholderValue(v) && !isGenericValue(v));
}

