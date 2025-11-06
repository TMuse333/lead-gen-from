'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import ResultsPage from '@/components/resultsPage/results';
import { useFlowResultStore } from '@/stores/flowResultStore';
import HeroValueCard from '@/components/resultsPage/heroValueCard';

export default function Results() {
  const router = useRouter();
  const result = useFlowResultStore((state) => state.result);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Zustand persist may take a tick to load from localStorage
    if (!result) {
      // Wait a tick and check again
      const timeout = setTimeout(() => {
        const r = useFlowResultStore.getState().result;
        if (!r) {
          setError('No analysis found. Please submit the form first.');
        }
        setLoading(false);
      }, 100);

      return () => clearTimeout(timeout);
    } else {
      setLoading(false);
    }
  }, [result]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-700 text-lg">Loading your personalized analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Analysis data not available.'}</p>
          <button
            onClick={() => router.push('/form')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <ResultsPage

      userEmail={result.leadId!} // or however you want to display lead/user email
    />
    <HeroValueCard/>
    </>
  );
}
