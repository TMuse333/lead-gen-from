// src/lib/stateMachine/engine.ts
/**
 * State Machine Engine — Pure functions (no side effects, no API calls)
 *
 * Evaluates transitions, processes extractions, handles objection counters,
 * and calculates progress for the conversational state machine.
 */

import type {
  StateMachineConfig,
  ConversationState,
  StateMachineContext,
  ExtractionItem,
  AdvancementResult,
  TransitionCondition,
} from '@/types/stateMachine.types';

/**
 * Get a state by its ID from the config
 */
export function getStateById(
  config: StateMachineConfig,
  stateId: string
): ConversationState | null {
  return config.states.find((s) => s.id === stateId) ?? null;
}

/**
 * Evaluate transition conditions for a given state and context.
 * Returns the target state ID if a transition condition is met, null otherwise.
 * Transitions are evaluated in priority order (lower number = higher priority).
 */
export function evaluateTransitions(
  state: ConversationState,
  context: StateMachineContext
): string | null {
  // Sort transitions by priority (lower = evaluated first)
  const sorted = [...state.transitions].sort((a, b) => a.priority - b.priority);

  for (const transition of sorted) {
    if (isConditionMet(transition.condition, context, state)) {
      return transition.targetStateId;
    }
  }

  return null;
}

/**
 * Check if a single transition condition is met
 */
function isConditionMet(
  condition: TransitionCondition,
  context: StateMachineContext,
  state: ConversationState
): boolean {
  switch (condition.type) {
    case 'data_collected':
      // All specified mappingKeys must be present in userInput
      return condition.mappingKeys.every((key) => !!context.userInput[key]);

    case 'any_data_collected':
      // At least one of the specified mappingKeys must be present
      return condition.mappingKeys.some((key) => !!context.userInput[key]);

    case 'intent_set':
      // Check if the 'intent' field in userInput matches any of the specified intents
      return condition.intents.includes(context.userInput['intent'] || '');

    case 'always':
      return true;

    case 'max_attempts_reached':
      return (context.stateAttempts[state.id] || 0) >= condition.maxAttempts;

    default:
      return false;
  }
}

/**
 * Process extraction results and determine state advancement.
 * Applies all high-confidence extractions to userInput, then cascades
 * through states (skipping states whose data is already collected).
 *
 * Returns an AdvancementResult describing what happened.
 */
export function processExtraction(
  config: StateMachineConfig,
  context: StateMachineContext,
  extractions: ExtractionItem[]
): AdvancementResult {
  const CONFIDENCE_THRESHOLD = 0.6;
  const fieldsCollected: string[] = [];
  const skippedStates: string[] = [];

  // Apply high-confidence extractions to a copy of userInput
  const newUserInput = { ...context.userInput };
  for (const extraction of extractions) {
    if (extraction.confidence >= CONFIDENCE_THRESHOLD) {
      newUserInput[extraction.mappingKey] = extraction.value;
      fieldsCollected.push(extraction.mappingKey);
    }
  }

  // Create updated context with new userInput
  const updatedContext: StateMachineContext = {
    ...context,
    userInput: newUserInput,
  };

  // Try to advance from the current state
  let currentStateId = context.currentStateId;
  let advanced = false;

  // Cascade: keep trying to advance through states
  let maxCascade = config.states.length; // Safety limit
  while (maxCascade-- > 0) {
    const currentState = getStateById(config, currentStateId);
    if (!currentState) break;

    const targetId = evaluateTransitions(currentState, updatedContext);
    if (!targetId || targetId === currentStateId) break;

    // Check if the target state can be skipped
    const targetState = getStateById(config, targetId);
    if (!targetState) break;

    const shouldSkip =
      config.skipCompletedStates &&
      targetState.skipIfDataExists !== false &&
      targetState.collects.length > 0 &&
      targetState.collects.every(
        (c) => !c.required || !!newUserInput[c.mappingKey]
      );

    if (shouldSkip) {
      skippedStates.push(targetId);
      currentStateId = targetId;
      advanced = true;
      continue;
    }

    // Advance to target state
    currentStateId = targetId;
    advanced = true;
    break;
  }

  // Check if we've reached the lead capture / completion state
  const isComplete =
    currentStateId === config.leadCaptureStateId ||
    getStateById(config, currentStateId)?.type === 'lead_capture' ||
    getStateById(config, currentStateId)?.type === 'completion';

  const progress = calculateProgress(config, newUserInput);

  return {
    advanced,
    newStateId: currentStateId,
    fieldsCollected,
    skippedStates,
    isComplete,
    progress,
  };
}

/**
 * Look up an objection counter for a given state and objection type.
 * Falls back to global objection counters if no state-level counter is found.
 *
 * Returns the response string or null if no counter is available.
 * Uses escalationResponse for the 2nd+ occurrence of the same objection type.
 */
export function getObjectionCounter(
  config: StateMachineConfig,
  stateId: string,
  objectionType: string,
  attemptCount: number
): string | null {
  const state = getStateById(config, stateId);
  const isEscalation = attemptCount > 1;

  // Check state-level counters first
  if (state) {
    const stateCounter = state.objectionCounters.find(
      (oc) => oc.objectionType === objectionType
    );
    if (stateCounter) {
      if (isEscalation && stateCounter.escalationResponse) {
        return stateCounter.escalationResponse;
      }
      return stateCounter.response;
    }
  }

  // Fall back to global counters
  const globalCounter = config.globalObjectionCounters.find(
    (oc) => oc.objectionType === objectionType
  );
  if (globalCounter) {
    return globalCounter.response;
  }

  return null;
}

/**
 * Calculate progress (0-100) based on required fields collected vs total required fields.
 */
export function calculateProgress(
  config: StateMachineConfig,
  userInput: Record<string, string>
): number {
  // Collect all required fields across all data_collection states
  const requiredFields = new Set<string>();
  for (const state of config.states) {
    if (state.type === 'data_collection') {
      for (const field of state.collects) {
        if (field.required) {
          requiredFields.add(field.mappingKey);
        }
      }
    }
  }

  if (requiredFields.size === 0) return 100;

  const collected = [...requiredFields].filter((key) => !!userInput[key]).length;
  return Math.min(Math.round((collected / requiredFields.size) * 100), 100);
}

/**
 * Get the next state in order after the given stateId.
 * Used as a fallback when no transition conditions are met.
 */
export function getNextStateByOrder(
  config: StateMachineConfig,
  currentStateId: string
): ConversationState | null {
  const sorted = [...config.states].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((s) => s.id === currentStateId);
  if (currentIndex === -1 || currentIndex + 1 >= sorted.length) return null;
  return sorted[currentIndex + 1];
}

/**
 * Get a prompt variant for re-asking, avoiding repetition.
 * Returns the base prompt if no variants are available.
 */
export function getPromptVariant(
  state: ConversationState,
  attemptCount: number
): string {
  if (!state.promptVariants || state.promptVariants.length === 0) {
    return state.prompt;
  }

  // Cycle through variants (attempt 0 = base prompt, 1+ = variants)
  if (attemptCount <= 0) return state.prompt;
  const variantIndex = (attemptCount - 1) % state.promptVariants.length;
  return state.promptVariants[variantIndex];
}
