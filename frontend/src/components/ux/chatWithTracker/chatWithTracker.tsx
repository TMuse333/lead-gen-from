// components/chatWithTracker.tsx - TOGGLEABLE MOBILE VERSION
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

import { GameChat } from './chat/gameChat';
import { Loader2 } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store';

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
  const configHydrated = useConversationStore((s) => s.hydrated);
  const getFlow = useConversationStore((s) => s.getFlow);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // NEW: State for chat open/close
  const submissionCalledRef = useRef(false);
  
  // Handlers for chat toggle
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const closeChat = () => setIsChatOpen(false);

  // DEBUG: Log every time isComplete changes
  useEffect(() => {
    console.log('🔄 isComplete changed to:', isComplete);
  }, [isComplete]);

  // Initialize: Wait for hydration + run migration once
  useEffect(() => {
    if (!configHydrated) return;

    // Check if migration already ran
    const migrated = localStorage.getItem('flows-migrated');
    
    if (!migrated) {
      console.log('🔄 Running conversation flows migration...');
      try {
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
    console.log('🔍 Submission useEffect triggered:');
    console.log('   - isComplete:', isComplete);
    console.log('   - currentFlow:', currentFlow);
    console.log('   - userInput length:', Object.keys(userInput).length);
    console.log('   - submissionCalled:', submissionCalledRef.current);
    
    if (!isComplete) {
      console.log('❌ Not complete yet - skipping');
      return;
    }
    
    if (submissionCalledRef.current) {
      console.log('❌ Already submitted - skipping');
      return;
    }
    
    if (!currentFlow || !userInput || Object.keys(userInput).length === 0) {
      console.log('❌ Missing flow or userInput - skipping');
      return;
    }

    console.log('✅ ALL CHECKS PASSED - Calling API now!');
    submissionCalledRef.current = true;
    closeChat(); // Close chat on successful submission

    const submitFastResults = async () => {
      try {
        console.log('🚀 Fast-tracking results via /api/test-component...', { 
          currentFlow, 
          userInput 
        });
        
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-purple-600">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg font-medium">Loading conversation flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
    id='chatbot-container'
    // Desktop: standard flow. Mobile: fixed/full-screen when open, or just a button.
    className={`
      md:relative md:min-h-screen md:py-8 md:px-4 md:text-black
      ${isChatOpen ? 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-0 text-black' : 'relative'}
    `}
    >
      <div className="flex gap-6 w-full items-center justify-center md:max-w-7xl mx-auto h-full">
        {/* Game Chat */}
        <div className="flex-1 justify-center items-center h-full">
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
            isChatOpen={isChatOpen} // NEW: Pass state to GameChat
            toggleChat={toggleChat} // NEW: Pass handler to GameChat
            closeChat={closeChat} // NEW: Pass handler to GameChat
          />
        </div>
      </div>
    </div>
  );
}