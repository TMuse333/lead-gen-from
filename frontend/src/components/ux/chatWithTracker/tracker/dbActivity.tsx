import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface DbActivityProps {
  dbActivity: string;
  matchScore: number;
  itemsFound: number;
  progress: number;
}

export function DbActivity({ dbActivity, matchScore, itemsFound, progress }: DbActivityProps) {
  if (progress <= 0 || progress >= 100) return null;

  // Show fallback instead of empty
  const displayText = dbActivity || "Processing your answers...";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-lg border shadow-sm"
      style={{
        backgroundColor: 'rgba(var(--color-surface-rgb), 0.6)',
        borderColor: 'rgba(var(--color-primary-rgb), 0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
        <p className="font-medium" style={{ color: 'var(--color-text-on-surface)' }}>Real-time Analysis</p>
      </div>

      <div className="space-y-2 text-sm">
        <p style={{ color: 'var(--color-text-on-surface-dim)' }}>{displayText}</p>
      </div>
    </motion.div>
  );
}