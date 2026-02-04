// stores/chatStore/actions/stateMachineMessageHandler.ts
/**
 * State Machine Message Handler
 *
 * Replaces sendMessageHandler.ts logic when state machine is active.
 * Handles free-text messages through the unified classify-and-extract flow.
 */

import { ChatMessage, ChatState } from '../types';
import {
  processExtraction,
  getObjectionCounter,
  getStateById,
  getPromptVariant,
} from '@/lib/stateMachine/engine';
import type {
  StateMachineConfig,
  StateMachineContext,
  ClassifyAndExtractResult,
  ConversationState,
} from '@/types/stateMachine.types';

export function createStateMachineMessageHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (message: string, displayText?: string) => {
    const state = get();
    console.log('🔷 === STATE MACHINE MESSAGE START ===');
    console.log('🔷 Message:', message);

    if (!message.trim()) return;

    const { selectedOffer, currentIntent, stateMachineConfig, currentStateId } = state;

    // If no flow selected yet, delegate to the pre-intent handler in sendMessageHandler
    // (the state machine only activates after intent is selected)
    if (!selectedOffer || !currentIntent || !stateMachineConfig) {
      console.log('[SM Message] No state machine active, should not reach here');
      return;
    }

    const currentState = getStateById(stateMachineConfig, currentStateId);
    if (!currentState) {
      console.error('[SM Message] Current state not found:', currentStateId);
      return;
    }

    set({ loading: true });

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: displayText || message,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    try {
      // Build all collectable fields for multi-field extraction
      const allCollectableFields = getAllCollectableFields(stateMachineConfig);

      // Check for pre-computed objection counter
      const attemptCount = state.stateAttempts[currentStateId] || 0;

      // Call /api/chat/smart with state machine context
      const clientIdentifier = typeof window !== 'undefined'
        ? sessionStorage.getItem('clientId') || undefined
        : undefined;

      const response = await fetch('/api/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeText: message,
          selectedOffer,
          currentIntent,
          currentQuestionId: currentStateId,
          userInput: state.userInput,
          messages: state.messages.slice(-5),
          clientIdentifier,
          conversationId: state.conversationId || undefined,
          // State machine specific
          currentState: {
            id: currentState.id,
            goal: currentState.goal,
            prompt: currentState.prompt,
            collects: currentState.collects,
          },
          allCollectableFields,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      console.log('✅ SM API response:', data);

      const classifyResult: ClassifyAndExtractResult | undefined = data.classifyResult;
      if (!classifyResult) {
        // Fallback: no classify result, treat as legacy response
        handleLegacyResponse(set, get, data, currentState);
        return;
      }

      const intentPrimary = classifyResult.intent.primary;

      // Handle based on intent
      if (intentPrimary === 'direct_answer' || intentPrimary === 'multi_answer') {
        await handleAnswer(set, get, data, classifyResult, stateMachineConfig, currentState);
      } else if (intentPrimary === 'objection') {
        await handleObjection(set, get, data, classifyResult, stateMachineConfig, currentState, attemptCount);
      } else if (intentPrimary === 'change_previous_answer') {
        await handleCorrection(set, get, data, classifyResult, stateMachineConfig, currentState);
      } else {
        // chitchat, off_topic, clarification, escalation, attempted_answer_but_unclear
        await handleNonAnswer(set, get, data, currentState);
      }

    } catch (error) {
      console.error('❌ SM Error:', error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, errorMsg] }));
    } finally {
      set({ loading: false });
      console.log('🔷 === STATE MACHINE MESSAGE END ===\n');
    }
  };
}

// ==================== HELPERS ====================

function getAllCollectableFields(config: StateMachineConfig) {
  const fields: Array<{ mappingKey: string; label: string; extractionHint: string }> = [];
  const seen = new Set<string>();

  for (const state of config.states) {
    for (const field of state.collects) {
      if (!seen.has(field.mappingKey)) {
        seen.add(field.mappingKey);
        fields.push({
          mappingKey: field.mappingKey,
          label: field.label,
          extractionHint: field.extractionHint,
        });
      }
    }
  }

  return fields;
}

function buildContext(state: ChatState): StateMachineContext {
  return {
    currentStateId: state.currentStateId,
    userInput: state.userInput,
    stateAttempts: state.stateAttempts,
    stateHistory: state.stateHistory,
  };
}

function convertStateButtons(state: ConversationState) {
  if (!state.buttons || state.inputType === 'text') return undefined;
  return state.buttons.map((btn) => ({
    id: btn.id,
    label: btn.label,
    value: btn.value,
  }));
}

// ==================== INTENT HANDLERS ====================

