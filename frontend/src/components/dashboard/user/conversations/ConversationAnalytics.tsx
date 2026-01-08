// src/components/dashboard/user/conversations/ConversationAnalytics.tsx
/**
 * Conversation Analytics Dashboard
 *
 * Visual analytics showing:
 * - Completion funnel
 * - Drop-off analysis
 * - Intent comparison
 * - Trends over time
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

interface FunnelStep {
  questionId: string;
  questionLabel: string;
  reached: number;
  answered: number;
  dropOff: number;
  dropOffRate: number;
}

interface IntentStats {
  intent: string;
  total: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
  abandonmentRate: number;
  avgDuration: number;
  avgProgress: number;
}

interface DropOffPoint {
  questionId: string;
  label: string;
  abandonedCount: number;
  percentage: number;
}

interface AnalyticsData {
  overview: {
    totalConversations: number;
    completedCount: number;
    abandonedCount: number;
    inProgressCount: number;
    overallCompletionRate: number;
    avgDuration: number;
    avgMessages: number;
  };
  byIntent: IntentStats[];
  funnel: FunnelStep[];
  dropOffPoints: DropOffPoint[];
  trends: {
    daily: Array<{
      date: string;
      started: number;
      completed: number;
      abandoned: number;
    }>;
  };
}

export default function ConversationAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [selectedIntent, setSelectedIntent] = useState('all');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('days', days.toString());
      if (selectedIntent !== 'all') {
        params.append('flow', selectedIntent); // API still uses 'flow' param
      }

      const response = await fetch(`/api/conversations/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, selectedIntent]);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, byIntent, funnel, dropOffPoints, trends } = data;

  // Calculate trend (compare last 7 days to previous 7 days)
  const recentDays = trends.daily.slice(-7);
  const previousDays = trends.daily.slice(-14, -7);
  const recentCompleted = recentDays.reduce((sum, d) => sum + d.completed, 0);
  const previousCompleted = previousDays.reduce((sum, d) => sum + d.completed, 0);
  const trendDirection = recentCompleted >= previousCompleted ? 'up' : 'down';
  const trendPercent = previousCompleted > 0
    ? Math.round(((recentCompleted - previousCompleted) / previousCompleted) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Conversation Analytics</h2>
          <p className="text-slate-400">
            Understand how users interact with your chatbot
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range */}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {/* Intent Filter */}
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm"
          >
            <option value="all">All Intents</option>
            <option value="buy">Buying</option>
            <option value="sell">Selling</option>
            <option value="browse">Browsing</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{overview.totalConversations}</p>
          {trendPercent !== 0 && (
            <div className={`flex items-center gap-1 text-sm mt-1 ${trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendPercent}% vs prev period</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Completed</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{overview.completedCount}</p>
          <p className="text-sm text-slate-400 mt-1">{overview.overallCompletionRate}% rate</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Abandoned</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{overview.abandonedCount}</p>
          <p className="text-sm text-slate-400 mt-1">
            {overview.totalConversations > 0
              ? Math.round((overview.abandonedCount / overview.totalConversations) * 100)
              : 0}% rate
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Avg Duration</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{formatDuration(overview.avgDuration)}</p>
          <p className="text-sm text-slate-400 mt-1">{overview.avgMessages} avg messages</p>
        </div>
      </div>

      {/* Completion Funnel */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Completion Funnel</h3>
        </div>

        {funnel.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No funnel data available yet</p>
        ) : (
          <div className="space-y-3">
            {/* Visual Funnel */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <span>Started: {overview.totalConversations}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="text-green-400">Completed: {overview.completedCount}</span>
              <span className="text-slate-500">({overview.overallCompletionRate}%)</span>
            </div>

            {/* Funnel Steps */}
            {funnel.slice(0, 8).map((step, index) => {
              const widthPercent = funnel.length > 0 && funnel[0].reached > 0
                ? Math.round((step.reached / funnel[0].reached) * 100)
                : 100;

              return (
                <div key={step.questionId} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 truncate max-w-[200px]">
                      {index + 1}. {step.questionLabel}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">{step.reached} reached</span>
                      {step.dropOffRate > 0 && (
                        <span className="text-red-400">-{step.dropOffRate}% drop</span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        step.dropOffRate > 20 ? 'bg-red-500/50' :
                        step.dropOffRate > 10 ? 'bg-amber-500/50' :
                        'bg-cyan-500/50'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Drop-off Points */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-slate-100">Top Drop-off Points</h3>
          </div>

          {dropOffPoints.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No abandoned conversations yet</p>
          ) : (
            <div className="space-y-3">
              {dropOffPoints.map((point, index) => (
                <div
                  key={point.questionId}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-bold">{index + 1}</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{point.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-semibold">{point.abandonedCount} left</p>
                    <p className="text-xs text-slate-500">{point.percentage}% of abandoned</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dropOffPoints.length > 0 && (
            <p className="text-sm text-slate-500 mt-4">
              Consider simplifying these questions or providing more guidance.
            </p>
          )}
        </div>

        {/* Intent Comparison */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-100">Performance by Intent</h3>
          </div>

          {byIntent.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No intent data available yet</p>
          ) : (
            <div className="space-y-4">
              {byIntent.map((item) => {
                // Map intent to display label
                const intentLabels: Record<string, string> = {
                  buy: 'Buying',
                  sell: 'Selling',
                  browse: 'Browsing',
                };
                const displayLabel = intentLabels[item.intent] || item.intent;

                return (
                  <div key={item.intent} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-200 font-medium">{displayLabel}</span>
                      <span className="text-slate-400 text-sm">{item.total} total</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-400">{item.completionRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-red-400">{item.abandonmentRate}%</span>
                      </div>
                      <span className="text-slate-500">
                        avg {formatDuration(item.avgDuration)}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-2 bg-slate-600 rounded-full mt-2 overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${item.completionRate}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${item.abandonmentRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Daily Trend</h3>
        </div>

        {trends.daily.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No trend data available yet</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-32 min-w-max">
              {trends.daily.slice(-14).map((day) => {
                const maxValue = Math.max(...trends.daily.slice(-14).map(d => d.started)) || 1;
                const height = Math.max((day.started / maxValue) * 100, 4);

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-1"
                    style={{ minWidth: '40px' }}
                  >
                    <div
                      className="w-6 bg-cyan-500/50 rounded-t hover:bg-cyan-500/70 transition relative group"
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs whitespace-nowrap">
                          <p className="text-slate-300">{day.started} started</p>
                          <p className="text-green-400">{day.completed} completed</p>
                          <p className="text-red-400">{day.abandoned} abandoned</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {overview.totalConversations > 0 && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Quick Insights</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {overview.overallCompletionRate < 50 && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  Your completion rate is below 50%. Consider shortening your conversation
                  or making questions clearer.
                </span>
              </li>
            )}
            {dropOffPoints.length > 0 && (
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>
                  Most users leave at "{dropOffPoints[0].label}". This question might need
                  rewording or additional context.
                </span>
              </li>
            )}
            {overview.avgDuration > 300 && (
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  Average conversation takes over 5 minutes. Consider streamlining your questions.
                </span>
              </li>
            )}
            {overview.overallCompletionRate >= 70 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Great job! Your {overview.overallCompletionRate}% completion rate is above average.
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
