'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { RefreshCw } from 'lucide-react';
import ResultsPage from '@/components/resultsPage/results';

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Get analysis and comparableHomes from URL params (passed from form)
    const analysisParam = searchParams.get('analysis');
    const comparableHomesParam = searchParams.get('comparableHomes');
    const emailParam = searchParams.get('email');

    if (!analysisParam || !comparableHomesParam || !emailParam) {
      setError('Missing required data. Please submit the form again.');
      setLoading(false);
      return;
    }

    try {
      const analysis = JSON.parse(decodeURIComponent(analysisParam));
      const comparableHomes = JSON.parse(decodeURIComponent(comparableHomesParam));
      const email = decodeURIComponent(emailParam);

      setData({
        analysis,
        comparableHomes,
        userEmail: email,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error parsing data:', err);
      setError('Error loading results. Please try again.');
      setLoading(false);
    }
  }, [searchParams]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
    <ResultsPage
      analysis={data.analysis}
      comparableHomes={data.comparableHomes}
      userEmail={data.userEmail}
    />
  );
}