// components/ux/chatWithTracker/components/EnhancedAnalysisPanel.tsx
'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Check, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete';
}

interface EnhancedAnalysisPanelProps {
  currentInsight: string;
  dbActivity: string;
  progress: number;
  isVisible?: boolean;
}

export function EnhancedAnalysisPanel({
  currentInsight,
  dbActivity,
  progress,
  isVisible = true,
}: EnhancedAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine analysis steps based on current activity
  const getAnalysisSteps = (): AnalysisStep[] => {
    const steps: AnalysisStep[] = [];

    if (progress > 0) {
      steps.push({
        id: 'start',
        label: 'Initializing AI analysis...',
        status: 'complete',
      });
    }

    if (progress > 20) {
      steps.push({
        id: 'qdrant',
        label: dbActivity || 'Loading market data...',
        status: progress > 40 ? 'complete' : 'loading',
      });
    }

    if (progress > 40) {
      steps.push({
        id: 'insights',
        label: currentInsight || 'Generating insights...',
        status: progress > 60 ? 'complete' : 'loading',
      });
    }

    if (progress > 60) {
      steps.push({
        id: 'personalize',
        label: 'Personalizing your timeline...',
        status: progress > 80 ? 'complete' : 'loading',
      });
    }

    if (progress > 80) {
      steps.push({
        id: 'finalize',
        label: 'Finalizing recommendations...',
        status: progress === 100 ? 'complete' : 'loading',
      });
    }

    return steps;
  };

  const steps = getAnalysisSteps();

  if (!isVisible || steps.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-cyan-500/30 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/5 to-blue-500/5"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-5 w-5 text-cyan-400" />
            {steps.some(s => s.status === 'loading') && (
              <Sparkles className="h-3 w-3 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-cyan-300">
              AI Analysis
            </h3>
            <p className="text-xs text-slate-400">
              {steps.filter(s => s.status === 'complete').length}/{steps.length} steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-cyan-400 font-medium">
            {Math.round(progress)}%
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {step.status === 'complete' ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : step.status === 'loading' ? (
                      <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      step.status === 'complete'
                        ? 'text-green-400'
                        : step.status === 'loading'
                        ? 'text-cyan-300'
                        : 'text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Current Activity Highlight */}
              {(currentInsight || dbActivity) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                >
                  <p className="text-xs text-cyan-300 leading-relaxed">
                    💡 {currentInsight || dbActivity}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
