'use client';

import { useState } from 'react';
import { BookOpen, Mic, HelpCircle, Sparkles, List, LayoutGrid, MessageCircle, Heart } from 'lucide-react';
import AgentAdviceDashboard from '../adviceDashboard/agentAdviceDashboard';
import AgentAdviceSpeechUploader from '../agentSpeechUploader/agentSpeechUploader';
import RulesExplanation from '../rules/rulesExplanation';
import RecommendedRules from '../rules/recommendedRules';
import ViewAllRules from '../rules/viewAllRules';
import OfferKnowledgeDashboard from './OfferKnowledgeDashboard';
import StoriesDashboard from './StoriesDashboard';

type KnowledgeBaseTab = 'stories' | 'advice' | 'by-offer' | 'upload' | 'explanation' | 'recommended' | 'view-all';

interface TabConfig {
  id: KnowledgeBaseTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlight?: boolean;
}

const TABS: TabConfig[] = [
  {
    id: 'stories',
    label: 'Stories',
    icon: Heart,
    description: 'Client stories that build trust',
    highlight: true, // Special emphasis
  },
  {
    id: 'advice',
    label: 'Tips & Advice',
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
  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('stories');

  const renderContent = () => {
    switch (activeTab) {
      case 'stories':
        return <StoriesDashboard />;
      case 'advice':
        return <AgentAdviceDashboard />;
      case 'by-offer':
        return <OfferKnowledgeDashboard />;
      case 'upload':
        return <AgentAdviceSpeechUploader />;
      case 'explanation':
        return <RulesExplanation />;
      case 'recommended':
        return <RecommendedRules />;
      case 'view-all':
        return <ViewAllRules />;
      default:
        return <StoriesDashboard />;
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

              // Special styling for Stories tab
              const isStoriesTab = tab.id === 'stories';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? isStoriesTab
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : isStoriesTab
                        ? 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className={`h-4 w-4 ${isStoriesTab && !isActive ? 'animate-pulse' : ''}`} />
                  <span>{tab.label}</span>
                  {isStoriesTab && !isActive && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Important</span>
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
