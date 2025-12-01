'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Shield,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatFeatureName } from '@/lib/utils/formatFeatureName';

interface RateLimitConfig {
  feature: string;
  authenticated: {
    requests: number;
    window: '1h' | '24h';
    current: number;
  };
  unauthenticated: {
    requests: number;
    window: '1h' | '24h';
    current: number;
  };
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

export default function AdminRateLimits() {
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/rate-limits');
      if (response.data.success) {
        setConfigs(response.data.configs);
      } else {
        setError('Failed to load rate limits');
      }
    } catch (err) {
      console.error('Error fetching rate limits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rate limits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (feature: string, config: RateLimitConfig) => {
    setSaving(feature);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put('/api/admin/rate-limits', {
        feature,
        authenticated: {
          requests: config.authenticated.requests,
          window: config.authenticated.window,
        },
        unauthenticated: {
          requests: config.unauthenticated.requests,
          window: config.unauthenticated.window,
        },
        enabled: config.enabled,
      });

      if (response.data.success) {
        setSuccess(`Rate limits for ${formatFeatureName(feature)} updated successfully`);
        await fetchConfigs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update rate limits');
      }
    } catch (err) {
      console.error('Error saving rate limit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save rate limits');
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (feature?: string) => {
    if (!confirm(`Reset ${feature ? formatFeatureName(feature) : 'all'} rate limits to defaults?`)) {
      return;
    }

    setSaving(feature || 'all');
    try {
      const url = feature
        ? `/api/admin/rate-limits/reset?feature=${feature}`
        : '/api/admin/rate-limits/reset';
      const response = await axios.post(url);

      if (response.data.success) {
        setSuccess(`Rate limits reset successfully`);
        await fetchConfigs();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to reset rate limits');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleEnabled = async (feature: string, enabled: boolean) => {
    const config = configs.find((c) => c.feature === feature);
    if (!config) return;

    const updatedConfig = { ...config, enabled };
    setConfigs(configs.map((c) => (c.feature === feature ? updatedConfig : c)));
    await handleSave(feature, updatedConfig);
  };

  const toggleExpand = (feature: string) => {
    setExpandedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) {
        next.delete(feature);
      } else {
        next.add(feature);
      }
      return next;
    });
  };

  const updateConfig = (feature: string, updates: Partial<RateLimitConfig>) => {
    setConfigs(
      configs.map((c) =>
        c.feature === feature ? { ...c, ...updates } : c
      )
    );
  };

  const filteredConfigs = configs.filter((config) => {
    if (filter === 'all') return true;
    if (filter === 'enabled') return config.enabled;
    if (filter === 'disabled') return !config.enabled;
    return true;
  });

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(100, (current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-400';
    if (percentage >= 80) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error && !configs.length) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchConfigs}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-200 mb-2">Rate Limits Management</h2>
          <p className="text-cyan-200/70">
            Configure request limits for each LLM feature to prevent abuse
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-cyan-500/20 rounded-lg px-4 py-2 text-cyan-200"
          >
            <option value="all">All Features</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* Reset All */}
          <button
            onClick={() => handleReset()}
            disabled={saving === 'all'}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50"
          >
            {saving === 'all' ? (
              <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 inline mr-2" />
            )}
            Reset All to Defaults
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Configs List - Accordion Style */}
      <div className="space-y-3">
        {filteredConfigs.map((config) => {
          const authUsage = getUsagePercentage(
            config.authenticated.current,
            config.authenticated.requests
          );
          const unauthUsage = getUsagePercentage(
            config.unauthenticated.current,
            config.unauthenticated.requests
          );
          const isExpanded = expandedFeatures.has(config.feature);

          return (
            <div
              key={config.feature}
              className={`bg-white/5 backdrop-blur-md rounded-xl border transition-all ${
                config.enabled
                  ? 'border-cyan-500/20'
                  : 'border-slate-500/20 opacity-60'
              } ${isExpanded ? 'p-6' : 'p-4'}`}
            >
              {/* Collapsed Overview */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(config.feature)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  {/* Feature Name & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-cyan-200 truncate">
                        {formatFeatureName(config.feature)}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(config.feature, !config.enabled);
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition flex-shrink-0 ${
                          config.enabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                        }`}
                      >
                        {config.enabled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 inline mr-1" />
                            Disabled
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-cyan-200/50 font-mono truncate">{config.feature}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Authenticated Quick View */}
                    <div className="text-right">
                      <div className="text-xs text-cyan-200/70 mb-0.5">Authenticated</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${getUsageColor(authUsage).split(' ')[0]}`}>
                          {config.authenticated.current}/{config.authenticated.requests}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
                    </div>

                    {/* Unauthenticated Quick View */}
                    <div className="text-right">
                      <div className="text-xs text-cyan-200/70 mb-0.5">Unauthenticated</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${getUsageColor(unauthUsage).split(' ')[0]}`}>
                          {config.unauthenticated.current}/{config.unauthenticated.requests}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset(config.feature);
                    }}
                    disabled={saving === config.feature}
                    className="px-3 py-1.5 text-xs text-cyan-200/50 hover:text-cyan-200 transition disabled:opacity-50"
                    title="Reset to defaults"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Authenticated Limits */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-cyan-200">Authenticated Users</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-cyan-200/70 mb-1 block">
                            Requests per Window
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={config.authenticated.requests}
                            onChange={(e) =>
                              updateConfig(config.feature, {
                                authenticated: {
                                  ...config.authenticated,
                                  requests: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            disabled={!config.enabled}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-cyan-200 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-cyan-200/70 mb-1 block">Time Window</label>
                          <select
                            value={config.authenticated.window}
                            onChange={(e) =>
                              updateConfig(config.feature, {
                                authenticated: {
                                  ...config.authenticated,
                                  window: e.target.value as '1h' | '24h',
                                },
                              })
                            }
                            disabled={!config.enabled}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-cyan-200 disabled:opacity-50"
                          >
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                          </select>
                        </div>

                        {/* Usage Indicator */}
                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-cyan-200/70">Current Usage</span>
                            <span className={getUsageColor(authUsage)}>
                              {config.authenticated.current} / {config.authenticated.requests}
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
                      </div>
                    </div>

                    {/* Unauthenticated Limits */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-cyan-200">Unauthenticated Users</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-cyan-200/70 mb-1 block">
                            Requests per Window
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={config.unauthenticated.requests}
                            onChange={(e) =>
                              updateConfig(config.feature, {
                                unauthenticated: {
                                  ...config.unauthenticated,
                                  requests: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            disabled={!config.enabled}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-cyan-200 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-cyan-200/70 mb-1 block">Time Window</label>
                          <select
                            value={config.unauthenticated.window}
                            onChange={(e) =>
                              updateConfig(config.feature, {
                                unauthenticated: {
                                  ...config.unauthenticated,
                                  window: e.target.value as '1h' | '24h',
                                },
                              })
                            }
                            disabled={!config.enabled}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-cyan-200 disabled:opacity-50"
                          >
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                          </select>
                        </div>

                        {/* Usage Indicator */}
                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-cyan-200/70">Current Usage</span>
                            <span className={getUsageColor(unauthUsage)}>
                              {config.unauthenticated.current} / {config.unauthenticated.requests}
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
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSave(config.feature, config)}
                      disabled={saving === config.feature || !config.enabled}
                      className="px-6 py-2 bg-cyan-500/20 text-cyan-200 rounded-lg hover:bg-cyan-500/30 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving === config.feature ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

