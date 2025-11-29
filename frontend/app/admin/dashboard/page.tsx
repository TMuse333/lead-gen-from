"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminAnalytics from '@/components/dashboard/admin/analytics/adminAnalytics';
import AdminConfigsList from '@/components/dashboard/admin/adminConfigsList/adminConfigsList';
import AdminTokenUsage from '@/components/dashboard/admin/tokenUsage/adminTokenUsage';
import { BarChart3, Building2, Loader2, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'configs' | 'token-usage'>('analytics');

  if (status === "loading") {
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
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'configs' && <AdminConfigsList />}
          {activeTab === 'token-usage' && <AdminTokenUsage />}
        </div>
      </div>
    </div>
  );
}
