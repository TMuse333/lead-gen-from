'use client';
import { useState } from 'react';
import AgentAdviceUploader from './agentAdviceUploader';
import ViewAgentAdvice from './viewAgentAdvice';
import { List, PlusCircle } from 'lucide-react';

export default function AgentAdviceDashboard() {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              View Advice
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
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