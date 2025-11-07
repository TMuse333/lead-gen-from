// components/AnalysisTracker.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Gift, Award, Zap } from 'lucide-react';
import { useChatStore, selectExtractedAnswers } from '@/stores/chatStore';
import { ExtractedAnswer } from '@/types/chat.types';
import { useState, useEffect } from 'react';
import {
  PropertyCollecting,
  SearchingHomes,
  AnalyzingTrends,
  CalculatingValue,
  GeneratingRecommendations,
  PendingIcon,
} from '../../conversationalForm/icons/calculatingIcon';

const TOTAL_QUESTIONS = 6;

export default function AnalysisTracker() {
  const answers = useChatStore(selectExtractedAnswers);
  const [showModal, setShowModal] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);

  const progress = (answers.length / TOTAL_QUESTIONS) * 100;
  const isComplete = answers.length >= TOTAL_QUESTIONS;

  // Glow intensity based on progress
  const glowIntensity = Math.min(progress / 100, 1);
  
  // Trophy scale based on progress
  const trophyScale = 0.5 + (progress / 100) * 0.5; // 0.5 to 1

  // Show modal when complete
  useEffect(() => {
    if (isComplete) {
      setShowModal(true);
      
      // Cycle through calculation steps
      const steps = [
        "Analyzing property details...",
        "Searching comparable homes...",
        "Processing market data...",
        "Calculating value range...",
        "Generating recommendations...",
        "Finalizing your report..."
      ];
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCalculationStep(step);
        if (step >= steps.length) {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isComplete]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:w-80 bg-white rounded-xl shadow-lg p-5 border border-blue-100 relative overflow-hidden"
        style={{
          boxShadow: `0 0 ${20 + glowIntensity * 30}px rgba(59, 130, 246, ${0.1 + glowIntensity * 0.3})`
        }}
      >
        {/* Animated background particles */}
        {progress > 50 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(Math.floor(progress / 20))].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
                animate={{
                  y: '-20%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Header with growing trophy */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="text-blue-600" size={20} />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="text-blue-400 opacity-50" size={20} />
              </motion.div>
            </div>
            <h3 className="font-semibold text-gray-900">Building Your Analysis</h3>
          </div>

          {/* Growing reward icon */}
          <motion.div
            animate={{ 
              scale: [trophyScale, trophyScale * 1.1, trophyScale],
              rotate: isComplete ? [0, 10, -10, 0] : 0,
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 0.5, repeat: isComplete ? Infinity : 0 }
            }}
            className="relative"
          >
            {isComplete ? (
              <Trophy className="text-yellow-500" size={24 + progress / 4} />
            ) : progress > 50 ? (
              <Award className="text-blue-500" size={24 + progress / 4} />
            ) : (
              <Gift className="text-gray-400" size={24 + progress / 4} />
            )}
            
            {/* Glow effect */}
            {progress > 30 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    `0 0 ${5 + glowIntensity * 20}px rgba(59, 130, 246, ${0.3 + glowIntensity * 0.4})`,
                    `0 0 ${15 + glowIntensity * 30}px rgba(59, 130, 246, ${0.5 + glowIntensity * 0.5})`,
                    `0 0 ${5 + glowIntensity * 20}px rgba(59, 130, 246, ${0.3 + glowIntensity * 0.4})`,
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>

        {/* Animated progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
          <p className="text-xs text-center mt-1 font-medium text-gray-600">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Progress Tasks */}
        <div className="space-y-3">
          <AnalysisTask
            icon={<PropertyCollecting size={20} isComplete={answers.length >= 1} duration={1500} />}
            text="Property profile collected"
            completed={answers.length >= 1}
            detail={answers.length >= 1 ? getPropertyDetail(answers) : ''}
          />

          <AnalysisTask
            icon={
              answers.length >= 2 ? (
                <SearchingHomes size={20} isComplete={answers.length >= 3} duration={1500} />
              ) : (
                <PendingIcon size={20} />
              )
            }
            text="Searching comparable homes"
            completed={answers.length >= 3}
            detail={answers.length >= 2 ? `Found ${12 + answers.length * 8} similar properties` : ''}
          />

          <AnalysisTask
            icon={
              answers.length >= 3 ? (
                <AnalyzingTrends size={20} isComplete={answers.length >= 4} duration={1500} />
              ) : (
                <PendingIcon size={20} />
              )
            }
            text="Analyzing market trends"
            completed={answers.length >= 4}
            detail={answers.length >= 3 ? 'Halifax market data: 1,247 points' : ''}
          />

          <AnalysisTask
            icon={
              answers.length >= 4 ? (
                <CalculatingValue size={20} isComplete={answers.length >= 5} duration={1500} />
              ) : (
                <PendingIcon size={20} />
              )
            }
            text="Calculating property value"
            completed={answers.length >= 5}
            detail={answers.length >= 5 ? getValueRangeTeaser(answers) : ''}
          />

          <AnalysisTask
            icon={
              answers.length >= 5 ? (
                <GeneratingRecommendations size={20} isComplete={answers.length >= 6} duration={1500} />
              ) : (
                <PendingIcon size={20} />
              )
            }
            text="Generating recommendations"
            completed={answers.length >= 6}
            detail={answers.length >= 6 ? 'Custom strategy ready' : ''}
          />
        </div>

        {/* Progress Footer */}
        {!isComplete ? (
          <motion.div 
            className="mt-4 pt-4 border-t border-gray-100"
            animate={{
              backgroundColor: progress > 70 ? 
                ['rgba(239, 246, 255, 0)', 'rgba(239, 246, 255, 0.5)', 'rgba(239, 246, 255, 0)'] : 
                'rgba(239, 246, 255, 0)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-blue-600">
                {answers.length} of {TOTAL_QUESTIONS}
              </span>
              {' '}questions answered
              <br />
              <span className="text-xs">
                {TOTAL_QUESTIONS - answers.length} more to unlock your treasure! 💎
              </span>
            </p>
          </motion.div>
        ) : null}
      </motion.div>

      {/* CALCULATION MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {}} // Prevent close on click
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Background animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: Math.random() * 100 + '%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Animated trophy */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <Trophy className="text-yellow-500" size={80} />
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(234, 179, 8, 0.5)',
                          '0 0 40px rgba(234, 179, 8, 0.8)',
                          '0 0 20px rgba(234, 179, 8, 0.5)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Analysis Complete!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Generating your personalized report...
                </p>

                {/* Calculation steps */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: <Zap size={16} />, text: "Analyzing property details", step: 0 },
                    { icon: <Sparkles size={16} />, text: "Searching comparables", step: 1 },
                    { icon: <Zap size={16} />, text: "Processing market data", step: 2 },
                    { icon: <Sparkles size={16} />, text: "Calculating value range", step: 3 },
                    { icon: <Zap size={16} />, text: "Generating recommendations", step: 4 },
                    { icon: <Sparkles size={16} />, text: "Finalizing your report", step: 5 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: calculationStep >= item.step ? 1 : 0.3,
                        x: 0 
                      }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className={`flex-shrink-0 ${calculationStep >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.icon}
                      </div>
                      <div className={`flex-1 text-left ${calculationStep >= item.step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {item.text}
                      </div>
                      {calculationStep > item.step && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-500"
                        >
                          ✓
                        </motion.div>
                      )}
                      {calculationStep === item.step && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Loading bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(calculationStep / 6) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  This will just take a moment...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* -----------------------------------------------------------------
   AnalysisTask Component
   ----------------------------------------------------------------- */
interface AnalysisTaskProps {
  icon: React.ReactNode;
  text: string;
  completed: boolean;
  detail?: string;
}

function AnalysisTask({ icon, text, completed, detail }: AnalysisTaskProps) {
  return (
    <motion.div 
      className="flex items-start gap-3"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: completed ? 1 : 0.5 }}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div
          className={`text-sm font-medium transition-colors ${
            completed ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {text}
        </div>
        <AnimatePresence>
          {detail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-blue-600 mt-1 font-medium"
            >
              {detail}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------------
   Helper Functions
   ----------------------------------------------------------------- */
function getPropertyDetail(answers: ExtractedAnswer[]): string {
  const propertyType = answers.find((a) => a.questionId === 'propertyType')?.value;
  if (!propertyType) return 'Property type recorded';
  
  if (propertyType.includes('house') || propertyType.includes('single')) {
    return 'Single-family home identified';
  }
  if (propertyType.includes('condo')) {
    return 'Condo/apartment identified';
  }
  if (propertyType.includes('townhouse')) {
    return 'Townhouse identified';
  }
  return 'Property type recorded';
}

function getValueRangeTeaser(answers: ExtractedAnswer[]): string {
  const hasRenovations = answers.find((a) => 
    a.questionId === 'renovations' && 
    (a.value.includes('kitchen') || a.value.includes('bathroom'))
  );
  
  if (hasRenovations) {
    return 'Range: $XXX,XXX - $XXX,XXX (+renovations!)';
  }
  return 'Range: $XXX,XXX - $XXX,XXX';
}