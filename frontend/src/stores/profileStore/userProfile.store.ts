// stores/profileStore/userProfile.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

interface UserProfileState {
  conversationId: string | null;
  userInput: Record<string, string>;
  userProfile: UserProfile | null;
  flow: 'buy' | 'sell' | 'browse' | null;
  lastSeen: Date | null;

  setConversationId: (id: string) => void;
  updateAnswer: (key: string, value: string) => void;
  setProfile: (profile: UserProfile) => void;
  setFlow: (flow: 'buy' | 'sell' | 'browse') => void;
  touch: () => void;
  reset: () => void;
}

// Create the store
const useUserProfile = create<UserProfileState>()(
  persist(
    (set, get) => ({
      conversationId: null,
      userInput: {},
      userProfile: null,
      flow: null,
      lastSeen: null,

      setConversationId: (id) => set({ conversationId: id }),
      updateAnswer: (key, value) =>
        set((state) => ({
          userInput: { ...state.userInput, [key]: value },
          lastSeen: new Date(),
        })),
      setProfile: (profile) => set({ userProfile: profile, lastSeen: new Date() }),
      setFlow: (flow) => set({ flow }),
      touch: () => set({ lastSeen: new Date() }),
      reset: () => set({ userInput: {}, userProfile: null, flow: null, lastSeen: null }),
    }),
    { name: 'real-estate-profile-v3' }
  )
);

// Export the hook
export { useUserProfile };

// Export a direct getState function (THIS IS THE FIX)
export const getUserProfileState = () => useUserProfile.getState();