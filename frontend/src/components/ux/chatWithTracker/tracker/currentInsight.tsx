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
      className="mb-4 p-3 rounded-lg border-l-4 shadow-sm"
      style={{
        backgroundColor: 'rgba(var(--color-surface-rgb), 0.7)',
        borderLeftColor: 'var(--color-primary)',
      }}
    >
      <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-text-on-surface)' }}>
        <Zap className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
        {displayText}
      </p>
    </motion.div>
  );
}