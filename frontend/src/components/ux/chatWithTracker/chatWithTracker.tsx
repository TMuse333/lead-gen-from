// components/chatWithTracker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  useChatStore, 
  selectMessages, 
  selectLoading, 
  selectShowTracker, 
  selectUserInput, 
  selectIsComplete,
  selectCurrentFlow,
  selectProgress
} from '@/stores/chatStore';
import { useConversationConfigStore } from '@/stores/conversationConfigStore';
import { migrateExistingFlows } from '@/lib/convert/migrateConversationFlows';

import { GameChat } from './chat/gameChat';
import { Loader2 } from 'lucide-react';

export default function ChatWithTracker() {
  const router = useRouter();

  // Chat store selectors
  const messages = useChatStore(selectMessages);
  const loading = useChatStore(selectLoading);
  const showTracker = useChatStore(selectShowTracker);
  const userInput = useChatStore(selectUserInput);
  const isComplete = useChatStore(selectIsComplete);
  const currentFlow = useChatStore(selectCurrentFlow);
  const progress = useChatStore(selectProgress);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const handleButtonClick = useChatStore((s) => s.handleButtonClick);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput);
  const resetChat = useChatStore((s) => s.reset);
  const setDebugInfo = useChatStore((s) => s.setDebugInfo);

  // Config store
  const configHydrated = useConversationConfigStore((s) => s.hydrated);
  const getFlow = useConversationConfigStore((s) => s.getFlow);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const submissionCalledRef = useRef(false);

  // Initialize: Wait for hydration + run migration once
  useEffect(() => {
    if (!configHydrated) return;

    // Check if migration already ran
    const migrated = localStorage.getItem('flows-migrated');
    
    if (!migrated) {
      console.log('🔄 Running conversation flows migration...');
      try {
        migrateExistingFlows();
        localStorage.setItem('flows-migrated', 'true');
        console.log('✅ Migration complete!');
      } catch (error) {
        console.error('❌ Migration failed:', error);
      }
    }

    setIsInitialized(true);
  }, [configHydrated]);

  // Calculate dynamic steps from current flow
  const currentFlowData = currentFlow ? getFlow(currentFlow) : null;
  const totalSteps = currentFlowData?.questions.length || 6;
  const completedSteps = Object.keys(userInput).length;
  const currentStep = completedSteps < totalSteps ? completedSteps : totalSteps - 1;

  // Submit to API when chat is complete
  useEffect(() => {
    if (!isComplete) return;
    if (submissionCalledRef.current) return;
    if (!currentFlow || !userInput || Object.keys(userInput).length === 0) return;

    submissionCalledRef.current = true;

    const submitFastResults = async () => {
      try {
        console.log('🚀 Fast-tracking results via /api/test-component...', { currentFlow, userInput });
        
        const { data } = await axios.post("/api/test-component", {
          flow: currentFlow,
          userInput,
        });
        
        console.log('✅ Results generated!', data);
        
        // Separate debug info from actual data
        const { _debug, ...llmOutput } = data;
        
        // Store LLM output in Zustand
        setLlmOutput(llmOutput);
        
        // Store debug info in Zustand (if it exists)
        if (_debug) {
          setDebugInfo(_debug);
          localStorage.setItem("llmDebugCache", JSON.stringify(_debug));
          console.log('📊 Debug info stored:', _debug);
        }
        
        // Cache to localStorage
        localStorage.setItem("llmResultsCache", JSON.stringify(llmOutput));
        
        // Reset chat for next user
        resetChat();
        
        // Go straight to results
        router.push('/results');
      } catch (err: any) {
        console.error('❌ Fast track failed:', err);
        alert(`Error: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        submissionCalledRef.current = false; // allow retry
      }
    };

    submitFastResults();
  }, [isComplete, currentFlow, userInput, setLlmOutput, resetChat, router, setDebugInfo]);

  // Loading state while Zustand hydrates
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-purple-600">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg font-medium">Loading conversation flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Game Chat */}
        <div className="flex-1">
          <GameChat
            messages={messages}
            loading={loading}
            onSend={sendMessage}
            onButtonClick={handleButtonClick}
            totalSteps={totalSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            userInput={userInput}
            currentFlow={currentFlow || undefined}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
}