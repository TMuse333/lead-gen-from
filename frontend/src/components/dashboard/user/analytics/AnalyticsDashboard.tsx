// src/components/dashboard/user/analytics/AnalyticsDashboard.tsx
/**
 * Combined Analytics Dashboard
 * Aggregates all analytics views: overview, conversations, replay, and token usage
 */

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Play, FlaskConical, Globe, Layers, Lightbulb } from 'lucide-react';
import UserAnalytics from './userAnalytics';
import ConversationAnalytics from '../conversations/ConversationAnalytics';
import ConversationViewer from './ConversationViewer';
import IntelDashboard from './IntelDashboard';

type AnalyticsTab = 'overview' | 'conversations' | 'replay' | 'intel';
type EnvironmentFilter = 'production' | 'test' | 'all';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [environmentFilter, setEnvironmentFilter] = useState<EnvironmentFilter>('production');
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Detect development mode and load preferences after hydration (avoids SSR mismatch)
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsDevelopment(isLocalhost);

    // Load saved filter preference
    const savedFilter = localStorage.getItem('analyticsEnvironmentFilter') as EnvironmentFilter;
    if (savedFilter) {
      // Only allow test/all filter if in development
      if ((savedFilter === 'test' || savedFilter === 'all') && !isLocalhost) {
        setEnvironmentFilter('production');
      } else {
        setEnvironmentFilter(savedFilter);
      }
    }
  }, []);

  // Persist filter preference
  useEffect(() => {
    localStorage.setItem('analyticsEnvironmentFilter', environmentFilter);
  }, [environmentFilter]);

  // Only show test option in development mode
  const environmentOptions: { value: EnvironmentFilter; label: string; icon: typeof Globe }[] = isDevelopment
    ? [
        { value: 'production', label: 'Production', icon: Globe },
        { value: 'test', label: 'Test', icon: FlaskConical },
        { value: 'all', label: 'All Data', icon: Layers },
      ]
    : [
        { value: 'production', label: 'Production', icon: Globe },
      ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'conversations' as const, label: 'Funnel', icon: MessageSquare },
    { id: 'replay' as const, label: 'Replay', icon: Play },
    { id: 'intel' as const, label: 'Intel', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Tab Navigation */}
      <div className="border-b border-slate-700 bg-slate-800/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px
                      ${isActive
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Environment Filter - Only show in development when there are multiple options */}
            {isDevelopment && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Data:</span>
                <div className="flex items-center bg-slate-900 rounded-lg p-0.5">
                  {environmentOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = environmentFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setEnvironmentFilter(option.value)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                          ${isActive
                            ? option.value === 'test'
                              ? 'bg-amber-500/20 text-amber-300'
                              : option.value === 'all'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                            : 'text-slate-500 hover:text-slate-300'
                          }
                        `}
                        title={option.label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'overview' && <UserAnalytics environment={environmentFilter} />}
        {activeTab === 'conversations' && (
          <div className="p-6">
            <ConversationAnalytics environment={environmentFilter} />
          </div>
        )}
        {activeTab === 'replay' && (
          <div className="p-6">
            <ConversationViewer environment={environmentFilter} />
          </div>
        )}
        {activeTab === 'intel' && (
          <div className="p-6">
            <IntelDashboard environment={environmentFilter} />
          </div>
        )}
      </div>
    </div>
  );
}
