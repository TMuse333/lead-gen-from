'use client';
import { useState } from 'react';
import AgentAdviceUploader from './agentAdviceUploader';
import ViewAgentAdvice from './viewAgentAdvice';
import { List, PlusCircle, Sparkles, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import DocumentExtractor from '../documentExtractor';

export default function AgentAdviceDashboard() {
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'document'>('view');
  const [autoPopulating, setAutoPopulating] = useState(false);
  const [autoPopulateResult, setAutoPopulateResult] = useState<{ success: boolean; message?: string; summary?: any } | null>(null);
  
  // Check if we're in development mode
  // In Next.js, NODE_ENV is available in client components but replaced at build time
  // For safety, we'll also check the hostname
  const isDevelopment = typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const handleAutoPopulate = async () => {
    if (!confirm('This will add ~20 pre-written real estate advice items to your knowledge base. Continue?')) {
      return;
    }

    try {
      setAutoPopulating(true);
      setAutoPopulateResult(null);
      
      const response = await axios.post('/api/agent-advice/auto-populate');
      
      if (response.data.success) {
        setAutoPopulateResult({
          success: true,
          message: response.data.message,
          summary: response.data.summary,
        });
        // Refresh the view if we're on the view tab
        if (activeTab === 'view') {
          // Trigger a refresh by switching tabs and back
          setActiveTab('add');
          setTimeout(() => setActiveTab('view'), 100);
        }
      } else {
        setAutoPopulateResult({
          success: false,
          message: response.data.error || 'Failed to auto-populate',
        });
      }
    } catch (error: any) {
      console.error('Error auto-populating:', error);
      setAutoPopulateResult({
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to auto-populate knowledge base',
      });
    } finally {
      setAutoPopulating(false);
    }
  };

  return (
    // Updated background and base text color
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Auto-Populate Button (Development Only) */}
        {isDevelopment && (
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-amber-200 font-semibold">Development Mode: Auto-Populate</h3>
                  <p className="text-amber-200/70 text-sm">
                    Quickly add ~20 pre-written real estate advice items to your knowledge base
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoPopulate}
                disabled={autoPopulating}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
              >
                {autoPopulating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Populating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Auto-Populate Knowledge Base
                  </>
                )}
              </button>
            </div>
            
            {/* Result Message */}
            {autoPopulateResult && (
              <div className={`mt-4 p-3 rounded-lg ${
                autoPopulateResult.success 
                  ? 'bg-green-900/30 border border-green-500/30' 
                  : 'bg-red-900/30 border border-red-500/30'
              }`}>
                <p className={autoPopulateResult.success ? 'text-green-300' : 'text-red-300'}>
                  {autoPopulateResult.message}
                </p>
                {autoPopulateResult.summary && (
                  <p className="text-sm text-green-200/70 mt-1">
                    Added {autoPopulateResult.summary.successful} of {autoPopulateResult.summary.total} items
                  </p>
                )}
              </div>
            )}
          </div>
        )}

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
            <button
              onClick={() => setActiveTab('document')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition ${
                // Updated active and inactive tab colors
                activeTab === 'document'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <FileText size={20} />
              Extract from Document
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'view' && <ViewAgentAdvice
          onSwitchToAdd={()=>setActiveTab('add')}
          />}
          {activeTab === 'add' && <AgentAdviceUploader />}
          {activeTab === 'document' && (
            <DocumentExtractor
              onComplete={() => {
                // Refresh view after upload
                setActiveTab('view');
                // Trigger refresh by switching tabs
                setTimeout(() => {
                  const event = new Event('refresh-advice-list');
                  window.dispatchEvent(event);
                }, 100);
              }}
              onCancel={() => setActiveTab('view')}
            />
          )}
        </div>
      </div>
    </div>
  );
}