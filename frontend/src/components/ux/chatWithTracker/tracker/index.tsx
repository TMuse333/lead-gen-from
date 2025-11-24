// components/tracker/index.tsx – Fully Neural Cyan Themed
'use client';

import { useChatStore, selectUserInput, selectProgress, selectCurrentFlow, ChatState } from '@/stores/chatStore';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AnimatedParticles } from './animatedParticles';
import { Header } from './header';
import { FlowBadge } from './flowBadge';
import { ProgressBar } from './progressBar';
import { AnsweredQuestions } from './answeredQuestions';
import { CurrentInsight } from './currentInsight';
import { DbActivity } from './dbActivity';
import { CompletionModal } from './completionModal';

const selectCurrentInsight = (state: ChatState) => state.currentInsight || '';
const selectDbActivity = (state: ChatState) => state.dbActivity || '';

export default function AnalysisTracker() {
  const userInput = useChatStore(selectUserInput);
  const progress = useChatStore(selectProgress);
  const currentFlow = useChatStore(selectCurrentFlow);
  const currentInsightFromStore = useChatStore(selectCurrentInsight);
  const dbActivityFromStore = useChatStore(selectDbActivity);

  const [currentInsight, setCurrentInsight] = useState("Gathering your information...");
  const [dbActivity, setDbActivity] = useState("Processing your answers...");

  const answersArray = Object.entries(userInput);
  const isComplete = progress >= 100;

  // Glow intensity based on progress (0 → 1)
  const glowIntensity = Math.min(progress / 100, 1);

  useEffect(() => {
    if (currentInsightFromStore) setCurrentInsight(currentInsightFromStore);
  }, [currentInsightFromStore]);

  useEffect(() => {
    if (dbActivityFromStore) setDbActivity(dbActivityFromStore);
  }, [dbActivityFromStore]);

  const formatKey = (key: string): string =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

  const formatValue = (value: string): string => {
    if (value.includes('-') && !value.includes('@')) {
      return value.replace(/-/g, ' - ').replace(' - plus', '+');
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl p-7 overflow-hidden backdrop-blur-xl border"
        style={{
          background: 'rgba(15, 23, 42, 0.75)', // slate-900/75
          borderColor: 'rgba(34, 211, 238, 0.3)', // cyan-400/30
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 ${30 + glowIntensity * 60}px rgba(6, 182, 212, ${0.15 + glowIntensity * 0.4}),
            inset 0 1px 0 rgba(34, 211, 238, 0.1)
          `,
        }}
      >
        {/* Subtle inner glow ring */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(34, 211, 238, ${glowIntensity * 0.3}) 0%, transparent 70%)`,
          }}
        />

        <AnimatedParticles progress={progress} />

        <Header progress={progress} isComplete={isComplete} />
        <FlowBadge currentFlow={currentFlow!} />
        <ProgressBar progress={progress} />

        <AnsweredQuestions 
          userInput={userInput} 
          formatKey={formatKey} 
          formatValue={formatValue} 
        />

        <CurrentInsight currentInsight={currentInsight} />
        <DbActivity 
          dbActivity={dbActivity}
          matchScore={Math.round(progress)}
          itemsFound={answersArray.length}
          progress={progress}
        />
      </motion.div>

      {isComplete && <CompletionModal />}
    </>
  );
}