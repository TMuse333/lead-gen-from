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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5 text-purple-600" />
        <p className="font-medium text-gray-900">Real-time Analysis</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <p className="text-gray-700">{dbActivity}</p>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Match Score:</span>
          <span className="font-bold text-purple-600">{matchScore.toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Items Found:</span>
          <span className="font-bold text-purple-600">{itemsFound}</span>
        </div>
      </div>
    </motion.div>
  );
}