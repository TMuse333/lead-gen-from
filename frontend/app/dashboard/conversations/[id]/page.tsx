'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  TrendingUp,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { ConversationDocument } from '@/lib/mongodb/models/conversation';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<ConversationDocument | null>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const fetchConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const [convResponse, genResponse] = await Promise.all([
        axios.get(`/api/conversations/${conversationId}`),
        axios.get(`/api/generations?conversationId=${conversationId}`).catch(() => ({ data: { generations: [] } })),
      ]);

      if (convResponse.data.success) {
        setConversation(convResponse.data.conversation);
      } else {
        setError('Failed to load conversation');
      }

      if (genResponse.data.success) {
        setGenerations(genResponse.data.generations || []);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/dashboard?section=conversations"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Conversations
        </Link>
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error || 'Conversation not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard?section=conversations"
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 capitalize">
              {conversation.flow} Flow Conversation
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {formatDate(conversation.startedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-sm font-medium border ${
              conversation.status === 'completed'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : conversation.status === 'abandoned'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {conversation.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
            ) : conversation.status === 'abandoned' ? (
              <XCircle className="w-4 h-4 inline mr-1" />
            ) : (
              <Clock className="w-4 h-4 inline mr-1" />
            )}
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-500">Duration</p>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {formatDuration(conversation.duration)}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-500">Messages</p>
          </div>
          <p className="text-xl font-bold text-slate-100">{conversation.messageCount}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-500">Progress</p>
          </div>
          <p className="text-xl font-bold text-slate-100">{conversation.progress}%</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-500">Generations</p>
          </div>
          <p className="text-xl font-bold text-slate-100">{generations.length}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Conversation Timeline
        </h2>

        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-1 rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-slate-700/50 border border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 capitalize">
                    {message.role}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p className="text-slate-200">{message.content}</p>
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.buttons.map((btn, btnIndex) => (
                      <span
                        key={btnIndex}
                        className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded"
                      >
                        {btn.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answers Summary */}
      {conversation.answers && conversation.answers.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            User Answers
          </h2>

          <div className="space-y-3">
            {conversation.answers.map((answer, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-cyan-400">
                    {answer.mappingKey}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {formatDate(answer.timestamp)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        answer.answeredVia === 'button'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {answer.answeredVia}
                    </span>
                  </div>
                </div>
                <p className="text-slate-200">{answer.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Offers */}
      {generations.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Generated Offers
          </h2>

          <div className="space-y-3">
            {generations.map((gen) => (
              <div
                key={gen._id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-400">
                      {gen.offerType || 'Offer'} - {formatDate(gen.generatedAt)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {gen.componentCount} components • {gen.generationTime}ms
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/generations/${gen._id}`}
                    className="px-3 py-1.5 bg-cyan-500/20 text-cyan-200 rounded-lg hover:bg-cyan-500/30 transition text-sm"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

