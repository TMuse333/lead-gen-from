// lib/onboarding/validateOfferRequirements.ts
// Validates that selected offers' required fields exist in conversation flows

import type { OfferType } from "@/stores/onboardingStore/onboarding.store";
import type { ConversationFlow } from "@/stores/conversationConfig/conversation.store";
import { getRequiredFieldsForOffers, getOfferRequirements, FIELD_LABELS } from "@/lib/offers/offerRequirements";

export interface ValidationResult {
  isValid: boolean;
  missingFields: Array<{
    offerType: OfferType;
    offerLabel: string;
    missingFields: string[];
  }>;
  warnings: string[];
}

/**
 * Extract all mappingKeys from conversation flows
 */
function extractMappingKeysFromFlows(
  flows: Record<string, ConversationFlow>
): Set<string> {
  const mappingKeys = new Set<string>();

  Object.values(flows).forEach((flow) => {
    flow.questions?.forEach((question) => {
      if (question.mappingKey) {
        mappingKeys.add(question.mappingKey);
      }
    });
  });

  return mappingKeys;
}

/**
 * Validate that all required fields for selected offers exist in conversation flows
 */
export function validateOfferRequirements(
  selectedOffers: OfferType[],
  conversationFlows: Record<string, ConversationFlow>
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingFields: [],
    warnings: [],
  };

  if (selectedOffers.length === 0) {
    return result; // No offers selected, nothing to validate
  }

  // Get all mappingKeys from flows
  const availableMappingKeys = extractMappingKeysFromFlows(conversationFlows);

  // Check each selected offer
  selectedOffers.forEach((offerType) => {
    const requirements = getOfferRequirements(offerType);
    const missing: string[] = [];

    requirements.requiredFields.forEach((requiredField) => {
      if (!availableMappingKeys.has(requiredField)) {
        missing.push(requiredField);
      }
    });

    if (missing.length > 0) {
      result.isValid = false;
      result.missingFields.push({
        offerType,
        offerLabel: requirements.label,
        missingFields: missing,
      });
    }
  });

  // Generate warnings
  if (!result.isValid) {
    result.warnings.push(
      `Some selected offers require questions that aren't in your conversation flows. Please add the missing questions or remove the offers.`
    );
  }

  return result;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.isValid) return "";

  const errors: string[] = [];

  result.missingFields.forEach(({ offerLabel, missingFields }) => {
    const fieldLabels = missingFields
      .map((field) => FIELD_LABELS[field] || field)
      .join(", ");
    errors.push(`${offerLabel} requires: ${fieldLabels}`);
  });

  return errors.join("\n");
}

