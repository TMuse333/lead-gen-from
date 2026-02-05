// src/components/dashboard/user/analytics/KnowledgeAnalytics.tsx
/**
 * Knowledge Retrieval Analytics Dashboard
 *
 * Shows how Qdrant knowledge is being used in conversations:
 * - Retrieval counts by intent
 * - Most popular knowledge items
 * - Source breakdown (stories, tips, agent knowledge)
 * - Performance metrics
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock,
  Layers,
  Heart,
  Lightbulb,
  FileText,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface IntentBreakdown {
  intent: string;
  count: number;
  avgRetrievalTime: number;
  avgItemsRetrieved: number;
}

interface PopularItem {
  id: string;
  title: string;
  category: string;
  kind: string;
  retrievalCount: number;
  avgScore: number;
}

interface DailyTrend {
  date: string;
  retrievals: number;
  avgItems: number;
}

interface KnowledgeAnalyticsData {
  success: boolean;
  period: { days: number; startDate: string; environment: string };
  summary: {
    totalRetrievals: number;
    avgRetrievalTime: number;
    avgItemsPerRetrieval: number;
  };
  byIntent: IntentBreakdown[];
  bySource: {
    agentKnowledge: number;
    stories: number;
    tips: number;
  };
  popularItems: PopularItem[];
  dailyTrend: DailyTrend[];
  objectionBreakdown: Array<{ type: string; count: number }>;
}

// Intent display config
const INTENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  objection: { label: 'Objections', icon: AlertCircle, color: 'text-red-400' },
  clarification_question: { label: 'Clarifications', icon: HelpCircle, color: 'text-blue-400' },
  chitchat: { label: 'Chitchat', icon: MessageSquare, color: 'text-purple-400' },
  off_topic: { label: 'Off-topic', icon: Sparkles, color: 'text-amber-400' },
  direct_answer: { label: 'Direct Answers', icon: FileText, color: 'text-green-400' },
  multi_answer: { label: 'Multi Answers', icon: Layers, color: 'text-cyan-400' },
};

// Source type config
const SOURCE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  agentKnowledge: { label: 'Agent Knowledge', icon: Brain, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  stories: { label: 'Stories', icon: Heart, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  tips: { label: 'Tips & Advice', icon: Lightbulb, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
};

interface Props {
  environment?: 'production' | 'test' | 'all';
}

export default function KnowledgeAnalytics({ environment = 'production' }: Props) {
  const [data, setData] = useState<KnowledgeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const envParam = environment === 'all' ? 'production' : environment;
      const response = await fetch(`/api/user/knowledge-analytics?days=${days}&environment=${envParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days, environment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <p className="text-lg font-medium text-slate-300 mb-2">Failed to load analytics</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const totalSourceItems = data.bySource.agentKnowledge + data.bySource.stories + data.bySource.tips;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Knowledge Retrieval Analytics</h2>
            <p className="text-sm text-slate-400">
              How your knowledge base is being used in conversations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">Total Retrievals</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.summary.totalRetrievals.toLocaleString()}</div>
          <div className="text-sm text-slate-500 mt-1">in the last {days} days</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Avg Items Retrieved</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.summary.avgItemsPerRetrieval}</div>
          <div className="text-sm text-slate-500 mt-1">per query</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">Avg Retrieval Time</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.summary.avgRetrievalTime}ms</div>
          <div className="text-sm text-slate-500 mt-1">query latency</div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Knowledge Sources Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SOURCE_CONFIG).map(([key, config]) => {
            const count = data.bySource[key as keyof typeof data.bySource] || 0;
            const percentage = totalSourceItems > 0 ? Math.round((count / totalSourceItems) * 100) : 0;
            const Icon = config.icon;

            return (
              <div key={key} className={`${config.bgColor} rounded-lg p-4 border border-slate-700/50`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-sm font-medium text-slate-200">{config.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{count.toLocaleString()}</span>
                  <span className="text-sm text-slate-400">{percentage}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.bgColor.replace('/10', '/50')} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Intent */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Retrievals by Intent</h3>
        {data.byIntent.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No retrieval data yet</p>
        ) : (
          <div className="space-y-3">
            {data.byIntent.map((item) => {
              const config = INTENT_CONFIG[item.intent] || {
                label: item.intent,
                icon: FileText,
                color: 'text-slate-400',
              };
              const Icon = config.icon;
              const maxCount = Math.max(...data.byIntent.map((i) => i.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <div key={item.intent} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm text-slate-300">{config.label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400/30 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(percentage, 10)}%` }}
                      >
                        <span className="text-xs font-medium text-white">{item.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-xs text-slate-500">
                    ~{item.avgItemsRetrieved} items
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Items */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Most Retrieved Knowledge</h3>
        {data.popularItems.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No items retrieved yet</p>
        ) : (
          <div className="space-y-2">
            {data.popularItems.slice(0, 8).map((item, index) => {
              const sourceConfig = item.kind === 'story'
                ? SOURCE_CONFIG.stories
                : item.kind === 'tip'
                ? SOURCE_CONFIG.tips
                : SOURCE_CONFIG.agentKnowledge;
              const Icon = sourceConfig.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
                    {index + 1}
                  </span>
                  <Icon className={`w-4 h-4 ${sourceConfig.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.category} &bull; Score: {item.avgScore}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-cyan-400">{item.retrievalCount}</span>
                    <span className="text-xs text-slate-500 ml-1">times</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Objection Breakdown (if data exists) */}
      {data.objectionBreakdown.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Objection Types Handled</h3>
          <div className="flex flex-wrap gap-3">
            {data.objectionBreakdown.map((obj) => (
              <div
                key={obj.type}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <span className="text-sm text-red-300">{obj.type?.replace(/_/g, ' ') || 'general'}</span>
                <span className="ml-2 text-lg font-semibold text-red-400">{obj.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
