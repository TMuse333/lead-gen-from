import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface CurrentInsightProps {
  currentInsight: string;
}

export function CurrentInsight({ currentInsight }: CurrentInsightProps) {
  if (!currentInsight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-500 shadow-sm"
    >
      <p className="text-sm text-gray-800 font-medium flex items-center gap-2">
        <Zap className="h-4 w-4 text-indigo-600" />
        {currentInsight}
      </p>
    </motion.div>
  );
}