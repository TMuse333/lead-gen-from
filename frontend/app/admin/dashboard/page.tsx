"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminAnalytics from '@/components/dashboard/admin/analytics/adminAnalytics';
import AdminConfigsList from '@/components/dashboard/admin/adminConfigsList/adminConfigsList';
import AdminTokenUsage from '@/components/dashboard/admin/tokenUsage/adminTokenUsage';
import AdminRateLimits from '@/components/dashboard/admin/rateLimits/AdminRateLimits';
import AdminConversations from '@/components/dashboard/admin/conversations/AdminConversations';
import IframeTest from '@/components/dashboard/admin/iframeTest/IframeTest';
import { BarChart3, Building2, Loader2, DollarSign, Shield, MessageSquare, ShieldX, Code } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'configs' | 'token-usage' | 'rate-limits' | 'conversations' | 'iframe-test'>('analytics');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/admin/check');
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } catch {
          setIsAdmin(false);
        }
      }
    };
    if (status === 'authenticated') {
      checkAdmin();
    }
  }, [session, status]);

  if (status === "loading" || (status === "authenticated" && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-200/70">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/admin/dashboard");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="text-center">
          <ShieldX className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-300 mb-2">Access Denied</h1>
          <p className="text-cyan-200/70 mb-6">You don&apos;t have permission to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-200 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-200 mb-2">Admin Dashboard</h1>
          <p className="text-cyan-200/70">
            System analytics and client configuration management (Owner/Developer Only)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 mb-6 overflow-hidden">
          <div className="flex border-b border-cyan-500/20">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <BarChart3 size={20} />
              System Analytics
            </button>
            <button
              onClick={() => setActiveTab('configs')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'configs'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <Building2 size={20} />
              Client Configurations
            </button>
            <button
              onClick={() => setActiveTab('token-usage')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'token-usage'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <DollarSign size={20} />
              Token Usage
            </button>
            <button
              onClick={() => setActiveTab('rate-limits')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'rate-limits'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <Shield size={20} />
              Rate Limits
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'conversations'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <MessageSquare size={20} />
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('iframe-test')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'iframe-test'
                  ? 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400'
                  : 'text-cyan-200/50 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              <Code size={20} />
              Iframe Test
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'configs' && <AdminConfigsList />}
          {activeTab === 'token-usage' && <AdminTokenUsage />}
          {activeTab === 'rate-limits' && <AdminRateLimits />}
          {activeTab === 'conversations' && <AdminConversations />}
          {activeTab === 'iframe-test' && <IframeTest />}
        </div>
      </div>
    </div>
  );
}
