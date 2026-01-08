// components/ux/chatWithTracker/tracker/OfferProgress.tsx
'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import {
  getOffer,
  getTrackingConfig,
  getQuestionsForOffer,
  type OfferType,
  type Intent,
  type ProgressStyle,
} from '@/lib/offers/unified';

interface OfferProgressProps {
  selectedOffer: OfferType;
  currentIntent: Intent;
  userInput: Record<string, string>;
  progress: number;
}

export function OfferProgress({
  selectedOffer,
  currentIntent,
  userInput,
  progress,
}: OfferProgressProps) {
  const tracking = getTrackingConfig(selectedOffer);
  const questions = getQuestionsForOffer(selectedOffer, currentIntent);

  if (!tracking) return null;

  const progressStyle = tracking.progressStyle;
  const color = tracking.color;

  // Render based on progressStyle
  if (progressStyle === 'bar') {
    return <ProgressBar progress={progress} color={color} />;
  }

  if (progressStyle === 'steps') {
    return (
      <ProgressSteps
        questions={questions}
        userInput={userInput}
        color={color}
      />
    );
  }

  if (progressStyle === 'checklist') {
    return (
      <ProgressChecklist
        questions={questions}
        userInput={userInput}
        color={color}
      />
    );
  }

  // Default to bar
  return <ProgressBar progress={progress} color={color} />;
}

// ==================== PROGRESS BAR ====================

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 10px ${color}80`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ==================== PROGRESS STEPS ====================

interface ProgressStepsProps {
  questions: { id: string; mappingKey: string; text: string }[];
  userInput: Record<string, string>;
  color: string;
}

function ProgressSteps({ questions, userInput, color }: ProgressStepsProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1">
        {questions.map((q, idx) => {
          const isAnswered = !!userInput[q.mappingKey];
          const isCurrent = !isAnswered && (idx === 0 || !!userInput[questions[idx - 1]?.mappingKey]);

          return (
            <motion.div
              key={q.id}
              className="flex items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Step dot */}
              <motion.div
                className="w-3 h-3 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isAnswered ? color : isCurrent ? `${color}60` : 'rgba(255,255,255,0.1)',
                  boxShadow: isAnswered || isCurrent ? `0 0 8px ${color}60` : 'none',
                }}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
              >
                {isAnswered && <Check size={8} className="text-white" />}
              </motion.div>

              {/* Connector line */}
              {idx < questions.length - 1 && (
                <div
                  className="w-4 h-0.5 mx-0.5"
                  style={{
                    backgroundColor: isAnswered ? color : 'rgba(255,255,255,0.1)',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="text-xs text-white/60 mt-1">
        {Object.keys(userInput).length} of {questions.length} steps
      </div>
    </div>
  );
}

// ==================== PROGRESS CHECKLIST ====================

interface ProgressChecklistProps {
  questions: { id: string; mappingKey: string; text: string }[];
  userInput: Record<string, string>;
  color: string;
}

function ProgressChecklist({ questions, userInput, color }: ProgressChecklistProps) {
  // Only show first 4 items to keep it compact
  const visibleQuestions = questions.slice(0, 4);
  const remainingCount = questions.length - 4;

  return (
    <div className="mb-4 space-y-1.5">
      {visibleQuestions.map((q, idx) => {
        const isAnswered = !!userInput[q.mappingKey];

        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-2 text-xs"
          >
            <motion.div
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{
                backgroundColor: isAnswered ? color : 'rgba(255,255,255,0.1)',
                border: isAnswered ? 'none' : '1px solid rgba(255,255,255,0.2)',
              }}
              animate={isAnswered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isAnswered && <Check size={10} className="text-white" />}
            </motion.div>
            <span className={isAnswered ? 'text-white/80' : 'text-white/40'}>
              {q.text.length > 30 ? q.text.substring(0, 30) + '...' : q.text}
            </span>
          </motion.div>
        );
      })}

      {remainingCount > 0 && (
        <div className="text-xs text-white/40 pl-6">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
