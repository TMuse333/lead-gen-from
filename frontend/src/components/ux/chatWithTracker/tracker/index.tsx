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

// NEW: Selectors for the dynamic tracker values
const selectCurrentInsight = (state: ChatState) => state.currentInsight || '';
const selectDbActivity = (state: ChatState) => state.dbActivity || '';

export default function AnalysisTracker() {
  const userInput = useChatStore(selectUserInput);
  const progress = useChatStore(selectProgress);
  const currentFlow = useChatStore(selectCurrentFlow);
  
  // These now come straight from the button tracker!


  const [showModal, setShowModal] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [itemsFound, setItemsFound] = useState(0);

  const answersArray = Object.entries(userInput);
  const isComplete = progress >= 100; // Now based on real progress from store

  // Glow intensity based on progress
  const glowIntensity = Math.min(progress / 100, 1);
  const currentInsightFromStore = useChatStore(selectCurrentInsight);
  const dbActivityFromStore = useChatStore(selectDbActivity);
  
  const [currentInsight, setCurrentInsight] = useState("Gathering your information...");
  const [dbActivity, setDbActivity] = useState("Processing your answers...");
  // Simulate ongoing DB activity when in progress
  useEffect(() => {
    if (currentInsightFromStore) {
      setCurrentInsight(currentInsightFromStore);
    }
  }, [currentInsightFromStore]);

  useEffect(() => {
    if (dbActivityFromStore) {
      setDbActivity(dbActivityFromStore);
    }
  }, [dbActivityFromStore]);

  // Show completion modal
  useEffect(() => {
    if (isComplete) {
      setShowModal(true);
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCalculationStep(step);
        if (step >= 7) clearInterval(interval);
      }, 600);

      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: string): string => {
    if (value.includes('-') && !value.includes('@')) {
      return value.replace(/-/g, ' - ').replace(' - plus', '+');
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  useEffect(() => {
    console.log('🔍 currentInsight from store:', currentInsightFromStore);
    console.log('🔍 dbActivity from store:', dbActivityFromStore);
  }, [currentInsightFromStore, dbActivityFromStore]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 relative overflow-hidden"
        style={{
          boxShadow: `0 0 ${20 + glowIntensity * 40}px rgba(99, 102, 241, ${0.15 + glowIntensity * 0.35})`
        }}
      >
        <AnimatedParticles progress={progress} />

        <Header progress={progress} isComplete={isComplete} />

        <FlowBadge currentFlow={currentFlow!} />

        <ProgressBar progress={progress} />

        <AnsweredQuestions 
          userInput={userInput} 
          formatKey={formatKey} 
          formatValue={formatValue} 
        />

        {/* Now uses real dynamic insight from button */}
        <CurrentInsight currentInsight={currentInsight } />

        {/* Real DB activity from button, with fallback simulation */}
        <DbActivity 
          dbActivity={dbActivity }
          matchScore={Math.round(matchScore)}
          itemsFound={itemsFound}
          progress={progress}
        />
      </motion.div>

      <CompletionModal 
        showModal={showModal}
        calculationStep={calculationStep}
        answersArray={answersArray}
      />
    </>
  );
}