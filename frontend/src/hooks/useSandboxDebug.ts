// src/hooks/useSandboxDebug.ts
// Parent-side hook: listens for SANDBOX_DEBUG_STATE postMessage events
// from the bot iframe, derives the active flowchart node, accumulates
// a session event log, and tracks state transitions with reasons.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SandboxDebugState, SandboxDebugMessage } from '@/lib/sandbox/sandboxBroadcaster';
import { deriveActiveNode } from '@/lib/sandbox/deriveActiveNode';
import { getOutgoingEdges, type OutgoingEdge } from '@/components/dashboard/admin/botSandbox/flowData';

export type SessionEventKind =
  | 'node-change'
  | 'offer-selected'
  | 'intent-selected'
  | 'question-change'
  | 'llm-start'
  | 'llm-end'
  | 'answer-collected'
  | 'message-received'
  | 'contact-modal'
  | 'flow-complete';

export interface SessionEvent {
  id: number;
  timestamp: number;
  kind: SessionEventKind;
  label: string;
  detail?: string;
}

export interface TransitionInfo {
  moved: boolean;
  fromNode: string | null;
  toNode: string | null;
  reason: string;
  timestamp: number;
}

interface SandboxDebugResult {
  debugState: SandboxDebugState | null;
  activeNodeId: string | null;
  sessionEvents: SessionEvent[];
  clearEvents: () => void;
  possibleNextNodes: OutgoingEdge[];
  lastTransition: TransitionInfo | null;
}

const nodeLabels: Record<string, string> = {
  'initial-greeting': 'Initial Greeting',
  'offer-selection': 'Offer Selection',
  'intent-selection': 'Intent Selection',
  'intent-classification': 'Intent Classification',
  'display-question': 'Display Question',
  'flow-complete': 'Flow Complete',
};

function labelFor(nodeId: string | null): string {
  if (!nodeId) return 'None';
  return nodeLabels[nodeId] || nodeId;
}

/** Infer why a transition happened (or didn't) from the state diff. */
function inferTransitionReason(
  prev: SandboxDebugState,
  next: SandboxDebugState,
  prevNode: string,
  nextNode: string,
): string {
  const moved = prevNode !== nextNode;

  // Offer selected
  if (!prev.selectedOffer && next.selectedOffer) {
    return `User selected offer: ${next.selectedOffer}`;
  }

  // Intent selected
  if (!prev.currentIntent && next.currentIntent) {
    return `Intent resolved: ${next.currentIntent}`;
  }

  // Flow complete
  if (!prev.isComplete && next.isComplete) {
    return 'All questions answered — flow complete';
  }

  // Contact modal
  if (!prev.showContactModal && next.showContactModal) {
    return 'Contact modal triggered';
  }

  // LLM started processing
  if (!prev.loading && next.loading) {
    return 'LLM processing free text input';
  }

  // LLM finished
  if (prev.loading && !next.loading) {
    // Check if a new answer was collected
    const prevKeys = Object.keys(prev.userInput);
    const nextKeys = Object.keys(next.userInput);
    const newKey = nextKeys.find((k) => !prevKeys.includes(k));

    if (newKey) {
      return moved
        ? `Answer extracted for "${newKey}" — advanced to next question`
        : `Answer extracted for "${newKey}"`;
    }

    if (moved) {
      return 'LLM classified intent — state advanced';
    }

    return 'LLM finished — stayed on same question (rephrase/retry)';
  }

  // Question changed without LLM (button click)
  if (prev.currentQuestionId !== next.currentQuestionId && next.currentQuestionId) {
    const prevKeys = Object.keys(prev.userInput);
    const nextKeys = Object.keys(next.userInput);
    const newKey = nextKeys.find((k) => !prevKeys.includes(k));

    if (newKey) {
      return `Button click — answer saved for "${newKey}"`;
    }
    return 'Question advanced via button click';
  }

  // New message but no state change
  if (next.messageCount > prev.messageCount && !moved) {
    return 'Pre-flow response — no state advancement';
  }

  if (moved) {
    return 'State advanced';
  }

  return 'No state change';
}

let nextEventId = 0;

