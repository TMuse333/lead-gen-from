import { motion } from 'framer-motion';
import { Sparkles, Trophy, Award, Gift } from 'lucide-react';

interface HeaderProps {
  progress: number;
  isComplete: boolean;
}

export function Header({ progress, isComplete }: HeaderProps) {
  const trophyScale = 0.5 + (progress / 100) * 0.5;

  return (
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="text-blue-600" size={20} />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="text-blue-400 opacity-50" size={20} />
          </motion.div>
        </div>
        <h3 className="font-semibold text-white">AI Analysis</h3>
      </div>

      {/* Growing reward icon */}
      <motion.div
        animate={{ 
          scale: [trophyScale, trophyScale * 1.1, trophyScale],
          rotate: isComplete ? [0, 10, -10, 0] : 0,
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity },
          rotate: { duration: 0.5, repeat: isComplete ? Infinity : 0 }
        }}
        className="relative"
      >
        {isComplete ? (
          <Trophy className="text-yellow-500" size={24 + progress / 4} />
        ) : progress > 50 ? (
          <Award className="text-blue-500" size={24 + progress / 4} />
        ) : (
          <Gift className="text-gray-400" size={24 + progress / 4} />
        )}
        
        {/* Glow effect */}
        {progress > 30 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 ${5 + (progress / 100) * 20}px rgba(59, 130, 246, ${0.3 + (progress / 100) * 0.4})`,
                `0 0 ${15 + (progress / 100) * 30}px rgba(59, 130, 246, ${0.5 + (progress / 100) * 0.5})`,
                `0 0 ${5 + (progress / 100) * 20}px rgba(59, 130, 246, ${0.3 + (progress / 100) * 0.4})`,
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}