async function handleAnswer(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  apiData: { reply: string },
  classifyResult: ClassifyAndExtractResult,
  config: StateMachineConfig,
  currentState: ConversationState
) {
  const { addAnswer, updateConversation } = get();

  // Apply all extractions
  for (const extraction of classifyResult.extracted) {
    addAnswer(extraction.mappingKey, extraction.value);

    await updateConversation({
      answer: {
        questionId: currentState.id,
        mappingKey: extraction.mappingKey,
        value: extraction.value,
        answeredVia: 'text',
      },
    });
  }

  // Process advancement
  const updatedState = get();
  const context = buildContext(updatedState);
  const result = processExtraction(config, context, classifyResult.extracted);

  if (result.isComplete) {
    console.log('🎉 STATE MACHINE COMPLETE! Showing contact modal');
    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: apiData.reply || 'Perfect! Let me get your contact info to send your personalized timeline.',
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, aiMsg] }));
    set({
      showContactModal: true,
      isComplete: true,
      shouldCelebrate: true,
      progress: 100,
    });
  } else if (result.advanced) {
    // Move to next state
    const nextState = getStateById(config, result.newStateId);
    if (nextState) {
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: apiData.reply || nextState.prompt,
        buttons: convertStateButtons(nextState),
        timestamp: new Date(),
      };
      set((s) => ({
        messages: [...s.messages, aiMsg],
        currentStateId: result.newStateId,
        currentQuestionId: result.newStateId,
        currentNodeId: result.newStateId,
        progress: result.progress,
        stateHistory: [...s.stateHistory, result.newStateId],
      }));

      await get().updateConversation({
        progress: result.progress,
        currentQuestionId: result.newStateId,
        messages: get().messages,
      });
    }
  } else {
    // Data was collected but no transition matched — re-ask with variant
    const attemptCount = (get().stateAttempts[currentState.id] || 0) + 1;
    set((s) => ({
      stateAttempts: { ...s.stateAttempts, [currentState.id]: attemptCount },
    }));

    const variant = getPromptVariant(currentState, attemptCount);
    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: apiData.reply || variant,
      buttons: convertStateButtons(currentState),
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, aiMsg] }));
  }
}

async function handleObjection(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  apiData: { reply: string },
  classifyResult: ClassifyAndExtractResult,
  config: StateMachineConfig,
  currentState: ConversationState,
  attemptCount: number
) {
  // Increment attempts
  const newAttemptCount = attemptCount + 1;
  set((s) => ({
    stateAttempts: { ...s.stateAttempts, [currentState.id]: newAttemptCount },
  }));

  // Look up objection counter
  const objectionType = classifyResult.intent.objection || 'general';
  const counterResponse = getObjectionCounter(config, currentState.id, objectionType, newAttemptCount);

  // Check max_attempts transition
  const maxAttempts = currentState.maxAttempts || 3;
  if (newAttemptCount >= maxAttempts) {
    // Auto-advance: process as if data was provided (skip this state)
    const context = buildContext(get());
    const advanceResult = processExtraction(config, {
      ...context,
      stateAttempts: { ...context.stateAttempts, [currentState.id]: newAttemptCount },
    }, []);

    if (advanceResult.advanced) {
      const nextState = getStateById(config, advanceResult.newStateId);
      if (nextState) {
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: "No problem at all! Let's move on to something else.",
          buttons: convertStateButtons(nextState),
          timestamp: new Date(),
        };
        set((s) => ({
          messages: [...s.messages, aiMsg],
          currentStateId: advanceResult.newStateId,
          currentQuestionId: advanceResult.newStateId,
          currentNodeId: advanceResult.newStateId,
          progress: advanceResult.progress,
          stateHistory: [...s.stateHistory, advanceResult.newStateId],
        }));

        // Skip the field
        for (const field of currentState.collects) {
          get().skipField(field.mappingKey);
        }

        return;
      }
    }
  }

  // Show objection counter response
  const reply = counterResponse || apiData.reply || "I understand. No pressure at all.";
  const aiMsg: ChatMessage = {
    role: 'assistant',
    content: reply,
    buttons: convertStateButtons(currentState),
    timestamp: new Date(),
  };
  set((s) => ({ messages: [...s.messages, aiMsg] }));
}

async function handleCorrection(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  apiData: { reply: string },
  classifyResult: ClassifyAndExtractResult,
  config: StateMachineConfig,
  currentState: ConversationState
) {
  const { addAnswer } = get();

  // Apply correction
  if (classifyResult.correction) {
    addAnswer(classifyResult.correction.mappingKey, classifyResult.correction.newValue);
  }

  // Also apply any additional extractions
  for (const extraction of classifyResult.extracted) {
    addAnswer(extraction.mappingKey, extraction.value);
  }

  // Re-evaluate state position
  const updatedState = get();
  const context = buildContext(updatedState);
  const result = processExtraction(config, context, classifyResult.extracted);

  const aiMsg: ChatMessage = {
    role: 'assistant',
    content: apiData.reply || "Got it, I've updated that for you!",
    buttons: result.advanced
      ? convertStateButtons(getStateById(config, result.newStateId) || currentState)
      : convertStateButtons(currentState),
    timestamp: new Date(),
  };
  set((s) => ({ messages: [...s.messages, aiMsg] }));

  if (result.advanced) {
    set((s) => ({
      currentStateId: result.newStateId,
      currentQuestionId: result.newStateId,
      currentNodeId: result.newStateId,
      progress: result.progress,
      stateHistory: [...s.stateHistory, result.newStateId],
    }));
  }
}

async function handleNonAnswer(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  apiData: { reply: string },
  currentState: ConversationState
) {
  // Increment attempts
  set((s) => ({
    stateAttempts: {
      ...s.stateAttempts,
      [currentState.id]: (s.stateAttempts[currentState.id] || 0) + 1,
    },
  }));

  const aiMsg: ChatMessage = {
    role: 'assistant',
    content: apiData.reply || currentState.prompt,
    buttons: convertStateButtons(currentState),
    timestamp: new Date(),
  };
  set((s) => ({ messages: [...s.messages, aiMsg] }));
}

function handleLegacyResponse(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  data: { reply?: string; extracted?: { mappingKey: string; value: string } },
  currentState: ConversationState
) {
  if (data.extracted) {
    get().addAnswer(data.extracted.mappingKey, data.extracted.value);
  }

  const aiMsg: ChatMessage = {
    role: 'assistant',
    content: data.reply || 'Got it!',
    buttons: convertStateButtons(currentState),
    timestamp: new Date(),
  };
  set((s) => ({ messages: [...s.messages, aiMsg] }));
}
