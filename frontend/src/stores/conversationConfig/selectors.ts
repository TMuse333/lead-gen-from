// stores/conversation/conversation.selectors.ts
import type { ConversationStore } from './conversation.store';

export const selectActiveFlow = (state: ConversationStore) =>
  state.activeFlowId ? state.flows[state.activeFlowId] : undefined;

export const selectSortedQuestions = (flowId: string) => (state: ConversationStore) =>
  state.flows[flowId]?.questions
    .slice()
    .sort((a, b) => a.order - b.order) ?? [];

export const selectAllFlows = (state: ConversationStore) =>
  Object.values(state.flows);