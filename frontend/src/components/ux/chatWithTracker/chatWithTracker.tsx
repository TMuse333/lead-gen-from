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
import { injectColorTheme, getTheme } from '@/lib/colors/colorUtils';

interface ClientConfig {
  id: string;
  businessName: string;
  industry: string;
  dataCollection: string[];
  selectedIntentions: string[];
  selectedOffers: string[];
  customOffer?: string;
  conversationFlows: Record<string, any>;
  colorConfig?: any; // ColorTheme
  qdrantCollectionName: string;
  isActive: boolean;
  onboardingCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatWithTrackerProps {
  clientConfig?: ClientConfig;
}

export default function ChatWithTracker({ clientConfig }: ChatWithTrackerProps = {}) {
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
  const conversationId = useChatStore((s) => s.conversationId);
  const updateConversation = useChatStore((s) => s.updateConversation);

  // Config store
  const configHydrated = useConversationStore((s) => s.hydrated);
  const getFlow = useConversationStore((s) => s.getFlow);
  const loadClientFlows = useConversationStore((s) => s.loadClientFlows);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // NEW: State for chat open/close
  const submissionCalledRef = useRef(false);
  const clientConfigLoadedRef = useRef(false);
  
  // Handlers for chat toggle
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const closeChat = () => setIsChatOpen(false);

  // DEBUG: Log every time isComplete changes
  useEffect(() => {
    console.log('🔄 isComplete changed to:', isComplete);
  }, [isComplete]);

  // Load client config flows and colors if provided
  useEffect(() => {
    if (clientConfig && !clientConfigLoadedRef.current && configHydrated) {
      console.log('🔄 Loading client configuration flows...', {
        businessName: clientConfig.businessName,
        flows: Object.keys(clientConfig.conversationFlows),
      });
      
      // Store client identifier for API calls
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('clientId', clientConfig.businessName);
        sessionStorage.setItem('clientQdrantCollection', clientConfig.qdrantCollectionName);
      }
      
      // Load client's flows into conversation store
      loadClientFlows(clientConfig.conversationFlows);
      
      // Inject color theme CSS variables
      const theme = getTheme(clientConfig.colorConfig);
      injectColorTheme(theme);
      
      clientConfigLoadedRef.current = true;
      console.log('✅ Client flows and colors loaded');
    }
  }, [clientConfig, configHydrated, loadClientFlows]);

  // Initialize: Wait for hydration + run migration once
  useEffect(() => {
    if (!configHydrated) return;

    // If client config is provided, skip default migration
    if (clientConfig) {
      setIsInitialized(true);
      return;
    }

    // Inject default theme if no client config (for default bot)
    if (!clientConfig && typeof window !== 'undefined') {
      const { DEFAULT_THEME } = require('@/lib/colors/defaultTheme');
      injectColorTheme(DEFAULT_THEME);
    }

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
  }, [configHydrated, clientConfig]);

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
        console.log('🚀 Fast-tracking results via /api/generation/generate-offer...', { 
          currentFlow, 
          userInput 
        });
        
        // Include client identifier if available (for public bots)
        const clientId = typeof window !== 'undefined' 
          ? sessionStorage.getItem('clientId') 
          : null;
        
        const requestBody: any = {
          flow: currentFlow,
          userInput,
          conversationId: conversationId || undefined,
        };
        
        if (clientId) {
          requestBody.clientId = clientId;
        }
        
        const { data } = await axios.post("/api/generation/generate-offer", requestBody, {
          params: clientId ? { client: clientId } : {},
        });
        
        console.log('✅ Results generated!', data);
        
        // Check if response has an error
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Validate that data has at least some components (flexible for different flows)
        const componentKeys = Object.keys(data).filter(key => 
          key !== '_debug' && 
          data[key] !== null && 
          data[key] !== undefined && 
          typeof data[key] === 'object'
        );
        
        if (componentKeys.length === 0) {
          console.error('❌ Invalid response structure - no components found:', data);
          throw new Error('API returned invalid data. No components found.');
        }
        
        console.log('✅ Valid response with components:', componentKeys);
        
        // Separate debug info from actual data
        const { _debug, ...llmOutput } = data;
        
        // Store to localStorage FIRST (more reliable than Zustand for cross-page navigation)
        try {
          localStorage.setItem("llmResultsCache", JSON.stringify(llmOutput));
          console.log('✅ Results cached to localStorage');
        } catch (cacheErr) {
          console.error('⚠️ Error caching to localStorage:', cacheErr);
          throw new Error('Failed to cache results. Please try again.');
        }
        
        // Store debug info to localStorage
        if (_debug) {
          try {
            localStorage.setItem("llmDebugCache", JSON.stringify(_debug));
            console.log('📊 Debug info stored in localStorage:', _debug);
          } catch (debugErr) {
            console.error('⚠️ Error storing debug info:', debugErr);
            // Non-critical, continue
          }
        }
        
        // Store LLM output in Zustand (for immediate access if on same page)
        try {
          setLlmOutput(llmOutput);
          console.log('✅ LLM output stored in Zustand');
        } catch (storeErr) {
          console.error('⚠️ Error storing in Zustand (non-critical):', storeErr);
          // Non-critical since we have localStorage
        }
        
        // Store debug info in Zustand (if it exists)
        if (_debug) {
          try {
            setDebugInfo(_debug);
            console.log('📊 Debug info stored in Zustand');
          } catch (debugErr) {
            console.error('⚠️ Error storing debug info in Zustand:', debugErr);
            // Non-critical, continue
          }
        }

        // Update conversation status to completed
        if (conversationId) {
          try {
            await updateConversation({
              status: 'completed',
              progress: 100,
            });
            console.log('✅ Conversation marked as completed');
          } catch (convErr) {
            console.error('⚠️ Error updating conversation status:', convErr);
            // Non-critical, continue
          }
        }
        
        // Reset chat for next user
        resetChat();
        
        // Longer delay to ensure localStorage is written and state is set
        // This is critical for slower devices/networks
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Navigate to results page
        // Using window.location for more reliable navigation across different browsers
        window.location.href = '/results';
      } catch (err: any) {
        console.error('❌ Fast track failed:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          userInput,
          currentFlow,
          stack: err.stack,
        });
        
        // Log to console with full context for debugging
        const errorDetails = {
          timestamp: new Date().toISOString(),
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          userInput,
          currentFlow,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        };
        console.error('📋 Full error context:', JSON.stringify(errorDetails, null, 2));
        
        // Show user-friendly error message
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
        alert(`Error generating results: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
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