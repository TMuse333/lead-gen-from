// stores/conversationConfigStore.ts
'use client'; // This file is now client-only → safe for localStorage + Date.now()

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import {
  ConversationConfig,
  ConversationFlow,
  QuestionNode,
  ButtonOption,
} from '@/types/conversationConfig.types';
import { VISUAL_MAP } from '@/utils/visualMapper';

// ---------------------------------------------------------------------
// 1. Default flows (only created on the client)
// ---------------------------------------------------------------------
const createDefaultFlows = (): Record<string, ConversationFlow> => ({
  sell: {
    id: 'sell',
    name: 'Seller Journey',
    type: 'sell',
    description: 'For homeowners looking to sell their property',
    visual: { type: 'emoji', value: 'house' },
    questions: [],
    metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
  },
  buy: {
    id: 'buy',
    name: 'Buyer Journey',
    type: 'buy',
    description: 'For people looking to purchase a home',
    visual: { type: 'emoji', value: 'key' },
    questions: [],
    metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
  },
  browse: {
    id: 'browse',
    name: 'Market Explorer',
    type: 'browse',
    description: 'For market researchers and curious browsers',
    visual: { type: 'emoji', value: 'eyes' },
    questions: [],
    metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
  },
});

// ---------------------------------------------------------------------
// 2. Client-only storage (no-op on server)
// ---------------------------------------------------------------------
const clientStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : null;
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

// ---------------------------------------------------------------------
// 3. Store interface
// ---------------------------------------------------------------------
interface ConversationConfigStore extends ConversationConfig {
  flows: Record<string, ConversationFlow>;
  activeFlowId?: string;
  settings: ConversationConfig['settings'];
  hydrated: boolean;

  // actions
  createFlow: (flow: Omit<ConversationFlow, 'id' | 'metadata'>) => string;
  updateFlow: (flowId: string, updates: Partial<ConversationFlow>) => void;
  deleteFlow: (flowId: string) => void;
  duplicateFlow: (flowId: string) => string;
  setActiveFlow: (flowId: string) => void;

  addQuestion: (flowId: string, question: Omit<QuestionNode, 'id'>) => void;
  updateQuestion: (flowId: string, questionId: string, updates: Partial<QuestionNode>) => void;
  deleteQuestion: (flowId: string, questionId: string) => void;
  reorderQuestions: (flowId: string, questionIds: string[]) => void;

  addButton: (flowId: string, questionId: string, button: ButtonOption) => void;
  updateButton: (flowId: string, questionId: string, buttonId: string, updates: Partial<ButtonOption>) => void;
  deleteButton: (flowId: string, questionId: string, buttonId: string) => void;

  exportFlow: (flowId: string) => string;
  importFlow: (jsonData: string) => void;
  updateSettings: (settings: Partial<ConversationConfig['settings']>) => void;

  getFlow: (flowId: string) => ConversationFlow | undefined;
  getQuestion: (flowId: string, questionId: string) => QuestionNode | undefined;
  getAllFlows: () => ConversationFlow[];

  // hydration
  _setHydrated: () => void;
}

