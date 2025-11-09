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
  selectExtractedAnswers, 
  selectIsComplete
} from '@/stores/chatStore';
import AnalysisTracker from './analysisTracker';
import { useFlowResultStore } from '@/stores/flowResultStore';
import { ExtractedAnswer, FlowAnalysisOutput } from '@/types';

interface ChatWithTrackerProps {
  onComplete?: (answers: ExtractedAnswer[]) => void;
}

export default function ChatWithTracker({ onComplete }: ChatWithTrackerProps) {
  const router = useRouter();

  const messages = useChatStore(selectMessages);
  const loading = useChatStore(selectLoading);
  const showTracker = useChatStore(selectShowTracker);
  const extractedAnswers = useChatStore(selectExtractedAnswers);
  const isComplete = useChatStore(selectIsComplete);
  const shouldCelebrate = useChatStore((s) => s.shouldCelebrate);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const handleButtonClick = useChatStore((s) => s.handleButtonClick);
  const clearCelebration = useChatStore((s) => s.clearCelebration);
  const resetChat = useChatStore((s) => s.reset);

  const currentFlow = useChatStore((s) => s.currentFlow);

  const [input, setInput] = useState('');
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const submissionCalledRef = useRef(false); // ensure submission only once

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

  // ✅ Trigger onComplete when chat is complete
  useEffect(() => {
    if (!isComplete) return;
    if (submissionCalledRef.current) return;

    if (!currentFlow) {
      console.warn('Flow not yet selected, waiting...');
      return;
    }

    if (!extractedAnswers || extractedAnswers.length === 0) {
      console.warn('No answers yet, waiting...');
      return;
    }

    submissionCalledRef.current = true;

    const submitForm = async () => {
      try {
        console.log('Submitting chat answers to backend...', { currentFlow, extractedAnswers });

        const response = await axios.post('/api/submit-form', {
          answers: extractedAnswers,
          flow: currentFlow,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        });

        const data = response.data;
        console.log('Backend response:', data);

        if (!data.success) {
          console.error('Submission failed:', data.error);
          alert('Submission failed. Please try again.');
          return;
        }

        // Build the result object for the FlowResultStore
        // const result: FlowAnalysisOutput = {
        //   flowType: data.flowType,
        //   analysis: data.analysis,
        //   comparableHomes: data.comparableHomes,
        //   marketTrends: data.marketTrends,
        //   agentAdvice: data.agentAdvice,
        //   // formConfig: data.formConfig,
        //   leadId: data.leadId,
        //   generatedAt: new Date(),
        // };

        // useFlowResultStore.getState().setResult(result,currentFlow);

        // Optionally trigger any parent callback
        if (onComplete) onComplete(extractedAnswers);

        // Reset chat for next user
        resetChat();

        // Navigate to results page
        router.push('/results');

      } catch (err) {
        console.error('Error submitting form::', err);
        alert('Error submitting form. Please try again.');
      }
    };

    submitForm();
  }, [isComplete, currentFlow, extractedAnswers, onComplete, resetChat, router]);

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
                    <p className="text-sm text-blue-700">I'm building your personalized home valuation report</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, i) => (
            <motion.div key={`${msg.timestamp?.getTime()}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {msg.content}
                </div>
              </div>
              {msg.buttons?.length && i === messages.length - 1 && (
                <div className="flex flex-wrap gap-2">
                  {msg.buttons.map((btn) => (
                    <button key={btn.id} onClick={() => handleButtonClick(btn)} disabled={loading} className="px-4 py-2 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition">
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {loading && <div className="text-gray-500">Loading...</div>}
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
              className="flex-1 px-4 py-3 border rounded-xl"
              disabled={loading}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-blue-600 text-white p-3 rounded-xl">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="w-full lg:w-80 shrink-0">
        <AnimatePresence mode="wait">
          {showTracker ? (
            <motion.div key="tracker" initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }}>
              <AnalysisTracker />
            </motion.div>
          ) : (
            <motion.div key="placeholder" className="hidden lg:flex h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center p-8">
              <p className="text-center text-gray-400">Your analysis will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
