'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, TrendingUp, RefreshCw } from 'lucide-react';
import { useFlowResultStore } from '@/stores/flowResultStore';
import type { FlowAnalysisOutput, SellerAnalysis, BuyerAnalysis, BrowseAnalysis } from '@/types/analysis.types';
import { useChatStore } from '@/stores/chatStore';

export default function HeroValueCard() {
  const storedResult = useFlowResultStore((state) => state.result);
  const [result, setResult] = useState<FlowAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const currentFlow = useChatStore((s) => s.currentFlow);

  // Load zustand data once
  useEffect(() => {
    if (storedResult && currentFlow) {
      setResult(storedResult);
      setLoading(false);
    }
  }, [storedResult, currentFlow]);



  if (loading) {
    console.log('nothing here')
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl shadow-xl mb-6">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-700 font-medium">Loading analysis...</span>
      </div>
    );
  }

  if (!result) return null;

  const {  analysis } = result;
  console.log('result',result)
  const flowType = currentFlow

  // Seller flow
  if (flowType === 'sell') {
    const seller = analysis as SellerAnalysis;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl p-8 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Home size={32} />
          <h2 className="text-2xl font-bold">Estimated Property Value</h2>
        </div>
        <div className="text-center my-6">
          <div className="text-5xl font-bold mb-2">
            ${seller.estimatedValue.low.toLocaleString()} - ${seller.estimatedValue.high.toLocaleString()}
          </div>
          <div className="text-blue-100 text-lg">
            {Math.round(seller.estimatedValue.confidence * 100)}% Confidence
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-blue-50">{seller.estimatedValue.reasoning}</p>
        </div>
      </motion.div>
    );
  }

  // Buyer flow
  if (flowType === 'buy') {
    const buyer = analysis as BuyerAnalysis;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl shadow-xl p-8 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <MapPin size={32} />
          <h2 className="text-2xl font-bold">Top Neighborhoods</h2>
        </div>
        <div className="text-center my-6">
          {buyer.bestNeighborhoods.length > 0 ? (
            <ul className="text-lg space-y-1">
              {buyer.bestNeighborhoods.map((n, i) => (
                <li key={i}>• {n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-100 text-lg">No neighborhoods suggested yet.</p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-blue-50">
            {buyer.financingTips.length > 0 ? buyer.financingTips.join(' • ') : 'No financing tips available.'}
          </p>
        </div>
      </motion.div>
    );
  }

  // Browse flow
  if (flowType === 'browse') {
    const browse = analysis as BrowseAnalysis;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-xl shadow-xl p-8 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={32} />
          <h2 className="text-2xl font-bold">Market Highlights</h2>
        </div>
        <div className="text-center my-6">
          {browse.highlights.length > 0 ? (
            <ul className="text-lg space-y-1">
              {browse.highlights.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-100 text-lg">No highlights available.</p>
          )}
        </div>
        {browse.neighborhoodInsights && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 mt-4">
            <p className="text-blue-50">{browse.neighborhoodInsights}</p>
          </div>
        )}
      </motion.div>
    );
  }
console.log('oof')
  return null;
}
