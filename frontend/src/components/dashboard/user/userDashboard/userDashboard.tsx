'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import HomeDashboard from '../home/HomeDashboard';
import LeadsDashboard from '../leads/leadsDashboard';
import SettingsDashboard from '../settings/SettingsDashboard';
import KnowledgeBaseDashboard from '../knowledgeBase/KnowledgeBaseDashboard';
import TimelineDashboard from '../timeline/TimelineDashboard';
import FeedbackDashboard from '../feedback/FeedbackDashboard';

// Define user dashboard sections (matching DashboardSidebar)
interface DashboardSection {
  id: string;
  label: string;
  component: React.ComponentType;
  description: string;
}

const USER_SECTIONS: DashboardSection[] = [
  // Home - Guide and quick stats
  {
    id: 'home',
    label: 'Home',
    component: HomeDashboard,
    description: 'Setup guide and quick stats'
  },
  // Stories - Knowledge base content
  {
    id: 'stories',
    label: 'Stories',
    component: KnowledgeBaseDashboard,
    description: 'Add client stories and expert advice'
  },
  // Timeline - Direct timeline configuration
  {
    id: 'timeline',
    label: 'Timeline',
    component: TimelineDashboard,
    description: 'Configure your chatbot timeline'
  },
  // Leads - Combined leads and conversations
  {
    id: 'leads',
    label: 'Leads',
    component: LeadsDashboard,
    description: 'View leads and conversations'
  },
  // Settings - Profile, branding, preferences
  {
    id: 'settings',
    label: 'Settings',
    component: SettingsDashboard,
    description: 'Profile, branding, and preferences'
  },
  // Feedback - MVP feedback collection
  {
    id: 'feedback',
    label: 'Feedback',
    component: FeedbackDashboard,
    description: 'Help us improve with your feedback'
  }
];

function UserDashboardContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  
  // Determine active section (default to 'home' if not specified)
  const activeSection = sectionParam || 'home';

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