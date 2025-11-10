'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

import QuestionCard from './questionCard';
import AnalysisTracker from '../ux/chatWithTracker/analysisTracker';

interface ConversationalFormProps {
  questions: FormQuestion[];
  onComplete: (answers: FormAnswer[]) => void;
  agentName?: string;
  primaryColor?: string;
}

export default function ConversationalForm({
  questions,
  onComplete,
  agentName = 'Your Agent',
  primaryColor = '#2563eb',
}: ConversationalFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [reactionHistory, setReactionHistory] = useState<
    { id: string; text: string; loading: boolean; question: string }[]
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLatestPulse, setShowLatestPulse] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const latestReaction = reactionHistory[reactionHistory.length - 1];

  /* --------------------------------------------------------------
     Fetch AI reaction
     -------------------------------------------------------------- */
  const getAiReaction = async (
    questionId: string,
    answer: string | string[],
    questionText: string
  ) => {
    const placeholderId = `${questionId}-${Date.now()}`;
    setReactionHistory((prev) => [
      ...prev,
      { id: placeholderId, text: '', loading: true, question: questionText },
    ]);

    try {
      const response = await fetch('/api/get-instant-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer, questionText }),
      });
      const data = await response.json();

      if (data.success && data.reaction) {
        setReactionHistory((prev) =>
          prev.map((r) =>
            r.id === placeholderId
              ? { ...r, text: data.reaction, loading: false }
              : r
          )
        );
        setShowLatestPulse(true);
        setTimeout(() => setShowLatestPulse(false), 2000);
      }
    } catch (error) {
      console.error('Error getting AI reaction:', error);
      setReactionHistory((prev) =>
        prev.map((r) =>
          r.id === placeholderId
            ? { ...r, text: 'Got it!', loading: false }
            : r
        )
      );
    }
  };

  /* --------------------------------------------------------------
     Handle answer
     -------------------------------------------------------------- */
  const handleAnswer = async (value: string | string[] | number) => {
    const answer: FormAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      value,
      answeredAt: new Date(),
    };
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    getAiReaction(
      currentQuestion.id,
      value as string | string[],
      currentQuestion.question
    );

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        onComplete(newAnswers);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Global Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Row */}
        <div className="flex flex-col md:flex-row-reverse gap-6">
          {/* Analysis Tracker */}
          {answers.length >= 2 && (
            <AnalysisTracker />
          )}

          {/* Question Card */}
          <div className="flex-1">
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              isLast={currentQuestionIndex === questions.length - 1}
            />
          </div>
        </div>

        {/* Sticky Reaction Panel */}
        {reactionHistory.length > 0 && (
          <div className="sticky bottom-4 z-10 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between text-white hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Sparkles size={24} className="text-yellow-300" />
                    {showLatestPulse && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-blue-100">
                      {agentName}'s insights
                    </div>
                    {latestReaction && !latestReaction.loading && (
                      <div className="text-base font-medium line-clamp-1">
                        {latestReaction.text}
                      </div>
                    )}
                    {latestReaction && latestReaction.loading && (
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reactionHistory.length > 1 && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {reactionHistory.length} insights
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronUp size={20} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto p-4 pt-0 space-y-3">
                      {reactionHistory.map((r, idx) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white/10 backdrop-blur rounded-lg p-3"
                        >
                          <div className="text-xs text-blue-200 mb-1 font-medium">
                            {r.question}
                          </div>
                          {r.loading ? (
                            <div className="flex gap-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150" />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300" />
                            </div>
                          ) : (
                            <p className="text-white text-sm leading-relaxed">
                              {r.text}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}