import {motion} from 'framer-motion'
import { Check } from 'lucide-react';

interface AnsweredQuestionsProps {
    userInput: Record<string, string>;
    formatKey: (key: string) => string;
    formatValue: (value: string) => string;
  }

  export function AnsweredQuestions({ userInput, formatKey, formatValue }: AnsweredQuestionsProps) {
    const answersArray = Object.entries(userInput);

    return (
      <div className="space-y-2 mb-6">
        {answersArray.map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-lg shadow-sm border transition-colors"
            style={{
              backgroundColor: 'rgba(var(--color-surface-rgb), 0.8)',
              borderColor: 'rgba(var(--color-primary-rgb), 0.2)',
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-on-surface)' }}>{formatKey(key)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color: 'var(--color-text-on-surface-dim)' }}>{formatValue(value)}</p>
              <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }