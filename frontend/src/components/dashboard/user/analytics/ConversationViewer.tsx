// src/components/dashboard/user/analytics/ConversationViewer.tsx
/**
 * Conversation Viewer Component
 * Shows full message history with timestamps, response times, and engagement metrics
 */

'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare, Clock, User, Bot, ChevronDown, ChevronUp,
  Timer, AlertTriangle, CheckCircle, XCircle, ArrowRight,
  Loader2, RefreshCw, Filter, Calendar, Globe, Smartphone,
  Tablet, Monitor, UserCheck, Link2, ExternalLink, Mail, SkipForward,
  EyeOff, Eye, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  buttons?: Array<{ label: string; value: string }>;
  timestamp: Date | string;
  questionId?: string;
}

interface Answer {
  questionId: string;
  mappingKey: string;
  value: string;
  timestamp: Date | string;
  answeredVia: 'button' | 'text';
}

interface VisitorTracking {
  visitorId?: string;
  isReturningVisitor?: boolean;
  lastVisit?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  referralSource?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    ref?: string | null;
    landingPage?: string;
    timestamp?: string;
  } | null;
  pagesViewed?: string[];
  previousIntent?: string;
  sessionStart?: string;
  messagesSent?: number;
  sessionDuration?: number;
}

interface ContactModal {
  shown?: boolean;
  shownAt?: string;
  completed?: boolean;
  completedAt?: string;
  skipped?: boolean;
  skippedAt?: string;
  skippedCount?: number;
}

interface Conversation {
  _id: string;
  flow: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  messages: ConversationMessage[];
  userInput: Record<string, string>;
  answers: Answer[];
  currentNodeId?: string;
  progress: number;
  messageCount: number;
  duration?: number;
  abandonedAt?: string;
  autoAbandoned?: boolean; // True if auto-detected as abandoned after 10 min idle
  visitorTracking?: VisitorTracking;
  contactModal?: ContactModal;
}

interface ConversationViewerProps {
  clientIdentifier?: string;
  environment?: 'production' | 'test' | 'all';
}

