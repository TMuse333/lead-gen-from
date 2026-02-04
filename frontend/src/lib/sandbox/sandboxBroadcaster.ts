// src/lib/sandbox/sandboxBroadcaster.ts
// Subscribes to the Zustand chat store and broadcasts a curated state snapshot
// to the parent window via postMessage. Only active when ?sandbox=true is in the URL.

import { useChatStore } from '@/stores/chatStore';

export interface SandboxDebugState {
  selectedOffer: string | null;
  currentIntent: string | null;
  currentQuestionId: string;
  userInput: Record<string, string>;
  progress: number;
  isComplete: boolean;
  loading: boolean;
  showContactModal: boolean;
  messageCount: number;
  lastAssistantMessage: string | null;
  lastUserMessage: string | null;
}

export interface SandboxDebugMessage {
  type: 'SANDBOX_DEBUG_STATE';
  timestamp: number;
  state: SandboxDebugState;
}

function truncate(str: string | undefined | null, max = 200): string | null {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) + '...' : str;
}

/**
 * Starts broadcasting chat store state to the parent window.
 * Returns an unsubscribe function for cleanup.
 * Throttled to ~20 updates/sec (50ms).
 */
export function startSandboxBroadcaster(): () => void {
  let lastSent = 0;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  function broadcast() {
    const s = useChatStore.getState();
    const messages = s.messages ?? [];

    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');

    const payload: SandboxDebugMessage = {
      type: 'SANDBOX_DEBUG_STATE',
      timestamp: Date.now(),
      state: {
        selectedOffer: s.selectedOffer ?? null,
        currentIntent: s.currentIntent ?? null,
        currentQuestionId: s.currentQuestionId ?? '',
        userInput: s.userInput ?? {},
        progress: s.progress ?? 0,
        isComplete: s.isComplete ?? false,
        loading: s.loading ?? false,
        showContactModal: s.showContactModal ?? false,
        messageCount: messages.length,
        lastAssistantMessage: truncate(lastAssistant?.content),
        lastUserMessage: truncate(lastUser?.content),
      },
    };

    window.parent.postMessage(payload, '*');
    lastSent = Date.now();
  }

  const unsubscribe = useChatStore.subscribe(() => {
    const now = Date.now();
    const elapsed = now - lastSent;

    if (elapsed >= 50) {
      broadcast();
    } else if (!pendingTimer) {
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        broadcast();
      }, 50 - elapsed);
    }
  });

  // Send initial state immediately
  broadcast();

  return () => {
    unsubscribe();
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
  };
}
