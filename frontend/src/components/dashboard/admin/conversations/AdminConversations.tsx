'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Download,
} from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  _id: string;
  userId?: string;
  clientIdentifier?: string;
  flow: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  messageCount: number;
  progress: number;
  generationCount?: number;
}

interface Analytics {
  totalConversations: number;
  completedConversations: number;
  abandonedConversations: number;
  inProgressConversations: number;
  completionRate: number;
  avgDuration: number;
  totalDuration: number;
  totalMessages: number;
  totalGenerations: number;
  uniqueUsers: number;
  uniqueClients: number;
  flowBreakdown: Record<string, number>;
}

export default function AdminConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned' | 'in-progress'>('all');
  const [flowFilter, setFlowFilter] = useState<string>('all');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (flowFilter !== 'all') {
        params.append('flow', flowFilter);
      }
      if (userIdFilter) {
        params.append('userId', userIdFilter);
      }
      if (clientFilter) {
        params.append('clientIdentifier', clientFilter);
      }

      const [convResponse, analyticsResponse] = await Promise.all([
        axios.get(`/api/admin/conversations?${params.toString()}`),
        axios.get('/api/admin/conversations/analytics'),
      ]);

      if (convResponse.data.success) {
        setConversations(convResponse.data.conversations);
      } else {
        setError('Failed to load conversations');
      }

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, flowFilter, userIdFilter, clientFilter]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'abandoned':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-200 mb-2">All Conversations</h2>
          <p className="text-cyan-200/70">
            View and analyze all conversations across all users and clients
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-200 rounded-lg hover:bg-cyan-500/30 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-200/70">Total Conversations</p>
            </div>
            <p className="text-2xl font-bold text-cyan-200">{analytics.totalConversations}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-cyan-200/70">Completion Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {analytics.completionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-200/70">Avg Duration</p>
            </div>
            <p className="text-2xl font-bold text-cyan-200">
              {formatDuration(Math.round(analytics.avgDuration))}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-200/70">Unique Users</p>
            </div>
            <p className="text-2xl font-bold text-cyan-200">{analytics.uniqueUsers}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-cyan-500/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-cyan-200/70 mb-1 block">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full bg-white/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-200 text-sm"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-cyan-200/70 mb-1 block">Flow</label>
            <select
              value={flowFilter}
              onChange={(e) => setFlowFilter(e.target.value)}
              className="w-full bg-white/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-200 text-sm"
            >
              <option value="all">All Flows</option>
              <option value="sell">Sell</option>
              <option value="buy">Buy</option>
              <option value="browse">Browse</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-cyan-200/70 mb-1 block">User ID</label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Filter by user ID"
              className="w-full bg-white/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-cyan-200/70 mb-1 block">Client</label>
            <input
              type="text"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="Filter by client"
              className="w-full bg-white/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-200 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-cyan-500/20">
          <MessageSquare className="w-12 h-12 text-cyan-500/50 mx-auto mb-4" />
          <p className="text-cyan-200/70">No conversations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-400/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-cyan-200 capitalize">
                      {conv.flow} Flow
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                        conv.status
                      )}`}
                    >
                      {conv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-cyan-200/70 mb-1">Started</p>
                      <p className="text-sm text-cyan-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(conv.startedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-cyan-200/70 mb-1">Duration</p>
                      <p className="text-sm text-cyan-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(conv.duration)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-cyan-200/70 mb-1">Messages</p>
                      <p className="text-sm text-cyan-200">{conv.messageCount}</p>
                    </div>

                    <div>
                      <p className="text-xs text-cyan-200/70 mb-1">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-cyan-500/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${conv.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-200/70">{conv.progress}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-cyan-200/70 mb-1">User/Client</p>
                      <p className="text-sm text-cyan-200 truncate">
                        {conv.userId || conv.clientIdentifier || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  {conv.generationCount !== undefined && conv.generationCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-cyan-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>{conv.generationCount} offer{conv.generationCount !== 1 ? 's' : ''} generated</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/dashboard/conversations/${conv._id}`}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-200 rounded-lg hover:bg-cyan-500/30 transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flow Breakdown */}
      {analytics && Object.keys(analytics.flowBreakdown).length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-lg font-bold text-cyan-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Flow Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.flowBreakdown).map(([flow, count]) => (
              <div key={flow} className="bg-white/5 rounded-lg p-4 border border-cyan-500/20">
                <p className="text-xs text-cyan-200/70 mb-1 capitalize">{flow} Flow</p>
                <p className="text-2xl font-bold text-cyan-200">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

