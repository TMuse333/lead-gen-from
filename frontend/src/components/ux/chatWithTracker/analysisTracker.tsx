'use client';

import { useChatStore, selectUserInput, selectProgress, selectCurrentFlow } from '@/stores/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, Trophy, Gift, Award, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const TOTAL_QUESTIONS = 6;

export default function AnalysisTracker() {
  const userInput = useChatStore(selectUserInput);
  const progress = useChatStore(selectProgress);
  const currentFlow = useChatStore(selectCurrentFlow);
  const [showModal, setShowModal] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);

  const answersArray = Object.entries(userInput);
  const isComplete = answersArray.length >= TOTAL_QUESTIONS;

  // Glow intensity based on progress
  const glowIntensity = Math.min(progress / 100, 1);
  
  // Trophy scale based on progress
  const trophyScale = 0.5 + (progress / 100) * 0.5;

  // Show modal when complete
  useEffect(() => {
    if (isComplete) {
      setShowModal(true);
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCalculationStep(step);
        if (step >= 6) {
          clearInterval(interval);
        }
      }, 500);

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
            <h3 className="font-semibold text-gray-900">Your Information</h3>
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

        {/* Flow Type Badge */}
        {currentFlow && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {currentFlow === 'sell' && '🏠 Selling'}
              {currentFlow === 'buy' && '🔑 Buying'}
              {currentFlow === 'browse' && '👀 Browsing'}
            </span>
          </div>
        )}

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

        {/* Answers List */}
        <div className="space-y-3">
          {answersArray.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Waiting for your responses...</p>
            </div>
          ) : (
            answersArray.map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {formatKey(key)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {formatValue(value)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Progress Footer */}
        {!isComplete ? (
          <motion.div 
            className="mt-6 pt-4 border-t border-gray-100"
            animate={{
              backgroundColor: progress > 70 ? 
                ['rgba(239, 246, 255, 0)', 'rgba(239, 246, 255, 0.5)', 'rgba(239, 246, 255, 0)'] : 
                'rgba(239, 246, 255, 0)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-blue-600">
                {answersArray.length} of {TOTAL_QUESTIONS}
              </span>
              {' '}questions answered
              <br />
              <span className="text-xs">
                {TOTAL_QUESTIONS - answersArray.length} more to unlock your treasure! 💎
              </span>
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <p className="text-sm font-semibold">All information collected!</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* CALCULATION MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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