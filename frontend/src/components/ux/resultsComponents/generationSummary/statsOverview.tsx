import { Database, Target, Zap } from 'lucide-react';
import { AnimatedCounter } from './animatedCounter';

interface StatsOverviewProps {
  collectionsCount: number;
  insightsCount: number;
  avgMatchScore: number;
}

export function StatsOverview({ collectionsCount, insightsCount, avgMatchScore }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Database className="h-5 w-5 text-indigo-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Collections</span>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          <AnimatedCounter end={collectionsCount} />
        </p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="h-5 w-5 text-purple-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Insights</span>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          <AnimatedCounter end={insightsCount} />
        </p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-green-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Match Score</span>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          <AnimatedCounter end={Math.round(avgMatchScore * 100)} suffix="%" />
        </p>
      </div>
    </div>
  );
}