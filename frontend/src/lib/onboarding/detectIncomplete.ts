// lib/onboarding/detectIncomplete.ts
// Utility functions to detect incomplete onboarding

import type { OnboardingState } from "@/stores/onboardingStore/onboarding.store";

/**
 * Check if there's incomplete onboarding data in localStorage
 * Returns the data if found, null otherwise
 */
export function detectIncompleteOnboarding(): OnboardingState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("onboarding-storage");
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const state = parsed?.state as OnboardingState | undefined;

    if (!state) return null;

    // Check if onboarding is actually incomplete
    // Incomplete means: has some data but not at step 6 (complete)
    const hasData =
      state.businessName ||
      state.selectedIntentions.length > 0 ||
      state.selectedOffers.length > 0 ||
      state.knowledgeBaseItems.length > 0 ||
      Object.keys(state.conversationFlows).length > 0;

    const isComplete = state.currentStep === 6;

    // Return state if there's data but not complete
    if (hasData && !isComplete) {
      return state;
    }

    return null;
  } catch (error) {
    console.error("Error detecting incomplete onboarding:", error);
    return null;
  }
}

/**
 * Get a summary of onboarding progress for display
 */
export function getOnboardingProgressSummary(
  state: OnboardingState
): {
  currentStep: number;
  businessName: string;
  completedSteps: number[];
  progress: number;
} {
  return {
    currentStep: state.currentStep || 1,
    businessName: state.businessName || "Unnamed Business",
    completedSteps: state.completedSteps || [],
    progress: Math.round(((state.currentStep || 1) / 6) * 100),
  };
}

