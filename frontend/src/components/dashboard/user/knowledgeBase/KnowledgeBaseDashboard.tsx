'use client';

import { useState } from 'react';
import { Mic, Sparkles, Brain } from 'lucide-react';
import AgentAdviceSpeechUploader from '../agentSpeechUploader/agentSpeechUploader';
import RecommendedStories from './RecommendedStories';
import { KnowledgeBrainDashboard } from './brain';

type KnowledgeBaseTab = 'brain' | 'recommended' | 'upload';

interface TabConfig {
  id: KnowledgeBaseTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlight?: boolean;
}

const TABS: TabConfig[] = [
  {
    id: 'brain',
    label: 'Knowledge Brain',
    icon: Brain,
    description: 'All knowledge: stories, tips, website copy, FAQs',
    highlight: true,
  },
  {
    id: 'recommended',
    label: 'Suggested',
    icon: Sparkles,
    description: 'Story ideas for your timeline phases',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: Mic,
    description: 'Add content via speech or script',
  },
];

export default function KnowledgeBaseDashboard() {
  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('brain');

  const renderContent = () => {
    switch (activeTab) {
      case 'brain':
        return (
          <div className="h-[calc(100vh-60px)]">
            <KnowledgeBrainDashboard />
          </div>
        );
      case 'recommended':
        return <RecommendedStories />;
      case 'upload':
        return <AgentAdviceSpeechUploader />;
      default:
        return (
          <div className="h-[calc(100vh-60px)]">
            <KnowledgeBrainDashboard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isBrainTab = tab.id === 'brain';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? isBrainTab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-700/50 text-slate-200 border border-slate-600'
                      : isBrainTab
                        ? 'text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className={`h-4 w-4 ${isBrainTab && isActive ? 'text-cyan-400' : ''}`} />
                  <span>{tab.label}</span>
                  {isBrainTab && !isActive && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">Main</span>
                  )}
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
