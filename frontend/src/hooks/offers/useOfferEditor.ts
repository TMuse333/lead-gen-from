// frontend/src/hooks/useOfferEditor.ts
/**
 * Hook for managing offer editor state
 */

import { useState, useCallback } from 'react';
import type { EditorTab } from '@/types/offers/offerCustomization.types';

export interface UseOfferEditorReturn {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (message: string | null) => void;
}

export function useOfferEditor(initialTab: EditorTab = 'timeline-builder'): UseOfferEditorReturn {
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear success message after 3 seconds
  const setSuccessWithTimeout = useCallback((message: string | null) => {
    setSuccess(message);
    if (message) {
      setTimeout(() => setSuccess(null), 3000);
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isLoading,
    setIsLoading,
    error,
    setError,
    success: success,
    setSuccess: setSuccessWithTimeout,
  };
}
