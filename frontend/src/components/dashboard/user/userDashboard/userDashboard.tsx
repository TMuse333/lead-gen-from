'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LeadsDashboard from '../leads/leadsDashboard';
import OffersDashboard from '../offers/OffersDashboard';
import ConversationsDashboard from '../conversations/ConversationsDashboard';
import SettingsDashboard from '../settings/SettingsDashboard';
import KnowledgeBaseDashboard from '../knowledgeBase/KnowledgeBaseDashboard';
import OverviewDashboard from '../overviewDashboard/OverviewDashboard';

// Define user dashboard sections (matching DashboardSidebar)
interface DashboardSection {
  id: string;
  label: string;
  component: React.ComponentType;
  description: string;
}

const USER_SECTIONS: DashboardSection[] = [
  // Overview (merged: Getting Started + Analytics)
  {
    id: 'overview',
    label: 'Overview',
    component: OverviewDashboard,
    description: 'Getting started guides and performance analytics'
  },
  // Core Features
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
  // Configuration
  {
    id: 'settings',
    label: 'Settings',
    component: SettingsDashboard,
    description: 'Bot configuration, colors, and usage tracking'
  },
  // Knowledge Base (merged into single section with tabs)
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    component: KnowledgeBaseDashboard,
    description: 'Manage advice content, uploads, and client situations'
  }
];

function UserDashboardContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  
  // Determine active section (default to 'overview' if not specified)
  const activeSection = sectionParam || 'overview';

  const currentSection = USER_SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = currentSection?.component;

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

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" /></div>}>
      <UserDashboardContent />
    </Suspense>
  );
}