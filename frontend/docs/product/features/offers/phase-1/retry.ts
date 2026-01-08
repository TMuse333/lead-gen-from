// lib/offers/core/retry.ts
/**
 * Retry logic with exponential backoff for LLM calls
 * Handles transient errors and rate limiting
 */

import type { RetryConfig } from './types';

// ==================== ERROR CLASSIFICATION ====================

/**
 * Classify error to determine if it's retryable
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  const errorType = error.type?.toLowerCase() || '';
  
  // Check if error matches any retryable patterns
  return retryableErrors.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    return (
      errorMessage.includes(lowerPattern) ||
      errorCode.includes(lowerPattern) ||
      errorType.includes(lowerPattern)
    );
  });
}

/**
 * Extract error details for logging
 */
function getErrorDetails(error: any): {
  message: string;
  code?: string;
  type?: string;
} {
  return {
    message: error.message || 'Unknown error',
    code: error.code,
    type: error.type,
  };
}

// ==================== BACKOFF CALCULATION ====================

/**
 * Calculate delay for next retry attempt
 */
function calculateBackoff(
  attempt: number,
  baseBackoffMs: number,
  exponential: boolean = true
): number {
  if (!exponential) {
    return baseBackoffMs;
  }
  
  // Exponential backoff: baseBackoff * 2^attempt
  // With jitter to avoid thundering herd
  const exponentialDelay = baseBackoffMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== RETRY WRAPPER ====================

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  context?: {
    operationName?: string;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<{
  result: T;
  attempts: number;
  totalDelay: number;
}> {
  const {
    maxRetries,
    backoffMs,
    retryableErrors,
    exponentialBackoff = true,
  } = config;
  
  let lastError: any;
  let totalDelay = 0;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // First attempt has no delay
      if (attempt > 0) {
        const delay = calculateBackoff(attempt - 1, backoffMs, exponentialBackoff);
        
        console.log(
          `[Retry] Attempt ${attempt}/${maxRetries} for ${context?.operationName || 'operation'}. ` +
          `Waiting ${delay}ms before retry...`
        );
        
        await sleep(delay);
        totalDelay += delay;
        
        // Call retry callback if provided
        context?.onRetry?.(attempt, lastError);
      }
      
      // Execute the function
      const result = await fn();
      
      // Log success if we had retries
      if (attempt > 0) {
        console.log(
          `[Retry] Success on attempt ${attempt}/${maxRetries} for ${context?.operationName || 'operation'}`
        );
      }
      
      return {
        result,
        attempts: attempt + 1,
        totalDelay,
      };
      
    } catch (error) {
      lastError = error;
      const errorDetails = getErrorDetails(error);
      
      // Check if error is retryable
      const shouldRetry = isRetryableError(error, retryableErrors);
      
      console.error(
        `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed for ${context?.operationName || 'operation'}. ` +
        `Error: ${errorDetails.message}. ` +
        `Retryable: ${shouldRetry}`
      );
      
      // If not retryable or out of retries, throw
      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

// ==================== RETRY STRATEGIES ====================

/**
 * Create a retry function with specific config
 */
export function createRetryFunction<T>(
  config: RetryConfig
): (
  fn: () => Promise<T>,
  operationName?: string
) => Promise<{ result: T; attempts: number }> {
  return async (fn, operationName) => {
    const { result, attempts, totalDelay } = await withRetry(fn, config, {
      operationName,
    });
    
    return { result, attempts };
  };
}

/**
 * Retry specifically for LLM API calls
 */
export async function retryLLMCall<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  offerType: string
): Promise<{
  result: T;
  attempts: number;
  totalDelay: number;
}> {
  return withRetry(fn, config, {
    operationName: `LLM call for ${offerType} offer`,
    onRetry: (attempt, error) => {
      console.warn(
        `[LLM Retry] Retrying ${offerType} offer generation. ` +
        `Attempt: ${attempt}. Error: ${error.message}`
      );
    },
  });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if we should retry based on error
 */
export function shouldRetryError(
  error: any,
  retryableErrors: string[]
): boolean {
  return isRetryableError(error, retryableErrors);
}

/**
 * Get retry delay for a given attempt
 */
export function getRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  return calculateBackoff(
    attempt,
    config.backoffMs,
    config.exponentialBackoff
  );
}

/**
 * Calculate total max retry time
 */
export function calculateMaxRetryTime(config: RetryConfig): number {
  let totalTime = 0;
  
  for (let i = 0; i < config.maxRetries; i++) {
    totalTime += calculateBackoff(
      i,
      config.backoffMs,
      config.exponentialBackoff
    );
  }
  
  return totalTime;
}

// ==================== VALIDATION ====================

/**
 * Validate retry configuration
 */
export function validateRetryConfig(config: RetryConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (config.maxRetries < 0) {
    errors.push('maxRetries must be >= 0');
  }
  
  if (config.maxRetries > 10) {
    errors.push('maxRetries should not exceed 10 (recommended max: 5)');
  }
  
  if (config.backoffMs < 0) {
    errors.push('backoffMs must be >= 0');
  }
  
  if (config.backoffMs > 60000) {
    errors.push('backoffMs should not exceed 60000ms (1 minute)');
  }
  
  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    errors.push('retryableErrors must contain at least one error pattern');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}