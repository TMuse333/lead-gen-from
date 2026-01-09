// frontend/src/components/dashboard/user/offers/editor/tabs/InputsTab.tsx
/**
 * Input Requirements tab for offer editor
 * Shows questions that the chatbot asks, grouped by intent
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import type { OfferDefinition } from '@/lib/offers/core/types';
import {
  getOffer,
  getQuestionsForOffer,
  type Question,
  type Intent,
} from '@/lib/offers/unified';

interface InputsTabProps {
  definition: OfferDefinition;
}

export function InputsTab({ definition }: InputsTabProps) {
  const offer = getOffer(definition.type as any);
  const [expandedIntents, setExpandedIntents] = useState<Set<Intent>>(
    new Set(['buy', 'sell', 'browse'])
  );

  const toggleIntent = (intent: Intent) => {
    setExpandedIntents((prev) => {
      const next = new Set(prev);
      if (next.has(intent)) {
        next.delete(intent);
      } else {
        next.add(intent);
      }
      return next;
    });
  };

  // Get questions for each intent from the unified offer
  const intentData: { intent: Intent; label: string; questions: Question[] }[] = [
    {
      intent: 'buy' as Intent,
      label: 'Buy Intent',
      questions: getQuestionsForOffer(definition.type as any, 'buy'),
    },
    {
      intent: 'sell' as Intent,
      label: 'Sell Intent',
      questions: getQuestionsForOffer(definition.type as any, 'sell'),
    },
    {
      intent: 'browse' as Intent,
      label: 'Browse Intent',
      questions: getQuestionsForOffer(definition.type as any, 'browse'),
    },
  ].filter((d) => d.questions.length > 0);

  if (!offer) {
    // Fallback to old system if unified offer not found
    return <LegacyInputsTab definition={definition} />;
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">Questions by Intent</h3>
        <p className="text-slate-300 text-sm">
          These are the questions the chatbot asks users. Questions are grouped by
          intent (buy/sell/browse). Adding questions here automatically updates the
          chatbot.
        </p>
      </div>

      {/* Questions by Intent */}
      {intentData.map(({ intent, label, questions }) => (
        <div key={intent} className="border border-slate-700 rounded-lg overflow-hidden">
          {/* Intent Header */}
          <button
            onClick={() => toggleIntent(intent)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedIntents.has(intent) ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-slate-100 font-medium">{label}</span>
              <span className="text-sm bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                {questions.length} questions
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {questions.filter((q) => q.required).length} required
            </div>
          </button>

          {/* Questions List */}
          {expandedIntents.has(intent) && (
            <div className="p-4 space-y-3 bg-slate-900/30">
              {questions.map((question, index) => (
                <QuestionItem key={question.id} question={question} index={index} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Info */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">
          Questions are defined in the offer configuration. The chatbot automatically
          uses these questions based on the selected intent. Required questions must
          be answered before the offer can be generated.
        </p>
      </div>
    </div>
  );
}

function QuestionItem({ question, index }: { question: Question; index: number }) {
  const [showButtons, setShowButtons] = useState(false);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Question Header */}
          <div className="flex items-center gap-2 mb-2">
            {question.required ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
            <span className="text-slate-100 font-medium">{question.text}</span>
          </div>

          {/* Question Metadata */}
          <div className="ml-6 space-y-1">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                Field: <code className="text-cyan-400">{question.mappingKey}</code>
              </span>
              <span className="text-slate-400">
                Type:{' '}
                <span className="text-slate-300 capitalize">{question.inputType}</span>
              </span>
              <span className="text-slate-400">
                Order: <span className="text-slate-300">{question.order}</span>
              </span>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {question.required ? (
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                  Required
                </span>
              ) : (
                <span className="text-xs bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded">
                  Optional
                </span>
              )}
              {question.inputType === 'buttons' && question.buttons && (
                <button
                  onClick={() => setShowButtons(!showButtons)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {showButtons ? 'Hide' : 'Show'} {question.buttons.length} options
                </button>
              )}
            </div>

            {/* Button Options */}
            {showButtons && question.buttons && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {question.buttons.map((btn) => (
                  <div
                    key={btn.id}
                    className="bg-slate-700/50 rounded px-3 py-2 text-sm"
                  >
                    <div className="text-slate-200">{btn.label}</div>
                    <div className="text-slate-500 text-xs">
                      value: {btn.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validation Info */}
            {question.validation && (
              <div className="mt-2 text-xs text-slate-500">
                {question.validation.minLength && (
                  <span className="mr-3">Min: {question.validation.minLength}</span>
                )}
                {question.validation.maxLength && (
                  <span className="mr-3">Max: {question.validation.maxLength}</span>
                )}
                {question.validation.pattern && (
                  <span>Pattern: {question.validation.pattern}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Legacy fallback for offers not yet in unified system
function LegacyInputsTab({ definition }: InputsTabProps) {
  const { requiredFields, optionalFields, fieldValidations } =
    definition.inputRequirements;

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <h3 className="text-amber-400 font-semibold mb-2">Legacy Field View</h3>
        <p className="text-slate-300 text-sm">
          This offer has not been migrated to the unified system yet. Showing field
          requirements instead of questions.
        </p>
      </div>

      {/* Required Fields */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Required Fields ({requiredFields.length})
        </h3>
        <div className="space-y-2">
          {requiredFields.map((field) => (
            <LegacyFieldItem
              key={field}
              field={field}
              required={true}
              validation={fieldValidations?.[field]}
            />
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      {optionalFields && optionalFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Optional Fields ({optionalFields.length})
          </h3>
          <div className="space-y-2">
            {optionalFields.map((field) => (
              <LegacyFieldItem
                key={field}
                field={field}
                required={false}
                validation={fieldValidations?.[field]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LegacyFieldItem({
  field,
  required,
  validation,
}: {
  field: string;
  required: boolean;
  validation?: any;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2">
        {required ? (
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
        ) : (
          <Circle className="w-4 h-4 text-slate-500" />
        )}
        <span className="text-slate-100 font-medium">{field}</span>
        {required && (
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
            Required
          </span>
        )}
      </div>
      {validation && (
        <div className="mt-2 ml-6 text-sm text-slate-400">
          {validation.type && <span className="mr-3">Type: {validation.type}</span>}
          {validation.minLength && (
            <span className="mr-3">Min: {validation.minLength}</span>
          )}
        </div>
      )}
    </div>
  );
}
