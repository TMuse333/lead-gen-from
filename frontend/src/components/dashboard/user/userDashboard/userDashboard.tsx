'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, MessageSquare, Settings, LayoutGrid, ArrowLeft, Home,
Mic, FileText, Eye, ExternalLink, Palette, BarChart3, Menu, X, Users, Target, Sparkles, DollarSign, Gift } from 'lucide-react';
import ConversationEditor from '../conversationEditor/conversationEditor';
import AgentAdviceDashboard from '../adviceDashboard/agentAdviceDashboard';
import logo from '../../../../../public/logo.png'
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/landingPage/navbar';
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
import { OfferEditor } from '../offers/editor/OfferEditor';
import { useUserConfig } from '@/contexts/UserConfigContext';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import dynamic from 'next/dynamic';

const TokenUsageDashboard = dynamic(
  () => import('../tokenUsage/tokenUsageDashboard'),
  { ssr: false }
);


// Define user dashboard sections organized by category
interface DashboardSection {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
  description: string;
}

interface SectionGroup {
  title: string;
  sections: DashboardSection[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Core Features',
    sections: [
      {
        id: 'offers',
        label: 'Offers',
        icon: Gift,
        component: OffersDashboard,
        description: 'Configure and manage your offer generation settings'
      },
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        component: LeadsDashboard,
        description: 'View all leads and their generated offers'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        component: UserAnalytics,
        description: 'Track your bot\'s performance and user engagement'
      }
    ]
  },
  {
    title: 'Configuration',
    sections: [
      {
        id: 'config',
        label: 'My Setup',
        icon: FileText,
        component: ConfigSummary,
        description: 'Complete overview of your bot configuration'
      },
      {
        id: 'conversations',
        label: 'Conversation Flows',
        icon: MessageSquare,
        component: ConversationEditor,
        description: 'Edit questions, buttons, and flow logic'
      },
      {
        id: 'colors',
        label: 'Colors',
        icon: Palette,
        component: ColorConfig,
        description: 'Customize your bot\'s color theme'
      }
    ]
  },
  {
    title: 'Knowledge Base',
    sections: [
      {
        id: 'advice',
        label: 'Agent Advice',
        icon: BookOpen,
        component: AgentAdviceDashboard,
        description: 'Manage personalized advice content'
      },
      {
        id: 'Speech upload',
        label: 'Speech Uploader',
        icon: Mic,
        component: AgentAdviceSpeechUploader,
        description: 'Upload your knowledge via script'
      },
      {
        id: 'rules-explanation',
        label: 'Client Situations Explained',
        icon: Target,
        component: RulesExplanation,
        description: 'Learn how client situations help target advice to different client circumstances'
      },
      {
        id: 'recommended-rules',
        label: 'Recommended Client Situations',
        icon: Sparkles,
        component: RecommendedRules,
        description: 'AI-generated client situation recommendations based on your flow'
      },
      {
        id: 'view-all-rules',
        label: 'View All Client Situations',
        icon: Target,
        component: ViewAllRules,
        description: 'View all client situations currently attached to advice in Qdrant'
      }
    ]
  },
  {
    title: 'Resources',
    sections: [
      {
        id: 'Overview',
        label: 'Getting Started',
        icon: Home,
        component: WelcomeOverview,
        description: 'Learn how to upload quality data to your bot'
      }
    ]
  },
  {
    title: 'Advanced',
    sections: [
      {
        id: 'token-usage',
        label: 'Token Usage',
        icon: DollarSign,
        component: TokenUsageDashboard,
        description: 'Track LLM API usage and costs across all features'
      }
    ]
  }
];

// Flatten sections for easy lookup
const USER_SECTIONS: DashboardSection[] = SECTION_GROUPS.flatMap(group => group.sections);

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { config } = useUserConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Derive state from URL - single source of truth
  const offerParam = searchParams.get('offer') as OfferType | null;
  const sectionParam = searchParams.get('section');
  
  // Determine active section (default to 'config' if not specified)
  const activeSection = sectionParam || 'config';
  
  // Determine if we're editing an offer
  const editingOfferType = offerParam;
  
  const currentSection = USER_SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = currentSection?.component;
  
  // Handle back from offer editor
  const handleBackFromEditor = () => {
    router.push('/dashboard?section=offers');
  };
  
  const botUrl = config?.businessName ? `/bot/${config.businessName}` : null;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar - Fixed positioning */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-slate-800 border-r border-slate-700 transition-all duration-300 flex-shrink-0
        fixed top-0 left-0 h-screen z-40 lg:z-auto
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Image
                className='h-8 w-8 object-contain'
                src={logo}
                width={32}
                height={32}
                alt='logo'
              />
              <h2 className="text-lg font-bold text-white">Dashboard</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation - Scrollable with sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-6">
            {SECTION_GROUPS.map((group, groupIndex) => (
              <div key={group.title} className="space-y-2">
                {/* Section Header */}
                {sidebarOpen && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}
                
                {/* Section Items */}
                <div className="space-y-1">
                  {group.sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          // Simply navigate to the section - URL is source of truth
                          router.push(`/dashboard?section=${section.id}`);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }
                        `}
                        title={sidebarOpen ? undefined : section.label}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        {sidebarOpen && (
                          <span className="truncate">{section.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* See Your Bot Live Button - Fixed at bottom */}
        {botUrl && sidebarOpen && (
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <Link
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg w-full justify-center text-sm"
            >
              <Eye size={18} />
              <span>See Your Bot Live</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content - Add left margin/padding to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {editingOfferType 
                    ? `${editingOfferType.toUpperCase()} Offer Editor`
                    : currentSection?.label || 'Dashboard'
                  }
                </h1>
                {currentSection && !editingOfferType && (
                  <p className="text-sm text-slate-400 mt-1">
                    {currentSection.description}
                  </p>
                )}
                {editingOfferType && (
                  <p className="text-sm text-slate-400 mt-1">
                    Customize settings, test generation, and view analytics
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
          {editingOfferType ? (
            <OfferEditor 
              offerType={editingOfferType} 
              onBack={handleBackFromEditor}
            />
          ) : (
            ActiveComponent && <ActiveComponent />
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}