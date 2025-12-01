// src/lib/rateLimit/getRateLimit.ts
// Rate limit checking utility

import { getTokenUsageCollection, getRateLimitConfigsCollection } from '@/lib/mongodb/db';
import { DEFAULT_RATE_LIMITS, type RateLimitConfig } from '@/lib/mongodb/models/rateLimitConfig';
import type { FeatureType } from '@/types/tokenUsage.types';

// In-memory cache for rate limit configs (5 min TTL)
const configCache = new Map<string, { config: RateLimitConfig; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get rate limit configuration for a feature
 * Uses cache to reduce MongoDB queries
 */
async function getRateLimitConfig(feature: FeatureType): Promise<RateLimitConfig> {
  // Check cache first
  const cached = configCache.get(feature);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config;
  }

  // Load from database
  const collection = await getRateLimitConfigsCollection();
  const doc = await collection.findOne({ feature });

  let config: RateLimitConfig;
  if (doc) {
    config = {
      authenticated: doc.authenticated,
      unauthenticated: doc.unauthenticated,
      enabled: doc.enabled,
    };
  } else {
    // Use defaults if not configured
    config = DEFAULT_RATE_LIMITS[feature];
  }

  // Update cache
  configCache.set(feature, {
    config,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return config;
}

/**
 * Invalidate cache for a feature (call after updating config)
 */
export function invalidateRateLimitCache(feature?: FeatureType) {
  if (feature) {
    configCache.delete(feature);
  } else {
    configCache.clear();
  }
}

/**
 * Convert window string to milliseconds
 */
function windowToMs(window: '1h' | '24h'): number {
  return window === '1h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

/**
 * Count recent requests for a feature
 */
async function countRecentRequests(
  feature: FeatureType,
  userId?: string,
  ip?: string,
  window: '1h' | '24h' = '1h'
): Promise<number> {
  const collection = await getTokenUsageCollection();
  const windowMs = windowToMs(window);
  const since = new Date(Date.now() - windowMs);

  const query: any = {
    feature,
    timestamp: { $gte: since },
  };

  // Match by userId (authenticated) or IP (unauthenticated)
  if (userId) {
    query.userId = userId;
  } else if (ip && ip !== 'unknown') {
    // For unauthenticated, we'd need to store IP in token_usage
    // For now, we'll use a combination approach
    query.userId = { $exists: false };
    // Note: You may want to add ipAddress field to token_usage tracking
  }

  return await collection.countDocuments(query);
}

/**
 * Calculate reset time based on window
 */
function calculateResetTime(window: '1h' | '24h'): Date {
  const now = Date.now();
  const windowMs = windowToMs(window);
  
  if (window === '1h') {
    // Reset at top of next hour
    const nextHour = Math.ceil(now / windowMs) * windowMs;
    return new Date(nextHour);
  } else {
    // Reset at midnight
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  current: number;
}

/**
 * Check if a request is within rate limits
 */
export async function checkRateLimit(
  feature: FeatureType,
  userId?: string,
  ip?: string
): Promise<RateLimitResult> {
  // Get configuration
  const config = await getRateLimitConfig(feature);

  // If disabled, allow all requests
  if (!config.enabled) {
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: new Date(Date.now() + 3600000),
      limit: Infinity,
      current: 0,
    };
  }

  // Determine which limits to use
  const limits = userId ? config.authenticated : config.unauthenticated;

  // Count recent requests
  const current = await countRecentRequests(feature, userId, ip, limits.window);

  // Check if exceeded
  const allowed = current < limits.requests;
  const remaining = Math.max(0, limits.requests - current);
  const resetAt = calculateResetTime(limits.window);

  return {
    allowed,
    remaining,
    resetAt,
    limit: limits.requests,
    current,
  };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request | { headers: Headers }): string {
  // Try various headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

