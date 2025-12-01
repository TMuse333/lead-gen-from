'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Code,
  Server,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { formatFeatureName } from '@/lib/utils/formatFeatureName';

interface LLMRoute {
  path: string;
  method: string;
  feature: string;
  description: string;
  rateLimitEnabled: boolean;
  authenticatedLimit: number;
  unauthenticatedLimit: number;
  currentUsage: {
    authenticated: number;
    unauthenticated: number;
  };
  models: string[];
  category: string;
}

export default function LLMRoutesPage() {
  const [routes, setRoutes] = useState<LLMRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch rate limit configs to get current limits
      const rateLimitResponse = await axios.get('/api/admin/rate-limits');
      const rateLimitConfigs = rateLimitResponse.data.success
        ? rateLimitResponse.data.configs
        : [];

      // Define all LLM routes
      const allRoutes: LLMRoute[] = [
        {
          path: '/api/chat/smart',
          method: 'POST',
          feature: 'chat.replyGeneration',
          description: 'Smart chat handler - generates replies and classifies intent',
          rateLimitEnabled: true,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'chat',
        },
        {
          path: '/api/chat/instant-reaction',
          method: 'POST',
          feature: 'chat.instantReaction',
          description: 'Generates instant reactions to user answers',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'chat',
        },
        {
          path: '/api/generation/generate-offer',
          method: 'POST',
          feature: 'offerGeneration',
          description: 'Generates personalized offers/reports using LLM',
          rateLimitEnabled: true,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'generation',
        },
        {
          path: '/api/offers/[type]/test',
          method: 'POST',
          feature: 'offerGeneration',
          description: 'Test offer generation with sample data',
          rateLimitEnabled: true,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini', 'gpt-4o'],
          category: 'generation',
        },
        {
          path: '/api/document-extraction/process',
          method: 'POST',
          feature: 'documentExtraction',
          description: 'Processes uploaded documents and extracts knowledge using LLM',
          rateLimitEnabled: true,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'generation',
        },
        {
          path: '/api/rules/recommend',
          method: 'POST',
          feature: 'rulesGeneration',
          description: 'Generates rule recommendations based on user flows',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'rules',
        },
        {
          path: '/api/rules/translate',
          method: 'POST',
          feature: 'rulesTranslation',
          description: 'Translates natural language rules into structured format',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'rules',
        },
        {
          path: '/api/agent-advice/generate-voice-script',
          method: 'POST',
          feature: 'voiceScriptGeneration',
          description: 'Generates questions for voice script uploads',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'onboarding',
        },
        {
          path: '/api/onboarding/generate-advice-questions',
          method: 'POST',
          feature: 'onboarding.generateQuestions',
          description: 'Generates advice questions during onboarding',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'onboarding',
        },
        {
          path: '/api/onboarding/generate-flow',
          method: 'POST',
          feature: 'onboarding.generateFlow',
          description: 'Generates conversation flows during onboarding',
          rateLimitEnabled: false,
          authenticatedLimit: 0,
          unauthenticatedLimit: 0,
          currentUsage: { authenticated: 0, unauthenticated: 0 },
          models: ['gpt-4o-mini'],
          category: 'onboarding',
        },
      ];

      // Merge with rate limit data
      const routesWithLimits = allRoutes.map((route) => {
        const config = rateLimitConfigs.find((c: any) => c.feature === route.feature);
        if (config) {
          return {
            ...route,
            rateLimitEnabled: config.enabled,
            authenticatedLimit: config.authenticated.requests,
            unauthenticatedLimit: config.unauthenticated.requests,
            currentUsage: {
              authenticated: config.authenticated.current || 0,
              unauthenticated: config.unauthenticated.current || 0,
            },
          };
        }
        return route;
      });

      setRoutes(routesWithLimits);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    if (filter === 'all') return true;
    if (filter === 'rate-limited') return route.rateLimitEnabled;
    if (filter === 'not-rate-limited') return !route.rateLimitEnabled;
    return route.category === filter;
  });

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(100, (current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (percentage >= 80) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-400 bg-green-500/10 border-green-500/30';
  };

  const categories = ['all', 'chat', 'generation', 'rules', 'onboarding', 'rate-limited', 'not-rate-limited'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">LLM Routes Overview</h1>
          <p className="text-slate-400">
            Visual overview of all API routes that use LLM services
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200"
          >
            <option value="all">All Routes</option>
            <option value="rate-limited">Rate Limited</option>
            <option value="not-rate-limited">Not Rate Limited</option>
            <option value="chat">Chat Routes</option>
            <option value="generation">Generation Routes</option>
            <option value="rules">Rules Routes</option>
            <option value="onboarding">Onboarding Routes</option>
          </select>

          <button
            onClick={fetchRoutes}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Routes</h3>
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{routes.length}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Rate Limited</h3>
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100">
            {routes.filter((r) => r.rateLimitEnabled).length}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Unique Features</h3>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100">
            {new Set(routes.map((r) => r.feature)).size}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Unique Models</h3>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100">
            {new Set(routes.flatMap((r) => r.models)).size}
          </p>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {filteredRoutes.map((route) => {
          const authUsage = getUsagePercentage(
            route.currentUsage.authenticated,
            route.authenticatedLimit
          );
          const unauthUsage = getUsagePercentage(
            route.currentUsage.unauthenticated,
            route.unauthenticatedLimit
          );

          return (
            <div
              key={route.path}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-slate-100 font-mono">
                      {route.method} {route.path}
                    </h3>
                    {route.rateLimitEnabled ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Rate Limited
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded">
                        Not Limited
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 mb-3">{route.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      Feature: <span className="text-cyan-400 font-mono">{route.feature}</span>
                    </span>
                    <span className="text-slate-500">
                      Category: <span className="text-cyan-400 capitalize">{route.category}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Models */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Models Used:</p>
                <div className="flex flex-wrap gap-2">
                  {route.models.map((model) => (
                    <span
                      key={model}
                      className="px-2 py-1 bg-slate-700 text-cyan-300 text-xs rounded font-mono"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rate Limit Info */}
              {route.rateLimitEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Authenticated Users
                    </p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">
                        {route.currentUsage.authenticated} / {route.authenticatedLimit}
                      </span>
                      <span className={getUsageColor(authUsage).split(' ')[0]}>
                        {authUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          authUsage >= 100
                            ? 'bg-red-500'
                            : authUsage >= 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, authUsage)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Unauthenticated Users
                    </p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">
                        {route.currentUsage.unauthenticated} / {route.unauthenticatedLimit}
                      </span>
                      <span className={getUsageColor(unauthUsage).split(' ')[0]}>
                        {unauthUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          unauthUsage >= 100
                            ? 'bg-red-500'
                            : unauthUsage >= 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, unauthUsage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={`/admin/dashboard?tab=rate-limits`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Manage Rate Limits
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href={`/admin/dashboard?tab=token-usage`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Activity className="w-3 h-3" />
                  View Usage Stats
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No routes found matching the filter</p>
        </div>
      )}
    </div>
  );
}

