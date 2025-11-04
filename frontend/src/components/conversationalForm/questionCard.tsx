'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FormQuestion } from '@/types';

import MultiSelect from './inputs/multiSelect';
import EmailInput from './inputs/emailInput';
import TextareaInput from './inputs/textAreaInput';

interface QuestionCardProps {
  question: FormQuestion;
  onAnswer: (value: string | string[] | number) => void;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  onAnswer,
  isLast,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.subtext && (
          <p className="text-gray-600 mb-6">{question.subtext}</p>
        )}

        {/* INPUT TYPES */}
        {question.type === 'button-select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.choices?.map((c) => (
              <button
                key={c.id}
                onClick={() => onAnswer(c.value)}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
              >
                {c.icon && (
                  <span className="text-2xl group-hover:scale-110 transition">
                    {c.icon}
                  </span>
                )}
                <span className="font-medium text-gray-900">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === 'multi-select' && (
          <MultiSelect
            choices={question.choices ?? []}
            onSubmit={(vals) => onAnswer(vals)}
          />
        )}

        {question.type === 'email' && (
          <EmailInput
            placeholder={question.placeholder}
            onSubmit={(v) => onAnswer(v)}
          />
        )}

        {question.type === 'textarea' && (
          <TextareaInput
            placeholder={question.placeholder}
            onSubmit={(v) => onAnswer(v)}
            isLast={isLast}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}