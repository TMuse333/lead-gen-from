'use client';

import { useChatStore, selectUserInput, selectProgress, selectCurrentFlow } from '@/stores/chatStore';
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

const TOTAL_QUESTIONS = 6;

// Simulated insights that appear based on user answers
const DYNAMIC_INSIGHTS = {
  sell: [
    "🏠 Analyzing your property type...",
    "📊 Searching 1,247 comparable sales...",
    "💡 Found 3 expert tips for your timeline",
    "🎯 Matching with similar seller journeys...",
    "✨ Personalizing your action plan..."
  ],
  buy: [
    "🔍 Analyzing your budget range...",
    "🏘️ Searching 892 active listings...",
    "💰 Found 4 financing strategies for you",
    "🎯 Matching with successful buyers...",
    "✨ Crafting your home search plan..."
  ],
  browse: [
    "📈 Analyzing market trends...",
    "🌍 Exploring neighborhood data...",
    "📊 Found 5 investment opportunities",
    "🎯 Understanding your interests...",
    "✨ Curating personalized insights..."
  ]
};

// Random "database" activity messages
const DB_MESSAGES = [
  "Querying vector database...",
  "Matching semantic patterns...",
  "Retrieving expert advice...",
  "Analyzing rule conditions...",
  "Computing relevance scores...",
  "Filtering 2,847 documents...",
  "Running similarity search...",
  "Aggregating insights..."
];

export default function AnalysisTracker() {
  const userInput = useChatStore(selectUserInput);
  const progress = useChatStore(selectProgress);
  const currentFlow = useChatStore(selectCurrentFlow);
  const [showModal, setShowModal] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);
  const [currentInsight, setCurrentInsight] = useState('');
  const [dbActivity, setDbActivity] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [itemsFound, setItemsFound] = useState(0);

  const answersArray = Object.entries(userInput);
  const isComplete = answersArray.length >= TOTAL_QUESTIONS;

  // Glow intensity based on progress
  const glowIntensity = Math.min(progress / 100, 1);

  // Show insights as user progresses
  useEffect(() => {
    if (answersArray.length > 0 && currentFlow) {
      const insights = DYNAMIC_INSIGHTS[currentFlow as keyof typeof DYNAMIC_INSIGHTS] || [];
      const insightIndex = Math.min(answersArray.length - 1, insights.length - 1);
      
      setTimeout(() => {
        setCurrentInsight(insights[insightIndex]);
      }, 300);
    }
  }, [answersArray.length, currentFlow]);

  // Simulate database activity
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const interval = setInterval(() => {
        const randomMsg = DB_MESSAGES[Math.floor(Math.random() * DB_MESSAGES.length)];
        setDbActivity(randomMsg);
        
        // Simulate increasing match score
        setMatchScore(prev => Math.min(prev + Math.random() * 5, 95));
        
        // Simulate finding items
        setItemsFound(prev => prev + Math.floor(Math.random() * 3));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [progress]);

  // Show modal when complete
  useEffect(() => {
    if (isComplete) {
      setShowModal(true);
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCalculationStep(step);
        if (step >= 7) {
          clearInterval(interval);
        }
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
      return value.replace('-', ' - ');
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 relative overflow-hidden"
        style={{
          boxShadow: `0 0 ${20 + glowIntensity * 30}px rgba(59, 130, 246, ${0.1 + glowIntensity * 0.3})`
        }}
      >
        <AnimatedParticles progress={progress} />

        <Header progress={progress} isComplete={isComplete} />

        <FlowBadge currentFlow={currentFlow!} />

        <ProgressBar progress={progress} />

        <AnsweredQuestions userInput={userInput} formatKey={formatKey} formatValue={formatValue} />

        <CurrentInsight currentInsight={currentInsight} />

        <DbActivity 
          dbActivity={dbActivity}
          matchScore={matchScore}
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