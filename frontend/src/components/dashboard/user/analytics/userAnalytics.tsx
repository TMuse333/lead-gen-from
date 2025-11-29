'use client';

import { useEffect, useState } from 'react';
import { 
  MessageSquare, CheckCircle2, XCircle, Clock, 
  TrendingUp, BarChart3, Zap, Database, Users, Activity
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
  timeline: Array<{ date: string; count: number }>;
}

export default function UserAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/user/analytics');
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
  }, []);

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

