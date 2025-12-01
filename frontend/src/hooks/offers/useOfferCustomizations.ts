// frontend/src/hooks/useOfferCustomizations.ts
/**
 * Hook for fetching and saving offer customizations
 */

import { useState, useEffect, useCallback } from 'react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type {
  OfferCustomizations,
  OfferCustomizationDocument,
} from '@/types/offers/offerCustomization.types';
import type { OfferDefinition } from '@/lib/offers/core/types';

interface UseOfferCustomizationsReturn {
  definition: OfferDefinition | null;
  customization: OfferCustomizations | null;
  hasCustomizations: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveCustomizations: (customizations: OfferCustomizations) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
}

export function useOfferCustomizations(
  offerType: OfferType | null
): UseOfferCustomizationsReturn {
  const [definition, setDefinition] = useState<OfferDefinition | null>(null);
  const [customization, setCustomization] = useState<OfferCustomizations | null>(null);
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch offer data
  const fetchOffer = useCallback(async () => {
    if (!offerType) {
      console.log('🟡 [useOfferCustomizations] No offerType provided, skipping fetch');
      return;
    }

    console.log('🟢 [useOfferCustomizations] Fetching offer data for:', offerType);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/offers/${offerType}`);
      console.log('🟢 [useOfferCustomizations] API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 [useOfferCustomizations] API error:', response.status, errorText);
        throw new Error('Failed to fetch offer definition');
      }

      const data = await response.json();
      console.log('🟢 [useOfferCustomizations] Data received:', {
        hasDefinition: !!data.definition,
        hasCustomization: !!data.customization,
        hasCustomizations: data.hasCustomizations
      });
      
      setDefinition(data.definition);
      setCustomization(data.customization);
      setHasCustomizations(data.hasCustomizations);
    } catch (err: any) {
      console.error('🔴 [useOfferCustomizations] Error fetching offer:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [offerType]);

  // Save customizations
  const saveCustomizations = useCallback(
    async (customizations: OfferCustomizations): Promise<boolean> => {
      if (!offerType) return false;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/offers/${offerType}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customizations }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save customizations');
        }

        const data = await response.json();
        setCustomization(data.customization.customizations);
        setHasCustomizations(true);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [offerType]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    if (!offerType) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/offers/${offerType}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset customizations');
      }

      setCustomization(null);
      setHasCustomizations(false);
      await fetchOffer(); // Refetch to get system defaults
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [offerType, fetchOffer]);

  // Fetch on mount and when offerType changes
  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  return {
    definition,
    customization,
    hasCustomizations,
    isLoading,
    error,
    refetch: fetchOffer,
    saveCustomizations,
    resetToDefaults,
  };
}
