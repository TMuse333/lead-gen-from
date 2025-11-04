// components/ChatWithTracker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useChatStore, selectMessages, selectLoading, selectShowTracker } from '@/stores/chatStore';
import AnalysisTracker from '../conversationalForm/analysisTracker';

interface ChatWithTrackerProps {
  onComplete?: (answers: any[]) => void;
}

export default function ChatWithTracker({ onComplete }: ChatWithTrackerProps) {
  const messages = useChatStore(selectMessages);
  const loading = useChatStore(selectLoading);
  const showTracker = useChatStore(selectShowTracker);
  const shouldCelebrate = useChatStore((state) => state.shouldCelebrate);
  const extractedAnswers = useChatStore((state) => state.extractedAnswers);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const handleButtonClick = useChatStore((state) => state.handleButtonClick);
  const clearCelebration = useChatStore((state) => state.clearCelebration);
  
  const [input, setInput] = useState('');
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log(messages)
  }, [messages]);

  // Check completion
  useEffect(() => {
    if (extractedAnswers.length >= 6 && onComplete) {
      setTimeout(() => onComplete(extractedAnswers), 1000);
    }
  }, [extractedAnswers.length, onComplete]);

  // Handle celebration banner (one-time display)
  useEffect(() => {
    if (shouldCelebrate) {
      setShowCelebrationBanner(true);
      // Clear the flag after showing
      setTimeout(() => {
        clearCelebration();
      }, 100);
      // Hide banner after 5 seconds
      setTimeout(() => {
        setShowCelebrationBanner(false);
      }, 5000);
    }
  }, [shouldCelebrate, clearCelebration]);

  const handleSend = async () => {
    const message = input;
    if (!message.trim()) return;
    
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="text-black flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-4">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* One-time celebration banner at top */}
          <AnimatePresence>
            {showCelebrationBanner && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 sticky top-0 z-10"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="text-blue-600" size={24} />
                  <div>
                    <p className="font-semibold text-blue-900">
                      🎉 Analysis Started!
                    </p>
                    <p className="text-sm text-blue-700">
                      I'm building your personalized home valuation report
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.timestamp?.getTime()}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Message bubble */}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.content ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <p className="text-gray-500 italic">Loading...</p>
                  )}
                </div>
              </div>

              {/* Button options */}
              {msg.buttons && msg.buttons.length > 0 && i === messages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2"
                >
                  {msg.buttons.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleButtonClick(btn)}
                      disabled={loading}
                      className="px-4 py-2 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition font-medium text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {btn.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Or type your own message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Tracker Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <AnimatePresence mode="wait">
          {showTracker ? (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                    '0 10px 15px -3px rgba(59, 130, 246, 0.5)',
                    '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: 2 }}
              >
                <AnalysisTracker />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:flex h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center p-8"
            >
              <div className="text-center text-gray-400">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Your analysis will appear here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}