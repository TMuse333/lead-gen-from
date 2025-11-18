'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { clientStorage } from './storage';
import { createDefaultFlows } from './defaults';
import { migrateVisual } from './visualMigrator';
import { createActions } from './actions';
import type { ConversationQuestion, ButtonOption, VisualAttachment } from '@/types/conversation.types';

interface FlowMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  author?: string;
}



export interface ConversationFlow {
  id: string;
  name: string;
  type: string;
  description?: string;
  visual?: VisualAttachment;
  flowPrompt: {
    systemBase: string;
    context: string;
    personality: string;
  };
  questions: ConversationQuestion[];
  metadata: FlowMetadata;

}

export interface ConversationStore {
  flows: Record<string, ConversationFlow>;
  activeFlowId?: string;
  settings: {
    enableTrackerAnimations: boolean;
    showProgress: boolean;
    autoSave: boolean;
  };
  hydrated: boolean;

  // Actions are added via createActions()
  createFlow: (flow: Omit<ConversationFlow, 'id' | 'metadata'>) => string;
  updateFlow: (flowId: string, updates: Partial<ConversationFlow>) => void;
  deleteFlow: (flowId: string) => void;
  duplicateFlow: (flowId: string) => string;
  setActiveFlow: (flowId: string) => void;
  addQuestion: (flowId: string, question: Omit<ConversationQuestion, 'id' | 'order'>) => void;
  updateQuestion: (flowId: string, questionId: string, updates: Partial<ConversationQuestion>) => void;
  deleteQuestion: (flowId: string, questionId: string) => void;
  reorderQuestions: (flowId: string, orderedIds: string[]) => void;
  addButton: (flowId: string, questionId: string, button: Omit<ButtonOption, 'id'>) => void;
  updateButton: (flowId: string, questionId: string, buttonId: string, updates: Partial<ButtonOption>) => void;
  deleteButton: (flowId: string, questionId: string, buttonId: string) => void;
  exportFlow: (flowId: string) => string;
  importFlow: (jsonData: string) => void;
  updateSettings: (updates: Partial<ConversationStore['settings']>) => void;
  getFlow: (id: string) => ConversationFlow | undefined;
  _setHydrated: () => void;

  getQuestion: (flowId: string, questionId: string) => ConversationQuestion | undefined; // ← ADD THIS
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      flows: {},
      activeFlowId: undefined,
      settings: {
        enableTrackerAnimations: true,
        showProgress: true,
        autoSave: true,
      },
      hydrated: false,

      // All actions are injected here
      ...createActions(set, get),
    }),
    {
      name: 'conversation-config-v2',
      storage: createJSONStorage(() => clientStorage),

      merge: (persisted: any, current) => {
        const defaults = createDefaultFlows();
        const merged = { ...defaults, ...(persisted?.flows ?? {}) };

        const migrated = Object.fromEntries(
          Object.entries(merged).map(([id, flow]: [string, any]) => {
            const questions = flow.questions.map((q: any) => ({
              ...q,
              visual: migrateVisual(q.visual),
              buttons: q.buttons?.map((b: any) => ({
                ...b,
                visual: migrateVisual(b.visual),
              })),
            }));
            return [id, { ...flow, visual: migrateVisual(flow.visual), questions }];
          })
        );

        return { ...current, ...persisted, flows: migrated };
      },

      onRehydrateStorage: () => (state) => {
        if (state) state._setHydrated();
      },
    }
  )
);

// Re-export selectors
export {
  selectActiveFlow,
  selectSortedQuestions as selectFlowQuestions,
  selectAllFlows,
} from './selectors';