export function useSandboxDebug(): SandboxDebugResult {
  const [debugState, setDebugState] = useState<SandboxDebugState | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);
  const [possibleNextNodes, setPossibleNextNodes] = useState<OutgoingEdge[]>([]);
  const [lastTransition, setLastTransition] = useState<TransitionInfo | null>(null);
  const prevStateRef = useRef<SandboxDebugState | null>(null);
  const prevNodeRef = useRef<string | null>(null);

  const pushEvent = useCallback((kind: SessionEventKind, label: string, detail?: string) => {
    setSessionEvents((prev) => [
      ...prev,
      { id: nextEventId++, timestamp: Date.now(), kind, label, detail },
    ]);
  }, []);

  const clearEvents = useCallback(() => {
    setSessionEvents([]);
    setLastTransition(null);
    setPossibleNextNodes([]);
    prevStateRef.current = null;
    prevNodeRef.current = null;
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data as SandboxDebugMessage;
    if (data?.type !== 'SANDBOX_DEBUG_STATE') return;

    const next = data.state;
    const prev = prevStateRef.current;
    const nextNode = deriveActiveNode(next);

    // Update possible next nodes from the edge map
    setPossibleNextNodes(getOutgoingEdges(nextNode));

    // Derive events + transition from state diff
    if (prev) {
      const prevNode = prevNodeRef.current!;
      const moved = prevNode !== nextNode;

      // Offer selected
      if (!prev.selectedOffer && next.selectedOffer) {
        pushEvent('offer-selected', 'Offer Selected', next.selectedOffer);
      }

      // Intent selected
      if (!prev.currentIntent && next.currentIntent) {
        pushEvent('intent-selected', 'Intent Selected', next.currentIntent);
      }

      // Question changed
      if (prev.currentQuestionId !== next.currentQuestionId && next.currentQuestionId) {
        pushEvent('question-change', 'Question Changed', next.currentQuestionId);
      }

      // LLM started
      if (!prev.loading && next.loading) {
        pushEvent('llm-start', 'LLM Processing Started');
      }

      // LLM finished
      if (prev.loading && !next.loading) {
        pushEvent('llm-end', 'LLM Processing Complete');
      }

      // New answer collected
      const prevKeys = new Set(Object.keys(prev.userInput));
      for (const [key, value] of Object.entries(next.userInput)) {
        if (!prevKeys.has(key)) {
          pushEvent('answer-collected', 'Answer Collected', `${key} = ${value}`);
        }
      }

      // New message
      if (next.messageCount > prev.messageCount) {
        if (next.lastUserMessage !== prev.lastUserMessage) {
          pushEvent('message-received', 'User Message', next.lastUserMessage ?? undefined);
        }
        if (next.lastAssistantMessage !== prev.lastAssistantMessage) {
          pushEvent('message-received', 'Assistant Message', next.lastAssistantMessage ?? undefined);
        }
      }

      // Contact modal opened
      if (!prev.showContactModal && next.showContactModal) {
        pushEvent('contact-modal', 'Contact Modal Opened');
      }

      // Flow complete
      if (!prev.isComplete && next.isComplete) {
        pushEvent('flow-complete', 'Flow Completed');
      }

      // Node changed
      if (moved) {
        pushEvent('node-change', 'Node Changed', labelFor(nextNode));
      }

      // Build transition info when something meaningful happened
      // (new message, loading change, or node move)
      const somethingHappened =
        moved ||
        next.messageCount > prev.messageCount ||
        prev.loading !== next.loading ||
        prev.currentQuestionId !== next.currentQuestionId;

      if (somethingHappened) {
        setLastTransition({
          moved,
          fromNode: prevNode,
          toNode: nextNode,
          reason: inferTransitionReason(prev, next, prevNode, nextNode),
          timestamp: Date.now(),
        });
      }
    } else {
      // First state received
      pushEvent('node-change', 'Session Started', labelFor(nextNode));
    }

    prevStateRef.current = next;
    prevNodeRef.current = nextNode;
    setDebugState(next);
    setActiveNodeId(nextNode);
  }, [pushEvent]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return { debugState, activeNodeId, sessionEvents, clearEvents, possibleNextNodes, lastTransition };
}
