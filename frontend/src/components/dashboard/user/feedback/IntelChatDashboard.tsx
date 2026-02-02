// components/dashboard/user/feedback/IntelChatDashboard.tsx
/**
 * Feedback & Intel Dashboard - Two-section layout for
 * developer insights and user feedback
 *
 * Admin feature: When an admin is viewing (impersonating), they can send
 * insights directly from this page
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowRight,
  Mail,
} from 'lucide-react';

interface Message {
  id: string;
  senderType: 'developer' | 'user';
  senderName?: string;
  message: string;
  category?: 'insight' | 'recommendation' | 'question' | 'feedback' | 'general';
  readAt?: string;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  insight: { icon: Lightbulb, label: 'Insight', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  recommendation: { icon: Sparkles, label: 'Recommendation', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  feedback: { icon: ThumbsUp, label: 'Feedback', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  feature_request: { icon: Sparkles, label: 'Feature Request', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  general: { icon: MessageSquare, label: 'Message', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30' },
};

const FEEDBACK_CATEGORIES = ['feedback', 'question', 'feature_request', 'general'] as const;
const ADMIN_CATEGORIES = ['insight', 'recommendation', 'question'] as const;

export default function IntelChatDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [newAdminMessage, setNewAdminMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('feedback');
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string>('insight');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSendingAdmin, setIsSendingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Check if we're in development environment (client-side only)
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsDevelopment(isLocalhost);
  }, []);

  // Check if user is admin and impersonating
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if admin
        const adminRes = await fetch('/api/admin/check');
        const adminData = await adminRes.json();
        setIsAdmin(adminData.isAdmin || false);

        // Check if impersonating via the status endpoint
        const impersonateRes = await fetch('/api/admin/impersonate/status');
        if (impersonateRes.ok) {
          const impersonateData = await impersonateRes.json();
          setIsImpersonating(impersonateData.isImpersonating || false);
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
      }
    };
    checkAdminStatus();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/intel-messages');
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/intel-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newFeedback.trim(),
          category: selectedCategory,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewFeedback('');
      } else {
        setError(data.error || 'Failed to send feedback');
      }
    } catch (err) {
      setError('Failed to send feedback');
    } finally {
      setIsSending(false);
    }
  };

  // Send test emails (dev only) - uses actual message from textarea
  const handleSendTestEmail = async (messageText: string, categoryText: string) => {
    if (!messageText.trim()) {
      setTestEmailResult({ success: false, message: 'Write a message first to test the email' });
      setTimeout(() => setTestEmailResult(null), 3000);
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/test-intel-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, category: categoryText }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult({ success: true, message: 'Test emails sent! Check thomaslmusial@gmail.com' });
      } else {
        setTestEmailResult({ success: false, message: data.results?.agentEmail?.error || data.results?.developerEmail?.error || 'Failed to send test emails' });
      }
    } catch (err) {
      setTestEmailResult({ success: false, message: 'Failed to send test emails' });
    } finally {
      setIsSendingTestEmail(false);
      // Clear result after 5 seconds
      setTimeout(() => setTestEmailResult(null), 5000);
    }
  };

  // Admin: Send insight to the user being viewed
  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminMessage.trim() || isSendingAdmin) return;

    setIsSendingAdmin(true);
    try {
      const res = await fetch('/api/intel-messages/admin-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newAdminMessage.trim(),
          category: selectedAdminCategory,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewAdminMessage('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsSendingAdmin(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Split messages into developer insights and user feedback
  const developerInsights = messages
    .filter(m => m.senderType === 'developer')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userFeedback = messages
    .filter(m => m.senderType === 'user')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const canSendAsAdmin = isAdmin && isImpersonating;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Feedback & Intel
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              View insights from our team and share your feedback
            </p>
          </div>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {/* Developer Insights Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <button
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Developer Insights</h3>
                <p className="text-slate-400 text-sm">
                  {developerInsights.length === 0
                    ? 'No insights yet'
                    : `${developerInsights.length} insight${developerInsights.length !== 1 ? 's' : ''} from our team`}
                </p>
              </div>
            </div>
            {insightsExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {insightsExpanded && (
            <div className="border-t border-slate-700">
              {/* Admin Send Form - inside the insights section */}
              {canSendAsAdmin && (
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium text-sm">Send Insight to User</span>
                  </div>
                  <form onSubmit={handleSendAdminMessage}>
                    <div className="flex gap-2 mb-3">
                      {ADMIN_CATEGORIES.map((key) => {
                        const config = CATEGORY_CONFIG[key];
                        const Icon = config.icon;
                        const isSelected = selectedAdminCategory === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedAdminCategory(key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                              isSelected
                                ? `${config.bg} ${config.color}`
                                : 'bg-slate-700/50 text-slate-400 border-transparent hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={newAdminMessage}
                        onChange={(e) => setNewAdminMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAdminMessage(e);
                          }
                        }}
                        placeholder="Write an insight, recommendation, or question..."
                        rows={2}
                        className="flex-1 bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none"
                      />
                      <div className="flex flex-col gap-2 self-end">
                        <button
                          type="submit"
                          disabled={!newAdminMessage.trim() || isSendingAdmin}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                        >
                          {isSendingAdmin ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        {isDevelopment && (
                          <button
                            type="button"
                            onClick={() => handleSendTestEmail(newAdminMessage, selectedAdminCategory)}
                            disabled={isSendingTestEmail}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors flex items-center gap-1.5"
                            title="Send test emails to admin"
                          >
                            {isSendingTestEmail ? (
                              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            Test Email
                          </button>
                        )}
                      </div>
                    </div>
                    {testEmailResult && (
                      <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${testEmailResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {testEmailResult.message}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {developerInsights.length === 0 && !canSendAsAdmin ? (
                <div className="p-8 text-center">
                  <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No insights from our team yet</p>
                  <p className="text-slate-500 text-sm mt-1">
                    We&apos;ll send you tips and recommendations here
                  </p>
                </div>
              ) : developerInsights.length === 0 && canSendAsAdmin ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No insights sent yet. Use the form above to send one.
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {developerInsights.map((msg) => {
                    const categoryConfig = CATEGORY_CONFIG[msg.category || 'general'];
                    const CategoryIcon = categoryConfig.icon;

                    return (
                      <div key={msg.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border ${categoryConfig.bg}`}>
                            <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryConfig.bg} ${categoryConfig.color} border`}>
                                {categoryConfig.label}
                              </span>
                              <span className="text-slate-500 text-xs">
                                from {msg.senderName || 'LeadGen Team'}
                              </span>
                            </div>
                            <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-slate-500 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(msg.createdAt)}
                              </span>
                              {msg.readAt && (
                                <span className="text-green-400/70 text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Feedback Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <button
            onClick={() => setFeedbackExpanded(!feedbackExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Your Feedback</h3>
                <p className="text-slate-400 text-sm">
                  {userFeedback.length === 0
                    ? 'Share your thoughts with us'
                    : `${userFeedback.length} message${userFeedback.length !== 1 ? 's' : ''} sent`}
                </p>
              </div>
            </div>
            {feedbackExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {feedbackExpanded && (
            <div className="border-t border-slate-700">
              {/* Feedback Form */}
              <form onSubmit={handleSendFeedback} className="p-4 border-b border-slate-700/50">
                <div className="flex gap-2 mb-3">
                  {FEEDBACK_CATEGORIES.map((key) => {
                    const config = CATEGORY_CONFIG[key];
                    const Icon = config.icon;
                    const isSelected = selectedCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCategory(key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? `${config.bg} ${config.color}`
                            : 'bg-slate-700/50 text-slate-400 border-transparent hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendFeedback(e);
                      }
                    }}
                    placeholder="Share your feedback, questions, or ideas..."
                    rows={2}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
                  />
                  <div className="flex flex-col gap-2 self-end">
                    <button
                      type="submit"
                      disabled={!newFeedback.trim() || isSending}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                    >
                      {isSending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                    {isAdmin && isDevelopment && (
                      <button
                        type="button"
                        onClick={() => handleSendTestEmail(newFeedback, selectedCategory)}
                        disabled={isSendingTestEmail}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        title="Send test emails to admin"
                      >
                        {isSendingTestEmail ? (
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Mail className="w-3 h-3" />
                        )}
                        Test Email
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
                {testEmailResult && !canSendAsAdmin && (
                  <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${testEmailResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {testEmailResult.message}
                  </div>
                )}
              </form>

              {/* Past Feedback */}
              {userFeedback.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No feedback sent yet</p>
                  <p className="text-slate-500 text-sm mt-1">
                    We&apos;d love to hear your thoughts!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {userFeedback.map((msg) => {
                    const categoryConfig = CATEGORY_CONFIG[msg.category || 'general'];
                    const CategoryIcon = categoryConfig.icon;

                    return (
                      <div key={msg.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border ${categoryConfig.bg}`}>
                            <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryConfig.bg} ${categoryConfig.color} border`}>
                                {categoryConfig.label}
                              </span>
                            </div>
                            <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                            <span className="text-slate-500 text-xs flex items-center gap-1 mt-2">
                              <Clock className="w-3 h-3" />
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
