'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare, CheckCircle2, XCircle, Clock,
  TrendingUp, BarChart3, Zap, Database, Users, Activity,
  Smartphone, Tablet, Monitor, UserCheck, Globe, Link2,
  Mail, UserPlus, SkipForward
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  conversations: {
    total: number;
    completed: number;
    abandoned: number;
    inProgress: number;
    completionRate: number;
    avgMessageCount: number;
    avgDuration: number;
    flowDistribution: Record<string, number>;
    recent: number;
  };
  generations: {
    total: number;
    successful: number;
    successRate: number;
    avgGenerationTime: number;
    avgAdviceUsed: number;
    recent: number;
  };
  visitors?: {
    total: number;
    returning: number;
    newVisitors: number;
    deviceBreakdown: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    referralSources: Record<string, number>;
    avgSessionDuration: number;
    returningCompletionRate: number;
  };
  contactModal?: {
    shown: number;
    completed: number;
    skipped: number;
    conversionRate: number;
    avgSkipsBeforeComplete: number;
  };
  timeline: Array<{ date: string; count: number }>;
}

interface UserAnalyticsProps {
  environment?: 'production' | 'test' | 'all';
}

export default function UserAnalytics({ environment = 'production' }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/analytics?environment=${environment}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [environment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-300">{error || 'Failed to load analytics'}</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Conversations',
      value: analytics.conversations.total,
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Completion Rate',
      value: `${analytics.conversations.completionRate}%`,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Generations',
      value: analytics.generations.total,
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Avg Generation Time',
      value: `${(analytics.generations.avgGenerationTime / 1000).toFixed(1)}s`,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-50 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Track your bot's performance and user engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversation Stats */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              Conversation Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Completed</span>
                <span className="text-green-400 font-semibold">{analytics.conversations.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Abandoned</span>
                <span className="text-red-400 font-semibold">{analytics.conversations.abandoned}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">In Progress</span>
                <span className="text-yellow-400 font-semibold">{analytics.conversations.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Messages</span>
                <span className="text-cyan-400 font-semibold">{analytics.conversations.avgMessageCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Duration</span>
                <span className="text-cyan-400 font-semibold">
                  {analytics.conversations.avgDuration > 0 
                    ? `${Math.floor(analytics.conversations.avgDuration / 60)}m ${analytics.conversations.avgDuration % 60}s`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Generation Stats */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Generation Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Successful</span>
                <span className="text-green-400 font-semibold">{analytics.generations.successful}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-green-400 font-semibold">{analytics.generations.successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Advice Used</span>
                <span className="text-cyan-400 font-semibold">{analytics.generations.avgAdviceUsed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recent (7 days)</span>
                <span className="text-cyan-400 font-semibold">{analytics.generations.recent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Distribution */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Flow Distribution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(analytics.conversations.flowDistribution).map(([flow, count]) => (
              <div key={flow} className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1 capitalize">{flow}</div>
                <div className="text-2xl font-bold text-cyan-400">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Modal Stats */}
        {analytics.contactModal && analytics.contactModal.shown > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-pink-400" />
              Lead Capture Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Modal Shown */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs uppercase">Modal Shown</span>
                </div>
                <div className="text-2xl font-bold text-slate-100">{analytics.contactModal.shown}</div>
              </div>

              {/* Completed */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs uppercase">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{analytics.contactModal.completed}</div>
              </div>

              {/* Skipped */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <SkipForward className="h-4 w-4" />
                  <span className="text-xs uppercase">Skipped</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">{analytics.contactModal.skipped}</div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase">Conversion</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{analytics.contactModal.conversionRate}%</div>
              </div>
            </div>

            {/* Conversion funnel visualization */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <span>Lead Capture Funnel</span>
              </div>
              <div className="h-8 bg-slate-700 rounded-lg overflow-hidden flex">
                <div
                  className="h-full bg-green-500 flex items-center justify-center text-xs font-medium text-white"
                  style={{ width: `${analytics.contactModal.conversionRate}%`, minWidth: analytics.contactModal.completed > 0 ? '40px' : '0' }}
                >
                  {analytics.contactModal.completed > 0 && `${analytics.contactModal.conversionRate}%`}
                </div>
                <div
                  className="h-full bg-amber-500/50 flex items-center justify-center text-xs font-medium text-amber-200"
                  style={{
                    width: `${analytics.contactModal.shown > 0 ? (analytics.contactModal.skipped / analytics.contactModal.shown) * 100 : 0}%`,
                    minWidth: analytics.contactModal.skipped > 0 ? '40px' : '0'
                  }}
                >
                  {analytics.contactModal.skipped > 0 && 'Skipped'}
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Submitted contact info</span>
                <span>Skipped modal</span>
              </div>
            </div>

            {analytics.contactModal.avgSkipsBeforeComplete > 0 && (
              <p className="text-sm text-slate-400 mt-4">
                Users who completed skipped an average of {analytics.contactModal.avgSkipsBeforeComplete} times before submitting.
              </p>
            )}
          </div>
        )}

        {/* Visitor Insights */}
        {analytics.visitors && analytics.visitors.total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Device Breakdown */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-400" />
                Visitor Insights
              </h2>
              <div className="space-y-4">
                {/* Returning vs New */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-amber-400" />
                    Returning Visitors
                  </span>
                  <span className="text-amber-400 font-semibold">{analytics.visitors.returning}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    New Visitors
                  </span>
                  <span className="text-blue-400 font-semibold">{analytics.visitors.newVisitors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Returning Completion Rate</span>
                  <span className="text-green-400 font-semibold">{analytics.visitors.returningCompletionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Avg Session Duration</span>
                  <span className="text-cyan-400 font-semibold">
                    {analytics.visitors.avgSessionDuration > 0
                      ? `${Math.floor(analytics.visitors.avgSessionDuration / 60)}m ${analytics.visitors.avgSessionDuration % 60}s`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-400" />
                Device Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-green-400" />
                    Desktop
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${analytics.visitors.total > 0
                            ? (analytics.visitors.deviceBreakdown.desktop / analytics.visitors.total) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-green-400 font-semibold w-8 text-right">
                      {analytics.visitors.deviceBreakdown.desktop}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-400" />
                    Mobile
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${analytics.visitors.total > 0
                            ? (analytics.visitors.deviceBreakdown.mobile / analytics.visitors.total) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-blue-400 font-semibold w-8 text-right">
                      {analytics.visitors.deviceBreakdown.mobile}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Tablet className="h-4 w-4 text-purple-400" />
                    Tablet
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${analytics.visitors.total > 0
                            ? (analytics.visitors.deviceBreakdown.tablet / analytics.visitors.total) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-purple-400 font-semibold w-8 text-right">
                      {analytics.visitors.deviceBreakdown.tablet}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Sources */}
              {Object.keys(analytics.visitors.referralSources).length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-indigo-400" />
                    Traffic Sources
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.visitors.referralSources)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([source, count]) => (
                        <div key={source} className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 capitalize">{source}</span>
                          <span className="text-indigo-300 font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-cyan-50 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Activity Timeline (Last 7 Days)
          </h2>
          <div className="flex items-end gap-2 h-48">
            {analytics.timeline.map((day, index) => {
              const maxCount = Math.max(...analytics.timeline.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg min-h-[4px]"
                    />
                  </div>
                  <div className="text-xs text-slate-400 text-center">
                    <div className="font-semibold">{day.count}</div>
                    <div>{dayName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

