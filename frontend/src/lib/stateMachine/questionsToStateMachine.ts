// src/lib/stateMachine/questionsToStateMachine.ts
/**
 * Backwards-Compatibility Converter
 *
 * Converts existing CustomQuestion[] arrays into a StateMachineConfig,
 * so all existing clients work without migration. Each question becomes
 * a data_collection state with linear transitions (state[n] -> state[n+1]).
 */

import type { CustomQuestion } from '@/types/timelineBuilder.types';
import type { Intent } from '@/lib/offers/unified';
import type {
  StateMachineConfig,
  ConversationState,
  StateTransition,
} from '@/types/stateMachine.types';

/**
 * Convert an array of CustomQuestion into a full StateMachineConfig.
 *
 * - Each CustomQuestion becomes one `data_collection` state
 * - Transitions are linear: state[n] -> state[n+1]
 * - Last data_collection state -> lead_capture
 * - No objection counters (mirrors current behavior exactly)
 * - This means zero disruption for existing clients
 */
export function questionsToStateMachine(
  questions: CustomQuestion[],
  intent: Intent
): StateMachineConfig {
  // Sort by order
  const sorted = [...questions].sort((a, b) => a.order - b.order);

  // Create the lead capture state
  const leadCaptureState: ConversationState = {
    id: '__lead_capture__',
    type: 'lead_capture',
    goal: 'Collect contact information for lead capture',
    order: sorted.length + 1,
    collects: [],
    prompt: 'Perfect! Let me get your contact info to send your personalized timeline.',
    inputType: 'text',
    objectionCounters: [],
    transitions: [
      {
        targetStateId: '__completion__',
        condition: { type: 'always' },
        priority: 0,
      },
    ],
  };

  // Create the completion state
  const completionState: ConversationState = {
    id: '__completion__',
    type: 'completion',
    goal: 'Flow complete',
    order: sorted.length + 2,
    collects: [],
    prompt: 'Thank you! Your personalized timeline is being generated.',
    inputType: 'text',
    objectionCounters: [],
    transitions: [],
  };

  // Convert each question to a data_collection state
  const dataStates: ConversationState[] = sorted.map((q, index) => {
    const stateId = `q_${q.id}`;
    const mappingKey = q.mappingKey || q.id;
    const nextStateId =
      index < sorted.length - 1
        ? `q_${sorted[index + 1].id}`
        : '__lead_capture__';

    // Build transition: advance when this question's data is collected
    const transitions: StateTransition[] = [
      {
        targetStateId: nextStateId,
        condition: {
          type: 'data_collected',
          mappingKeys: [mappingKey],
        },
        priority: 0,
      },
    ];

    // Convert buttons if present
    const buttons =
      q.inputType === 'buttons' && q.buttons
        ? q.buttons.map((btn) => ({
            id: btn.id,
            label: btn.label,
            value: btn.value,
            mappingKey,
          }))
        : undefined;

    const inputType: 'buttons' | 'text' | 'hybrid' =
      q.inputType === 'buttons' && q.buttons?.length
        ? 'buttons'
        : 'text';

    return {
      id: stateId,
      type: 'data_collection' as const,
      goal: `Collect ${q.label || mappingKey}`,
      order: index + 1,
      collects: [
        {
          mappingKey,
          label: q.label || mappingKey,
          required: q.required !== false,
          extractionHint: `the user's ${q.label || mappingKey}`,
        },
      ],
      prompt: q.question,
      inputType,
      buttons,
      objectionCounters: [],
      transitions,
      maxAttempts: 3,
      skipIfDataExists: true,
      // Preserve timeline links from the original question
      linkedPhaseId: q.linkedPhaseId,
      linkedStepId: q.linkedStepId,
      personalAdvice: q.personalAdvice,
    };
  });

  const allStates = [...dataStates, leadCaptureState, completionState];
  const initialStateId = dataStates.length > 0 ? dataStates[0].id : '__lead_capture__';

  return {
    id: `converted_${intent}_${Date.now()}`,
    version: 1,
    intent,
    states: allStates,
    initialStateId,
    leadCaptureStateId: '__lead_capture__',
    globalObjectionCounters: [],
    multiFieldExtraction: true,
    skipCompletedStates: true,
  };
}
