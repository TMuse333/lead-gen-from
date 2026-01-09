// lib/offers/core/registry.ts
/**
 * Central registry for all offer definitions
 * NOW POPULATED with all offer types!
 */

import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferDefinition, OfferRegistry } from './types';

// Import all offer definitions
import { PDF_OFFER_DEFINITION } from '../definitions/pdfOffer';
import { LANDING_PAGE_OFFER_DEFINITION } from '../definitions/landingPageOffer';
import { VIDEO_OFFER_DEFINITION } from '../definitions/videoOffer';
import { HOME_ESTIMATE_OFFER_DEFINITION } from '../definitions/homeEstimateOffer';
import { CUSTOM_OFFER_DEFINITION } from '../definitions/customOffer';
import { REAL_ESTATE_TIMELINE_DEFINITION } from '../definitions/realEstateTimeline';

// ==================== REGISTRY ====================

/**
 * Global offer registry
 * NOW COMPLETE with all 6 offer definitions!
 */
export const OFFER_DEFINITIONS = {
  'pdf': PDF_OFFER_DEFINITION,
  'landingPage': LANDING_PAGE_OFFER_DEFINITION,
  'video': VIDEO_OFFER_DEFINITION,
  'home-estimate': HOME_ESTIMATE_OFFER_DEFINITION,
  'custom': CUSTOM_OFFER_DEFINITION,
  'real-estate-timeline': REAL_ESTATE_TIMELINE_DEFINITION,
} as unknown as OfferRegistry;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get offer definition by type
 */
export function getOfferDefinition(type: OfferType): OfferDefinition | null {
  const definition = OFFER_DEFINITIONS[type];
  
  if (!definition) {
    console.warn(`[Registry] No definition found for offer type: ${type}`);
    return null;
  }
  
  return definition;
}

/**
 * Check if offer type has a definition
 */
export function hasOfferDefinition(type: OfferType): boolean {
  return type in OFFER_DEFINITIONS;
}

/**
 * Get all available offer types
 */
export function getAvailableOfferTypes(): OfferType[] {
  return Object.keys(OFFER_DEFINITIONS) as OfferType[];
}

/**
 * Register a new offer definition (for future extensibility)
 */
export function registerOfferDefinition(
  type: OfferType,
  definition: OfferDefinition
): void {
  OFFER_DEFINITIONS[type] = definition;
}

/**
 * Get all offer definitions
 */
export function getAllOfferDefinitions(): Array<{
  type: OfferType;
  definition: OfferDefinition;
}> {
  return Object.entries(OFFER_DEFINITIONS)
    .filter(([_, def]) => def !== undefined)
    .map(([type, definition]) => ({
      type: type as OfferType,
      definition: definition!,
    }));
}

/**
 * Validate registry (ensure all offer types have definitions)
 */
export function validateRegistry(): {
  valid: boolean;
  missing: OfferType[];
  available: OfferType[];
} {
  const allOfferTypes: OfferType[] = [
    'pdf',
    'landingPage',
    'video',
    'home-estimate',
    'custom',
    'real-estate-timeline',
  ];
  
  const available = getAvailableOfferTypes();
  const missing = allOfferTypes.filter((type) => !hasOfferDefinition(type));
  
  return {
    valid: missing.length === 0,
    missing,
    available,
  };
}

// ==================== DEVELOPMENT HELPERS ====================

/**
 * Get registry status for debugging
 */
export function getRegistryStatus(): {
  totalTypes: number;
  registered: number;
  missing: number;
  types: Array<{ type: OfferType; registered: boolean; version?: string }>;
} {
  const allTypes: OfferType[] = [
    'pdf',
    'landingPage',
    'video',
    'home-estimate',
    'custom',
    'real-estate-timeline',
  ];
  
  const types = allTypes.map((type) => {
    const definition = OFFER_DEFINITIONS[type];
    return {
      type,
      registered: !!definition,
      version: definition?.version.version,
    };
  });
  
  return {
    totalTypes: allTypes.length,
    registered: types.filter((t) => t.registered).length,
    missing: types.filter((t) => !t.registered).length,
    types,
  };
}

/**
 * Log registry status to console (no-op in production)
 */
export function logRegistryStatus(): void {
  // No-op - debug logging removed
}