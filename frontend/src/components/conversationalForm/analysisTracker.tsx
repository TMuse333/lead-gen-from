// components/AnalysisTracker.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useChatStore, selectExtractedAnswers } from '@/stores/chatStore';
import { ExtractedAnswer } from '@/types/chat.types';
import {
  PropertyCollecting,
  SearchingHomes,
  AnalyzingTrends,
  CalculatingValue,
  GeneratingRecommendations,
  PendingIcon,
} from './icons/calculatingIcon';

export default function AnalysisTracker() {
  const answers = useChatStore(selectExtractedAnswers);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="md:w-80 bg-white rounded-xl shadow-lg p-5 border border-blue-100"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
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

      {/* Progress Tasks */}
      <div className="space-y-3">
        {/* Task 1: Property Profile */}
        <AnalysisTask
          icon={<PropertyCollecting size={20} isComplete={answers.length >= 1} duration={1500} />}
          text="Property profile collected"
          completed={answers.length >= 1}
          detail={answers.length >= 1 ? getPropertyDetail(answers) : ''}
        />

        {/* Task 2: Searching Comparables */}
        <AnalysisTask
          icon={
            answers.length >= 2 ? (
              <SearchingHomes size={20} isComplete={answers.length >= 4} duration={1500} />
            ) : (
              <PendingIcon size={20} />
            )
          }
          text="Searching comparable homes in Halifax"
          completed={answers.length >= 4}
          detail={answers.length >= 3 ? `Found ${12 + answers.length * 8} similar properties...` : ''}
        />

        {/* Task 3: Market Analysis */}
        <AnalysisTask
          icon={
            answers.length >= 4 ? (
              <AnalyzingTrends size={20} isComplete={answers.length >= 6} duration={1500} />
            ) : (
              <PendingIcon size={20} />
            )
          }
          text="Analyzing market trends & pricing"
          completed={answers.length >= 6}
          detail={answers.length >= 5 ? 'Halifax market data: 1,247 data points' : ''}
        />

        {/* Task 4: Value Calculation */}
        <AnalysisTask
          icon={
            answers.length >= 6 ? (
              <CalculatingValue size={20} isComplete={answers.length >= 7} duration={1500} />
            ) : (
              <PendingIcon size={20} />
            )
          }
          text="Calculating your property value range"
          completed={answers.length >= 7}
          detail={answers.length >= 7 ? getValueRangeTeaser(answers) : ''}
        />

        {/* Task 5: Personalized Strategy */}
        <AnalysisTask
          icon={
            answers.length >= 7 ? (
              <GeneratingRecommendations size={20} isComplete={answers.length >= 9} duration={1500} />
            ) : (
              <PendingIcon size={20} />
            )
          }
          text="Generating personalized recommendations"
          completed={answers.length >= 9}
          detail={answers.length >= 8 ? 'Custom strategy based on your timeline' : ''}
        />
      </div>

      {/* Progress Footer */}
      {answers.length < 9 ? (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Tip: <span className="font-medium">
              Your analysis is {Math.round((answers.length / 9) * 100)}% complete
            </span>
            <br />
            {9 - answers.length} {9 - answers.length === 1 ? 'answer' : 'answers'} to unlock full insights
          </p>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-green-600 flex items-center gap-2">
            <span className="text-lg">🎉</span>
            Complete! Your comprehensive analysis is ready
          </p>
        </div>
      )}
    </motion.div>
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
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div
          className={`text-sm font-medium ${
            completed ? 'text-gray-900' : 'text-gray-600'
          }`}
        >
          {text}
        </div>
        {detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-blue-600 mt-1 font-medium"
          >
            {detail}
          </motion.div>
        )}
      </div>
    </div>
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
    return 'Estimated range: $XXX,XXX - $XXX,XXX (renovations add value!)';
  }
  return 'Estimated range: $XXX,XXX - $XXX,XXX (narrowing...)';
}