// lib/onboarding/validateOfferRequirements.ts
// Validates that selected offers' required fields exist in conversation flows

import type { OfferType, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
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
 * Extract all mappingKeys from specific conversation flows
 */
function extractMappingKeysFromFlows(
  flows: Record<string, ConversationFlow>,
  flowTypes?: FlowIntention[]
): Set<string> {
  const mappingKeys = new Set<string>();

  const flowsToCheck = flowTypes 
    ? flowTypes.filter(ft => flows[ft]).map(ft => flows[ft])
    : Object.values(flows);

  console.log(`[extractMappingKeys] Checking ${flowsToCheck.length} flow(s)`);
  console.log(`[extractMappingKeys] Flow types:`, flowTypes);

  flowsToCheck.forEach((flow) => {
    flow.questions?.forEach((question) => {
      if (question.mappingKey) {
        console.log(`[extractMappingKeys] Found mappingKey: "${question.mappingKey}" from question: "${question.question}"`);
        mappingKeys.add(question.mappingKey);
      } else {
        console.log(`[extractMappingKeys] Question "${question.question}" has no mappingKey`);
      }
    });
  });

  return mappingKeys;
}

/**
 * Validate that all required fields for selected offers exist in conversation flows
 * Only checks offers against their applicable flows
 */
export function validateOfferRequirements(
  selectedOffers: OfferType[],
  conversationFlows: Record<string, ConversationFlow>,
  offerFlowMap?: Record<OfferType, FlowIntention[]> // Optional: user-specified flow mapping
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingFields: [],
    warnings: [],
  };

  if (selectedOffers.length === 0) {
    return result; // No offers selected, nothing to validate
  }

  // Check each selected offer
  selectedOffers.forEach((offerType) => {
    const requirements = getOfferRequirements(offerType);
    
    // Determine which flows to check for this offer
    // Priority: 1) User-specified mapping (if non-empty), 2) Offer's default applicableFlows, 3) All flows
    let flowsToCheck: FlowIntention[] | undefined;
    
    // Check user-specified mapping first (but only if it's not empty)
    if (offerFlowMap?.[offerType] && offerFlowMap[offerType].length > 0) {
      flowsToCheck = offerFlowMap[offerType];
    } else if (requirements.applicableFlows && requirements.applicableFlows.length > 0) {
      // Fall back to offer's default applicable flows
      flowsToCheck = requirements.applicableFlows;
    } else {
      // No restriction - check all flows
      flowsToCheck = undefined;
    }
    
    // Debug logging
    console.log(`[Validation] Checking offer: ${offerType}`);
    console.log(`[Validation] offerFlowMap[${offerType}]:`, offerFlowMap?.[offerType]);
    console.log(`[Validation] requirements.applicableFlows:`, requirements.applicableFlows);
    console.log(`[Validation] flowsToCheck:`, flowsToCheck);
    
    // Get mappingKeys from only the applicable flows
    const availableMappingKeys = extractMappingKeysFromFlows(conversationFlows, flowsToCheck);
    
    // Debug: Log all questions and their mappingKeys from the flows being checked
    if (flowsToCheck && flowsToCheck.length > 0) {
      flowsToCheck.forEach(flowType => {
        const flow = conversationFlows[flowType];
        if (flow) {
          console.log(`[Validation] Flow "${flowType}" questions:`, 
            flow.questions.map(q => ({
              id: q.id,
              question: q.question,
              mappingKey: q.mappingKey
            }))
          );
        } else {
          console.warn(`[Validation] Flow "${flowType}" not found in conversationFlows`);
        }
      });
    } else if (flowsToCheck && flowsToCheck.length === 0) {
      console.warn(`[Validation] flowsToCheck is empty array for offer ${offerType}`);
    } else {
      console.log(`[Validation] Checking all flows (no restriction)`);
      Object.entries(conversationFlows).forEach(([flowType, flow]) => {
        console.log(`[Validation] Flow "${flowType}" questions:`, 
          flow.questions.map(q => ({
            id: q.id,
            question: q.question,
            mappingKey: q.mappingKey
          }))
        );
      });
    }
    
    console.log(`[Validation] Available mappingKeys:`, Array.from(availableMappingKeys));
    console.log(`[Validation] Required fields:`, requirements.requiredFields);
    
    const missing: string[] = [];

    requirements.requiredFields.forEach((requiredField) => {
      if (!availableMappingKeys.has(requiredField)) {
        missing.push(requiredField);
      }
    });
    
    console.log(`[Validation] Missing fields for ${offerType}:`, missing);

    if (missing.length > 0) {
      result.isValid = false;
      const flowContext = flowsToCheck 
        ? ` (in ${flowsToCheck.join(', ')} flow${flowsToCheck.length > 1 ? 's' : ''})`
        : '';
      result.missingFields.push({
        offerType,
        offerLabel: `${requirements.label}${flowContext}`,
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

