// frontend/src/hooks/useOfferTest.ts
/**
 * Hook for testing offer generation
 */

import { useState, useCallback } from 'react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferTestRequest, OfferTestResponse } from '@/types/offers/offerCustomization.types';

interface UseOfferTestReturn {
  isGenerating: boolean;
  result: OfferTestResponse | null;
  error: string | null;
  generateTest: (request: OfferTestRequest) => Promise<void>;
  clearResult: () => void;
}

export function useOfferTest(offerType: OfferType | null): UseOfferTestReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<OfferTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTest = useCallback(
    async (request: OfferTestRequest) => {
      if (!offerType) return;

      setIsGenerating(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(`/api/offers/${offerType}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Generation failed');
        }

        setResult(data);
      } catch (err: any) {
        setError(err.message);
        setResult({
          success: false,
          error: err.message,
          metadata: {
            cost: 0,
            tokensUsed: 0,
            duration: 0,
            retries: 0,
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [offerType]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    result,
    error,
    generateTest,
    clearResult,
  };
}
