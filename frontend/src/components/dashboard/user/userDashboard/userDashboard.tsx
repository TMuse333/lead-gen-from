'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConversationEditor from '../conversationEditor/conversationEditor';
import AgentAdviceDashboard from '../adviceDashboard/agentAdviceDashboard';
import WelcomeOverview from '../overview/overview';
import ConfigSummary from '../configSummary/configSummary';
import AgentAdviceSpeechUploader from '../agentSpeechUploader/agentSpeechUploader';
import ColorConfig from '../colorConfig/colorConfig';
import UserAnalytics from '../analytics/userAnalytics';
import LeadsDashboard from '../leads/leadsDashboard';
import RulesExplanation from '../rules/rulesExplanation';
import RecommendedRules from '../rules/recommendedRules';
import ViewAllRules from '../rules/viewAllRules';
import OffersDashboard from '../offers/OffersDashboard';
import ConversationsDashboard from '../conversations/ConversationsDashboard';
import dynamic from 'next/dynamic';

const TokenUsageDashboard = dynamic(
  () => import('../tokenUsage/tokenUsageDashboard'),
  { ssr: false }
);

// Define user dashboard sections (matching DashboardSidebar)
interface DashboardSection {
  id: string;
  label: string;
  component: React.ComponentType;
  description: string;
}

const USER_SECTIONS: DashboardSection[] = [
  {
    id: 'offers',
    label: 'Offers',
    component: OffersDashboard,
    description: 'Configure and manage your offer generation settings'
  },
  {
    id: 'leads',
    label: 'Leads',
    component: LeadsDashboard,
    description: 'View all leads and their generated offers'
  },
  {
    id: 'my-conversations',
    label: 'My Conversations',
    component: ConversationsDashboard,
    description: 'View all your chatbot interactions and generated offers'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    component: UserAnalytics,
    description: 'Track your bot\'s performance and user engagement'
  },
  {
    id: 'config',
    label: 'My Setup',
    component: ConfigSummary,
    description: 'Complete overview of your bot configuration'
  },
  {
    id: 'conversations',
    label: 'Conversation Flows',
    component: ConversationEditor,
    description: 'Edit questions, buttons, and flow logic'
  },
  {
    id: 'colors',
    label: 'Colors',
    component: ColorConfig,
    description: 'Customize your bot\'s color theme'
  },
  {
    id: 'advice',
    label: 'Agent Advice',
    component: AgentAdviceDashboard,
    description: 'Manage personalized advice content'
  },
  {
    id: 'Speech upload',
    label: 'Speech Uploader',
    component: AgentAdviceSpeechUploader,
    description: 'Upload your knowledge via script'
  },
  {
    id: 'rules-explanation',
    label: 'Client Situations Explained',
    component: RulesExplanation,
    description: 'Learn how client situations help target advice to different client circumstances'
  },
  {
    id: 'recommended-rules',
    label: 'Recommended Client Situations',
    component: RecommendedRules,
    description: 'AI-generated client situation recommendations based on your flow'
  },
  {
    id: 'view-all-rules',
    label: 'View All Client Situations',
    component: ViewAllRules,
    description: 'View all client situations currently attached to advice in Qdrant'
  },
  {
    id: 'Overview',
    label: 'Getting Started',
    component: WelcomeOverview,
    description: 'Learn how to upload quality data to your bot'
  },
  {
    id: 'token-usage',
    label: 'Token Usage',
    component: TokenUsageDashboard,
    description: 'Track LLM API usage and costs across all features'
  }
];

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  
  // Determine active section (default to 'config' if not specified)
  const activeSection = sectionParam || 'config';
  
  // Log section changes
  useEffect(() => {
    console.log('🟡 [UserDashboard] Active section changed:', activeSection);
    console.log('🟡 [UserDashboard] Section param from URL:', sectionParam);
    console.log('🟡 [UserDashboard] Current pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
  }, [activeSection, sectionParam]);
  
  const currentSection = USER_SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = currentSection?.component;
  
  // Log component selection
  useEffect(() => {
    if (currentSection) {
      console.log('🟡 [UserDashboard] Rendering component:', currentSection.label, currentSection.id);
    } else {
      console.warn('🟡 [UserDashboard] No component found for section:', activeSection);
    }
  }, [currentSection, activeSection]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentSection?.label || 'Dashboard'}
              </h1>
              {currentSection && (
                <p className="text-sm text-slate-400 mt-1">
                  {currentSection.description}
                </p>
              )}
            </div>
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}