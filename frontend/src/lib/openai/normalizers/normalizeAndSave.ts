// lib/openai/normalizers/normalizeAndSaveProfile.ts
import { normalizeToRealEstateSchema } from './normalizeToRealEstateSchema';
import type { UserProfile } from '@/types';
import { FlowType } from '@/types/conversation.types';

let isNormalizing = false;

export async function updateAndNormalizeProfile(
  getState: () => { userInput: Record<string, string>; flow: string | null },
  setProfile: (profile: UserProfile) => void
) {
  if (isNormalizing) return;
  isNormalizing = true;

  const { userInput, flow } = getState();

  if (!flow || Object.keys(userInput).length === 0) {
    isNormalizing = false;
    return;
  }

  console.log('Normalizing profile...');
  console.log('Raw input:', userInput);

  try {
    const normalized = await normalizeToRealEstateSchema(userInput, flow as FlowType);
    const fullProfile: UserProfile = {
      intent: flow as FlowType,
      ...normalized,
    };

    console.log('Normalized profile → saved:', fullProfile);
    setProfile(fullProfile);
  } catch (error) {
    console.error('Profile normalization failed:', error);
  } finally {
    isNormalizing = false;
  }
}