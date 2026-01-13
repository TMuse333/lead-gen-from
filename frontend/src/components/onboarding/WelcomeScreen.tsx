"use client";

import { motion } from "framer-motion";
import { ArrowRight, User, Rocket } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const STEPS = [
  {
    icon: User,
    title: "Your Info",
    description: "Name, email, and business details",
  },
  {
    icon: Rocket,
    title: "You're Live!",
    description: "Then customize your chatbot",
  },
];

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      {/* Header */}
      <div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl mb-4"
        >
          👋
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-3">
          Welcome!
        </h1>
        <p className="text-cyan-200/70 text-lg">
          Let's set up your lead-gen chatbot in 3 quick steps
        </p>
      </div>

      {/* Steps Preview */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Step Card */}
              <div className="flex flex-col items-center text-center w-32">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="text-xs text-cyan-500 font-medium mb-1">
                  Step {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps (not after last) */}
              {index < STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 text-cyan-500/50 hidden sm:block" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50 transition-all hover:scale-105"
        >
          Let's Go
          <ArrowRight className="h-5 w-5" />
        </button>
        <p className="text-xs text-slate-500 mt-4">
          Takes about 2 minutes
        </p>
      </motion.div>
    </motion.div>
  );
}
