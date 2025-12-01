// src/lib/mongodb/models/rateLimitConfig.ts
// MongoDB schema for rate limit configurations

import { ObjectId } from 'mongodb';
import type { FeatureType } from '@/types/tokenUsage.types';

export interface RateLimitWindow {
  requests: number;
  window: '1h' | '24h';
  tokens?: number; // Optional token-based limit
}

export interface RateLimitConfig {
  authenticated: RateLimitWindow;
  unauthenticated: RateLimitWindow;
  enabled: boolean;
}

export interface RateLimitConfigDocument {
  _id?: ObjectId;
  feature: FeatureType;
  authenticated: RateLimitWindow;
  unauthenticated: RateLimitWindow;
  enabled: boolean;
  updatedAt: Date;
  updatedBy?: string; // Admin user ID
  createdAt: Date;
}

/**
 * Default rate limits for all features
 */
export const DEFAULT_RATE_LIMITS: Record<FeatureType, RateLimitConfig> = {
  'embeddings.adviceUpload': {
    authenticated: { requests: 500, window: '1h' },
    unauthenticated: { requests: 100, window: '1h' },
    enabled: true,
  },
  'embeddings.userQuery': {
    authenticated: { requests: 500, window: '1h' },
    unauthenticated: { requests: 100, window: '1h' },
    enabled: true,
  },
  'chat.intentClassification': {
    authenticated: { requests: 200, window: '1h' },
    unauthenticated: { requests: 50, window: '1h' },
    enabled: true,
  },
  'chat.replyGeneration': {
    authenticated: { requests: 200, window: '1h' },
    unauthenticated: { requests: 50, window: '1h' },
    enabled: true,
  },
  'chat.answerExtraction': {
    authenticated: { requests: 100, window: '1h' },
    unauthenticated: { requests: 20, window: '1h' },
    enabled: true,
  },
  'chat.instantReaction': {
    authenticated: { requests: 200, window: '1h' },
    unauthenticated: { requests: 50, window: '1h' },
    enabled: true,
  },
  'offerGeneration': {
    authenticated: { requests: 50, window: '1h' },
    unauthenticated: { requests: 5, window: '1h' },
    enabled: true,
  },
  'rulesGeneration': {
    authenticated: { requests: 20, window: '1h' },
    unauthenticated: { requests: 2, window: '1h' },
    enabled: true,
  },
  'rulesTranslation': {
    authenticated: { requests: 50, window: '1h' },
    unauthenticated: { requests: 5, window: '1h' },
    enabled: true,
  },
  'voiceScriptGeneration': {
    authenticated: { requests: 10, window: '1h' },
    unauthenticated: { requests: 1, window: '1h' },
    enabled: true,
  },
  'onboarding.generateQuestions': {
    authenticated: { requests: 10, window: '1h' },
    unauthenticated: { requests: 1, window: '1h' },
    enabled: true,
  },
  'onboarding.generateFlow': {
    authenticated: { requests: 10, window: '1h' },
    unauthenticated: { requests: 1, window: '1h' },
    enabled: true,
  },
  'documentExtraction': {
    authenticated: { requests: 10, window: '1h' },
    unauthenticated: { requests: 2, window: '1h' },
    enabled: true,
  },
};

