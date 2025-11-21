// stores/userProfile.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

interface UserProfileState {
  // Unique ID per visitor (even without email)
  conversationId: string | null;
  
  // Raw answers (question → answer)
  userInput: Record<string, string>;
  
  // The golden normalized profile
  userProfile: UserProfile | null;
  
  // Metadata
  lastSeen: Date | null;
  flow: 'buy' | 'sell' | 'browse' | null;

  // Actions
  setConversationId: (id: string) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  setProfile: (profile: UserProfile) => void;
  setFlow: (flow: 'buy' | 'sell' | 'browse') => void;
  touch: () => void; // update lastSeen
  reset: () => void;
}

export const useUserProfile = create<UserProfileState>()(
  persist(
    (set) => ({
      conversationId: null,
      userInput: {},
      userProfile: null,
      lastSeen: null,
      flow: null,

      setConversationId: (id) => set({ conversationId: id }),
      
      updateAnswer: (questionId, answer) =>
        set((state) => ({
          userInput: { ...state.userInput, [questionId]: answer },
          lastSeen: new Date(),
        })),

      setProfile: (profile) =>
        set({
          userProfile: profile,
          lastSeen: new Date(),
        }),

      setFlow: (flow) => set({ flow }),

      touch: () => set({ lastSeen: new Date() }),

      reset: () =>
        set({
          userInput: {},
          userProfile: null,
          lastSeen: null,
          flow: null,
        }),
    }),
    {
      name: 'real-estate-profile-v2',
      partialize: (state) => ({
        conversationId: state.conversationId,
        userInput: state.userInput,
        userProfile: state.userProfile,
        flow: state.flow,
        lastSeen: state.lastSeen,
      }),
    }
  )
);