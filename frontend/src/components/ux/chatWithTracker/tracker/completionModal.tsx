// components/completionModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Database, Search, Radar, BarChart3, Brain, TrendingUp, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';
import logo from '../../../../../public/logo.png'; // ← Your exact path

interface CompletionModalProps {
  showModal: boolean;
  calculationStep: number;
  answersArray: [string, string][];
}

export function CompletionModal({ showModal, calculationStep, answersArray }: CompletionModalProps) {
  const steps = [
    { icon: <Database size={18} />, text: "Connecting to neural knowledge base", subtext: "12,483 vectors loaded" },
    { icon: <Search size={18} />, text: "Running semantic similarity search", subtext: "Found 18 highly relevant insights" },
    { icon: <Radar size={18} />, text: "Evaluating user profile rules", subtext: "7 conditions matched" },
    { icon: <BarChart3 size={18} />, text: "Building personalized profile", subtext: `${answersArray.length} data points analyzed` },
    { icon: <Brain size={18} />, text: "Neural engine generating content", subtext: "GPT-4o + RAG in progress..." },
    { icon: <TrendingUp size={18} />, text: "Prioritizing action steps", subtext: "6 high-impact items selected" },
    { icon: <Sparkles size={18} />, text: "Finalizing your experience", subtext: "Polishing output..." },
  ];

  const finalStep = steps.length; // 7 steps → finalStep = 7
  const progress = calculationStep >= finalStep ? 100 : (calculationStep / finalStep) * 100;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(34, 211, 238, 0.4)',
              boxShadow: '0 0 80px rgba(6, 182, 212, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent" />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-cyan-400/30 to-transparent"
              />
            </div>

            {/* Logo Header */}
            <div className="relative z-10 flex justify-center pt-6 pb-4">
              <Image
                src={logo}
                alt="Logo"
                width={140}
                height={60}
                className="h-14 w-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Trophy + Title */}
            <div className="relative z-10 text-center px-8 pb-6">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Trophy className="mx-auto text-cyan-400" size={80} strokeWidth={2.5} />
              </motion.div>

              <h2 className="mt-5 text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Neural Analysis Complete!
              </h2>
              <p className="mt-3 text-cyan-100/80 text-lg">
                Generating your personalized experience...
              </p>
            </div>

            {/* Steps List */}
            <div className="relative z-10 px-8 space-y-3">
              {steps.map((item, i) => {
                const isActive = calculationStep > i;
                const isCurrent = calculationStep === i + 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isActive ? 1 : (isCurrent ? 0.8 : 0.5), 
                      x: 0 
                    }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 py-2"
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-cyan-500/20' 
                        : isCurrent 
                        ? 'bg-cyan-500/10 animate-pulse' 
                        : 'bg-slate-700/50'
                    }`}>
                      <div className={isActive ? 'text-cyan-400' : isCurrent ? 'text-cyan-400/70' : 'text-cyan-600/50'}>
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${
                        isActive ? 'text-cyan-50' : isCurrent ? 'text-cyan-200' : 'text-cyan-300/60'
                      }`}>
                        {item.text}
                      </p>
                      <p className="text-xs text-cyan-300/70">{item.subtext}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Check size={20} className="text-cyan-400" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Loading Bar + Status */}
            <div className="relative z-10 px-8 mt-6 mb-8">
              <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-800/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>

              <div className="flex justify-between mt-3 text-sm">
                <span className="text-cyan-300/80">
                  {calculationStep >= finalStep ? "Finalizing output..." : `Step ${calculationStep + 1} of ${finalStep}`}
                </span>
                <motion.span
                  className="font-bold text-cyan-400"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {Math.round(progress)}% Complete
                </motion.span>
              </div>
            </div>

            {/* Final pulsing glow when complete */}
            {calculationStep >= finalStep && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                animate={{
                  boxShadow: [
                    "0 0 60px rgba(34, 211, 238, 0.4)",
                    "0 0 100px rgba(34, 211, 238, 0.7)",
                    "0 0 60px rgba(34, 211, 238, 0.4)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}