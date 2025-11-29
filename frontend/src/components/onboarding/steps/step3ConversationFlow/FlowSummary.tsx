"use client";

import { motion } from "framer-motion";
import { Sparkles, Edit2, Type, MousePointerClick } from "lucide-react";
import type { ConversationFlow } from "@/stores/conversationConfig/conversation.store";
import type { FlowIntention } from "@/stores/onboardingStore/onboarding.store";

interface FlowSummaryProps {
  flow: ConversationFlow;
  flowType: FlowIntention;
  onEditQuestion: (questionId: string) => void;
  onEnhanceWithAI: () => void;
}

export default function FlowSummary({
  flow,
  flowType,
  onEditQuestion,
  onEnhanceWithAI,
}: FlowSummaryProps) {
  const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-cyan-200">
            {flow.name}
          </h3>
          <p className="text-sm text-cyan-200/70">{flow.description}</p>
        </div>
        <button
          onClick={onEnhanceWithAI}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Enhance with AI
        </button>
      </div>

      <div className="space-y-3">
        {sortedQuestions.map((question) => (
          <div
            key={question.id}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">
                    Question {question.order}
                  </span>
                  {question.allowFreeText ? (
                    <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded flex items-center gap-1">
                      <Type className="h-3 w-3" />
                      Free Text
                    </span>
                  ) : (
                    <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      Buttons ({question.buttons?.length || 0})
                    </span>
                  )}
                </div>
                <p className="text-cyan-200 font-medium">{question.question}</p>
                {!question.allowFreeText && question.buttons && question.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {question.buttons.slice(0, 3).map((button) => (
                      <div
                        key={button.id}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-200 rounded-full text-xs font-medium"
                      >
                        {button.label}
                      </div>
                    ))}
                    {question.buttons.length > 3 && (
                      <div className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 text-slate-400 rounded-full text-xs">
                        +{question.buttons.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => onEditQuestion(question.id)}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-cyan-200 rounded-lg transition-colors text-sm"
              >
                <Edit2 className="h-4 w-4" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