// ---------------------------------------------------------------------
// 4. The store
// ---------------------------------------------------------------------
export const useConversationConfigStore = create<ConversationConfigStore>()(
  persist(
    (set, get) => ({
      // Initial empty state – will be merged with defaults + persisted data
      flows: {},
      activeFlowId: undefined,
      settings: {
        enableTrackerAnimations: true,
        showProgress: true,
        autoSave: true,
      },
      hydrated: false,

      _setHydrated: () => set({ hydrated: true }),

      // Flow management
      createFlow: (flow) => {
        const id = `flow-${Date.now()}`;
        const newFlow: ConversationFlow = {
          ...flow,
          id,
          metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
        };
        set((s) => ({ flows: { ...s.flows, [id]: newFlow } }));
        return id;
      },

      updateFlow: (flowId, updates) => {
        set((s) => {
          const existing = s.flows[flowId];
          if (!existing) return s;
          const updated: ConversationFlow = {
            ...existing,
            ...updates,
            metadata: {
              createdAt: existing.metadata?.createdAt ?? new Date(),
              updatedAt: new Date(),
              version: (existing.metadata?.version ?? 0) + 1,
              author: updates.metadata?.author ?? existing.metadata?.author,
            },
          };
          return { flows: { ...s.flows, [flowId]: updated } };
        });
      },

      deleteFlow: (flowId) => {
        set((s) => {
          const { [flowId]: _, ...rest } = s.flows;
          return { flows: rest };
        });
      },

      duplicateFlow: (flowId) => {
        const flow = get().flows[flowId];
        if (!flow) return '';
        const newId = `${flowId}-copy-${Date.now()}`;
        const dup: ConversationFlow = {
          ...flow,
          id: newId,
          name: `${flow.name} (Copy)`,
          metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 },
        };
        set((s) => ({ flows: { ...s.flows, [newId]: dup } }));
        return newId;
      },

      setActiveFlow: (flowId) => set({ activeFlowId: flowId }),

      // Question management
      addQuestion: (flowId, question) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        const id = `q-${Date.now()}`;
        const newQ: QuestionNode = { ...question, id, order: flow.questions.length + 1 };
        set((s) => ({
          flows: {
            ...s.flows,
            [flowId]: { ...flow, questions: [...flow.questions, newQ] },
          },
        }));
      },

      updateQuestion: (flowId, questionId, updates) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        set((s) => ({
          flows: {
            ...s.flows,
            [flowId]: {
              ...flow,
              questions: flow.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            },
          },
        }));
      },

      deleteQuestion: (flowId, questionId) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        set((s) => ({
          flows: {
            ...s.flows,
            [flowId]: {
              ...flow,
              questions: flow.questions.filter((q) => q.id !== questionId),
            },
          },
        }));
      },

      reorderQuestions: (flowId, questionIds) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        const reordered = questionIds
          .map((id, i) => {
            const q = flow.questions.find((x) => x.id === id);
            return q ? { ...q, order: i + 1 } : null;
          })
          .filter((x): x is QuestionNode => x !== null);
        set((s) => ({
          flows: { ...s.flows, [flowId]: { ...flow, questions: reordered } },
        }));
      },

      // Button management
      addButton: (flowId, questionId, button) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        set((s) => ({
          flows: {
            ...s.flows,
            [flowId]: {
              ...flow,
              questions: flow.questions.map((q) =>
                q.id === questionId
                  ? { ...q, buttons: [...(q.buttons ?? []), button] }
                  : q
              ),
            },
          },
        }));
      },

      updateButton: (flowId, questionId, buttonId, updates) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        set((s) => ({
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
        }));
      },

      deleteButton: (flowId, questionId, buttonId) => {
        const flow = get().flows[flowId];
        if (!flow) return;
        set((s) => ({
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
        }));
      },

      exportFlow: (flowId) => JSON.stringify(get().flows[flowId], null, 2),

      importFlow: (jsonData) => {
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

      updateSettings: (newSettings) => {
        set((s) => ({
          settings: {
            enableTrackerAnimations:
              newSettings!.enableTrackerAnimations ?? s.settings!.enableTrackerAnimations,
            showProgress: newSettings!.showProgress ?? s.settings!.showProgress,
            autoSave: newSettings!.autoSave ?? s.settings!.autoSave,
          },
        }));
      },

      getFlow: (flowId) => get().flows[flowId],
      getQuestion: (flowId, questionId) => {
        const flow = get().flows[flowId];
        return flow?.questions.find((q) => q.id === questionId);
      },
      getAllFlows: () => Object.values(get().flows),
    }),
    {
      name: 'conversation-config-storage',
      version: 1,
      storage: createJSONStorage(() => clientStorage),

      // Merge persisted data with defaults on first load
      merge: (persisted: any, current) => {
        const defaults = createDefaultFlows();
      
        const transformVisual = (visual: any) => {
          if (!visual?.value) return visual;
      
          // If it's an emoji string like "house"
          if (visual.type === 'emoji' && typeof visual.value === 'string') {
            const emoji = VISUAL_MAP[visual.value as keyof typeof VISUAL_MAP];
            if (typeof emoji === 'string') {
              return { ...visual, value: emoji }; // house → house
            }
          }
      
          // If it's an icon name like "House"
          if (visual.type === 'icon' && typeof visual.value === 'string') {
            const IconComponent = VISUAL_MAP[visual.value as keyof typeof VISUAL_MAP];
            if (typeof IconComponent === 'function') {
              return { ...visual, value: IconComponent };
            }
          }
      
          return visual;
        };
      
        const transformFlow = (flow: any): ConversationFlow => ({
          ...flow,
          visual: flow.visual ? transformVisual(flow.visual) : undefined,
          questions: flow.questions.map((q: any) => ({
            ...q,
            visual: q.visual ? transformVisual(q.visual) : undefined,
            buttons: q.buttons?.map((b: any) => ({
              ...b,
              visual: b.visual ? transformVisual(b.visual) : undefined,
            })),
          })),
        });
      
        const mergedFlows = {
          ...defaults,
          ...(persisted?.flows ?? {}),
        };
      
        const transformedFlows = Object.fromEntries(
          Object.entries(mergedFlows).map(([id, flow]: [string, any]) => [
            id,
            transformFlow(flow),
          ])
        );
      
        return {
          ...current,
          ...persisted,
          flows: transformedFlows,
        };
      },

      // FIXED: Correct signature for onRehydrateStorage
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Rehydration error:', error);
          } else if (state) {
            state._setHydrated(); // This now works perfectly
          }
        };
      },
    }
  )
);

// ---------------------------------------------------------------------
// Handy selectors
// ---------------------------------------------------------------------
export const selectActiveFlow = (state: ConversationConfigStore) =>
  state.activeFlowId ? state.flows[state.activeFlowId] : undefined;

export const selectFlowQuestions =
  (flowId: string) => (state: ConversationConfigStore) =>
    state.flows[flowId]?.questions.sort((a, b) => a.order - b.order) ?? [];