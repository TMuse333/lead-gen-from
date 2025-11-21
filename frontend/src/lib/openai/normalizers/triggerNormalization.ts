// lib/openai/normalizers/triggerNormalization.ts
import { getUserProfileState } from '@/stores/profileStore/userProfile.store';
import { updateAndNormalizeProfile } from './normalizeAndSave';

let isRunning = false;

export async function triggerNormalization() {
  if (isRunning) return;
  isRunning = true;

  const state = getUserProfileState();

  if (!state.flow || Object.keys(state.userInput).length === 0) {
    isRunning = false;
    return;
  }

  try {
    await updateAndNormalizeProfile(
      () => ({ userInput: state.userInput, flow: state.flow! }),
      state.setProfile
    );
  } catch (error) {
    console.error('Failed to normalize profile:', error);
  } finally {
    isRunning = false;
  }
}