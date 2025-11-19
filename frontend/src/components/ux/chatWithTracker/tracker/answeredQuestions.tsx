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
      <div className="space-y-2 mb-6 text-white">
        {answersArray.map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-white/80 rounded-lg shadow-sm border-2 border-blue-100 hover:border-blue-300 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{formatKey(key)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">{formatValue(value)}</p>
              <Check className="h-4 w-4 text-green-500" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }