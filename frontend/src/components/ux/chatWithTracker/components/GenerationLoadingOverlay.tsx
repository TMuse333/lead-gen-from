// components/ux/chatWithTracker/components/GenerationLoadingOverlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Database,
  Brain,
  Wand2,
} from 'lucide-react';

export interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: 'config' | 'advice' | 'generating' | 'finalizing' | 'complete';
}

export const GENERATION_STEPS: GenerationStep[] = [
  {
    id: 'config',
    label: 'Loading Configuration',
    description: 'Setting up your personalized experience...',
    icon: 'config',
  },
  {
    id: 'advice',
    label: 'Gathering Insights',
    description: 'Pulling expert knowledge from our database...',
    icon: 'advice',
  },
  {
    id: 'generating',
    label: 'Creating Your Timeline',
    description: 'AI is crafting your personalized roadmap...',
    icon: 'generating',
  },
  {
    id: 'finalizing',
    label: 'Finalizing Results',
    description: 'Adding the finishing touches...',
    icon: 'finalizing',
  },
  {
    id: 'complete',
    label: 'Complete!',
    description: 'Redirecting to your results...',
    icon: 'complete',
  },
];

const iconMap = {
  config: Settings,
  advice: Lightbulb,
  generating: Brain,
  finalizing: Wand2,
  complete: CheckCircle2,
};

const colorMap = {
  config: 'from-blue-500 to-cyan-500',
  advice: 'from-amber-500 to-orange-500',
  generating: 'from-purple-500 to-pink-500',
  finalizing: 'from-emerald-500 to-teal-500',
  complete: 'from-green-500 to-emerald-500',
};

interface GenerationLoadingOverlayProps {
  isVisible: boolean;
  currentStep: string;
  steps?: GenerationStep[];
  error?: string | null;
  onRetry?: () => void;
  onGoBack?: () => void;
  /** Progress percentage (0-100) */
  percent?: number;
  /** Current message from SSE */
  message?: string;
}

export function GenerationLoadingOverlay({
  isVisible,
  currentStep,
  steps = GENERATION_STEPS,
  error,
  onRetry,
  onGoBack,
  percent = 0,
  message,
}: GenerationLoadingOverlayProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const activeStep = steps.find((s) => s.id === currentStep) || steps[0];
  const Icon = iconMap[activeStep.icon] || Settings;
  const gradientColor = colorMap[activeStep.icon] || colorMap.config;

  // Use custom message if provided, otherwise fall back to step description
  const displayMessage = message || activeStep.description;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {error ? (
            // Error State
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-2xl bg-slate-800/90 border border-red-500/50 shadow-2xl max-w-md mx-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Generation Failed
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                {error}
              </p>
              <div className="flex gap-3 justify-center">
                {onGoBack && (
                  <button
                    onClick={onGoBack}
                    className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                  >
                    Go Back
                  </button>
                )}
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-lg font-medium transition-colors bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // Loading State
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-2xl max-w-lg mx-4"
            >
              {/* Animated Icon */}
              <div className="relative mb-6">
                <motion.div
                  key={activeStep.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg`}
                >
                  <motion.div
                    animate={activeStep.id !== 'complete' ? { rotate: 360 } : {}}
                    transition={
                      activeStep.id !== 'complete'
                        ? { duration: 3, repeat: Infinity, ease: 'linear' }
                        : {}
                    }
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>

                {/* Pulse ring */}
                {activeStep.id !== 'complete' && (
                  <motion.div
                    className={`absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-br ${gradientColor} opacity-30`}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Step Label */}
              <motion.h2
                key={`label-${activeStep.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-2"
              >
                {activeStep.label}
              </motion.h2>

              {/* Step Description / Custom Message */}
              <motion.p
                key={`desc-${activeStep.id}-${message}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-sm mb-4"
              >
                {displayMessage}
              </motion.p>

              {/* Percentage Progress Bar */}
              <div className="w-full max-w-xs mx-auto mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">Progress</span>
                  <motion.span
                    key={percent}
                    initial={{ scale: 1.2, color: '#06b6d4' }}
                    animate={{ scale: 1, color: '#94a3b8' }}
                    className="text-sm font-bold text-slate-400"
                  >
                    {percent}%
                  </motion.span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${gradientColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-center items-center gap-2 mb-4">
                {steps.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  const StepIcon = iconMap[step.icon];

                  return (
                    <motion.div
                      key={step.id}
                      className="flex items-center"
                    >
                      {/* Step dot/icon */}
                      <motion.div
                        className={`
                          relative w-8 h-8 rounded-full flex items-center justify-center
                          ${isCompleted ? 'bg-green-500' : isActive ? `bg-gradient-to-br ${gradientColor}` : 'bg-slate-700'}
                          transition-all duration-300
                        `}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        )}
                      </motion.div>

                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`
                            w-6 h-0.5 mx-1
                            ${index < currentStepIndex ? 'bg-green-500' : 'bg-slate-700'}
                            transition-colors duration-300
                          `}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress text */}
              <p className="text-xs text-slate-500">
                Step {currentStepIndex + 1} of {steps.length}
              </p>

              {/* Animated dots */}
              {activeStep.id !== 'complete' && (
                <div className="mt-6 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-500"
                      animate={{
                        y: [0, -8, 0],
                        backgroundColor: ['#64748b', '#06b6d4', '#64748b'],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
