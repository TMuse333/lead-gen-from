// components/chat/GameChat.tsx – Neural Cyan Theme Edition (Final Toggleable, with Close Button)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X } from 'lucide-react'; 
import { useState, useRef, useEffect } from 'react';
import { RewardSystem } from './rewardSystem';
import { MessageBubble } from './messageBubble';
import { IntegratedTracker } from './integratedTracker';
import AnalysisTracker from '../tracker';
import { AnalysisTrackerBar } from '../tracker/trackerbar';

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
  isChatOpen: boolean; 
  toggleChat: () => void; 
  closeChat: () => void; 
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
  isChatOpen, 
  toggleChat,
  closeChat,
}: GameChatProps) {
  const [input, setInput] = useState('');
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCompletedRef = useRef(0);
  
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


  useEffect(() => {
    // Scroll to bottom when messages or loading state changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isChatOpen]); 

  useEffect(() => {
    if (completedSteps > prevCompletedRef.current) {
      setRewardTrigger((prev) => prev + 1);
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
      className="fixed bottom-6 right-6 z-50 p-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 transition-all md:hidden"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageSquare size={28} className="text-white" />
    </motion.button>
  );


  return (
    <>
      {/* 1. Mobile Chat Button (Show only on mobile, and only when chat is NOT open) */}
      <AnimatePresence>
        {(!isChatOpen && isMobile) && <MobileChatButton />}
      </AnimatePresence>
      
      {/* 2. Main Chat Content - Hidden on mobile if not open, always visible on desktop */}
      <div 
        // Hide the full chat container when closed on mobile, but keep it flex on desktop
        className={`flex gap-6 w-full mx-auto h-full ${!isChatOpen && isMobile && 'hidden'} ${!isMobile && 'md:flex'}`}
      >
        {/* <RewardSystem trigger={rewardTrigger} /> */}

        {/* Chat Container – LEFT */}
        <motion.div
          className="flex-1 md:max-w-xl bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-cyan-500/30 md:h-[700px] flex flex-col ring-1 ring-cyan-400/20 relative" 
          // Mobile: Full screen/height. Desktop: fixed height
          style={isChatOpen && isMobile ? { height: '100vh', width: '100vw', borderRadius: 0 } : {}}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Close Button (Desktop & Mobile Header) */}
          
          {/* Desktop Close Button (Top right corner) */}
          <motion.button
              onClick={closeChat}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 transition-colors hidden md:block" 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} />
          </motion.button>
          
          {/* Mobile Header/Close Button */}
          <div className="md:hidden flex justify-between items-center p-4 bg-slate-900/90 border-b border-cyan-700/40">
            <h3 className="text-lg font-bold text-cyan-400">Game Chat</h3> 
            <motion.button
              onClick={closeChat}
              className="p-2 rounded-full bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-cyan-600/30">
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
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:shadow-xl disabled:opacity-50 transition-all"
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
                    className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-gradient-to-t from-slate-900/90 to-slate-800/70 border-t border-cyan-700/40 backdrop-blur-md
          flex flex-col">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-5 py-3.5 bg-slate-800/80 border border-cyan-600/50 rounded-full text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                disabled={loading}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-full shadow-xl shadow-cyan-500/40 disabled:opacity-50 hover:shadow-cyan-400/60 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <Send size={22} className="text-white" />
              </motion.button>
            </div>
            <AnalysisTrackerBar />
          </div>
        </motion.div>

        {/* Tracker – RIGHT (Desktop Only) */}
        <div className="w-80 hidden md:block flex-shrink-0">
          <AnalysisTracker />
        </div>
      </div>
    </>
  );
}