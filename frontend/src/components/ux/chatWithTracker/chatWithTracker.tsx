// components/chatWithTracker.tsx - SIMPLIFIED VERSION
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useChatStore,
  selectMessages,
  selectLoading,
  selectShowTracker,
  selectUserInput,
  selectIsComplete,
  selectCurrentFlow,
  selectCurrentIntent,
  selectProgress,
  selectEnabledOffers,
  selectSelectedOffer,
  selectShowContactModal
} from '@/stores/chatStore';

import { GameChat } from './chat/gameChat';
import { Loader2 } from 'lucide-react';
import { injectColorTheme, getTheme } from '@/lib/colors/colorUtils';
import { getQuestionCount, getQuestion, type OfferType } from '@/lib/offers/unified';
import { ContactCollectionModal, ContactRetriggerButton, type ContactData } from './modals/ContactCollectionModal';
import { GenerationLoadingOverlay, GENERATION_STEPS } from './components/GenerationLoadingOverlay';

// Analytics tracking for contact collection
interface ContactAnalytics {
  firstAttemptShown: boolean;
  firstAttemptCompleted: boolean;
  skippedCount: number;
  retryCompleted: boolean;
}

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
  const currentIntent = useChatStore(selectCurrentIntent);
  const selectedOffer = useChatStore(selectSelectedOffer);
  const progress = useChatStore(selectProgress);
  const currentNodeId = useChatStore((s) => s.currentNodeId);
  const enabledOffers = useChatStore(selectEnabledOffers);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const handleButtonClick = useChatStore((s) => s.handleButtonClick);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput);
  const resetChat = useChatStore((s) => s.reset);
  const setDebugInfo = useChatStore((s) => s.setDebugInfo);
  const conversationId = useChatStore((s) => s.conversationId);
  const updateConversation = useChatStore((s) => s.updateConversation);
  const updateInitialMessage = useChatStore((s) => s.updateInitialMessage);
  // Modal state from store - triggered when reaching a question with triggersContactModal flag
  const storeShowContactModal = useChatStore(selectShowContactModal);
  const setStoreShowContactModal = useChatStore((s) => s.setShowContactModal);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [hasSkippedContact, setHasSkippedContact] = useState(false);
  const [contactMessageSent, setContactMessageSent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('config');
  const [generationPercent, setGenerationPercent] = useState<number>(0);
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const submissionCalledRef = useRef(false);
  const clientConfigLoadedRef = useRef(false);
  const contactAnalyticsRef = useRef<ContactAnalytics>({
    firstAttemptShown: false,
    firstAttemptCompleted: false,
    skippedCount: 0,
    retryCompleted: false,
  });
  
  // Handlers for chat toggle
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const closeChat = () => setIsChatOpen(false);

  // Load client config and colors if provided
  useEffect(() => {
    if (clientConfig && !clientConfigLoadedRef.current) {
      // Store client identifier and config for API calls and UI
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('clientId', clientConfig.businessName);
        sessionStorage.setItem('businessName', clientConfig.businessName);
        sessionStorage.setItem('clientQdrantCollection', clientConfig.qdrantCollectionName);
        sessionStorage.setItem('selectedOffers', JSON.stringify(clientConfig.selectedOffers || []));

        // Update the initial message with the loaded config
        updateInitialMessage();
      }

      // Inject color theme CSS variables
      const theme = getTheme(clientConfig.colorConfig);
      injectColorTheme(theme);

      // Store color theme for results page
      if (typeof window !== 'undefined' && clientConfig.colorConfig) {
        localStorage.setItem('colorThemeCache', JSON.stringify(clientConfig.colorConfig));
      }

      clientConfigLoadedRef.current = true;
    }
  }, [clientConfig, updateInitialMessage]);

  // Initialize on mount
  useEffect(() => {
    // If client config is provided, wait for it to load
    if (clientConfig && !clientConfigLoadedRef.current) {
      return;
    }

    // Inject default theme if no client config (for default bot)
    if (!clientConfig && typeof window !== 'undefined') {
      const { DEFAULT_THEME } = require('@/lib/colors/defaultTheme');
      injectColorTheme(DEFAULT_THEME);
    }

    setIsInitialized(true);
  }, [clientConfig]);

  // Calculate dynamic steps from unified offer system
  const totalSteps = (enabledOffers?.length > 0 && currentIntent)
    ? getQuestionCount(enabledOffers, currentIntent)
    : 6;
  const completedSteps = Object.keys(userInput).length;
  const currentStep = completedSteps < totalSteps ? completedSteps : totalSteps - 1;

  // Add a bot message asking for contact info
  const addContactRequestMessage = useCallback(() => {
    if (contactMessageSent) return;

    const { addMessage } = useChatStore.getState();
    addMessage({
      role: 'assistant',
      content: "Great job answering all the questions! 🎉 Before I generate your personalized results, I just need a few quick details so we can connect you with the right expert.",
      timestamp: new Date(),
    });
    setContactMessageSent(true);
  }, [contactMessageSent]);

  // Watch for store's showContactModal flag (triggered when reaching a question with triggersContactModal)
  // This is the NEW flow - modal shows BEFORE isComplete, when the email question is reached
  useEffect(() => {
    if (storeShowContactModal && !showContactModal && !hasSkippedContact) {
      // Add the bot message first
      addContactRequestMessage();
      // Small delay to let message render, then show modal
      setTimeout(() => {
        setShowContactModal(true);
        // Track analytics - first attempt
        contactAnalyticsRef.current.firstAttemptShown = true;
      }, 500);
    }
  }, [storeShowContactModal, showContactModal, hasSkippedContact, addContactRequestMessage]);

  // Show contact modal when chat is complete
  // Use intent (new system) with flow as fallback (legacy)
  const effectiveIntent = currentIntent || currentFlow;

  useEffect(() => {
    // Early exit conditions - prevent race conditions
    if (!isComplete) {
      return;
    }

    if (submissionCalledRef.current) {
      return;
    }

    if (isGenerating) {
      return;
    }

    if (showContactModal) {
      return;
    }

    if (hasSkippedContact) {
      return;
    }

    // Check for intent OR flow (support both new and legacy systems)
    if (!effectiveIntent || !userInput || Object.keys(userInput).length === 0) {
      return;
    }

    // Check if all required contact info is already collected (name + email)
    if (userInput.contactName && userInput.contactEmail) {
      submissionCalledRef.current = true;
      startGeneration({
        name: userInput.contactName,
        email: userInput.contactEmail,
        phone: userInput.contactPhone || '',
      });
    } else {
      // Add the bot message first
      addContactRequestMessage();
      // Small delay to let message render, then show modal
      setTimeout(() => {
        setShowContactModal(true);
        // Track analytics - first attempt
        contactAnalyticsRef.current.firstAttemptShown = true;
      }, 800);
    }
  }, [isComplete, currentIntent, currentFlow, effectiveIntent, selectedOffer, userInput, isGenerating, showContactModal, hasSkippedContact, addContactRequestMessage]);

  // Handle contact submission from modal
  const handleContactSubmit = useCallback((contact: ContactData) => {
    setShowContactModal(false);
    setStoreShowContactModal(false); // Reset store flag
    submissionCalledRef.current = true;

    // Track analytics
    if (!contactAnalyticsRef.current.firstAttemptCompleted && contactAnalyticsRef.current.skippedCount === 0) {
      contactAnalyticsRef.current.firstAttemptCompleted = true;
    } else if (contactAnalyticsRef.current.skippedCount > 0) {
      contactAnalyticsRef.current.retryCompleted = true;
    }

    // Add contact info to userInput using addAnswer for each field
    const { addAnswer, setComplete } = useChatStore.getState();
    addAnswer('contactName', contact.name);
    addAnswer('contactEmail', contact.email);
    if (contact.phone) {
      addAnswer('contactPhone', contact.phone);
    }
    // Also keep 'email' for backwards compatibility with generation
    addAnswer('email', contact.email);

    // Mark as complete since contact was the final step
    setComplete(true);

    startGeneration(contact);
  }, [setStoreShowContactModal]);

  // Handle skip from contact modal
  const handleContactSkip = useCallback(() => {
    setShowContactModal(false);
    setStoreShowContactModal(false); // Reset store flag
    setHasSkippedContact(true);

    // Track skip analytics
    contactAnalyticsRef.current.skippedCount += 1;

    // Add a message letting user know they can complete it later
    const { addMessage } = useChatStore.getState();
    addMessage({
      role: 'assistant',
      content: "No worries! When you're ready to get your personalized results, just click the button below. 👇",
      timestamp: new Date(),
    });
  }, [setStoreShowContactModal]);

  // Handle re-trigger of contact modal
  const handleContactRetrigger = useCallback(() => {
    setHasSkippedContact(false);
    setShowContactModal(true);
  }, []);

  // Start generation with SSE
  const startGeneration = useCallback(async (contact: ContactData) => {
    setIsGenerating(true);
    setGenerationStep('config');
    setGenerationPercent(0);
    setGenerationMessage('');
    setGenerationError(null);

    try {
      // Read fresh values from store to avoid stale closure issues
      const storeState = useChatStore.getState();
      const freshIntent = storeState.currentIntent || storeState.currentFlow;
      const freshOffer = storeState.selectedOffer || storeState.enabledOffers?.[0];
      const freshUserInput = storeState.userInput;
      const freshConversationId = storeState.conversationId;

      if (!freshIntent) {
        throw new Error('No intent/flow selected. Please complete the conversation first.');
      }

      if (!freshOffer) {
        throw new Error('No offer selected. The chatbot did not set selectedOffer in the store.');
      }

      const clientId = typeof window !== 'undefined'
        ? sessionStorage.getItem('clientId')
        : null;

      const requestBody: any = {
        intent: freshIntent,
        offer: freshOffer,
        flow: freshIntent, // backwards compatibility
        userInput: {
          ...freshUserInput,
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          email: contact.email,
        },
        conversationId: freshConversationId || undefined,
      };

      if (clientId) {
        requestBody.clientId = clientId;
        requestBody.clientIdentifier = clientId;
      }

      // Use fetch for SSE
      const response = await fetch('/api/offers/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // Handle progress events
              if (data.step) {
                setGenerationStep(data.step);
              }
              if (data.percent !== undefined) {
                setGenerationPercent(data.percent);
              }
              if (data.message) {
                setGenerationMessage(data.message);
              }

              // Handle error events
              if (data.error) {
                throw new Error(data.error);
              }

              // Handle complete event (final data)
              if (data._debug !== undefined || (!data.step && !data.error && Object.keys(data).length > 0)) {
                const { _debug, ...llmOutput } = data;

                // Store results
                localStorage.setItem("llmResultsCache", JSON.stringify(llmOutput));
                if (_debug) {
                  localStorage.setItem("llmDebugCache", JSON.stringify(_debug));
                }

                setLlmOutput(llmOutput);
                if (_debug) setDebugInfo(_debug);

                // Update conversation status
                if (freshConversationId) {
                  try {
                    await updateConversation({ status: 'completed', progress: 100 });
                  } catch (e) {
                    console.warn('Failed to update conversation status:', e);
                  }
                }

                // Brief pause on complete step before redirect
                setGenerationStep('complete');
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Reset and redirect
                resetChat();
                window.location.href = '/results';
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError);
            }
          }
        }
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Unknown error occurred');
      setIsGenerating(false);
      submissionCalledRef.current = false;
    }
    // Dependencies are minimal since we read fresh values from store directly
  }, [setLlmOutput, setDebugInfo, updateConversation, resetChat]);

  // Handle retry from error overlay
  const handleRetry = useCallback(() => {
    setGenerationError(null);
    setIsGenerating(true);
    setGenerationStep('config');
    submissionCalledRef.current = false;

    // Read fresh values from store to avoid stale closure issues
    const freshUserInput = useChatStore.getState().userInput;

    // Check if we have contact info to retry with
    if (freshUserInput.contactEmail && freshUserInput.contactName) {
      startGeneration({
        name: freshUserInput.contactName,
        email: freshUserInput.contactEmail,
        phone: freshUserInput.contactPhone || '',
      });
    } else {
      setShowContactModal(true);
      setIsGenerating(false);
    }
  }, [startGeneration]);

  // Handle go back from error overlay
  const handleGoBack = useCallback(() => {
    setGenerationError(null);
    setIsGenerating(false);
    submissionCalledRef.current = false;
  }, []);

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

  const businessName = clientConfig?.businessName || 'AI Assistant';

  return (
    <>
      {/* Full-Screen Container */}
      <div
        id='chatbot-container'
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Simple Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{
            backgroundColor: 'rgba(var(--color-background-rgb), 0.95)',
            borderColor: 'rgba(var(--color-primary-rgb), 0.3)',
          }}
        >
          {/* Left: Business Name */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))',
                color: 'var(--color-text-on-gradient)',
              }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-lg" style={{ color: 'var(--color-text-on-background)' }}>{businessName}</span>
          </div>

          {/* Right: Progress */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-32 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
                  }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                {progress}%
              </span>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.parent.postMessage({ type: 'close-iframe' }, '*');
                }
              }}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
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
              currentNodeId={currentNodeId}
              isChatOpen={true}
              toggleChat={toggleChat}
              closeChat={closeChat}
              businessName={businessName}
            />
          </div>

          {/* Side Panel - Progress Tracker (Desktop Only) */}
          <div
            className="hidden lg:flex w-80 flex-col border-l"
            style={{
              backgroundColor: 'rgba(var(--color-background-rgb), 0.5)',
              borderColor: 'rgba(var(--color-primary-rgb), 0.2)',
            }}
          >
            {/* Progress Header */}
            <div className="p-4 border-b" style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.2)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-on-background)' }}>Your Progress</h3>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
                    }}
                  />
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {progress}%
                </span>
              </div>
            </div>

            {/* Collected Info */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-on-background-dim)' }}>
                Information Collected
              </h4>
              {Object.keys(userInput).length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-on-background-dim)' }}>Answer questions to see your progress...</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(userInput).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                    >
                      <div className="text-xs capitalize mb-1" style={{ color: 'var(--color-text-on-background-dim)' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm truncate" style={{ color: 'var(--color-text-on-background)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Insight */}
            {useChatStore.getState().currentInsight && (
              <div
                className="p-4 border-t"
                style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.2)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <span className="text-xs font-medium uppercase" style={{ color: 'var(--color-text-on-background-dim)' }}>AI Insight</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-on-background)' }}>
                  {useChatStore.getState().currentInsight}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Collection Modal - Mandatory for all offers */}
      <ContactCollectionModal
        isOpen={showContactModal}
        onSubmit={handleContactSubmit}
        onSkip={handleContactSkip}
        businessName={businessName}
        requiredFields={{ name: true, email: true, phone: false }}
        allowSkip={true}
      />

      {/* Re-trigger button shown after user skips contact collection */}
      {hasSkippedContact && !isGenerating && !showContactModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <ContactRetriggerButton onClick={handleContactRetrigger} />
        </div>
      )}

      {/* Generation Loading Overlay with Progress */}
      <GenerationLoadingOverlay
        isVisible={isGenerating || !!generationError}
        currentStep={generationStep}
        steps={GENERATION_STEPS}
        error={generationError}
        onRetry={handleRetry}
        onGoBack={handleGoBack}
        percent={generationPercent}
        message={generationMessage}
      />
    </>
  );
}