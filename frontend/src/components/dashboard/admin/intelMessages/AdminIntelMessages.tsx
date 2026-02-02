// components/dashboard/admin/intelMessages/AdminIntelMessages.tsx
/**
 * Admin panel for viewing and sending intel messages to users
 * Two-section layout: Developer Insights sent + User Feedback received
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
  User,
  Search,
  Mail,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
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

interface UserConfig {
  userId: string;
  businessName: string;
  agentFirstName: string;
  agentLastName?: string;
  notificationEmail: string;
}

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  insight: { icon: Lightbulb, label: 'Insight', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  recommendation: { icon: Sparkles, label: 'Recommendation', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  feedback: { icon: ThumbsUp, label: 'Feedback', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  general: { icon: MessageSquare, label: 'General', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30' },
};

const DEVELOPER_CATEGORIES = ['insight', 'recommendation', 'question'] as const;

export default function AdminIntelMessages() {
  const [users, setUsers] = useState<UserConfig[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('insight');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [insightsSentExpanded, setInsightsSentExpanded] = useState(true);
  const [feedbackReceivedExpanded, setFeedbackReceivedExpanded] = useState(true);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/client-configs');
        const data = await res.json();
        if (data.configs) {
          setUsers(data.configs);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages when user is selected
  const fetchMessages = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/intel-messages?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  // Send test emails (dev only) - uses actual message from textarea
  const handleSendTestEmail = async () => {
    if (!newMessage.trim()) {
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
        body: JSON.stringify({ message: newMessage, category: selectedCategory }),
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedUser) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/intel-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.userId,
          message: newMessage.trim(),
          category: selectedCategory,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
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
      return `${date.toLocaleDateString([], { weekday: 'short' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.agentFirstName?.toLowerCase().includes(searchLower) ||
      user.agentLastName?.toLowerCase().includes(searchLower) ||
      user.businessName?.toLowerCase().includes(searchLower) ||
      user.notificationEmail?.toLowerCase().includes(searchLower)
    );
  });

  // Split messages
  const insightsSent = messages
    .filter(m => m.senderType === 'developer')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const feedbackReceived = messages
    .filter(m => m.senderType === 'user')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 overflow-hidden">
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-xl font-bold text-cyan-200 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Intel Messages
        </h2>
        <p className="text-cyan-200/60 text-sm mt-1">
          Send insights to users and view their feedback
        </p>
      </div>

      <div className="flex h-[700px]">
        {/* Users List */}
        <div className="w-72 border-r border-cyan-500/20 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-cyan-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-200 text-sm placeholder-cyan-400/50 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-cyan-200/50 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => {
                    setSelectedUser(user);
                    setMessages([]);
                  }}
                  className={`w-full p-3 text-left border-b border-cyan-500/10 transition-all ${
                    selectedUser?.userId === user.userId
                      ? 'bg-cyan-500/20'
                      : 'hover:bg-cyan-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cyan-200 font-medium text-sm truncate">
                        {user.agentFirstName} {user.agentLastName || ''}
                      </p>
                      <p className="text-cyan-200/50 text-xs truncate">
                        {user.businessName}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* User Header */}
              <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-cyan-200 font-medium">
                      {selectedUser.agentFirstName} {selectedUser.agentLastName || ''}
                    </p>
                    <p className="text-cyan-200/50 text-xs">
                      {selectedUser.notificationEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => fetchMessages(selectedUser.userId)}
                  disabled={isLoadingMessages}
                  className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <>
                    {/* Send New Insight Form */}
                    <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-4">
                      <h4 className="text-cyan-200 font-medium text-sm mb-3 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Send Insight to {selectedUser.agentFirstName}
                      </h4>
                      <form onSubmit={handleSendMessage}>
                        <div className="flex gap-2 mb-3">
                          {DEVELOPER_CATEGORIES.map((key) => {
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
                                    : 'bg-white/5 text-cyan-200/50 border-transparent hover:bg-white/10'
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
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                              }
                            }}
                            placeholder="Write an insight, recommendation, or question..."
                            rows={2}
                            className="flex-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-cyan-100 text-sm placeholder-cyan-400/50 focus:outline-none focus:border-cyan-500/40 resize-none"
                          />
                          <div className="flex flex-col gap-2 self-end">
                            <button
                              type="submit"
                              disabled={!newMessage.trim() || isSending}
                              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                            >
                              {isSending ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={handleSendTestEmail}
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
                          </div>
                        </div>
                        {testEmailResult && (
                          <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${testEmailResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {testEmailResult.message}
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Feedback Received Section */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => setFeedbackReceivedExpanded(!feedbackReceivedExpanded)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-400" />
                          <span className="text-cyan-200 font-medium text-sm">
                            Feedback Received
                          </span>
                          <span className="text-cyan-200/50 text-xs">
                            ({feedbackReceived.length})
                          </span>
                        </div>
                        {feedbackReceivedExpanded ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>

                      {feedbackReceivedExpanded && (
                        <div className="border-t border-white/10">
                          {feedbackReceived.length === 0 ? (
                            <div className="p-6 text-center text-cyan-200/40 text-sm">
                              No feedback from this user yet
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5">
                              {feedbackReceived.map((msg) => {
                                const categoryConfig = CATEGORY_CONFIG[msg.category || 'general'];
                                const CategoryIcon = categoryConfig.icon;

                                return (
                                  <div key={msg.id} className="p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-1.5 rounded-lg border ${categoryConfig.bg}`}>
                                        <CategoryIcon className={`w-3 h-3 ${categoryConfig.color}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryConfig.bg} ${categoryConfig.color} border`}>
                                            {categoryConfig.label}
                                          </span>
                                        </div>
                                        <p className="text-cyan-100 text-sm whitespace-pre-wrap">
                                          {msg.message}
                                        </p>
                                        <span className="text-cyan-200/40 text-xs flex items-center gap-1 mt-1">
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

                    {/* Insights Sent Section */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => setInsightsSentExpanded(!insightsSentExpanded)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <span className="text-cyan-200 font-medium text-sm">
                            Insights Sent
                          </span>
                          <span className="text-cyan-200/50 text-xs">
                            ({insightsSent.length})
                          </span>
                        </div>
                        {insightsSentExpanded ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>

                      {insightsSentExpanded && (
                        <div className="border-t border-white/10">
                          {insightsSent.length === 0 ? (
                            <div className="p-6 text-center text-cyan-200/40 text-sm">
                              No insights sent to this user yet
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5">
                              {insightsSent.map((msg) => {
                                const categoryConfig = CATEGORY_CONFIG[msg.category || 'general'];
                                const CategoryIcon = categoryConfig.icon;

                                return (
                                  <div key={msg.id} className="p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-1.5 rounded-lg border ${categoryConfig.bg}`}>
                                        <CategoryIcon className={`w-3 h-3 ${categoryConfig.color}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryConfig.bg} ${categoryConfig.color} border`}>
                                            {categoryConfig.label}
                                          </span>
                                          {msg.readAt && (
                                            <span className="text-green-400/70 text-xs flex items-center gap-1">
                                              <Check className="w-3 h-3" />
                                              Read
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-cyan-100 text-sm whitespace-pre-wrap">
                                          {msg.message}
                                        </p>
                                        <span className="text-cyan-200/40 text-xs flex items-center gap-1 mt-1">
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
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-16 h-16 text-cyan-500/20 mb-4" />
              <h3 className="text-cyan-200 font-medium mb-2">Select a User</h3>
              <p className="text-cyan-200/50 text-sm max-w-xs">
                Choose a user from the list to send them insights or view their feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
