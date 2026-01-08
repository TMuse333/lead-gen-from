'use client';

import { useState } from 'react';
import { LayoutDashboard, BarChart3 } from 'lucide-react';
import WelcomeOverview from '../overview/overview';
import UserAnalytics from '../analytics/userAnalytics';

type OverviewTab = 'getting-started' | 'analytics';

interface TabConfig {
  id: OverviewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: LayoutDashboard,
    description: 'Learn how to set up your bot',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Track performance & engagement',
  },
];

export default function OverviewDashboard() {
  const [activeTab, setActiveTab] = useState<OverviewTab>('getting-started');

  const renderContent = () => {
    switch (activeTab) {
      case 'getting-started':
        return <WelcomeOverview />;
      case 'analytics':
        return <UserAnalytics />;
      default:
        return <WelcomeOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                    ${isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
