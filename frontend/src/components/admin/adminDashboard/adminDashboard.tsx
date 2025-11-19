'use client';

import { useState } from 'react';
import { BookOpen, MessageSquare, Settings, LayoutGrid, ArrowLeft, Home,
Mic } from 'lucide-react';
import ConversationEditor from '../conversationEditor/conversationEditor';
import AgentAdviceDashboard from '../adviceDashboard/agentAdviceDashboard';
import logo from '../../../../public/logo.png'
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/landingPage/navbar';
import WelcomeOverview from '../overview/overview';
import AgentAdviceSpeechUploader from '../agentSpeechUploader/agentSpeechUploader';


// Define admin sections for easy scaling
const ADMIN_SECTIONS = [
    {
        id:'Overview',
        label:'Overview',
        icon:Home,
        component:WelcomeOverview,
        description:'Overview of the dashboard'
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
    id:'Speech upload',
    label:'Speech uploader',
    icon:Mic,
    component:AgentAdviceSpeechUploader,
    description:'Upload your knowledge via script'
  }
 
  // Easy to add more sections later:
  // {
  //   id: 'analytics',
  //   label: 'Analytics',
  //   icon: BarChart3,
  //   component: AnalyticsDashboard,
  //   description: 'View conversion metrics'
  // },
] as const;

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('conversations');

  const currentSection = ADMIN_SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = currentSection?.component;

  return (
    <div className="min-h-screen bg-slate-900">
        <Navbar/>
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
            <Image
            className='h-12 w-12 object-contain'
            src={logo}
            width={600}
            height={600}
            alt='logo'
 />
 <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
 <Link
        href="/"                     // ← change to "/bot" if that’s your actual route
        className="group flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to bot</span>
      </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1">
              {ADMIN_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Section Description Bar */}
      {currentSection && (
        <div className="bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-slate-400">
              {currentSection.description}
            </p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="relative">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}