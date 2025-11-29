"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Type, MousePointerClick, Plus, Trash2, X } from "lucide-react";
import { useOnboardingStore, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
import type { ConversationQuestion, ButtonOption } from "@/types/conversation.types";

interface QuestionConfigFlowProps {
  flowType: FlowIntention;
  questionId: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function QuestionConfigFlow({
  flowType,
  questionId,
  onComplete,
  onBack,
}: QuestionConfigFlowProps) {
  const { conversationFlows, updateConversationFlow } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(1);

  const flow = conversationFlows[flowType];
  const question = flow?.questions.find((q) => q.id === questionId);

  if (!question) {
    return null;
  }

  // Step 1: Define Question
  const Step1DefineQuestion = () => {
    const [questionText, setQuestionText] = useState(question.question);

    const handleNext = () => {
      updateConversationFlow(flowType, {
        questions: flow.questions.map((q) =>
          q.id === questionId ? { ...q, question: questionText } : q
        ),
      });
      setCurrentStep(2);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-cyan-200 mb-2">Step 1: Define Your Question</h3>
          <p className="text-sm text-cyan-200/70 mb-4">
            What would you like to ask your visitors?
          </p>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
            placeholder="e.g., What type of property are you interested in?"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!questionText.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Choose Answer Type
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Choose Answer Type
  const Step2AnswerType = () => {
    const [answerType, setAnswerType] = useState<'buttons' | 'freeText'>(
      question.allowFreeText ? 'freeText' : 'buttons'
    );

    const handleNext = () => {
      const isFreeText = answerType === 'freeText';
      const updatedQuestion: Partial<ConversationQuestion> = {
        allowFreeText: isFreeText,
        buttons: isFreeText ? undefined : (question.buttons && question.buttons.length > 0
          ? question.buttons
          : [
              {
                id: `btn-${Date.now()}`,
                label: "Button 1",
                value: "button-1",
                tracker: {
                  insight: '',
                  dbMessage: '',
                },
              },
            ]),
      };

      updateConversationFlow(flowType, {
        questions: flow.questions.map((q) =>
          q.id === questionId ? { ...q, ...updatedQuestion } : q
        ),
      });

      if (isFreeText) {
        onComplete();
      } else {
        setCurrentStep(3);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-cyan-200 mb-2">Step 2: Choose Answer Type</h3>
          <p className="text-sm text-cyan-200/70 mb-4">
            How should users respond to this question?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAnswerType('buttons')}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${answerType === 'buttons'
                  ? 'bg-cyan-500/20 border-cyan-500'
                  : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <MousePointerClick className={`h-8 w-8 mb-3 ${answerType === 'buttons' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <h4 className="font-semibold text-cyan-200 mb-2">Button Answers</h4>
              <p className="text-sm text-cyan-200/70">
                Users select from predefined options. Best for multiple choice questions.
              </p>
            </button>
            <button
              onClick={() => setAnswerType('freeText')}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${answerType === 'freeText'
                  ? 'bg-cyan-500/20 border-cyan-500'
                  : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <Type className={`h-8 w-8 mb-3 ${answerType === 'freeText' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <h4 className="font-semibold text-cyan-200 mb-2">Free Text Answer</h4>
              <p className="text-sm text-cyan-200/70">
                Users type their own answer. Best for emails, names, or open-ended questions.
              </p>
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            {answerType === 'buttons' ? 'Next: Configure Buttons' : 'Complete'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Configure Buttons
  const Step3ConfigureButtons = () => {
    const currentQuestion = flow?.questions.find((q) => q.id === questionId);
    const buttons = currentQuestion?.buttons || [];

    const generateValueFromLabel = (label: string): string => {
      return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const handleUpdateButton = (buttonId: string, label: string) => {
      const autoValue = generateValueFromLabel(label);
      updateConversationFlow(flowType, {
        questions: flow.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                buttons: q.buttons?.map((b) =>
                  b.id === buttonId
                    ? {
                        ...b,
                        label,
                        value: autoValue,
                        tracker: b.tracker || { insight: '', dbMessage: '' },
                      }
                    : b
                ),
              }
            : q
        ),
      });
    };

    const handleAddButton = () => {
      const buttonCount = buttons.length;
      const newButton: ButtonOption = {
        id: `btn-${Date.now()}`,
        label: `Button ${buttonCount + 1}`,
        value: `button-${buttonCount + 1}`,
        tracker: {
          insight: '',
          dbMessage: '',
        },
      };

      updateConversationFlow(flowType, {
        questions: flow.questions.map((q) =>
          q.id === questionId
            ? { ...q, buttons: [...(q.buttons || []), newButton] }
            : q
        ),
      });
    };

    const handleDeleteButton = (buttonId: string) => {
      updateConversationFlow(flowType, {
        questions: flow.questions.map((q) =>
          q.id === questionId
            ? { ...q, buttons: q.buttons?.filter((b) => b.id !== buttonId) }
            : q
        ),
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-cyan-200 mb-2">Step 3: Configure Buttons</h3>
          <p className="text-sm text-cyan-200/70 mb-4">
            Add and customize the button options users can choose from.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-cyan-200">
            Button Options
          </label>
          <button
            onClick={handleAddButton}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Button
          </button>
        </div>

        {buttons.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {buttons.map((button, btnIndex) => (
              <div
                key={button.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="mb-3">
                  <label className="block text-xs text-cyan-200/70 mb-2">
                    Button {btnIndex + 1} Preview
                  </label>
                  <div className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium shadow-lg shadow-cyan-500/30 inline-block">
                    {button.label || `Button ${btnIndex + 1}`}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cyan-200 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={button.label}
                    onChange={(e) => handleUpdateButton(button.id, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-cyan-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder={`Enter button text...`}
                  />
                </div>
                <button
                  onClick={() => handleDeleteButton(button.id)}
                  className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-lg text-center">
            <p className="text-sm text-slate-400 mb-3">
              No buttons yet. Add your first button to get started.
            </p>
            <button
              onClick={handleAddButton}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Button
            </button>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-slate-700">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            Complete
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Flow Summary
          </button>
          <h2 className="text-2xl font-bold text-cyan-200">
            Configure Question {question.order}
          </h2>
        </div>
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`
                  flex-1 h-2 rounded-full transition-all
                  ${step <= currentStep
                    ? 'bg-cyan-500'
                    : 'bg-slate-700'
                  }
                `}
              />
              {step < 3 && (
                <div
                  className={`
                    w-2 h-2 rounded-full mx-1 transition-all
                    ${step < currentStep
                      ? 'bg-cyan-500'
                      : 'bg-slate-700'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-cyan-200/70">
          <span className={currentStep >= 1 ? 'text-cyan-300' : ''}>Define Question</span>
          <span className={currentStep >= 2 ? 'text-cyan-300' : ''}>Answer Type</span>
          <span className={currentStep >= 3 ? 'text-cyan-300' : ''}>Configure Buttons</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Step1DefineQuestion />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Step2AnswerType />
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Step3ConfigureButtons />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

