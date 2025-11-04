// src/components/conversational-form/CalculatingIcon.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Home, TrendingUp, DollarSign, Lightbulb, Search } from 'lucide-react';

interface CalculatingIconProps {
  size?: number;
  isComplete?: boolean;
  duration?: number;
}

// 1. Property Profile Collection - Home icon building
export function PropertyCollecting({ size = 20, isComplete = false, duration = 1500 }: CalculatingIconProps) {
  const [showComplete, setShowComplete] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
    } else {
      // Start timer immediately when component mounts
      const timer = setTimeout(() => setShowComplete(true), duration);
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div
            key="calculating"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Home className="text-amber-600" size={size} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check className="text-green-600" size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 2. Searching Comparables - Search with expanding rings
export function SearchingHomes({ size = 20, isComplete = false, duration = 1500 }: CalculatingIconProps) {
  const [showComplete, setShowComplete] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
    } else {
      const timer = setTimeout(() => setShowComplete(true), duration);
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div key="calculating" className="absolute inset-0">
            {/* Expanding rings */}
            {[0, 0.25, 0.5].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-amber-400 rounded-full"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay,
                  ease: 'easeOut',
                }}
              />
            ))}
            {/* Center search icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="text-amber-600" size={size * 0.6} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="text-green-600" size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 3. Market Trends Analysis - Chart bars animating
export function AnalyzingTrends({ size = 20, isComplete = false, duration = 1500 }: CalculatingIconProps) {
  const [showComplete, setShowComplete] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
    } else {
      const timer = setTimeout(() => setShowComplete(true), duration);
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div key="calculating" className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <TrendingUp className="text-amber-600" size={size} />
            </motion.div>
            {/* Animated line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              animate={{ scaleX: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="text-green-600" size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 4. Value Calculation - Dollar sign with numbers
export function CalculatingValue({ size = 20, isComplete = false, duration = 1500 }: CalculatingIconProps) {
  const [showComplete, setShowComplete] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
    } else {
      const timer = setTimeout(() => setShowComplete(true), duration);
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div key="calculating" className="absolute inset-0 flex items-center justify-center">
            {/* Orbiting dots around dollar */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-500 rounded-full"
                animate={{
                  x: [
                    Math.cos((angle * Math.PI) / 180) * (size * 0.35),
                    Math.cos(((angle + 360) * Math.PI) / 180) * (size * 0.35),
                  ],
                  y: [
                    Math.sin((angle * Math.PI) / 180) * (size * 0.35),
                    Math.sin(((angle + 360) * Math.PI) / 180) * (size * 0.35),
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
            {/* Center dollar sign */}
            <DollarSign className="text-amber-600" size={size * 0.7} />
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="text-green-600" size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 5. Generating Recommendations - Lightbulb lighting up
export function GeneratingRecommendations({ size = 20, isComplete = false, duration = 1500 }: CalculatingIconProps) {
  const [showComplete, setShowComplete] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
    } else {
      const timer = setTimeout(() => setShowComplete(true), duration);
      return () => clearTimeout(timer);
    }
  }, [isComplete, duration]);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div key="calculating" className="absolute inset-0 flex items-center justify-center">
            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 bg-amber-300 rounded-full blur-sm"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Lightbulb */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Lightbulb className="text-amber-600" size={size * 0.8} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="text-green-600" size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generic pending icon (square)
export function PendingIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div
        className="w-3 h-3 border-2 border-gray-400 rounded"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}