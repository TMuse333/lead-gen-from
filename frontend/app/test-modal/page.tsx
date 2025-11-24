"use client";

import { useChatStore, selectProgress } from '@/stores/chatStore';
import { CompletionModal } from '@/components/ux/chatWithTracker/tracker/completionModal';

export default function TestModalPage() {
  const setProgress = useChatStore((s) => s.setProgress);
  const addAnswer = useChatStore((s) => s.addAnswer);
  const resetChat = useChatStore((s) => s.reset);
  const progress = useChatStore(selectProgress);
  const isComplete = progress >= 100;

  const triggerModal = () => {
    // Reset first
    resetChat();
    
    // Add some sample user input
    addAnswer('propertyType', 'house');
    addAnswer('budget', '500000');
    addAnswer('location', 'downtown');
    addAnswer('timeline', '3-months');
    addAnswer('experience', 'first-time');
    
    // Set progress to 100% to trigger modal
    setProgress(100);
  };

  return (
    <main className="min-h-screen bg-[#0a1525] flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Test Completion Modal
          </h1>
          <p className="text-cyan-200/70">
            Click the button below to trigger the completion modal
          </p>
          <p className="text-cyan-300/50 text-sm mt-2">
            Progress: {progress}% | Complete: {isComplete ? 'Yes' : 'No'}
          </p>
        </div>
        
        <button
          onClick={triggerModal}
          className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50"
        >
          Show Completion Modal
        </button>

        <button
          onClick={() => {
            resetChat();
            setProgress(0);
          }}
          className="w-full px-6 py-3 bg-slate-700 text-cyan-200 rounded-lg font-medium hover:bg-slate-600 transition-all"
        >
          Reset
        </button>

        {/* Conditionally render the modal */}
        {/* {isComplete && <CompletionModal />} */}
        <CompletionModal/>
      </div>
    </main>
  );
}