export default function ConversationViewer({ clientIdentifier, environment = 'production' }: ConversationViewerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned' | 'in-progress'>('all');
  const [total, setTotal] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [excludeInternal, setExcludeInternal] = useState(true); // Default to excluding internal traffic
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [stats, setStats] = useState({ completed: 0, abandoned: 0, inProgress: 0 });

  useEffect(() => {
    fetchConversations();
  }, [filter, environment, excludeInternal, timeRange]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('limit', '50');
      params.set('environment', environment);
      if (filter !== 'all') {
        params.set('status', filter);
      }
      if (excludeInternal) {
        params.set('excludeInternal', 'true');
      }
      if (timeRange !== 'all') {
        params.set('timeRange', timeRange);
      }

      const response = await fetch(`/api/user/conversations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.conversations || []);
      setTotal(data.total || 0);
      setUniqueVisitors(data.uniqueVisitors || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTimeBetween = (time1: string | Date, time2: string | Date): string => {
    const diff = new Date(time2).getTime() - new Date(time1).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'abandoned': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'abandoned': return <XCircle className="h-4 w-4" />;
      default: return <Timer className="h-4 w-4" />;
    }
  };

  const getEngagementScore = (conversation: Conversation): { score: number; label: string; color: string } => {
    const messageCount = conversation.messageCount;
    const hasCompletion = conversation.status === 'completed';
    const duration = conversation.duration || 0;

    // Score based on messages, completion, and engagement time
    let score = 0;
    if (messageCount >= 10) score += 40;
    else if (messageCount >= 5) score += 25;
    else score += 10;

    if (hasCompletion) score += 40;
    else if (conversation.progress >= 50) score += 20;

    if (duration >= 180) score += 20; // 3+ minutes
    else if (duration >= 60) score += 10; // 1+ minute

    if (score >= 80) return { score, label: 'High', color: 'text-green-400' };
    if (score >= 50) return { score, label: 'Medium', color: 'text-yellow-400' };
    return { score, label: 'Low', color: 'text-red-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            Conversation Replay
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            View full message history and engagement metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {([
              { value: '24h', label: '24h' },
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
              { value: 'all', label: 'All' },
            ] as const).map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeRange(t.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === t.value
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Exclude Internal Toggle */}
          <button
            onClick={() => setExcludeInternal(!excludeInternal)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              excludeInternal
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={excludeInternal ? 'Showing external traffic only' : 'Showing all traffic including internal'}
          >
            {excludeInternal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {excludeInternal ? 'Internal Hidden' : 'Show All'}
          </button>

          {/* Filter */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            {(['all', 'completed', 'abandoned', 'in-progress'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchConversations}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-cyan-400">{total}</div>
          <div className="text-sm text-slate-400">
            {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Total Conversations'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{uniqueVisitors}</div>
          <div className="text-sm text-slate-400">Unique Visitors</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">{stats.abandoned}</div>
          <div className="text-sm text-slate-400">Abandoned</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
          <div className="text-sm text-slate-400">In Progress</div>
        </div>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-xl text-slate-400 mb-2">No conversations yet</p>
          <p className="text-slate-500">Conversations will appear here as users interact with your bot.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation, index) => {
            const isExpanded = expandedId === conversation._id;
            const engagement = getEngagementScore(conversation);

            return (
              <motion.div
                key={conversation._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Conversation Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : conversation._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-lg ${getStatusColor(conversation.status)}`}>
                        {getStatusIcon(conversation.status)}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {formatDate(conversation.startedAt)}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300 capitalize">
                            {conversation.flow}
                          </span>
                          <span className={`text-xs font-medium ${engagement.color}`}>
                            {engagement.label} Engagement
                          </span>
                          {conversation.autoAbandoned && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Timed out
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          {/* Visitor ID */}
                          {conversation.visitorTracking?.visitorId && (
                            <span className="flex items-center gap-1 font-mono text-xs text-slate-500" title={conversation.visitorTracking.visitorId}>
                              <User className="h-3 w-3" />
                              {conversation.visitorTracking.visitorId.substring(0, 8)}...
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {conversation.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {conversation.progress}% complete
                          </span>
                          {conversation.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(conversation.duration / 60)}m {conversation.duration % 60}s
                            </span>
                          )}
                          {/* Visitor tracking indicators */}
                          {conversation.visitorTracking?.deviceType && (
                            <span className="flex items-center gap-1">
                              {conversation.visitorTracking.deviceType === 'mobile' && (
                                <Smartphone className="h-3 w-3 text-blue-400" />
                              )}
                              {conversation.visitorTracking.deviceType === 'tablet' && (
                                <Tablet className="h-3 w-3 text-purple-400" />
                              )}
                              {conversation.visitorTracking.deviceType === 'desktop' && (
                                <Monitor className="h-3 w-3 text-green-400" />
                              )}
                            </span>
                          )}
                          {conversation.visitorTracking?.isReturningVisitor && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <UserCheck className="h-3 w-3" />
                              <span className="text-xs">Returning</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content - Message History */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-700 p-4 space-y-4">
                        {/* Answers Summary */}
                        {conversation.answers && conversation.answers.length > 0 && (
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-3">
                              Collected Answers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {conversation.answers.map((answer, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400 capitalize">
                                    {answer.mappingKey.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="text-cyan-200 font-medium flex items-center gap-2">
                                    {answer.value}
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      answer.answeredVia === 'button'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                      {answer.answeredVia}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visitor Tracking Data */}
                        {conversation.visitorTracking && (
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Visitor Insights
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Device Type */}
                              {conversation.visitorTracking.deviceType && (
                                <div className="flex items-center gap-2 text-sm">
                                  {conversation.visitorTracking.deviceType === 'mobile' && (
                                    <Smartphone className="h-4 w-4 text-blue-400" />
                                  )}
                                  {conversation.visitorTracking.deviceType === 'tablet' && (
                                    <Tablet className="h-4 w-4 text-purple-400" />
                                  )}
                                  {conversation.visitorTracking.deviceType === 'desktop' && (
                                    <Monitor className="h-4 w-4 text-green-400" />
                                  )}
                                  <span className="text-slate-400">Device:</span>
                                  <span className="text-white capitalize">
                                    {conversation.visitorTracking.deviceType}
                                  </span>
                                </div>
                              )}

                              {/* Returning Visitor */}
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className={`h-4 w-4 ${
                                  conversation.visitorTracking.isReturningVisitor
                                    ? 'text-amber-400'
                                    : 'text-slate-500'
                                }`} />
                                <span className="text-slate-400">Visitor:</span>
                                <span className={`font-medium ${
                                  conversation.visitorTracking.isReturningVisitor
                                    ? 'text-amber-300'
                                    : 'text-slate-300'
                                }`}>
                                  {conversation.visitorTracking.isReturningVisitor
                                    ? 'Returning'
                                    : 'First Visit'}
                                </span>
                              </div>

                              {/* Previous Intent */}
                              {conversation.visitorTracking.previousIntent && (
                                <div className="flex items-center gap-2 text-sm">
                                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                                  <span className="text-slate-400">Previous Intent:</span>
                                  <span className="text-cyan-200 capitalize">
                                    {conversation.visitorTracking.previousIntent}
                                  </span>
                                </div>
                              )}

                              {/* Session Duration */}
                              {conversation.visitorTracking.sessionDuration !== undefined && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Timer className="h-4 w-4 text-orange-400" />
                                  <span className="text-slate-400">Session:</span>
                                  <span className="text-orange-200">
                                    {Math.floor(conversation.visitorTracking.sessionDuration / 60)}m{' '}
                                    {conversation.visitorTracking.sessionDuration % 60}s
                                  </span>
                                </div>
                              )}

                              {/* Visitor ID (truncated) */}
                              {conversation.visitorTracking.visitorId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-slate-400" />
                                  <span className="text-slate-400">ID:</span>
                                  <span className="text-slate-300 font-mono text-xs">
                                    {conversation.visitorTracking.visitorId.substring(0, 8)}...
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Referral Source */}
                            {conversation.visitorTracking.referralSource && (
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <Link2 className="h-4 w-4 text-indigo-400" />
                                  <span className="text-indigo-300 font-medium">Traffic Source</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {conversation.visitorTracking.referralSource.source && (
                                    <div>
                                      <span className="text-slate-500">Source: </span>
                                      <span className="text-slate-300">
                                        {conversation.visitorTracking.referralSource.source}
                                      </span>
                                    </div>
                                  )}
                                  {conversation.visitorTracking.referralSource.medium && (
                                    <div>
                                      <span className="text-slate-500">Medium: </span>
                                      <span className="text-slate-300">
                                        {conversation.visitorTracking.referralSource.medium}
                                      </span>
                                    </div>
                                  )}
                                  {conversation.visitorTracking.referralSource.campaign && (
                                    <div>
                                      <span className="text-slate-500">Campaign: </span>
                                      <span className="text-slate-300">
                                        {conversation.visitorTracking.referralSource.campaign}
                                      </span>
                                    </div>
                                  )}
                                  {conversation.visitorTracking.referralSource.landingPage && (
                                    <div className="col-span-2">
                                      <span className="text-slate-500">Landing: </span>
                                      <span className="text-slate-300">
                                        {conversation.visitorTracking.referralSource.landingPage}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Pages Viewed */}
                            {conversation.visitorTracking.pagesViewed &&
                             conversation.visitorTracking.pagesViewed.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <ExternalLink className="h-4 w-4 text-teal-400" />
                                  <span className="text-teal-300 font-medium">
                                    Pages Viewed ({conversation.visitorTracking.pagesViewed.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {conversation.visitorTracking.pagesViewed.slice(0, 5).map((page, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300"
                                    >
                                      {page}
                                    </span>
                                  ))}
                                  {conversation.visitorTracking.pagesViewed.length > 5 && (
                                    <span className="text-xs px-2 py-1 text-slate-500">
                                      +{conversation.visitorTracking.pagesViewed.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message Timeline */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-300">Message History</h4>

                          {conversation.messages.map((message, i) => {
                            const isUser = message.role === 'user';
                            const prevMessage = i > 0 ? conversation.messages[i - 1] : null;
                            const timeBetween = prevMessage
                              ? getTimeBetween(prevMessage.timestamp, message.timestamp)
                              : null;

                            // Highlight long response times (potential drop-off indicators)
                            const responseTime = prevMessage
                              ? (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) / 1000
                              : 0;
                            const isSlowResponse = responseTime > 60; // > 1 minute

                            return (
                              <div key={i}>
                                {/* Time Gap Indicator */}
                                {timeBetween && (
                                  <div className="flex items-center justify-center gap-2 py-2">
                                    <div className="h-px bg-slate-700 flex-1" />
                                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                      isSlowResponse
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-slate-700 text-slate-500'
                                    }`}>
                                      <Clock className="h-3 w-3" />
                                      {timeBetween}
                                      {isSlowResponse && <AlertTriangle className="h-3 w-3" />}
                                    </span>
                                    <div className="h-px bg-slate-700 flex-1" />
                                  </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                                  <div className={`p-2 rounded-full flex-shrink-0 ${
                                    isUser ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                                  }`}>
                                    {isUser ? (
                                      <User className="h-4 w-4 text-cyan-400" />
                                    ) : (
                                      <Bot className="h-4 w-4 text-purple-400" />
                                    )}
                                  </div>

                                  <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                                      isUser
                                        ? 'bg-cyan-500/20 text-cyan-100'
                                        : 'bg-slate-700 text-slate-200'
                                    }`}>
                                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                      {/* Show buttons if any */}
                                      {message.buttons && message.buttons.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-600">
                                          {message.buttons.map((btn, bi) => (
                                            <span
                                              key={bi}
                                              className="text-xs px-2 py-1 bg-slate-600/50 rounded text-slate-300"
                                            >
                                              {btn.label}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : ''}`}>
                                      {formatTime(message.timestamp)}
                                      {message.questionId && (
                                        <span className="ml-2 text-slate-600">
                                          ({message.questionId})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Contact Modal Indicator */}
                          {conversation.contactModal?.shown && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <div className={`h-px flex-1 ${
                                conversation.contactModal.completed
                                  ? 'bg-pink-500/30'
                                  : conversation.contactModal.skipped
                                    ? 'bg-amber-500/30'
                                    : 'bg-slate-600'
                              }`} />
                              <div className={`text-xs px-3 py-2 rounded-lg flex flex-col items-center gap-1.5 ${
                                conversation.contactModal.completed
                                  ? 'bg-pink-500/20 text-pink-300'
                                  : conversation.contactModal.skipped
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-700 text-slate-400'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span className="font-medium">Contact Modal</span>
                                  {conversation.contactModal.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                  ) : conversation.contactModal.skipped ? (
                                    <SkipForward className="h-4 w-4 text-amber-400" />
                                  ) : null}
                                </div>
                                {conversation.contactModal.completed && conversation.userInput.contactEmail && (
                                  <div className="text-xs text-pink-200/70 flex flex-col items-center gap-0.5">
                                    <span>{conversation.userInput.contactName || 'No name'}</span>
                                    <span>{conversation.userInput.contactEmail}</span>
                                    {conversation.userInput.contactPhone && (
                                      <span>{conversation.userInput.contactPhone}</span>
                                    )}
                                  </div>
                                )}
                                {conversation.contactModal.skipped && conversation.contactModal.skippedCount && (
                                  <span className="text-xs text-amber-200/70">
                                    Skipped {conversation.contactModal.skippedCount} time{conversation.contactModal.skippedCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className={`h-px flex-1 ${
                                conversation.contactModal.completed
                                  ? 'bg-pink-500/30'
                                  : conversation.contactModal.skipped
                                    ? 'bg-amber-500/30'
                                    : 'bg-slate-600'
                              }`} />
                            </div>
                          )}

                          {/* Drop-off Indicator */}
                          {conversation.status === 'abandoned' && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <div className="h-px bg-red-500/30 flex-1" />
                              <span className="text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                User dropped off here
                                {conversation.currentNodeId && (
                                  <span className="text-red-500">
                                    (at: {conversation.currentNodeId})
                                  </span>
                                )}
                              </span>
                              <div className="h-px bg-red-500/30 flex-1" />
                            </div>
                          )}

                          {/* Completion Indicator */}
                          {conversation.status === 'completed' && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <div className="h-px bg-green-500/30 flex-1" />
                              <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Conversation completed successfully
                              </span>
                              <div className="h-px bg-green-500/30 flex-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
