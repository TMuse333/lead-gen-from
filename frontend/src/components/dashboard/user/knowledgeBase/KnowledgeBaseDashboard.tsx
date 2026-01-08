'use client';

import { useState } from 'react';
import { BookOpen, Mic, HelpCircle, Sparkles, List, LayoutGrid, MessageCircle } from 'lucide-react';
import AgentAdviceDashboard from '../adviceDashboard/agentAdviceDashboard';
import AgentAdviceSpeechUploader from '../agentSpeechUploader/agentSpeechUploader';
import RulesExplanation from '../rules/rulesExplanation';
import RecommendedRules from '../rules/recommendedRules';
import ViewAllRules from '../rules/viewAllRules';
import OfferKnowledgeDashboard from './OfferKnowledgeDashboard';
import StoriesDashboard from './StoriesDashboard';

type KnowledgeBaseTab = 'advice' | 'by-offer' | 'stories' | 'upload' | 'explanation' | 'recommended' | 'view-all';

interface TabConfig {
  id: KnowledgeBaseTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'advice',
    label: 'Agent Advice',
    icon: BookOpen,
    description: 'Manage advice content',
  },
  {
    id: 'by-offer',
    label: 'By Offer',
    icon: LayoutGrid,
    description: 'Knowledge organized by offer phases',
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: MessageCircle,
    description: 'View all client stories',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: Mic,
    description: 'Upload via speech/script',
  },
  {
    id: 'explanation',
    label: 'How It Works',
    icon: HelpCircle,
    description: 'Learn about client situations',
  },
  {
    id: 'recommended',
    label: 'Recommended',
    icon: Sparkles,
    description: 'AI-generated suggestions',
  },
  {
    id: 'view-all',
    label: 'View All',
    icon: List,
    description: 'All client situations',
  },
];

export default function KnowledgeBaseDashboard() {
  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('advice');

  const renderContent = () => {
    switch (activeTab) {
      case 'advice':
        return <AgentAdviceDashboard />;
      case 'by-offer':
        return <OfferKnowledgeDashboard />;
      case 'stories':
        return <StoriesDashboard />;
      case 'upload':
        return <AgentAdviceSpeechUploader />;
      case 'explanation':
        return <RulesExplanation />;
      case 'recommended':
        return <RecommendedRules />;
      case 'view-all':
        return <ViewAllRules />;
      default:
        return <AgentAdviceDashboard />;
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

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap
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
