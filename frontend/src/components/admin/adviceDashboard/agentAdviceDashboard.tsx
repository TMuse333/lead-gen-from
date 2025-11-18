'use client';
import { useState } from 'react';
import AgentAdviceUploader from './agentAdviceUploader';
import ViewAgentAdvice from './viewAgentAdvice';
import { List, PlusCircle } from 'lucide-react';

export default function AgentAdviceDashboard() {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

  return (
    // Updated background and base text color
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Tab Navigation */}
        {/* Updated card background and border */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6 overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                // Updated active and inactive tab colors
                activeTab === 'view'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <List size={20} />
              View Advice
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                // Updated active and inactive tab colors
                activeTab === 'add'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <PlusCircle size={20} />
              Add New
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'view' && <ViewAgentAdvice
          onSwitchToAdd={()=>setActiveTab('add')}
          />}
          {activeTab === 'add' && <AgentAdviceUploader />}
        </div>
      </div>
    </div>
  );
}