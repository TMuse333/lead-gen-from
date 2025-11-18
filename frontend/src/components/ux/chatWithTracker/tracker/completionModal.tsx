import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Check, Database, Search, Radar, BarChart3, Brain, TrendingUp } from 'lucide-react';
import { CalculationStep } from './calculateStep';


interface CompletionModalProps {
  showModal: boolean;
  calculationStep: number;
  answersArray: [string, string][];
}

export function CompletionModal({ showModal, calculationStep, answersArray }: CompletionModalProps) {
  const steps = [
    { 
      icon: <Database size={18} />, 
      text: "Connecting to Qdrant vector database", 
      subtext: "2,847 documents indexed",
      step: 0,
      color: "text-blue-600"
    },
    { 
      icon: <Search size={18} />, 
      text: "Running semantic similarity search", 
      subtext: `Found ${Math.floor(Math.random() * 8) + 12} relevant insights`,
      step: 1,
      color: "text-purple-600"
    },
    { 
      icon: <Radar size={18} />, 
      text: "Evaluating rule-based conditions", 
      subtext: `${Math.floor(Math.random() * 4) + 3} rules matched`,
      step: 2,
      color: "text-indigo-600"
    },
    { 
      icon: <BarChart3 size={18} />, 
      text: "Analyzing your unique profile", 
      subtext: `${answersArray.length} data points processed`,
      step: 3,
      color: "text-pink-600"
    },
    { 
      icon: <Brain size={18} />, 
      text: "AI crafting personalized content", 
      subtext: "GPT-4o-mini generating...",
      step: 4,
      color: "text-orange-600"
    },
    { 
      icon: <TrendingUp size={18} />, 
      text: "Optimizing action plan priority", 
      subtext: `${Math.floor(Math.random() * 3) + 4} steps prioritized`,
      step: 5,
      color: "text-green-600"
    },
    { 
      icon: <Sparkles size={18} />, 
      text: "Finalizing your experience", 
      subtext: "Assembling components...",
      step: 6,
      color: "text-yellow-600"
    },
  ];

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => {}}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pointer-events-none"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Confetti particles */}
            {calculationStep >= 7 && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${Math.random() * 360}, 80%, 70%)`,
                      left: `${Math.random() * 100}%`,
                      top: '100%',
                    }}
                    animate={{
                      y: [-400 - Math.random() * 200, 0],
                      x: [0, Math.sin(i) * 50],
                      opacity: [1, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </>
            )}

            {/* Trophy Animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <Trophy className="text-yellow-500" size={90} />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(234, 179, 8, 0.6)',
                      '0 0 60px rgba(234, 179, 8, 0.9)',
                      '0 0 30px rgba(234, 179, 8, 0.6)',
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              🎉 AI Analysis Complete!
            </h2>
            
            <p className="text-gray-700 text-center mb-8 font-medium">
              Generating your personalized landing page...
            </p>

            {/* Enhanced calculation steps */}
            <div className="space-y-3 mb-6">
              {steps.map((item, i) => (
                <CalculationStep key={i} item={item} calculationStep={calculationStep} />
              ))}
            </div>

            {/* Enhanced loading bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 relative"
                initial={{ width: 0 }}
                animate={{ width: `${(calculationStep / 7) * 100}%` }}
                transition={{ duration: 0.4 }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-600 font-medium">
                Processing step {calculationStep + 1} of {steps.length}
              </p>
              <motion.p 
                className="text-xs font-bold text-indigo-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {Math.round((calculationStep / 7) * 100)}% complete
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}