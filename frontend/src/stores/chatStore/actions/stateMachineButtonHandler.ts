// stores/chatStore/actions/stateMachineButtonHandler.ts
/**
 * State Machine Button Handler
 *
 * Handles button clicks when state machine is active.
 * Simpler than message handler: save answer, process extraction, advance.
 */

import { ChatMessage, ChatState } from '../types';
import { ButtonOption } from '@/types/conversation.types';
import {
  processExtraction,
  getStateById,
} from '@/lib/stateMachine/engine';
import type {
  StateMachineConfig,
  StateMachineContext,
  ConversationState,
} from '@/types/stateMachine.types';

export function createStateMachineButtonHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (button: ButtonOption) => {
    const state = get();
    const { stateMachineConfig, currentStateId } = state;

    if (!stateMachineConfig) {
      console.error('[SM Button] No state machine config');
      return;
    }

    const currentState = getStateById(stateMachineConfig, currentStateId);
    if (!currentState) {
      console.error('[SM Button] Current state not found:', currentStateId);
      return;
    }

    console.log('🔷 SM Button clicked:', button.label, 'in state:', currentStateId);

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: button.label,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }));

    // Determine mappingKey: prefer button's mappingKey (passed through from UI),
    // then check state config, then fallback to state ID
    const stateButton = currentState.buttons?.find((b) => b.id === button.id);
    const mappingKey =
      button.mappingKey ||  // From UI button (most reliable)
      stateButton?.mappingKey ||  // From state machine config
      currentState.collects[0]?.mappingKey ||
      currentStateId;

    console.log('🔷 [SM Button] Mapping key resolution:', {
      fromUIButton: button.mappingKey,
      fromStateButton: stateButton?.mappingKey,
      fromCollects: currentState.collects[0]?.mappingKey,
      final: mappingKey,
    });

    // Save answer
    const { addAnswer, updateConversation } = get();
    addAnswer(mappingKey, button.value);

    // Track answer on server
    await updateConversation({
      messages: get().messages,
      userInput: { ...get().userInput, [mappingKey]: button.value },
      progress: get().progress,
      currentQuestionId: currentStateId,
      answer: {
        questionId: currentStateId,
        mappingKey,
        value: button.value,
        answeredVia: 'button',
      },
    });

    try {
      // Call API for warm reply
      const clientIdentifier = typeof window !== 'undefined'
        ? sessionStorage.getItem('clientId') || undefined
        : undefined;

      const response = await fetch('/api/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buttonId: button.id,
          buttonValue: button.value,
          buttonLabel: button.label,
          selectedOffer: state.selectedOffer,
          currentIntent: state.currentIntent,
          currentQuestionId: currentStateId,
          userInput: get().userInput,
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
          allCollectableFields: getAllCollectableFields(stateMachineConfig),
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Got it!';

      // Process advancement via engine
      await advanceStateMachine(set, get, stateMachineConfig, currentState, reply);

    } catch (error) {
      console.error('❌ SM Button API error:', error);
      // Fallback: advance locally without API reply
      await advanceStateMachine(set, get, stateMachineConfig, currentState, 'Got it!');
    } finally {
      set({ loading: false });
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

function convertStateButtons(state: ConversationState | null) {
  if (!state?.buttons || state.inputType === 'text') return undefined;
  return state.buttons.map((btn) => ({
    id: btn.id,
    label: btn.label,
    value: btn.value,
    mappingKey: btn.mappingKey, // Include mappingKey for reliable advancement
  }));
}

async function advanceStateMachine(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  config: StateMachineConfig,
  currentState: ConversationState,
  reply: string
) {
  const updatedState = get();
  const context = buildContext(updatedState);

  console.log('🔄 [SM Advance] Starting advancement check:', {
    currentStateId: context.currentStateId,
    userInput: context.userInput,
    stateCollects: currentState.collects.map(c => c.mappingKey),
  });

  // Create a dummy extraction to trigger transition evaluation
  const extractions = currentState.collects.map((c) => ({
    mappingKey: c.mappingKey,
    value: updatedState.userInput[c.mappingKey] || '',
    confidence: 1.0,
  })).filter((e) => e.value);

  console.log('🔄 [SM Advance] Extractions:', extractions);

  const result = processExtraction(config, context, extractions);

  console.log('🔄 [SM Advance] Result:', {
    advanced: result.advanced,
    newStateId: result.newStateId,
    fieldsCollected: result.fieldsCollected,
    isComplete: result.isComplete,
  });

  if (result.isComplete) {
    console.log('🎉 STATE MACHINE COMPLETE via button!');
    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: reply,
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
    const nextState = getStateById(config, result.newStateId);
    if (nextState) {
      // Combine the warm acknowledgment with the next question's prompt
      // This ensures the bot transitions smoothly to the next question
      const fullReply = nextState.prompt
        ? `${reply}\n\n${nextState.prompt}`
        : reply;

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: fullReply,
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
    // No advancement — show reply without advancing
    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: reply,
      buttons: convertStateButtons(currentState),
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, aiMsg] }));
  }
}
