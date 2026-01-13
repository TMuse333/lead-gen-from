// components/chat/GameChat.tsx – Simplified Chat Component
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './messageBubble';
import ChatExperienceSvg from './ChatExperienceSvg';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';
import { determineTextColorForGradient } from '@/lib/colors/contrastUtils';
import { useChatStore, selectEnabledOffers, selectCurrentIntent } from '@/stores/chatStore';
import { isImportantField } from '@/lib/chat/importantFields';
import { getQuestion } from '@/lib/offers/unified';
import ImportantInfoModal from '../modals/ImportantInfoModal';

interface ChatButton {
  id: string;
  label: string;
  value: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  buttons?: ChatButton[];
}

interface GameChatProps {
  messages: Message[];
  loading: boolean;
  onSend: (message: string) => Promise<void>;
  onButtonClick: (button: ChatButton) => void;
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
  userInput: Record<string, string>;
  currentFlow?: string;
  progress: number;
  currentNodeId?: string;
  isChatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  businessName?: string;
  isContactModalOpen?: boolean;
}

export function GameChat({
  messages,
  loading,
  onSend,
  onButtonClick,
  totalSteps,
  currentStep,
  completedSteps,
  userInput,
  currentFlow,
  progress,
  currentNodeId,
  isChatOpen,
  toggleChat,
  closeChat,
  businessName = 'AI Assistant',
  isContactModalOpen = false,
}: GameChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCompletedRef = useRef(0);
  const [showImportantModal, setShowImportantModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we're expecting text input (last assistant message has no buttons)
  // Don't flash input when contact modal is open
  const lastMessage = messages[messages.length - 1];
  const expectsTextInput = lastMessage?.role === 'assistant' &&
    (!lastMessage.buttons || lastMessage.buttons.length === 0) &&
    !loading &&
    !isContactModalOpen;

  // Auto-focus input when expecting text response
  useEffect(() => {
    if (expectsTextInput && inputRef.current && !showImportantModal) {
      // Small delay to ensure animation starts first
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [expectsTextInput, showImportantModal]);

  // Get current question from unified offer system
  const enabledOffers = useChatStore(selectEnabledOffers);
  const currentIntent = useChatStore(selectCurrentIntent);
  const currentQuestion = (enabledOffers?.length > 0 && currentIntent && currentNodeId)
    ? getQuestion(enabledOffers, currentIntent, currentNodeId)
    : null;

  const isFieldSkipped = useChatStore((s) => s.isFieldSkipped);
  const shouldShowModal = currentQuestion?.mappingKey && 
    isImportantField(currentQuestion.mappingKey) &&
    !userInput[currentQuestion.mappingKey!] &&
    !isFieldSkipped(currentQuestion.mappingKey);
  
  // Show modal when question changes to an important field
  useEffect(() => {
    if (shouldShowModal && currentQuestion) {
      setShowImportantModal(true);
    } else {
      setShowImportantModal(false);
    }
  }, [currentNodeId, shouldShowModal, currentQuestion, userInput, isFieldSkipped]);
  
  // Custom hook to detect mobile screen size dynamically
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      // Function to check screen size
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint is 768px
      };
      
      // Run on mount
      checkScreenSize();
      
      // Listen for window resize events
      window.addEventListener('resize', checkScreenSize);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return isMobile;
  };
  
  const isMobile = useIsMobile();
  
  // Helper to get CSS variable value
  const getCSSVar = (varName: string, fallback: string = '#06b6d4'): string => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  };

  // Inject default theme on mount if CSS variables not already set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingTheme = document.getElementById('bot-color-theme');
      if (!existingTheme) {
        injectColorTheme(DEFAULT_THEME);
      }
    }
  }, []);

  useEffect(() => {
    // Only scroll to bottom when there are actual messages (not on initial mount)
    if (messages.length > 1 && messagesEndRef.current) {
      // Use a small timeout to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, loading, isChatOpen]); 

  useEffect(() => {
    if (completedSteps > prevCompletedRef.current) {
      prevCompletedRef.current = completedSteps;
    }
  }, [completedSteps]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input;
    setInput('');
    await onSend(message);
  };

  const handleButtonClick = (button: ChatButton) => {
    onButtonClick(button);
  };
  
  // Renders the button that opens the chat on mobile
  const MobileChatButton = () => (
    <motion.button
      onClick={toggleChat}
      // Use CSS to hide on desktop, fixed position on mobile
      className="fixed bottom-6 right-6 z-50 p-5 bg-gradient-to-r rounded-full shadow-2xl transition-all md:hidden"
      style={{ 
        background: `linear-gradient(to right, var(--color-gradient-from), var(--color-gradient-to))`,
        boxShadow: '0 0 40px rgba(var(--color-primary-rgb), 0.5)',
        color: determineTextColorForGradient(
          getCSSVar('--color-gradient-from', '#06b6d4'),
          getCSSVar('--color-gradient-to', '#3b82f6')
        ),
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageSquare 
        size={28} 
        style={{ 
          color: determineTextColorForGradient(
            getCSSVar('--color-gradient-from', '#06b6d4'),
            getCSSVar('--color-gradient-to', '#3b82f6')
          ),
        }} 
      />
    </motion.button>
  );


  return (
    <>
      {/* Mobile Chat Button (Show only on mobile, and only when chat is NOT open) */}
      <AnimatePresence>
        {(!isChatOpen && isMobile) && <MobileChatButton />}
      </AnimatePresence>

      {/* Main Chat Content */}
      <div
        className={`flex w-full h-full ${!isChatOpen && isMobile && 'hidden'}`}
      >
        {/* Chat Container */}
        <div className="flex-1 flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-cyan-600/30">
            {/* AI Chat Experience Header - shows only at start */}
            {messages.length <= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center pb-4 mb-2 border-b border-cyan-500/20"
              >
                <ChatExperienceSvg width={280} height={100} />
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <div key={`${msg.timestamp?.getTime()}-${i}`} className="space-y-4">
                <MessageBubble role={msg.role} content={msg.content} index={i} />

                {/* Quick Reply Buttons */}
                {msg.buttons && msg.buttons.length > 0 && i === messages.length - 1 && (
                  <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {msg.buttons.map((btn) => (
                      <motion.button
                        key={btn.id}
                        onClick={() => handleButtonClick(btn)}
                        disabled={loading}
                        className="px-5 py-2.5 bg-gradient-to-r rounded-full font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                        style={{
                          background: `linear-gradient(to right, var(--color-gradient-from), var(--color-gradient-to))`,
                          color: determineTextColorForGradient(
                            getCSSVar('--color-gradient-from', '#06b6d4'),
                            getCSSVar('--color-gradient-to', '#3b82f6')
                          ),
                        }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {btn.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}

            {/* Loading Dots */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                    }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Important Info Modal */}
          {shouldShowModal && currentQuestion && (
            <ImportantInfoModal
              isOpen={showImportantModal}
              mappingKey={currentQuestion.mappingKey || ''}
              question={currentQuestion.text}
              onSubmit={async (value) => {
                setShowImportantModal(false);
                await onSend(value);
              }}
              onSkip={() => {
                const skipField = useChatStore.getState().skipField;
                if (currentQuestion?.mappingKey) {
                  skipField(currentQuestion.mappingKey);
                }
                setShowImportantModal(false);
              }}
              onClose={() => {
                setShowImportantModal(false);
              }}
            />
          )}

          {/* Input Area - Always visible */}
          <div
            className="p-4 border-t backdrop-blur-md"
            style={{
              background: `linear-gradient(to top, rgba(var(--color-background-rgb), 0.95), rgba(var(--color-surface-rgb), 0.8))`,
              borderColor: 'rgba(var(--color-primary-rgb), 0.3)',
            }}
          >
            {shouldShowModal && showImportantModal ? (
              <div className="text-center py-2">
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  Please use the modal above to provide your information
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                  placeholder={expectsTextInput ? "Type your answer here..." : "Type your message..."}
                  className="flex-1 px-5 py-3 border-2 rounded-full focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(var(--color-surface-rgb), 0.8)',
                    color: 'var(--color-text)',
                  }}
                  animate={expectsTextInput ? {
                    borderColor: [
                      'rgba(var(--color-primary-rgb), 0.4)',
                      'var(--color-primary)',
                      'rgba(var(--color-primary-rgb), 0.4)',
                    ],
                    boxShadow: [
                      '0 0 5px rgba(var(--color-primary-rgb), 0.2), 0 0 10px rgba(var(--color-primary-rgb), 0.1)',
                      '0 0 15px rgba(var(--color-primary-rgb), 0.5), 0 0 30px rgba(var(--color-primary-rgb), 0.3), 0 0 45px rgba(var(--color-primary-rgb), 0.15)',
                      '0 0 5px rgba(var(--color-primary-rgb), 0.2), 0 0 10px rgba(var(--color-primary-rgb), 0.1)',
                    ],
                  } : {
                    borderColor: 'rgba(var(--color-primary-rgb), 0.5)',
                    boxShadow: '0 0 0 0 rgba(var(--color-primary-rgb), 0)',
                  }}
                  transition={expectsTextInput ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  } : {
                    duration: 0.2,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.3)';
                  }}
                  onBlur={(e) => {
                    if (!expectsTextInput) {
                      e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.5)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  disabled={loading || !!(shouldShowModal && showImportantModal)}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !!(shouldShowModal && showImportantModal)}
                  className="p-3.5 rounded-full shadow-xl disabled:opacity-50 transition-all"
                  style={{
                    background: `linear-gradient(to right, var(--color-gradient-from), var(--color-gradient-to))`,
                    color: determineTextColorForGradient(
                      getCSSVar('--color-gradient-from', '#06b6d4'),
                      getCSSVar('--color-gradient-to', '#3b82f6')
                    ),
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}