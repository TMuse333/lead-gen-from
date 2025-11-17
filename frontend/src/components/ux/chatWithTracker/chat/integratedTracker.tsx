// components/chat/IntegratedTracker.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Star, CheckCircle2, Lock, Database, Brain, Target, 
  Activity, Cpu, Sparkles, Award, Trophy, Gift
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PathNode {
  id: number;
  completed: boolean;
  current: boolean;
}

interface IntegratedTrackerProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
  userInput: Record<string, string>;
  currentFlow?: string;
  progress: number; // 0-100
}

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

const DB_MESSAGES = [
  "Querying vector database...",
  "Matching semantic patterns...",
  "Retrieving expert advice...",
  "Computing relevance scores...",
  "Filtering 2,847 documents...",
];

export function IntegratedTracker({ 
  totalSteps, 
  currentStep, 
  completedSteps,
  userInput,
  currentFlow,
  progress 
}: IntegratedTrackerProps) {
  const [nodes, setNodes] = useState<PathNode[]>([]);
  const [currentInsight, setCurrentInsight] = useState('');
  const [dbActivity, setDbActivity] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [itemsFound, setItemsFound] = useState(0);

  const answersArray = Object.entries(userInput);
  const isComplete = completedSteps >= totalSteps;
  const glowIntensity = Math.min(progress / 100, 1);
  const trophyScale = 0.5 + (progress / 100) * 0.5;

  // Create path nodes
  useEffect(() => {
    const newNodes: PathNode[] = [];
    for (let i = 0; i < totalSteps; i++) {
      newNodes.push({
        id: i,
        completed: i < completedSteps,
        current: i === currentStep,
      });
    }
    setNodes(newNodes);
  }, [totalSteps, currentStep, completedSteps]);

  // Show insights as user progresses
  useEffect(() => {
    if (answersArray.length > 0 && currentFlow) {
      const insights = DYNAMIC_INSIGHTS[currentFlow as keyof typeof DYNAMIC_INSIGHTS] || [];
      const insightIndex = Math.min(answersArray.length - 1, insights.length - 1);
      setTimeout(() => setCurrentInsight(insights[insightIndex]), 300);
    }
  }, [answersArray.length, currentFlow]);

  // Simulate database activity
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const interval = setInterval(() => {
        const randomMsg = DB_MESSAGES[Math.floor(Math.random() * DB_MESSAGES.length)];
        setDbActivity(randomMsg);
        setMatchScore(prev => Math.min(prev + Math.random() * 5, 95));
        setItemsFound(prev => prev + Math.floor(Math.random() * 3));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [progress]);

  const formatKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  };

  const formatValue = (value: string): string => {
    if (value.includes('-') && !value.includes('@')) {
      return value.replace('-', ' - ');
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
      {/* Header with Trophy */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-white" size={20} />
            <h3 className="font-bold text-white">AI Analysis</h3>
          </div>
          <motion.div
            animate={{ 
              scale: [trophyScale, trophyScale * 1.1, trophyScale],
              rotate: isComplete ? [0, 10, -10, 0] : 0,
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 0.5, repeat: isComplete ? Infinity : 0 }
            }}
          >
            {isComplete ? (
              <Trophy className="text-yellow-300" size={24 + progress / 4} />
            ) : progress > 50 ? (
              <Award className="text-white" size={24 + progress / 4} />
            ) : (
              <Gift className="text-white/70" size={24 + progress / 4} />
            )}
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-white/90 mt-1 text-center font-medium">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </div>

      {/* Flow Badge */}
      {currentFlow && (
        <div className="px-4 pt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900">
            {currentFlow === 'sell' && '🏠 Selling Journey'}
            {currentFlow === 'buy' && '🔑 Buying Journey'}
            {currentFlow === 'browse' && '👀 Market Explorer'}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Live Insight */}
        {currentInsight && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="h-4 w-4 text-indigo-600" />
              </motion.div>
              <p className="text-xs font-semibold text-indigo-900">{currentInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Real-time Stats */}
        {progress > 20 && progress < 100 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <Target className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">Match</span>
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
                <span className="text-xs font-bold text-purple-900">Found</span>
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
                <span className="text-xs font-bold text-green-900">Score</span>
              </div>
              <motion.p 
                className="text-lg font-bold text-green-600"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {(progress / 100 * 98).toFixed(0)}%
              </motion.p>
            </div>
          </div>
        )}

        {/* DB Activity Ticker */}
        {dbActivity && progress > 0 && progress < 100 && (
          <motion.div
            key={dbActivity}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2 border border-gray-200"
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

        {/* Path Progress Integrated */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-3 border-2 border-purple-200">
          <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-purple-600" />
            Your Journey
          </h4>
          <div className="flex items-center gap-3">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    node.completed
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-purple-300'
                      : node.current
                      ? 'bg-white border-blue-500'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                  animate={node.current ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {node.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : node.current ? (
                    <Star className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Lock className="w-3 h-3 text-gray-400" />
                  )}
                </motion.div>
                <span className="text-xs font-medium text-gray-600 mt-1">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collected Answers */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Collected Info</h4>
          <div className="space-y-2">
            {answersArray.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Waiting for your responses...
              </p>
            ) : (
              answersArray.map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-2 border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        {formatKey(key)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer Status */}
        {!isComplete ? (
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-purple-600 text-lg">
                {answersArray.length} / {totalSteps}
              </span>
              {' '}answered
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalSteps - answersArray.length} more to unlock! ✨
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-bold">Ready for AI analysis!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}