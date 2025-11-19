import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface CurrentInsightProps {
  currentInsight: string;
}

export function CurrentInsight({ currentInsight }: CurrentInsightProps) {
  // Show fallback instead of hiding
  const displayText = currentInsight || "Gathering your information...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-slate-700 rounded-lg border-l-4 border-[#00bfff] shadow-sm"
    >
      <p className="text-sm text-white font-medium flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#00bfff]" />
        {displayText}
      </p>
    </motion.div>
  );
}