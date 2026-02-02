// components/tracker/index.tsx - UNIFIED OFFER SYSTEM
'use client';

import { useChatStore, selectUserInput, selectProgress, ChatState } from '@/stores/chatStore';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AnimatedParticles } from './animatedParticles';
import { OfferHeader } from './OfferHeader';
import { OfferBadge } from './OfferBadge';
import { OfferProgress } from './OfferProgress';
import { AnsweredQuestions } from './answeredQuestions';
import { CurrentInsight } from './currentInsight';
import { DbActivity } from './dbActivity';
// CompletionModal removed - contact collection now handled in chatWithTracker.tsx
import { getTrackingConfig, type OfferType, type Intent } from '@/lib/offers/unified';

// Selectors
const selectCurrentInsight = (state: ChatState) => state.currentInsight || '';
const selectDbActivity = (state: ChatState) => state.dbActivity || '';
const selectSelectedOffer = (state: ChatState) => state.selectedOffer;
const selectCurrentIntent = (state: ChatState) => state.currentIntent;
const selectFlowQuestions = (state: ChatState) => state.flowQuestions;

export default function AnalysisTracker() {
  const userInput = useChatStore(selectUserInput);
  const progress = useChatStore(selectProgress);
  const selectedOffer = useChatStore(selectSelectedOffer);
  const currentIntent = useChatStore(selectCurrentIntent);
  const flowQuestions = useChatStore(selectFlowQuestions);
  const currentInsightFromStore = useChatStore(selectCurrentInsight);
  const dbActivityFromStore = useChatStore(selectDbActivity);

  const [currentInsight, setCurrentInsight] = useState("Gathering your information...");
  const [dbActivity, setDbActivity] = useState("Processing your answers...");

  const answersArray = Object.entries(userInput);
  const isComplete = progress >= 100;

  // Get custom questions from MongoDB if available
  // Note: 'browse' commented out for MVP - handle legacy data gracefully
  const customQuestions = currentIntent && (currentIntent === 'buy' || currentIntent === 'sell')
    ? flowQuestions[currentIntent] || []
    : [];

  // Get offer-specific tracking config (fallback for styling)
  const tracking = selectedOffer ? getTrackingConfig(selectedOffer) : null;
  const color = tracking?.color || '#3b82f6'; // Default blue

  // Glow intensity based on progress (0 -> 1)
  const glowIntensity = Math.min(progress / 100, 1);

  useEffect(() => {
    if (currentInsightFromStore) setCurrentInsight(currentInsightFromStore);
  }, [currentInsightFromStore]);

  useEffect(() => {
    if (dbActivityFromStore) setDbActivity(dbActivityFromStore);
  }, [dbActivityFromStore]);

  const formatKey = (key: string): string => {
    // First: Try to use custom question label from MongoDB
    const customQuestion = customQuestions.find(q => q.mappingKey === key);
    if (customQuestion?.label) {
      return customQuestion.label;
    }

    // Second: Try to extract a short label from the question text
    if (customQuestion?.question) {
      // Take first part of question (before ? or first 30 chars)
      const questionText = customQuestion.question;
      const shortText = questionText.split('?')[0].trim();
      if (shortText.length <= 40) {
        return shortText;
      }
      return shortText.substring(0, 37) + '...';
    }

    // Third: Fall back to static tracking field label
    if (tracking?.fields[key]?.label) {
      return tracking.fields[key].label;
    }

    // Fourth: Format the key itself (camelCase to Title Case)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  };

  const formatValue = (value: string): string => {
    // Use tracking field format function if available
    const fieldKey = Object.keys(userInput).find(k => userInput[k] === value);
    if (fieldKey && tracking?.fields[fieldKey]?.format) {
      return tracking.fields[fieldKey].format!(value);
    }
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
          background: 'rgba(var(--color-background-rgb), 0.85)',
          borderColor: `${color}4d`, // 30% opacity
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 ${30 + glowIntensity * 60}px ${color}${Math.round((0.15 + glowIntensity * 0.4) * 255).toString(16).padStart(2, '0')},
            inset 0 1px 0 ${color}1a
          `,
        }}
      >
        {/* Subtle inner glow ring - uses offer color */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}${Math.round(glowIntensity * 0.3 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          }}
        />

        <AnimatedParticles progress={progress} />

        {/* Offer-aware header */}
        <OfferHeader
          selectedOffer={selectedOffer}
          progress={progress}
          isComplete={isComplete}
        />

        {/* Offer badge with intent */}
        <OfferBadge
          selectedOffer={selectedOffer}
          currentIntent={currentIntent}
        />

        {/* Offer-specific progress display */}
        {selectedOffer && currentIntent && (
          <OfferProgress
            selectedOffer={selectedOffer}
            currentIntent={currentIntent}
            userInput={userInput}
            progress={progress}
          />
        )}

        {/* Answered questions list */}
        <AnsweredQuestions
          userInput={userInput}
          formatKey={formatKey}
          formatValue={formatValue}
        />

        {/* Current insight */}
        <CurrentInsight currentInsight={currentInsight} />

        {/* Database activity */}
        <DbActivity
          dbActivity={dbActivity}
          matchScore={Math.round(progress)}
          itemsFound={answersArray.length}
          progress={progress}
        />
      </motion.div>
    </>
  );
}
