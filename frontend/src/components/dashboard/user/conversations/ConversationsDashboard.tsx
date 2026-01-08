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
  BarChart3,
  List,
  Home,
  ShoppingCart,
  Search,
  Gift,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConversationAnalytics from './ConversationAnalytics';

type ViewMode = 'list' | 'analytics';

interface Conversation {
  _id: string;
  flow: string; // This is actually the intent (buy/sell/browse)
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  messageCount: number;
  progress: number;
  generationCount?: number;
  userInput: Record<string, string>;
}

// Intent display config matching the offer system
const INTENT_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  buy: { label: 'Buying', icon: Home, color: 'cyan' },
  sell: { label: 'Selling', icon: ShoppingCart, color: 'purple' },
  browse: { label: 'Browsing', icon: Search, color: 'amber' },
};

export default function ConversationsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned' | 'in-progress'>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const router = useRouter();

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (intentFilter !== 'all') {
        params.append('flow', intentFilter); // API still uses 'flow' param
      }

      const response = await axios.get(`/api/conversations?${params.toString()}`);
      if (response.data.success) {
        setConversations(response.data.conversations);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filter, intentFilter]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'abandoned':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
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

  const filteredConversations = conversations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Mode Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">My Conversations</h2>
          <p className="text-slate-400">
            View all your chatbot interactions and generated offers
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'list'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Analytics View */}
      {viewMode === 'analytics' && <ConversationAnalytics />}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Intent:</span>
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm"
          >
            <option value="all">All Intents</option>
            <option value="buy">Buying</option>
            <option value="sell">Selling</option>
            <option value="browse">Browsing</option>
          </select>
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
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No conversations found</p>
          <p className="text-sm text-slate-500 mt-2">
            Start a conversation with your bot to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => {
            const intentConfig = INTENT_CONFIG[conv.flow] || { label: conv.flow, icon: MessageSquare, color: 'slate' };
            const IntentIcon = intentConfig.icon;

            return (
              <div
                key={conv._id}
                className={`bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-${intentConfig.color}-500/50 transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Intent Badge - matching offer style */}
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-${intentConfig.color}-500/20 text-${intentConfig.color}-300 border border-${intentConfig.color}-500/30`}
                      >
                        <IntentIcon className="w-4 h-4" />
                        <span>{intentConfig.label}</span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                          conv.status
                        )}`}
                      >
                        {getStatusIcon(conv.status)}
                        {conv.status}
                      </span>

                      {/* Offers Generated Badge */}
                      {conv.generationCount !== undefined && conv.generationCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Gift className="w-3 h-3" />
                          {conv.generationCount} offer{conv.generationCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Started</p>
                        <p className="text-sm text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conv.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Duration</p>
                        <p className="text-sm text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(conv.duration)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Messages</p>
                        <p className="text-sm text-slate-300">{conv.messageCount}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${intentConfig.color}-500 transition-all`}
                              style={{ width: `${conv.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{conv.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/dashboard/conversations/${conv._id}`}
                      className={`px-4 py-2 bg-${intentConfig.color}-500/20 text-${intentConfig.color}-200 rounded-lg hover:bg-${intentConfig.color}-500/30 transition flex items-center gap-2`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {filteredConversations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Total Conversations</p>
            <p className="text-2xl font-bold text-slate-100">{filteredConversations.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {filteredConversations.filter((c) => c.status === 'completed').length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Avg Duration</p>
            <p className="text-2xl font-bold text-slate-100">
              {formatDuration(
                Math.round(
                  filteredConversations
                    .filter((c) => c.duration)
                    .reduce((sum, c) => sum + (c.duration || 0), 0) /
                    filteredConversations.filter((c) => c.duration).length || 1
                )
              )}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Total Messages</p>
            <p className="text-2xl font-bold text-slate-100">
              {filteredConversations.reduce((sum, c) => sum + c.messageCount, 0)}
            </p>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

