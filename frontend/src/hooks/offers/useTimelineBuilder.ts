// src/hooks/offers/useTimelineBuilder.ts
/**
 * Hook for managing timeline builder state
 * Handles fetching, editing, and saving custom phases
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  CustomPhaseConfig,
  CustomActionableStep,
  TimelineFlow,
  PhaseValidationError,
} from '@/types/timelineBuilder.types';
import {
  validatePhases,
  createEmptyPhase,
  createEmptyStep,
  PHASE_CONSTRAINTS,
} from '@/types/timelineBuilder.types';

interface UseTimelineBuilderReturn {
  // State
  phases: CustomPhaseConfig[];
  selectedFlow: TimelineFlow;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
  isDirty: boolean;
  isCustom: boolean;
  validationErrors: PhaseValidationError[];

  // Flow actions
  setSelectedFlow: (flow: TimelineFlow) => void;

  // Phase actions
  addPhase: () => void;
  removePhase: (phaseId: string) => void;
  updatePhase: (phaseId: string, updates: Partial<CustomPhaseConfig>) => void;
  reorderPhases: (reorderedPhases: CustomPhaseConfig[]) => void;

  // Step actions
  addStep: (phaseId: string) => void;
  removeStep: (phaseId: string, stepId: string) => void;
  updateStep: (phaseId: string, stepId: string, updates: Partial<CustomActionableStep>) => void;
  reorderSteps: (phaseId: string, reorderedSteps: CustomActionableStep[]) => void;

  // Story linking
  linkStory: (phaseId: string, stepId: string, storyId: string) => void;
  setInlineExperience: (phaseId: string, stepId: string, text: string) => void;
  clearStoryLink: (phaseId: string, stepId: string) => void;

  // Save/Reset
  savePhases: () => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  discardChanges: () => void;

  // Helpers
  canAddPhase: boolean;
  canRemovePhase: boolean;
}

export function useTimelineBuilder(): UseTimelineBuilderReturn {
  const [phases, setPhases] = useState<CustomPhaseConfig[]>([]);
  const [originalPhases, setOriginalPhases] = useState<CustomPhaseConfig[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  // Computed state
  const isDirty = JSON.stringify(phases) !== JSON.stringify(originalPhases);
  const validationErrors = validatePhases(phases);
  const canAddPhase = phases.length < PHASE_CONSTRAINTS.MAX_PHASES;
  const canRemovePhase = phases.length > PHASE_CONSTRAINTS.MIN_PHASES;

  // Fetch phases for selected flow
  const fetchPhases = useCallback(async (flow: TimelineFlow) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/custom-phases?flow=${flow}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch phases');
      }

      setPhases(data.phases);
      setOriginalPhases(data.phases);
      setIsCustom(data.isCustom);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load phases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on flow change
  useEffect(() => {
    fetchPhases(selectedFlow);
  }, [selectedFlow, fetchPhases]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Phase actions
  const addPhase = useCallback(() => {
    if (!canAddPhase) return;

    const newPhase = createEmptyPhase(phases.length + 1);
    setPhases((prev) => [...prev, newPhase]);
  }, [phases.length, canAddPhase]);

  const removePhase = useCallback((phaseId: string) => {
    if (!canRemovePhase) return;

    setPhases((prev) => {
      const filtered = prev.filter((p) => p.id !== phaseId);
      // Reorder remaining phases
      return filtered.map((p, i) => ({ ...p, order: i + 1 }));
    });
  }, [canRemovePhase]);

  const updatePhase = useCallback((phaseId: string, updates: Partial<CustomPhaseConfig>) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, ...updates, id: phaseId } : p))
    );
  }, []);

  const reorderPhases = useCallback((reorderedPhases: CustomPhaseConfig[]) => {
    const withOrder = reorderedPhases.map((p, i) => ({ ...p, order: i + 1 }));
    setPhases(withOrder);
  }, []);

  // Step actions
  const addStep = useCallback((phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        if (p.actionableSteps.length >= PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE) return p;

        const newStep = createEmptyStep(p.actionableSteps.length + 1);
        return { ...p, actionableSteps: [...p.actionableSteps, newStep] };
      })
    );
  }, []);

  const removeStep = useCallback((phaseId: string, stepId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        if (p.actionableSteps.length <= PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE) return p;

        const filtered = p.actionableSteps.filter((s) => s.id !== stepId);
        const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
        return { ...p, actionableSteps: reordered };
      })
    );
  }, []);

  const updateStep = useCallback(
    (phaseId: string, stepId: string, updates: Partial<CustomActionableStep>) => {
      setPhases((prev) =>
        prev.map((p) => {
          if (p.id !== phaseId) return p;
          return {
            ...p,
            actionableSteps: p.actionableSteps.map((s) =>
              s.id === stepId ? { ...s, ...updates, id: stepId } : s
            ),
          };
        })
      );
    },
    []
  );

  const reorderSteps = useCallback((phaseId: string, reorderedSteps: CustomActionableStep[]) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        const withOrder = reorderedSteps.map((s, i) => ({ ...s, order: i + 1 }));
        return { ...p, actionableSteps: withOrder };
      })
    );
  }, []);

  // Story linking
  const linkStory = useCallback((phaseId: string, stepId: string, storyId: string) => {
    updateStep(phaseId, stepId, { linkedStoryId: storyId, inlineExperience: undefined });
  }, [updateStep]);

  const setInlineExperience = useCallback((phaseId: string, stepId: string, text: string) => {
    updateStep(phaseId, stepId, { inlineExperience: text, linkedStoryId: undefined });
  }, [updateStep]);

  const clearStoryLink = useCallback((phaseId: string, stepId: string) => {
    updateStep(phaseId, stepId, { linkedStoryId: undefined, inlineExperience: undefined });
  }, [updateStep]);

  // Save phases
  const savePhases = useCallback(async (): Promise<boolean> => {
    if (validationErrors.length > 0) {
      setError('Please fix validation errors before saving');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/custom-phases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: selectedFlow, phases }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save phases');
      }

      setOriginalPhases(phases);
      setIsCustom(true);
      setSuccessMessage('Timeline saved successfully');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save phases');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [phases, selectedFlow, validationErrors.length]);

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/custom-phases?flow=${selectedFlow}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset');
      }

      setPhases(data.phases);
      setOriginalPhases(data.phases);
      setIsCustom(false);
      setSuccessMessage('Reset to default timeline');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedFlow]);

  // Discard changes
  const discardChanges = useCallback(() => {
    setPhases(originalPhases);
    setError(null);
  }, [originalPhases]);

  return {
    // State
    phases,
    selectedFlow,
    isLoading,
    isSaving,
    error,
    successMessage,
    isDirty,
    isCustom,
    validationErrors,

    // Flow actions
    setSelectedFlow,

    // Phase actions
    addPhase,
    removePhase,
    updatePhase,
    reorderPhases,

    // Step actions
    addStep,
    removeStep,
    updateStep,
    reorderSteps,

    // Story linking
    linkStory,
    setInlineExperience,
    clearStoryLink,

    // Save/Reset
    savePhases,
    resetToDefaults,
    discardChanges,

    // Helpers
    canAddPhase,
    canRemovePhase,
  };
}

export default useTimelineBuilder;
