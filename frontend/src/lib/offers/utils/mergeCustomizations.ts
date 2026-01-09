// frontend/src/lib/offers/utils/mergeCustomizations.ts
/**
 * Utilities for merging system offer definitions with user customizations
 */

import type { OfferDefinition, BaseOfferProps } from '@/lib/offers/core/types';
import type {
  OfferCustomizationDocument,
  OfferCustomizations,
} from '@/types/offers/offerCustomization.types';

/**
 * Merge system offer definition with user customizations
 * System defaults are preserved, user customizations override specific fields
 */
export function mergeOfferDefinition<T extends BaseOfferProps = BaseOfferProps>(
  systemDef: OfferDefinition<T>,
  userCustomizations: OfferCustomizationDocument | null
): OfferDefinition<T> {
  // No customizations - return system defaults
  if (!userCustomizations?.customizations) {
    return systemDef;
  }

  const custom = userCustomizations.customizations;
  const merged = { ...systemDef };

  // Merge generation metadata
  if (custom.generationMetadata) {
    merged.generationMetadata = {
      ...merged.generationMetadata,
      ...custom.generationMetadata,
    };
  }

  // Merge input requirements
  if (custom.inputRequirements) {
    merged.inputRequirements = mergeInputRequirements(
      merged.inputRequirements,
      custom.inputRequirements
    );
  }

  // Merge fallback config
  if (custom.fallbackConfig) {
    merged.fallbackConfig = {
      ...merged.fallbackConfig,
      ...custom.fallbackConfig,
    } as typeof merged.fallbackConfig;
  }

  return merged;
}

/**
 * Merge input requirements with user customizations
 */
function mergeInputRequirements(
  systemReqs: any,
  customReqs: any
): any {
  const merged = { ...systemReqs };

  // Add additional required fields
  if (customReqs.additionalRequiredFields?.length > 0) {
    merged.requiredFields = [
      ...new Set([
        ...merged.requiredFields,
        ...customReqs.additionalRequiredFields,
      ]),
    ];
  }

  // Remove specified required fields
  if (customReqs.removedRequiredFields?.length > 0) {
    merged.requiredFields = merged.requiredFields.filter(
      (field: string) => !customReqs.removedRequiredFields.includes(field)
    );
  }

  // Merge custom validations
  if (customReqs.customValidations) {
    merged.fieldValidations = {
      ...merged.fieldValidations,
      ...customReqs.customValidations,
    };
  }

  return merged;
}

/**
 * Extract only the customizations (diff from system defaults)
 * This is what gets saved to database
 */
export function extractCustomizations<T extends BaseOfferProps = BaseOfferProps>(
  systemDef: OfferDefinition<T>,
  editedDef: Partial<OfferDefinition<T>>
): OfferCustomizations {
  const customizations: OfferCustomizations = {};

  // Check generation metadata changes
  if (editedDef.generationMetadata) {
    const metaDiff: any = {};
    let hasChanges = false;

    Object.keys(editedDef.generationMetadata).forEach((key) => {
      const editedValue = (editedDef.generationMetadata as any)[key];
      const systemValue = (systemDef.generationMetadata as any)[key];

      if (editedValue !== systemValue) {
        metaDiff[key] = editedValue;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      customizations.generationMetadata = metaDiff;
    }
  }

  // Check enabled status
  if (editedDef.hasOwnProperty('enabled')) {
    customizations.enabled = (editedDef as any).enabled;
  }

  return customizations;
}

/**
 * Check if offer has any customizations
 */
export function hasCustomizations(
  customization: OfferCustomizationDocument | null
): boolean {
  if (!customization?.customizations) {
    return false;
  }

  const c = customization.customizations;
  return !!(
    c.generationMetadata ||
    c.inputRequirements ||
    c.promptModifications ||
    c.fallbackConfig ||
    c.enabled === false
  );
}

/**
 * Get summary of customizations for display
 */
export function getCustomizationSummary(
  customization: OfferCustomizationDocument | null
): string[] {
  if (!customization?.customizations) {
    return [];
  }

  const summary: string[] = [];
  const c = customization.customizations;

  if (c.generationMetadata) {
    const keys = Object.keys(c.generationMetadata);
    summary.push(`Modified ${keys.length} generation setting(s)`);
  }

  if (c.inputRequirements) {
    if (c.inputRequirements.additionalRequiredFields?.length) {
      summary.push(
        `Added ${c.inputRequirements.additionalRequiredFields.length} required field(s)`
      );
    }
    if (c.inputRequirements.removedRequiredFields?.length) {
      summary.push(
        `Removed ${c.inputRequirements.removedRequiredFields.length} required field(s)`
      );
    }
  }

  if (c.promptModifications) {
    summary.push('Custom prompt modifications');
  }

  if (c.enabled === false) {
    summary.push('Disabled');
  }

  return summary;
}
