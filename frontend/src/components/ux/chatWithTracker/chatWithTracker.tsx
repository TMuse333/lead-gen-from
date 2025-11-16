// components/chatWithTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  useChatStore, 
  selectMessages, 
  selectLoading, 
  selectShowTracker, 
  selectUserInput, 
  selectIsComplete,
  selectCurrentFlow
} from '@/stores/chatStore';
import AnalysisTracker from './analysisTracker';
import { FastTrackButton } from './fastTrackButton';
import { GameChat } from './components/gameChat';
;

const TOTAL_QUESTIONS = 6;

export default function ChatWithTracker() {
  const router = useRouter();

  const messages = useChatStore(selectMessages);
  const loading = useChatStore(selectLoading);
  const showTracker = useChatStore(selectShowTracker);
  const userInput = useChatStore(selectUserInput);
  const isComplete = useChatStore(selectIsComplete);
  const currentFlow = useChatStore(selectCurrentFlow);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const handleButtonClick = useChatStore((s) => s.handleButtonClick);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput);
  const resetChat = useChatStore((s) => s.reset);
  const setDebugInfo = useChatStore((s) => s.setDebugInfo);

  const submissionCalledRef = useRef(false);

  // Calculate progress from userInput
  const answersArray = Object.entries(userInput);
  const completedSteps = answersArray.length;
  const currentStep = completedSteps < TOTAL_QUESTIONS ? completedSteps : TOTAL_QUESTIONS - 1;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <FastTrackButton />

      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Game Chat */}
        <div className="flex-1">
        <GameChat
  messages={messages}
  loading={loading}
  onSend={sendMessage}
  onButtonClick={handleButtonClick}
  totalSteps={TOTAL_QUESTIONS}
  currentStep={currentStep}
  completedSteps={completedSteps}
  userInput={userInput}
  currentFlow={currentFlow!}
  progress={(completedSteps / TOTAL_QUESTIONS) * 100} // ADD THIS
/>
        </div>

        {/* Analysis Tracker - Side Panel */}
        {/* {showTracker && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <AnalysisTracker />
          </div>
        )} */}
      </div>
    </div>
  );
}