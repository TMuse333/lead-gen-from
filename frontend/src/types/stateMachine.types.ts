// src/types/stateMachine.types.ts
/**
 * Conversational State Machine Types
 *
 * Replaces the rigid linear question flow with a state machine where each
 * user interaction is evaluated for advancement toward lead capture.
 */

import type { Intent } from '@/lib/offers/unified';

// ==================== STATE TYPES ====================

export type StateType = 'greeting' | 'data_collection' | 'rapport' | 'lead_capture' | 'completion';

export interface ConversationState {
  id: string;
  type: StateType;
  goal: string;                           // Human-readable purpose
  order: number;                          // Default fallback ordering

  // Data collection
  collects: Array<{
    mappingKey: string;                   // Key in userInput
    label: string;                        // "Budget", "Location"
    required: boolean;
    extractionHint: string;               // LLM hint: "a dollar amount or price range"
  }>;

  // Bot messaging
  prompt: string;                         // What the bot says for this state
  promptVariants?: string[];              // Re-ask alternatives (avoids repetition)
  inputType: 'buttons' | 'text' | 'hybrid';
  buttons?: Array<{ id: string; label: string; value: string; mappingKey?: string }>;

  // Objection counters
  objectionCounters: Array<{
    objectionType: string;                // Matches classifyIntent objection values
    response: string;
    tone: 'empathetic' | 'firm' | 'playful' | 'educational';
    escalationResponse?: string;          // 2nd+ objection of same type
  }>;

  // Transitions
  transitions: StateTransition[];

  // Config
  maxAttempts?: number;                   // Auto-advance after N re-asks (default: 3)
  skipIfDataExists?: boolean;             // Skip if data already collected (default: true)

  // Timeline links (preserved from current system)
  linkedPhaseId?: string;
  linkedStepId?: string;
  personalAdvice?: string;
}

// ==================== TRANSITIONS ====================

export interface StateTransition {
  targetStateId: string;
  condition: TransitionCondition;
  priority: number;                       // Lower = evaluated first
}

export type TransitionCondition =
  | { type: 'data_collected'; mappingKeys: string[] }
  | { type: 'any_data_collected'; mappingKeys: string[] }
  | { type: 'intent_set'; intents: string[] }
  | { type: 'always' }
  | { type: 'max_attempts_reached'; maxAttempts: number };

// ==================== CONFIG ====================

export interface StateMachineConfig {
  id: string;
  version: number;
  intent: Intent;
  states: ConversationState[];
  initialStateId: string;
  leadCaptureStateId: string;
  globalObjectionCounters: Array<{
    objectionType: string;
    response: string;
    tone: string;
  }>;
  multiFieldExtraction: boolean;
  skipCompletedStates: boolean;
}

// ==================== EXTRACTION & ADVANCEMENT ====================

export interface ExtractionItem {
  mappingKey: string;
  value: string;
  confidence: number;
}

export interface AdvancementResult {
  advanced: boolean;
  newStateId: string;
  fieldsCollected: string[];
  skippedStates: string[];
  isComplete: boolean;
  progress: number;
}

// ==================== CLASSIFY & EXTRACT (LLM output) ====================

export interface ClassifyAndExtractResult {
  intent: {
    primary:
      | 'direct_answer'
      | 'multi_answer'
      | 'clarification_question'
      | 'objection'
      | 'chitchat'
      | 'off_topic'
      | 'change_previous_answer'
      | 'escalation_request'
      | 'attempted_answer_but_unclear';
    objection?: string;
    confidence: number;
    suggestedTone?: 'empathetic' | 'firm' | 'playful' | 'educational';
  };
  extracted: ExtractionItem[];
  correction?: {
    mappingKey: string;
    newValue: string;
  };
}

// ==================== CONTEXT (passed to engine functions) ====================

export interface StateMachineContext {
  currentStateId: string;
  userInput: Record<string, string>;
  stateAttempts: Record<string, number>;
  stateHistory: string[];
}
