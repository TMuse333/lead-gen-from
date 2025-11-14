'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
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

export default function ChatWithTracker() {
  const router = useRouter();

  const messages = useChatStore(selectMessages);
  const loading = useChatStore(selectLoading);
  const showTracker = useChatStore(selectShowTracker);
  const userInput = useChatStore(selectUserInput);
  const isComplete = useChatStore(selectIsComplete);
  const currentFlow = useChatStore(selectCurrentFlow);
  const shouldCelebrate = useChatStore((s) => s.shouldCelebrate);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const handleButtonClick = useChatStore((s) => s.handleButtonClick);
  const clearCelebration = useChatStore((s) => s.clearCelebration);
  const resetChat = useChatStore((s) => s.reset);

  const [input, setInput] = useState('');
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const submissionCalledRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Celebration banner
  useEffect(() => {
    if (shouldCelebrate) {
      setShowCelebrationBanner(true);
      setTimeout(() => clearCelebration(), 100);
      setTimeout(() => setShowCelebrationBanner(false), 5000);
    }
  }, [shouldCelebrate, clearCelebration]);

  // Submit to generate-landing-page when complete
  useEffect(() => {
    if (!isComplete) return;
    if (submissionCalledRef.current) return;

    if (!currentFlow) {
      console.warn('Flow not yet selected, waiting...');
      return;
    }

    if (!userInput || Object.keys(userInput).length === 0) {
      console.warn('No answers yet, waiting...');
      return;
    }

    submissionCalledRef.current = true;

    const submitForm = async () => {
      try {
        console.log('🚀 Submitting to generate-landing-page...', { currentFlow, userInput });

        const response = await axios.post('/api/generate-landing-page', {
          flow: currentFlow,
          userInput: userInput,
          agentId: process.env.NEXT_PUBLIC_AGENT_ID || 'default-agent',
        });

        const data = response.data;
        console.log('✅ Landing page generated:', data);

        if (!data.success) {
          console.error('Generation failed:', data.error);
          alert('Failed to generate your page. Please try again.');
          return;
        }

        // Store the result somewhere if needed, or navigate directly
        // You can use a result store here if you want
        
        // Reset chat for next user
        resetChat();

        // Navigate to results page
        router.push('/results');

      } catch (err) {
        console.error('❌ Error generating landing page:', err);
        alert('Error generating your page. Please try again.');
      }
    };

    submitForm();
  }, [isComplete, currentFlow, userInput, resetChat, router]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-4 text-black">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    <p className="font-semibold text-blue-900">🎉 Analysis Started!</p>
                    <p className="text-sm text-blue-700">I'm building your personalized report</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, i) => (
            <motion.div 
              key={`${msg.timestamp?.getTime()}-${i}`} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-3"
            >
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.content}
                </div>
              </div>
              {msg.buttons?.length && i === messages.length - 1 && (
                <div className="flex flex-wrap gap-2">
                  {msg.buttons.map((btn) => (
                    <button 
                      key={btn.id} 
                      onClick={() => handleButtonClick(btn)} 
                      disabled={loading} 
                      className="px-4 py-2 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Or type your own message..."
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || loading} 
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="w-full lg:w-80 shrink-0">
        <AnimatePresence mode="wait">
          {showTracker ? (
            <motion.div 
              key="tracker" 
              initial={{ opacity: 0, x: 50, scale: 0.9 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }} 
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
            >
              <AnalysisTracker />
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder" 
              className="hidden lg:flex h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center p-8"
            >
              <p className="text-center text-gray-400">Your analysis will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}