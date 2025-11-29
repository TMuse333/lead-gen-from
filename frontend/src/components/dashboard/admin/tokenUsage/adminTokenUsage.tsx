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
  Users,
  RefreshCw,
  AlertCircle,
  List
} from 'lucide-react';
import AllFeatures from './allFeatures';

interface AdminUsageStats {
  totalTokens: {
    input: number;
    output: number;
    embedding: number;
    total: number;
  };
  totalCost: number;
  totalUsers: number;
  totalCalls: number;
  featureBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
    users: number;
  }>;
  modelBreakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
    users: number;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export default function AdminTokenUsage() {
  const [stats, setStats] = useState<AdminUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeView, setActiveView] = useState<'usage' | 'features'>('usage');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/admin/token-usage?period=${period}`);
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      console.error('Error fetching admin token usage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-cyan-200/70">No usage data available</p>
      </div>
    );
  }

  // Calculate percentages and sort breakdowns
  const featureEntries = Object.entries(stats.featureBreakdown)
    .sort((a, b) => b[1].cost - a[1].cost);
  
  const modelEntries = Object.entries(stats.modelBreakdown)
    .sort((a, b) => b[1].cost - a[1].cost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-200 mb-2">Token Usage & Features</h2>
          <p className="text-cyan-200/70">
            {activeView === 'usage' 
              ? 'Aggregated usage across all users' 
              : 'Complete list of all LLM features'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex gap-2 bg-white/5 rounded-lg p-1 border border-cyan-500/20">
            <button
              onClick={() => setActiveView('usage')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeView === 'usage'
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : 'text-cyan-200/50 hover:text-cyan-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Usage Stats
            </button>
            <button
              onClick={() => setActiveView('features')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeView === 'features'
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : 'text-cyan-200/50 hover:text-cyan-200'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              All Features
            </button>
          </div>

          {/* Period Selector (only show for usage view) */}
          {activeView === 'usage' && (
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    period === p
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400'
                      : 'bg-white/5 text-cyan-200/50 hover:bg-white/10 hover:text-cyan-200'
                  }`}
                >
                  {p === 'all' ? 'All Time' : `${p.toUpperCase()}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'features' ? (
        <AllFeatures />
      ) : (
        <>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-200/70">Total Tokens</h3>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-200">{formatNumber(stats.totalTokens.total)}</p>
          <div className="mt-2 text-xs text-cyan-200/50">
            {formatNumber(stats.totalTokens.input)} input • {formatNumber(stats.totalTokens.output)} output
            {stats.totalTokens.embedding > 0 && ` • ${formatNumber(stats.totalTokens.embedding)} embeddings`}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-200/70">Total Cost</h3>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-200">{formatCurrency(stats.totalCost)}</p>
          <p className="mt-2 text-xs text-cyan-200/50">
            {period === 'all' ? 'All time' : `Last ${period}`}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-200/70">Total API Calls</h3>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-200">{formatNumber(stats.totalCalls)}</p>
          <p className="mt-2 text-xs text-cyan-200/50">Across {stats.totalUsers} users</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-200/70">Avg Cost/Call</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-200">
            {formatCurrency(
              stats.totalCost / Math.max(1, stats.totalCalls)
            )}
          </p>
          <p className="mt-2 text-xs text-cyan-200/50">Per API call</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Breakdown */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            By Feature
          </h3>
          <div className="space-y-3">
            {featureEntries.map(([feature, data]) => {
              const percentage = (data.cost / stats.totalCost) * 100;
              return (
                <div
                  key={feature}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-200">
                      {formatFeatureName(feature)}
                    </span>
                    <span className="text-sm text-cyan-200/50">{data.count} calls</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-cyan-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-cyan-200/50 w-20 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-200/50">{formatNumber(data.tokens)} tokens</span>
                    <span className="text-green-400 font-medium">{formatCurrency(data.cost)}</span>
                  </div>
                  <div className="mt-1 text-xs text-cyan-200/40">
                    Used by {data.users} user{data.users !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Breakdown */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            By Model
          </h3>
          <div className="space-y-3">
            {modelEntries.map(([model, data]) => {
              const percentage = (data.cost / stats.totalCost) * 100;
              return (
                <div key={model} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-200 font-mono">{model}</span>
                    <span className="text-sm text-cyan-200/50">{data.count} calls</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-blue-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-cyan-200/50 w-20 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-200/50">{formatNumber(data.tokens)} tokens</span>
                    <span className="text-green-400 font-medium">{formatCurrency(data.cost)}</span>
                  </div>
                  <div className="mt-1 text-xs text-cyan-200/40">
                    Used by {data.users} user{data.users !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

