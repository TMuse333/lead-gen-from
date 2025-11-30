// lib/offers/core/registry.ts
/**
 * Central registry for all offer definitions
 * This will be populated with actual definitions in Phase 2
 */

import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferDefinition, OfferRegistry } from './types';

// ==================== REGISTRY ====================

/**
 * Global offer registry
 * Will be populated with actual offer definitions in Phase 2
 */
export const OFFER_DEFINITIONS: Partial<OfferRegistry> = {
  // TODO: Phase 2 - Add offer definitions
  // 'pdf': PDF_OFFER_DEFINITION,
  // 'landingPage': LANDING_PAGE_OFFER_DEFINITION,
  // 'video': VIDEO_OFFER_DEFINITION,
  // 'home-estimate': HOME_ESTIMATE_OFFER_DEFINITION,
  // 'custom': CUSTOM_OFFER_DEFINITION,
};

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
 * Register a new offer definition
 */
export function registerOfferDefinition(
  type: OfferType,
  definition: OfferDefinition
): void {
  if (OFFER_DEFINITIONS[type]) {
    console.warn(
      `[Registry] Overwriting existing definition for offer type: ${type}`
    );
  }
  
  OFFER_DEFINITIONS[type] = definition;
  console.log(`[Registry] Registered definition for offer type: ${type}`);
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
  types: Array<{ type: OfferType; registered: boolean }>;
} {
  const allTypes: OfferType[] = [
    'pdf',
    'landingPage',
    'video',
    'home-estimate',
    'custom',
  ];
  
  const types = allTypes.map((type) => ({
    type,
    registered: hasOfferDefinition(type),
  }));
  
  return {
    totalTypes: allTypes.length,
    registered: types.filter((t) => t.registered).length,
    missing: types.filter((t) => !t.registered).length,
    types,
  };
}

/**
 * Log registry status to console
 */
export function logRegistryStatus(): void {
  const status = getRegistryStatus();
  
  console.log('[Registry Status]', {
    total: status.totalTypes,
    registered: status.registered,
    missing: status.missing,
  });
  
  status.types.forEach((type) => {
    const icon = type.registered ? '✅' : '❌';
    console.log(`  ${icon} ${type.type}`);
  });
}