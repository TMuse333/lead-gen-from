// frontend/src/components/dashboard/user/offers/editor/tabs/AnalyticsTab.tsx
/**
 * Analytics tab for offer editor
 * Shows generation statistics (placeholder for now)
 */

'use client';

import { BarChart3, TrendingUp, DollarSign, Zap } from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface AnalyticsTabProps {
  offerType: OfferType;
}

export function AnalyticsTab({ offerType }: AnalyticsTabProps) {
  // TODO: Fetch actual analytics from API
  const stats = {
    totalGenerations: 0,
    successRate: 0,
    averageCost: 0,
    averageTokens: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Total Generations"
          value={stats.totalGenerations.toString()}
          color="cyan"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Success Rate"
          value={`${stats.successRate}%`}
          color="green"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Avg Cost"
          value={`$${stats.averageCost.toFixed(4)}`}
          color="yellow"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Avg Tokens"
          value={stats.averageTokens.toLocaleString()}
          color="purple"
        />
      </div>

      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700 text-center">
        <p className="text-slate-400">
          No generation data yet. Test or generate offers to see analytics.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`rounded-lg p-4 border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
