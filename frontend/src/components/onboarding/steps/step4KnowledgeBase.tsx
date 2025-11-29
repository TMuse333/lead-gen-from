"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileText,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useOnboardingStore, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
import DocumentExtractor from "@/components/dashboard/user/documentExtractor";

export default function Step4KnowledgeBase() {
  const {
    businessName,
    selectedIntentions,
    knowledgeBaseItems,
    addKnowledgeBaseItem,
    removeKnowledgeBaseItem,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [mode, setMode] = useState<'select' | 'manual' | 'questions' | 'document'>('select');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Manual advice state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAdvice, setManualAdvice] = useState('');
  const [manualFlows, setManualFlows] = useState<FlowIntention[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const response = await fetch('/api/onboarding/generate-advice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry: 'real-estate',
          flows: selectedIntentions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const { questions } = await response.json();
      setGeneratedQuestions(questions);
      setMode('questions');
      setCurrentQuestionIndex(0);
      setQuestionAnswers({});
    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAnswerQuestion = (question: string, answer: string) => {
    setQuestionAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaveQuestionAnswers = () => {
    Object.entries(questionAnswers).forEach(([question, answer]) => {
      if (answer.trim()) {
        addKnowledgeBaseItem({
          title: question,
          advice: answer,
          flows: selectedIntentions,
          tags: [],
          source: 'questions',
        });
      }
    });
    setMode('select');
    setGeneratedQuestions([]);
    setQuestionAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleSaveManualAdvice = () => {
    if (manualTitle.trim() && manualAdvice.trim() && manualFlows.length > 0) {
      addKnowledgeBaseItem({
        title: manualTitle.trim(),
        advice: manualAdvice.trim(),
        flows: manualFlows,
        tags: [],
        source: 'manual',
      });
      setManualTitle('');
      setManualAdvice('');
      setManualFlows([]);
      setMode('select');
    }
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  const handleNext = () => {
    markStepComplete(4);
    setCurrentStep(5);
    alert('Knowledge base configured! Next step coming soon...');
  };

  const canProceed = knowledgeBaseItems.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          Build Your Knowledge Base
        </h2>
        <p className="text-cyan-200/70">
          Add your expertise so the chatbot can provide personalized advice
        </p>
      </div>

      {/* Mode Selection */}
      {mode === 'select' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMode('manual')}
              className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all text-left"
            >
              <FileText className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-cyan-200 mb-2">Write Manually</h3>
              <p className="text-sm text-cyan-200/70">
                Think of advice off the top of your head and write it directly
              </p>
            </button>

            <button
              onClick={handleGenerateQuestions}
              disabled={generatingQuestions}
              className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all text-left disabled:opacity-50"
            >
              {generatingQuestions ? (
                <Loader2 className="h-8 w-8 text-cyan-400 mb-3 animate-spin" />
              ) : (
                <Sparkles className="h-8 w-8 text-cyan-400 mb-3" />
              )}
              <h3 className="font-semibold text-cyan-200 mb-2">AI-Generated Questions</h3>
              <p className="text-sm text-cyan-200/70">
                Answer AI-generated questions to extract your knowledge
              </p>
            </button>

            <button
              onClick={() => setMode('document')}
              className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all text-left"
            >
              <Upload className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-cyan-200 mb-2">Upload Documents</h3>
              <p className="text-sm text-cyan-200/70">
                Drop documents to extract relevant information with AI
              </p>
            </button>
          </div>

          {/* Knowledge Base Items Summary */}
          {knowledgeBaseItems.length > 0 && (
            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-cyan-200">
                  Added Items ({knowledgeBaseItems.length})
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {knowledgeBaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-cyan-200">{item.title}</p>
                        {/* Rule Type Badge - Default to Universal for onboarding items */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                          🌐 Universal
                        </span>
                      </div>
                      <p className="text-xs text-cyan-200/60 mt-1 line-clamp-2">
                        {item.advice}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {item.flows.map((flow) => (
                          <span
                            key={flow}
                            className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded"
                          >
                            {flow}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeKnowledgeBaseItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Manual Advice Entry */}
      {mode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cyan-200">Write Advice Manually</h3>
            <button
              onClick={() => setMode('select')}
              className="text-slate-400 hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g., First-time buyer tips"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Advice Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={manualAdvice}
              onChange={(e) => setManualAdvice(e.target.value)}
              rows={6}
              placeholder="Write your advice here... (2-4 sentences recommended)"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Applicable Flows <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {selectedIntentions.map((intention) => (
                <button
                  key={intention}
                  type="button"
                  onClick={() =>
                    setManualFlows((prev) =>
                      prev.includes(intention)
                        ? prev.filter((f) => f !== intention)
                        : [...prev, intention]
                    )
                  }
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                    ${manualFlows.includes(intention)
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                    }
                  `}
                >
                  {intention.charAt(0).toUpperCase() + intention.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMode('select')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveManualAdvice}
              disabled={!manualTitle.trim() || !manualAdvice.trim() || manualFlows.length === 0}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Advice
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Questions Flow */}
      {mode === 'questions' && generatedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-cyan-200">
                Question {currentQuestionIndex + 1} of {generatedQuestions.length}
              </h3>
              <p className="text-sm text-cyan-200/70 mt-1">
                Answer these questions to build your knowledge base
              </p>
            </div>
            <button
              onClick={() => {
                setMode('select');
                setGeneratedQuestions([]);
                setQuestionAnswers({});
                setCurrentQuestionIndex(0);
              }}
              className="text-slate-400 hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Question */}
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              {generatedQuestions[currentQuestionIndex]}
            </label>
            <textarea
              value={questionAnswers[generatedQuestions[currentQuestionIndex]] || ''}
              onChange={(e) =>
                handleAnswerQuestion(generatedQuestions[currentQuestionIndex], e.target.value)
              }
              rows={5}
              placeholder="Type your answer here... (2-4 sentences recommended)"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            {currentQuestionIndex < generatedQuestions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveQuestionAnswers}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save All Answers
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Document Upload */}
      {mode === 'document' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-200">Upload Documents</h3>
            <button
              onClick={() => setMode('select')}
              className="text-slate-400 hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DocumentExtractor
            onComplete={(items) => {
              // Items are already added to store by DocumentExtractor
              setMode('select');
            }}
            onCancel={() => setMode('select')}
            initialFlows={selectedIntentions}
          />
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-cyan-500/20">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-white/5 border border-cyan-500/30 text-cyan-200 hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all
            ${canProceed
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 text-slate-100 p-8 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
                <h2 className="text-2xl font-bold text-white">Understanding Rules vs Universal Advice</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-full hover:bg-slate-700 transition"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    🌐 Universal Advice
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    Advice that applies to all users in your selected flows. No conditions needed.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Example: "General home buying tips" - applies to anyone in the "buy" flow
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                    🎯 Simple Conditions
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    Quick filtering based on user answers (e.g., property type, timeline).
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Example: "First-time buyer tips" - only shows when buyingReason = 'first-home'
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    🔧 Complex Rules
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    Advanced targeting with AND/OR logic for precise situations.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Example: "Urgent relocation strategy" - only shows when timeline = '0-3' AND sellingReason = 'relocating'
                  </p>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm text-cyan-200 font-medium mb-1">💡 When to Use Rules</p>
                  <p className="text-xs text-cyan-200/80">
                    Start with universal advice. Add rules later if you want to target specific situations. You can always edit rules after onboarding.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

