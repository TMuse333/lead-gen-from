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
    // Incomplete means: has started (past welcome screen) and has some data but not complete
    const hasStarted = state.currentStep > 0;
    const hasData =
      state.businessName ||
      state.agentFirstName ||
      state.agentEmail;

    const isComplete = state.currentStep === 2 || state.completedSteps?.includes(2);

    // Return state if user has started, has data, but not complete
    if (hasStarted && hasData && !isComplete) {
      return state;
    }

    return null;
  } catch {
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
    progress: Math.round(((state.currentStep || 1) / 2) * 100), // 2 steps in ultra-simplified flow
  };
}

