// frontend/src/components/dashboard/user/offers/editor/tabs/TestTab.tsx
/**
 * Test Generation tab for offer editor
 * Allows testing offer generation with sample data
 */

'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle2, XCircle, DollarSign, Clock, Zap } from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import { getSampleDataForOffer } from '@/lib/offers/utils/getSampleData';
import { useOfferTest } from '@/hooks/offers/useOfferTest';

interface TestTabProps {
  offerType: OfferType;
}

export function TestTab({ offerType }: TestTabProps) {
  const { isGenerating, result, error, generateTest, clearResult } = useOfferTest(offerType);
  const [sampleData, setSampleData] = useState(() => getSampleDataForOffer(offerType));

  const handleGenerate = () => {
    generateTest({
      offerType,
      sampleData: sampleData.userInput,
      context: sampleData.context,
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setSampleData((prev) => ({
      ...prev,
      userInput: {
        ...prev.userInput,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Sample Data Form */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Test Data
        </h3>
        <div className="space-y-3">
          {Object.entries(sampleData.userInput).map(([field, value]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {field}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Generate Test Offer
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Status */}
          <div
            className={`rounded-lg p-4 flex items-center gap-3 ${
              result.success
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            {result.success ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="text-green-400 font-semibold">Generation Successful!</h4>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Your test offer was generated successfully.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="text-red-400 font-semibold">Generation Failed</h4>
                  <p className="text-slate-300 text-sm mt-0.5">{result.error}</p>
                </div>
              </>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={<DollarSign className="w-4 h-4" />}
              label="Cost"
              value={`$${result.metadata.cost.toFixed(4)}`}
            />
            <MetricCard
              icon={<Zap className="w-4 h-4" />}
              label="Tokens"
              value={result.metadata.tokensUsed.toLocaleString()}
            />
            <MetricCard
              icon={<Clock className="w-4 h-4" />}
              label="Duration"
              value={`${(result.metadata.duration / 1000).toFixed(2)}s`}
            />
          </div>

          {/* Generated Data */}
          {result.success && result.data && (
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-3">
                Generated Output
              </h4>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
