// lib/rules/fieldDiscovery.ts
// Extract fields from user's conversation flows

import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { RealEstateConcept } from './concepts';
import { findConceptByField, normalizeValue } from './concepts';

export interface UserField {
  fieldId: string; // The mappingKey from the question
  label: string; // Human-readable label (question text)
  questionId: string;
  flow: string; // Which flow this field belongs to
  type: 'select' | 'text'; // Based on allowFreeText
  values: string[]; // Button values or empty for text
  concept?: RealEstateConcept; // Mapped concept (if found)
  normalizedValues?: string[]; // Normalized button values
}

/**
 * Extract all fields from user's conversation flows
 */
export function discoverFieldsFromFlows(
  flows: Record<string, ConversationFlow>
): UserField[] {
  const fields: Map<string, UserField> = new Map();
  
  Object.values(flows).forEach(flow => {
    flow.questions.forEach(question => {
      if (question.mappingKey) {
        const fieldId = question.mappingKey;
        
        // Try to map to a concept
        const concept = findConceptByField(fieldId, question.question);
        
        // Extract button values, filtering out placeholder values
        const rawValues = question.buttons?.map(b => b.value) || [];
        const values = rawValues.filter(v => {
          // Filter out placeholder values like "button-1", "button-2", "btn-*", etc.
          const isPlaceholder = /^(button-\d+|btn-\d+|button\d+|option-\d+|option\d+)$/i.test(v);
          // Also filter out very short or generic values that are likely placeholders
          const isGeneric = v.length <= 2 && /^[a-z]+$/i.test(v);
          return !isPlaceholder && !isGeneric;
        });
        
        // Normalize values if concept found
        const normalizedValues = concept 
          ? values.map(v => normalizeValue(concept, v))
          : undefined;
        
        const userField: UserField = {
          fieldId,
          label: question.question,
          questionId: question.id,
          flow: flow.type,
          type: question.allowFreeText ? 'text' : 'select',
          values,
          concept,
          normalizedValues,
        };
        
        // Use fieldId as key to avoid duplicates
        fields.set(fieldId, userField);
      }
    });
  });
  
  return Array.from(fields.values());
}

/**
 * Get fields grouped by concept
 */
export function groupFieldsByConcept(fields: UserField[]): Map<string, UserField[]> {
  const grouped = new Map<string, UserField[]>();
  
  fields.forEach(field => {
    if (field.concept) {
      const conceptKey = field.concept.concept;
      if (!grouped.has(conceptKey)) {
        grouped.set(conceptKey, []);
      }
      grouped.get(conceptKey)!.push(field);
    }
  });
  
  return grouped;
}

/**
 * Get fields that don't map to any concept (custom fields)
 */
export function getCustomFields(fields: UserField[]): UserField[] {
  return fields.filter(f => !f.concept);
}

/**
 * Find a field by concept
 */
export function findFieldByConcept(
  concept: string,
  fields: UserField[]
): UserField | null {
  return fields.find(f => f.concept?.concept === concept) || null;
}

/**
 * Get available values for a field
 */
export function getFieldValues(field: UserField): string[] {
  return field.values.length > 0 ? field.values : [];
}

