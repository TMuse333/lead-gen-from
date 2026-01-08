// stores/conversation/actions.ts
import type { ConversationStore, ConversationFlow } from './conversation.store';
import type { ConversationQuestion, ButtonOption } from '@/types/conversation.types';

// Debounce timer for saving to MongoDB
let saveTimeout: NodeJS.Timeout | null = null;

// This is the clean, modern way — just like your chat.actions.ts
export const createActions = (
  set: (updater: Partial<ConversationStore> | ((state: ConversationStore) => Partial<ConversationStore>)) => void,
  get: () => ConversationStore
) => ({
  _setHydrated: () => set({ hydrated: true }),

  createFlow: (flow: Omit<ConversationFlow, 'id' | 'metadata'>) => {
    const id = `flow-${Date.now()}`;
    const newFlow: ConversationFlow = {
      ...flow,
      id,
      metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
    };
    set((s) => ({ flows: { ...s.flows, [id]: newFlow } }));
    return id;
  },

  updateFlow: (flowId: string, updates: Partial<ConversationFlow>) => {
    // Update local store first (optimistic update)
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;
      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            ...updates,
            metadata: {
              ...flow.metadata,
              updatedAt: new Date()!,
              version: (flow.metadata?.version ?? 0) + 1,
            },
          },
        },
      };
    });

    // Debounce MongoDB save (wait 1 second after last update)
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      try {
        const updatedFlows = get().flows;
        
        // Serialize flows (convert Date objects to ISO strings for MongoDB)
        const serializedFlows = Object.fromEntries(
          Object.entries(updatedFlows).map(([key, flow]) => [
            key,
            {
              ...flow,
              metadata: {
                ...flow.metadata,
                createdAt: flow.metadata.createdAt instanceof Date 
                  ? flow.metadata.createdAt.toISOString() 
                  : flow.metadata.createdAt,
                updatedAt: flow.metadata.updatedAt instanceof Date 
                  ? flow.metadata.updatedAt.toISOString() 
                  : flow.metadata.updatedAt,
              },
            },
          ])
        );
        
        const response = await fetch('/api/user/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationFlows: serializedFlows,
          }),
        });

        if (!response.ok) {
          console.error('❌ Failed to save conversation flows to MongoDB');
          throw new Error('Failed to save conversation flows');
        }

        console.log('✅ Conversation flows saved to MongoDB');
      } catch (error) {
        console.error('❌ Error saving conversation flows:', error);
        // Note: We don't revert the local update - user sees their changes
        // but they may need to refresh to see the persisted version
      }
    }, 1000); // Wait 1 second after last update
  },

    getQuestion: (flowId: string, questionId: string) => {
        const flow = get().flows[flowId];
        return flow?.questions.find(q => q.id === questionId);
      },

  deleteFlow: (flowId: string) =>
    set((s) => {
      const { [flowId]: _, ...rest } = s.flows;
      const newActive = s.activeFlowId === flowId ? undefined : s.activeFlowId;
      return { flows: rest, activeFlowId: newActive };
    }),

  duplicateFlow: (flowId: string) => {
    const flow = get().flows[flowId];
    if (!flow) return '';
    const newId = `${flowId}-copy-${Date.now()}`;
    const copy: ConversationFlow = {
      ...flow,
      id: newId,
      name: `${flow.name} (Copy)`,
      metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
    };
    set((s) => ({ flows: { ...s.flows, [newId]: copy } }));
    return newId;
  },

  setActiveFlow: (flowId: string) => set({ activeFlowId: flowId }),

  addQuestion: (flowId: string, question: Omit<ConversationQuestion, 'id' | 'order'>) => {
    const flow = get().flows[flowId];
    if (!flow) return;

    const id = `q-${Date.now()}`;
    const newQ: ConversationQuestion = {
      ...question,
      id,
      order: flow.questions.length + 1,
    };

    set((s) => ({
      flows: {
        ...s.flows,
        [flowId]: {
          ...flow,
          questions: [...flow.questions, newQ],
        },
      },
    }));
  },

  updateQuestion: (flowId: string, questionId: string, updates: Partial<ConversationQuestion>) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            questions: flow.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          },
        },
      };
    }),

  deleteQuestion: (flowId: string, questionId: string) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            questions: flow.questions.filter((q) => q.id !== questionId),
          },
        },
      };
    }),

  reorderQuestions: (flowId: string, orderedIds: string[]) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      const reordered = orderedIds
        .map((id, i) => {
          const q = flow.questions.find((x) => x.id === id);
          return q ? { ...q, order: i + 1 } : null;
        })
        .filter(Boolean) as ConversationQuestion[];

      return {
        flows: {
          ...s.flows,
          [flowId]: { ...flow, questions: reordered },
        },
      };
    }),

  addButton: (flowId: string, questionId: string, button: Omit<ButtonOption, 'id'>) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      const newButton = { ...button, id: `btn-${Date.now()}` };

      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            questions: flow.questions.map((q) =>
              q.id === questionId
                ? { ...q, buttons: [...(q.buttons ?? []), newButton] }
                : q
            ),
          },
        },
      };
    }),

  updateButton: (flowId: string, questionId: string, buttonId: string, updates: Partial<ButtonOption>) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            questions: flow.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    buttons: q.buttons?.map((b) =>
                      b.id === buttonId ? { ...b, ...updates } : b
                    ),
                  }
                : q
            ),
          },
        },
      };
    }),

  deleteButton: (flowId: string, questionId: string, buttonId: string) =>
    set((s) => {
      const flow = s.flows[flowId];
      if (!flow) return s;

      return {
        flows: {
          ...s.flows,
          [flowId]: {
            ...flow,
            questions: flow.questions.map((q) =>
              q.id === questionId
                ? { ...q, buttons: q.buttons?.filter((b) => b.id !== buttonId) }
                : q
            ),
          },
        },
      };
    }),

  exportFlow: (flowId: string) =>
    JSON.stringify(get().flows[flowId], null, 2),

  importFlow: (jsonData: string) => {
    try {
      const flow: ConversationFlow = JSON.parse(jsonData);
      const newId = `imported-${Date.now()}`;
      set((s) => ({
        flows: { ...s.flows, [newId]: { ...flow, id: newId } },
      }));
    } catch (e) {
      console.error('Import failed', e);
    }
  },

  updateSettings: (updates: Partial<ConversationStore['settings']>) =>
    set((s) => ({ settings: { ...s.settings, ...updates } })),

  getFlow: (id: string) => get().flows[id],

  // Load client flows from configuration
  loadClientFlows: (clientFlows: Record<string, ConversationFlow>) => {
    console.log('🔄 Loading client flows:', Object.keys(clientFlows));
    set((s) => ({
      flows: clientFlows,
      // Keep activeFlowId if it still exists in new flows
      activeFlowId: s.activeFlowId && clientFlows[s.activeFlowId] 
        ? s.activeFlowId 
        : Object.keys(clientFlows)[0] || undefined,
    }));
  },
});