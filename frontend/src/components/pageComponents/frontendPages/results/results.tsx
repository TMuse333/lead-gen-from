'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowResultStore } from '@/stores/flowResultStore';
import ResultLayout from '@/components/ux/resultsPage/results';

// import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ResultsPage() {
  const { result, flowType } = useFlowResultStore();
  const router = useRouter();

  // Redirect if no result
  useEffect(() => {
    if (!result || !flowType) {
      router.replace('/');
    }
  }, [result, flowType, router]);

  if (!result || !flowType) {
    return <p>loading...</p>;
  }

  return <ResultLayout flowType={flowType} output={result} />;
}