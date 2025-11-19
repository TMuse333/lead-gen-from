// components/AnalysisTracker/AnalysisTrackerBar.tsx
'use client';

import { motion } from 'framer-motion';
import { useChatStore, selectProgress, selectCurrentFlow, selectUserInput } from '@/stores/chatStore';
import { Trophy, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const FLOW_MESSAGES = {
  buy: [
    "Analyzing your budget & timeline...",
    "Searching active listings in your areas...",
    "Matching you with successful buyer journeys...",
    "Finding financing options that fit you...",
    "Personalizing your home search strategy...",
  ],
  sell: [
    "Evaluating your property details...",
    "Pulling recent comparable sales...",
    "Matching with high-equity sellers like you...",
    "Optimizing pricing & timing recommendations...",
    "Building your custom selling plan...",
  ],
  browse: [
    "Detecting your market interests...",
    "Scanning neighborhood trends...",
    "Finding investment-grade opportunities...",
    "Curating insights based on your behavior...",
    "Preparing your personalized market overview...",
  ],
};

const FINAL_MESSAGE = "Personalization complete! Generating your page...";

export function AnalysisTrackerBar() {
  const progress = useChatStore(selectProgress);
  const currentFlow = useChatStore(selectCurrentFlow);
  const userInput = useChatStore(selectUserInput);

  const [currentMessage, setCurrentMessage] = useState("Initializing AI analysis...");
  const [prevAnswerCount, setPrevAnswerCount] = useState(0);

  const answerCount = Object.keys(userInput).length;

  useEffect(() => {
    // Only trigger when a new answer is added
    if (answerCount > prevAnswerCount && currentFlow) {
      const messages = FLOW_MESSAGES[currentFlow as keyof typeof FLOW_MESSAGES] || FLOW_MESSAGES.buy;
      const messageIndex = Math.min(answerCount - 1, messages.length - 1);
      
      setCurrentMessage(messages[messageIndex]);
      setPrevAnswerCount(answerCount);
    }

    // Final message when complete
    if (progress >= 100) {
      setCurrentMessage(FINAL_MESSAGE);
    }
  }, [answerCount, currentFlow, progress, prevAnswerCount]);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="from-cyan-400 via-blue-500 to-cyan-600 p-4 shadow-2xl">
        <div className="flex items-center justify-between text-white">
          {/* Left: Flow + Progress + Dynamic Message */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold text-sm">
                {currentFlow 
                  ? `${currentFlow.charAt(0).toUpperCase() + currentFlow.slice(1)} Journey`
                  : 'Analyzing...'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-bold">
                {Math.round(progress)}%
              </span>
              <motion.span
                key={currentMessage} // triggers animation on change
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs opacity-90 max-w-[240px] truncate"
              >
                {currentMessage}
              </motion.span>
            </div>
          </div>

          {/* Right: Circular Progress + Icon */}
          <div className="relative">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28" cy="28" r="24"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="7"
                fill="none"
              />
              <motion.circle
                cx="28" cy="28" r="24"
                stroke="white"
                strokeWidth="7"
                fill="none"
                strokeDasharray="150.8"
                initial={{ strokeDashoffset: 150.8 }}
                animate={{ strokeDashoffset: 150.8 * (1 - progress / 100) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {progress >= 100 ? (
                <Trophy className="h-8 w-8 text-yellow-300" />
              ) : (
                <Zap className="h-6 w-6 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}