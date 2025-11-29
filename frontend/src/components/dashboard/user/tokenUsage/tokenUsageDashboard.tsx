'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Zap, 
  BarChart3, 
  PieChart,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface UsageStats {
  totalTokens: {
    input: number;
    output: number;
    embedding: number;
    total: number;
  };
  totalCost: number;
  featureBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
  }>;
  modelBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

interface RecentUsage {
  id: string;
  timestamp: Date;
  feature: string;
  model: string;
  tokens: number;
  cost: number;
  success: boolean;
  latency: number;
}

export default function TokenUsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (selectedFeature) {
        params.append('feature', selectedFeature);
      }

      const response = await axios.get(`/api/token-usage/stats?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentUsage(response.data.recentUsage || []);
      }
    } catch (error) {
      console.error('Error fetching token usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, selectedFeature]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const formatFeatureName = (feature: string) => {
    return feature
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No usage data available</p>
      </div>
    );
  }

  // Calculate percentages for breakdowns
  const featureEntries = Object.entries(stats.featureBreakdown)
    .sort((a, b) => b[1].cost - a[1].cost);
  
  const modelEntries = Object.entries(stats.modelBreakdown)
    .sort((a, b) => b[1].cost - a[1].cost);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Token Usage & Costs</h1>
          <p className="text-slate-400">Track LLM API usage across all features</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p === 'all' ? 'All Time' : `${p.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all hover:border-indigo-500/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Tokens</h3>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatNumber(stats.totalTokens.total)}</p>
          <div className="mt-2 text-xs text-slate-500">
            {formatNumber(stats.totalTokens.input)} input • {formatNumber(stats.totalTokens.output)} output
            {stats.totalTokens.embedding > 0 && ` • ${formatNumber(stats.totalTokens.embedding)} embeddings`}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all hover:border-green-500/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Cost</h3>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalCost)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {period === 'all' ? 'All time' : `Last ${period}`}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all hover:border-yellow-500/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">API Calls</h3>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {Object.values(stats.featureBreakdown).reduce((sum, f) => sum + f.count, 0)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Total requests</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all hover:border-blue-500/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Avg Cost/Call</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(
              stats.totalCost / Math.max(1, Object.values(stats.featureBreakdown).reduce((sum, f) => sum + f.count, 0))
            )}
          </p>
          <p className="mt-2 text-xs text-slate-500">Per API call</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Breakdown */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              By Feature
            </h2>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-xs text-slate-400 hover:text-slate-300"
            >
              Clear Filter
            </button>
          </div>
          <div className="space-y-3">
            {featureEntries.map(([feature, data], index) => {
              const percentage = (data.cost / stats.totalCost) * 100;
              return (
                <div
                  key={feature}
                  className="cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition"
                  onClick={() => setSelectedFeature(selectedFeature === feature ? null : feature)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">
                      {formatFeatureName(feature)}
                    </span>
                    <span className="text-sm text-slate-400">{data.count} calls</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-20 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{formatNumber(data.tokens)} tokens</span>
                    <span className="text-green-400 font-medium">{formatCurrency(data.cost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Breakdown */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            By Model
          </h2>
          <div className="space-y-3">
            {modelEntries.map(([model, data]) => {
              const percentage = (data.cost / stats.totalCost) * 100;
              return (
                <div key={model} className="p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{model}</span>
                    <span className="text-sm text-slate-400">{data.count} calls</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-20 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{formatNumber(data.tokens)} tokens</span>
                    <span className="text-green-400 font-medium">{formatCurrency(data.cost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Usage */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Recent Usage
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Feature</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Model</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Tokens</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Cost</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Latency</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsage.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No recent usage
                  </td>
                </tr>
              ) : (
                recentUsage.map((usage) => (
                  <tr
                    key={usage.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                  >
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {new Date(usage.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {formatFeatureName(usage.feature)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400 font-mono">
                      {usage.model}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 text-right">
                      {formatNumber(usage.tokens)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-400 text-right font-medium">
                      {formatCurrency(usage.cost)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400 text-right">
                      {usage.latency}ms
                    </td>
                    <td className="py-3 px-4 text-center">
                      {usage.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

