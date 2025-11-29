// types/advice.types.ts
// Advice type definitions with extensible const array approach

/**
 * All valid advice types. Add new types here as needed.
 * This is the single source of truth for advice types.
 */
export const ADVICE_TYPES = [
  'general-advice',
  'actionable-advice',
] as const;

/**
 * TypeScript union type auto-generated from ADVICE_TYPES array
 */
export type AdviceType = typeof ADVICE_TYPES[number];

/**
 * Default advice type for backward compatibility
 */
export const DEFAULT_ADVICE_TYPE: AdviceType = 'general-advice';

/**
 * Type guard to check if a string is a valid advice type
 */
export function isValidAdviceType(type: string): type is AdviceType {
  return ADVICE_TYPES.includes(type as any);
}

/**
 * Determines the advice type from an item's tags
 * Defaults to 'general-advice' if no type tag is found
 */
export function getAdviceTypeFromTags(tags?: string[]): AdviceType {
  if (!tags || tags.length === 0) {
    return DEFAULT_ADVICE_TYPE;
  }

  // Check for each type in order (most specific first)
  for (const type of ADVICE_TYPES) {
    if (tags.includes(type)) {
      return type;
    }
  }

  // Default if no type tag found
  return DEFAULT_ADVICE_TYPE;
}

/**
 * Ensures an advice item has the correct type tag in its tags array
 * Adds the type tag if missing, preserves existing tags
 */
export function ensureTypeTag(
  tags: string[],
  type?: AdviceType
): string[] {
  const adviceType = type || DEFAULT_ADVICE_TYPE;
  const hasTypeTag = ADVICE_TYPES.some(t => tags.includes(t));

  if (hasTypeTag) {
    // Already has a type tag, return as-is
    return tags;
  }

  // Add the type tag
  return [adviceType, ...tags];
}

/**
 * Agent Advice Scenario interface
 * Represents an advice item retrieved from Qdrant
 */
export interface AgentAdviceScenario {
  id: string;
  agentId?: string;
  title: string;
  advice: string;
  tags: string[];
  type?: AdviceType; // Optional advice type
  applicableWhen?: {
    flow?: string[];
    conditions?: Record<string, string[]>;
    ruleGroups?: any[]; // RuleGroup[] from rules.types
    minMatchScore?: number;
  };
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;
}
