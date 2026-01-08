// components/ux/resultsComponents/timeline/components/MarketContext.tsx
'use client';

import { TrendingUp, TrendingDown, Clock, DollarSign, Activity, AlertTriangle, Flame } from 'lucide-react';

export interface MarketData {
  location: string;
  avgDaysOnMarket: number;
  medianPrice: string;
  priceChange30d: number; // percentage, can be negative
  competitiveness: 'low' | 'moderate' | 'high' | 'very-high';
  inventory: 'low' | 'balanced' | 'high';
  bestTimeToAct?: string;
  marketInsight?: string;
}

interface MarketContextProps {
  data: MarketData;
  accentColor: string;
}

const COMPETITIVENESS_CONFIG = {
  low: { label: 'Relaxed', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  moderate: { label: 'Moderate', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: 'Competitive', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'very-high': { label: 'Very Hot', icon: Flame, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

/**
 * Market context section showing local real estate conditions
 * Adds authority and urgency signals
 */
export function MarketContext({ data, accentColor }: MarketContextProps) {
  const compConfig = COMPETITIVENESS_CONFIG[data.competitiveness];
  const CompIcon = compConfig.icon;
  const priceUp = data.priceChange30d >= 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Activity className={`h-5 w-5 ${accentColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {data.location} Market Snapshot
            </h3>
            <p className="text-sm text-gray-500">Current conditions in your area</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Days on Market */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{data.avgDaysOnMarket}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Days on Market</div>
          </div>

          {/* Median Price */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <DollarSign className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{data.medianPrice}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Median Price</div>
          </div>

          {/* Price Change */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            {priceUp ? (
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
            )}
            <div className={`text-2xl font-bold ${priceUp ? 'text-green-600' : 'text-red-600'}`}>
              {priceUp ? '+' : ''}{data.priceChange30d}%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">30-Day Change</div>
          </div>

          {/* Competitiveness */}
          <div className={`text-center p-4 rounded-xl ${compConfig.bg} border ${compConfig.border}`}>
            <CompIcon className={`h-6 w-6 ${compConfig.color} mx-auto mb-2`} />
            <div className={`text-xl font-bold ${compConfig.color}`}>{compConfig.label}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Market Heat</div>
          </div>
        </div>

        {/* Market Insight */}
        {data.marketInsight && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Market Insight</p>
                <p className="text-sm text-blue-800">{data.marketInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Best Time to Act */}
        {data.bestTimeToAct && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              Best time to act: <span className="font-semibold text-gray-700">{data.bestTimeToAct}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
