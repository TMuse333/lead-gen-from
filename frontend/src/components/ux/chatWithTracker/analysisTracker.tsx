'use client';

import { useChatStore, selectUserInput, selectProgress, selectCurrentFlow } from '@/stores/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Loader2, Sparkles, Trophy, Gift, Award, Zap, 
  Database, Brain, TrendingUp, Target, Search, Cpu,
  BarChart3, Activity, Radar
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  
  // Trophy scale based on progress
  const trophyScale = 0.5 + (progress / 100) * 0.5;

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
        {/* Animated background particles */}
        {progress > 30 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(Math.floor(progress / 15))].map((_, i) => (
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
            <h3 className="font-semibold text-gray-900">AI Analysis</h3>
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
              {currentFlow === 'sell' && '🏠 Selling Journey'}
              {currentFlow === 'buy' && '🔑 Buying Journey'}
              {currentFlow === 'browse' && '👀 Market Explorer'}
            </span>
          </div>
        )}

        {/* Live AI Insight - NEW */}
        {currentInsight && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="h-4 w-4 text-indigo-600" />
              </motion.div>
              <p className="text-sm font-medium text-indigo-900">{currentInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Real-time Stats - NEW */}
        {progress > 20 && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 grid grid-cols-3 gap-2"
          >
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <Target className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Match</span>
              </div>
              <motion.p 
                className="text-lg font-bold text-blue-600"
                key={matchScore}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {matchScore.toFixed(0)}%
              </motion.p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
              <div className="flex items-center gap-1 mb-1">
                <Database className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">Found</span>
              </div>
              <motion.p 
                className="text-lg font-bold text-purple-600"
                key={itemsFound}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {itemsFound}
              </motion.p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span className="text-xs font-semibold text-green-900">Score</span>
              </div>
              <motion.p 
                className="text-lg font-bold text-green-600"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {(progress / 100 * 98).toFixed(0)}%
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Database Activity Ticker - NEW */}
        {dbActivity && progress > 0 && progress < 100 && (
          <motion.div
            key={dbActivity}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mb-4 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2 border border-gray-200"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Cpu className="h-3 w-3 text-indigo-500" />
            </motion.div>
            <span className="font-mono">{dbActivity}</span>
          </motion.div>
        )}

        {/* Animated progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-medium text-gray-600">
              {Math.round(progress)}% Analyzed
            </p>
            {progress > 0 && progress < 100 && (
              <motion.p 
                className="text-xs font-medium text-indigo-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Processing...
              </motion.p>
            )}
          </div>
        </div>

        {/* Answers List - Enhanced */}
        <div className="space-y-2">
          {answersArray.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <Radar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              </motion.div>
              <p className="text-sm font-medium">AI ready to analyze your responses...</p>
            </div>
          ) : (
            answersArray.map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border-2 border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                      className="bg-green-100 rounded-full p-0.5"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      {formatKey(key)}
                    </p>
                    <p className="text-sm font-bold text-gray-900 break-words">
                      {formatValue(value)}
                    </p>
                  </div>
                  {/* Subtle processing indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1.5 }}
                    className="text-xs text-blue-500 font-mono"
                  >
                    ✓
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Progress Footer */}
        {!isComplete ? (
          <motion.div 
            className="mt-6 pt-4 border-t border-gray-200"
            animate={{
              backgroundColor: progress > 70 ? 
                ['rgba(239, 246, 255, 0)', 'rgba(239, 246, 255, 0.5)', 'rgba(239, 246, 255, 0)'] : 
                'rgba(239, 246, 255, 0)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-gray-600 text-center">
              <span className="font-bold text-blue-600 text-lg">
                {answersArray.length} / {TOTAL_QUESTIONS}
              </span>
              {' '}questions answered
              <br />
              <motion.span 
                className="text-xs font-medium"
                animate={{ 
                  color: progress > 70 ? ['#6B7280', '#4F46E5', '#6B7280'] : '#6B7280'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {TOTAL_QUESTIONS - answersArray.length} more to unlock your personalized plan! ✨
              </motion.span>
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 pt-4 border-t-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3"
          >
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <p className="text-sm font-bold">Ready for AI analysis!</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ENHANCED CALCULATION MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden border-2 border-indigo-200"
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: Math.random() * 100 + '%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.6, 0],
                      y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
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
                    <Trophy className="text-yellow-500" size={90} />
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(234, 179, 8, 0.6)',
                          '0 0 60px rgba(234, 179, 8, 0.9)',
                          '0 0 30px rgba(234, 179, 8, 0.6)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  🎉 AI Analysis Complete!
                </h2>
                
                <p className="text-gray-700 text-center mb-8 font-medium">
                  Generating your personalized landing page...
                </p>

                {/* Enhanced calculation steps */}
                <div className="space-y-3 mb-6">
                  {[
                    { 
                      icon: <Database size={18} />, 
                      text: "Connecting to Qdrant vector database", 
                      subtext: "2,847 documents indexed",
                      step: 0,
                      color: "text-blue-600"
                    },
                    { 
                      icon: <Search size={18} />, 
                      text: "Running semantic similarity search", 
                      subtext: `Found ${Math.floor(Math.random() * 8) + 12} relevant insights`,
                      step: 1,
                      color: "text-purple-600"
                    },
                    { 
                      icon: <Radar size={18} />, 
                      text: "Evaluating rule-based conditions", 
                      subtext: `${Math.floor(Math.random() * 4) + 3} rules matched`,
                      step: 2,
                      color: "text-indigo-600"
                    },
                    { 
                      icon: <BarChart3 size={18} />, 
                      text: "Analyzing your unique profile", 
                      subtext: `${answersArray.length} data points processed`,
                      step: 3,
                      color: "text-pink-600"
                    },
                    { 
                      icon: <Brain size={18} />, 
                      text: "AI crafting personalized content", 
                      subtext: "GPT-4o-mini generating...",
                      step: 4,
                      color: "text-orange-600"
                    },
                    { 
                      icon: <TrendingUp size={18} />, 
                      text: "Optimizing action plan priority", 
                      subtext: `${Math.floor(Math.random() * 3) + 4} steps prioritized`,
                      step: 5,
                      color: "text-green-600"
                    },
                    { 
                      icon: <Sparkles size={18} />, 
                      text: "Finalizing your experience", 
                      subtext: "Assembling components...",
                      step: 6,
                      color: "text-yellow-600"
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: calculationStep >= item.step ? 1 : 0.4,
                        x: 0 
                      }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        calculationStep >= item.step 
                          ? 'bg-white/80 shadow-md' 
                          : 'bg-white/40'
                      }`}
                    >
                      <div className={`flex-shrink-0 mt-0.5 ${
                        calculationStep >= item.step ? item.color : 'text-gray-400'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${
                          calculationStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {item.text}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          calculationStep >= item.step ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {item.subtext}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {calculationStep > item.step && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-green-100 rounded-full p-1"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                        {calculationStep === item.step && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced loading bar */}
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${(calculationStep / 7) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-600 font-medium">
                    Processing step {calculationStep + 1} of 7
                  </p>
                  <motion.p 
                    className="text-xs font-bold text-indigo-600"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {Math.round((calculationStep / 7) * 100)}% complete
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}