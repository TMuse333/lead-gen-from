'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Settings, LayoutGrid, ArrowLeft, Home,
Mic, FileText, Eye, ExternalLink, Palette, BarChart3, Menu, X, Users, Target, Sparkles, DollarSign } from 'lucide-react';
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
import { useUserConfig } from '@/contexts/UserConfigContext';
import dynamic from 'next/dynamic';

const TokenUsageDashboard = dynamic(
  () => import('../tokenUsage/tokenUsageDashboard'),
  { ssr: false }
);


// Define user dashboard sections
const USER_SECTIONS = [
    {
        id:'config',
        label:'My Setup',
        icon:FileText,
        component:ConfigSummary,
        description:'Complete overview of your bot configuration'
    },
    {
        id:'analytics',
        label:'Analytics',
        icon:BarChart3,
        component:UserAnalytics,
        description:'Track your bot\'s performance and user engagement'
    },
    {
        id:'leads',
        label:'Leads',
        icon:Users,
        component:LeadsDashboard,
        description:'View all leads and their generated offers'
    },
    {
        id:'Overview',
        label:'Getting Started',
        icon:Home,
        component:WelcomeOverview,
        description:'Learn how to upload quality data to your bot'
    },
  {
    id: 'conversations',
    label: 'Conversation Flows',
    icon: MessageSquare,
    component: ConversationEditor,
    description: 'Edit questions, buttons, and flow logic'
  },
  {
    id: 'advice',
    label: 'Agent Advice',
    icon: BookOpen,
    component: AgentAdviceDashboard,
    description: 'Manage personalized advice content'
  },
  {
    id: 'colors',
    label: 'Colors',
    icon: Palette,
    component: ColorConfig,
    description: 'Customize your bot\'s color theme'
  },
  {
    id:'Speech upload',
    label:'Speech uploader',
    icon:Mic,
    component:AgentAdviceSpeechUploader,
    description:'Upload your knowledge via script'
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
  },
  {
    id: 'token-usage',
    label: 'Token Usage',
    icon: DollarSign,
    component: TokenUsageDashboard,
    description: 'Track LLM API usage and costs across all features'
  }
];

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState<string>('config');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { config } = useUserConfig();
  
  // Handle URL search params for section navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && USER_SECTIONS.find(s => s.id === section)) {
        setActiveSection(section);
      }
    }
  }, []);

  const currentSection = USER_SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = currentSection?.component;
  
  const botUrl = config?.businessName ? `/bot/${config.businessName}` : null;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-slate-800 border-r border-slate-700 transition-all duration-300 flex-shrink-0
        fixed h-screen z-40 lg:relative lg:z-auto
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
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

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {USER_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }
                `}
                title={sidebarOpen ? undefined : section.label}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{section.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* See Your Bot Live Button */}
        {botUrl && sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <Link
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg w-full justify-center"
            >
              <Eye size={18} />
              <span>See Your Bot Live</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
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