'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Download,
  Share2,
  Printer,
  RefreshCw,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { TimelineDisplay } from '@/components/ux/resultsComponents/timeline';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';

export default function TimelineResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const conversationId = params.conversationId as string;

  const [timeline, setTimeline] = useState<TimelineOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/timeline/${conversationId}`);
    }
  }, [authStatus, conversationId, router]);

  // Fetch timeline data
  useEffect(() => {
    if (conversationId && authStatus === 'authenticated') {
      fetchTimeline();
    }
  }, [conversationId, authStatus]);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try to fetch existing timeline from conversation
      const convResponse = await axios.get(`/api/conversations/${conversationId}`);

      if (!convResponse.data.success) {
        throw new Error('Failed to load conversation');
      }

      const conversation = convResponse.data.conversation;

      // Check if user owns this conversation
      if (conversation.userId !== session?.user?.id) {
        setError('You do not have permission to view this timeline');
        return;
      }

      // Check if timeline exists in the conversation
      if (conversation.generatedTimeline) {
        setTimeline(conversation.generatedTimeline);
      } else {
        // No timeline exists yet - show appropriate message
        setError('Timeline not yet generated for this conversation. Complete the conversation first.');
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Conversation not found');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await axios.post('/api/timeline/generate', {
        conversationId,
      });

      if (response.data.success) {
        setTimeline(response.data.timeline);
      } else {
        throw new Error(response.data.error || 'Failed to regenerate timeline');
      }
    } catch (err) {
      console.error('Error regenerating timeline:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate timeline');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post('/api/timeline/export/pdf', {
        conversationId,
      }, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timeline-${conversationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/timeline/share/${conversationId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: timeline?.title || 'My Real Estate Timeline',
          text: 'Check out my personalized real estate timeline!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - copy to clipboard instead
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Share link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Unable to Load Timeline
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchTimeline}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No timeline state
  if (!timeline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              No Timeline Available
            </h1>
            <p className="text-slate-600 mb-6">
              Complete a conversation to generate your personalized real estate timeline.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main timeline display
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Your Timeline
                </h1>
                <p className="text-sm text-slate-500">
                  Personalized for your journey
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                title="Regenerate Timeline"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Share Timeline"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Print Timeline"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Agent Branding (if available) */}
      {timeline.agentInfo && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 print:hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4">
              {timeline.agentInfo.photo && (
                <img
                  src={timeline.agentInfo.photo}
                  alt={timeline.agentInfo.name}
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                />
              )}
              <div>
                <p className="font-semibold">{timeline.agentInfo.name}</p>
                {timeline.agentInfo.company && (
                  <p className="text-sm text-white/80">{timeline.agentInfo.company}</p>
                )}
              </div>
              {timeline.agentInfo.contact && (
                <div className="ml-auto text-right hidden sm:block">
                  <p className="text-sm">{timeline.agentInfo.contact}</p>
                  {timeline.agentInfo.email && (
                    <p className="text-sm text-white/80">{timeline.agentInfo.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* "Powered by AI" Badge */}
      <div className="flex justify-center py-4 print:hidden">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-full">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            Powered by AI + Your Agent's Expertise
          </span>
        </div>
      </div>

      {/* Timeline Content */}
      <main className="pb-12">
        <TimelineDisplay data={timeline} />
      </main>

      {/* Footer CTA */}
      <footer className="bg-slate-900 text-white py-8 print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 mb-4">
            Have questions about your timeline?
          </p>
          {timeline.agentInfo?.email ? (
            <a
              href={`mailto:${timeline.agentInfo.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Contact Your Agent
            </a>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Back to Dashboard
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
