// src/lib/sandbox/deriveActiveNode.ts
// Pure function: maps sandbox debug state to a flowchart node ID.

import type { SandboxDebugState } from './sandboxBroadcaster';

export function deriveActiveNode(state: SandboxDebugState): string {
  // Completion states
  if (state.isComplete || state.showContactModal) {
    return 'flow-complete';
  }

  // No offer selected yet — still at greeting
  if (!state.selectedOffer) {
    return 'initial-greeting';
  }

  // Offer selected but no intent yet
  if (!state.currentIntent) {
    return 'offer-selection';
  }

  // Intent set but no question started
  if (!state.currentQuestionId) {
    return 'intent-selection';
  }

  // In the question loop
  if (state.loading) {
    return 'intent-classification';
  }

  return 'display-question';
}
