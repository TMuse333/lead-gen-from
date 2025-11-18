// stores/chatStore/index.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatState } from './types';
import { initialState } from './initialState';
import { createActions } from './chat.actions';

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ...createActions(set, get),
    }),
    { name: 'chat-store' }
  )
);

// Re-export everything for convenience
export * from './types';
export * from './selectors';