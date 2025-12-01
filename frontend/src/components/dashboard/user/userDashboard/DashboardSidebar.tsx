'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, MessageSquare, Settings, Home,
Mic, FileText, Eye, ExternalLink, Palette, BarChart3, Menu, X, Users, Target, Sparkles, DollarSign, Gift, Code } from 'lucide-react';
import logo from '../../../../../public/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { useUserConfig } from '@/contexts/UserConfigContext';

// Define user dashboard sections organized by category
interface DashboardSection {
  id: string;
  label: string;
  icon: any;
  href?: string; // Optional href for external navigation
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
        description: 'Configure and manage your offer generation settings'
      },
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        description: 'View all leads and their generated offers'
      },
      {
        id: 'my-conversations',
        label: 'My Conversations',
        icon: MessageSquare,
        description: 'View all your chatbot interactions and generated offers'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
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
        description: 'Complete overview of your bot configuration'
      },
      {
        id: 'conversations',
        label: 'Conversation Flows',
        icon: MessageSquare,
        description: 'Edit questions, buttons, and flow logic'
      },
      {
        id: 'colors',
        label: 'Colors',
        icon: Palette,
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
        description: 'Manage personalized advice content'
      },
      {
        id: 'Speech upload',
        label: 'Speech Uploader',
        icon: Mic,
        description: 'Upload your knowledge via script'
      },
      {
        id: 'rules-explanation',
        label: 'Client Situations Explained',
        icon: Target,
        description: 'Learn how client situations help target advice to different client circumstances'
      },
      {
        id: 'recommended-rules',
        label: 'Recommended Client Situations',
        icon: Sparkles,
        description: 'AI-generated client situation recommendations based on your flow'
      },
      {
        id: 'view-all-rules',
        label: 'View All Client Situations',
        icon: Target,
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
        description: 'Track LLM API usage and costs across all features'
      },
      {
        id: 'llm-routes',
        label: 'LLM Routes',
        icon: Code,
        href: '/dashboard/llm-routes',
        description: 'Visual overview of all API routes that use LLM services'
      }
    ]
  }
];

// Flatten sections for easy lookup
const USER_SECTIONS: DashboardSection[] = SECTION_GROUPS.flatMap(group => group.sections);

export function DashboardSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { config } = useUserConfig();
  
  // Determine active section based on pathname
  const getActiveSection = (): string => {
    // Check if we're on LLM routes page
    if (pathname === '/dashboard/llm-routes') {
      return 'llm-routes';
    }
    
    // Check if we're on conversation detail route
    const conversationMatch = pathname.match(/\/dashboard\/conversations\/([^/]+)/);
    if (conversationMatch) {
      console.log('🟡 [DashboardSidebar] Detected conversation detail route, active section: my-conversations');
      return 'my-conversations'; // Highlight "My Conversations" when viewing details
    }
    
    // Check if we're on offer editor route
    const offerMatch = pathname.match(/\/dashboard\/offers\/([^/]+)/);
    if (offerMatch) {
      console.log('🟡 [DashboardSidebar] Detected offer editor route, active section: offers');
      return 'offers'; // Highlight "Offers" when editing
    }
    
    // Check if we're on main dashboard
    if (pathname === '/dashboard') {
      const section = searchParams.get('section');
      console.log('🟡 [DashboardSidebar] On main dashboard, section param:', section || 'config (default)');
      return section || 'config'; // Default to config
    }
    
    console.log('🟡 [DashboardSidebar] Unknown pathname, defaulting to config:', pathname);
    return 'config';
  };
  
  const activeSection = getActiveSection();
  
  // Log sidebar state changes
  useEffect(() => {
    console.log('🟡 [DashboardSidebar] Pathname:', pathname);
    console.log('🟡 [DashboardSidebar] Active section:', activeSection);
    console.log('🟡 [DashboardSidebar] Search params:', searchParams.toString());
  }, [pathname, activeSection, searchParams]);
  
  const botUrl = config?.businessName ? `/bot/${config.businessName}` : null;

  return (
    <>
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
            {SECTION_GROUPS.map((group) => (
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
                    
                    // If section has href, use Link, otherwise use button with router
                    if (section.href) {
                      return (
                        <Link
                          key={section.id}
                          href={section.href}
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
                        </Link>
                      );
                    }
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

