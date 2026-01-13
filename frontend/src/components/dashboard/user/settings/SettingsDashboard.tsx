'use client';

import { useState } from 'react';
import { Settings, Palette, BarChart3 } from 'lucide-react';
import ConfigSummary from '../configSummary/configSummary';
import ColorConfig from '../colorConfig/colorConfig';
import dynamic from 'next/dynamic';

const TokenUsageDashboard = dynamic(
  () => import('../tokenUsage/tokenUsageDashboard'),
  { ssr: false }
);

// Agent Profile moved to Timeline > Agent Stats tab
type SettingsTab = 'general' | 'colors' | 'usage';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'general',
    label: 'General',
    icon: Settings,
    description: 'Bot configuration overview',
  },
  {
    id: 'colors',
    label: 'Colors',
    icon: Palette,
    description: 'Customize your theme',
  },
  {
    id: 'usage',
    label: 'Usage',
    icon: BarChart3,
    description: 'Token usage & costs',
  },
];

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <ConfigSummary />;
      case 'colors':
        return <ColorConfig />;
      case 'usage':
        return <TokenUsageDashboard />;
      default:
        return <ConfigSummary />;
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
