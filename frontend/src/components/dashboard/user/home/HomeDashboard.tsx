'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Target,
  MessageSquare,
  TrendingDown,
  CheckCircle2,
  Play,
  Users,
  Zap,
} from 'lucide-react';
import { useUserConfig } from '@/contexts/UserConfigContext';

export default function HomeDashboard() {
  const router = useRouter();
  const { config } = useUserConfig();
  const agentName = config?.agentFirstName || 'there';

  const handleStartSetup = () => {
    router.push('/dashboard?section=stories');
  };

  const handleGoToTimeline = () => {
    router.push('/dashboard?section=timeline');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome back, {agentName}!
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Your chatbot helps potential clients understand their journey by providing
          personalized timelines with your expert insights.
        </p>
      </motion.div>

      {/* Value Proposition Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              The Goal: Reduce Uncertainty
            </h2>
            <p className="text-slate-300">
              Your potential clients have questions and feel uncertain about their real estate journey.
              Your chatbot generates <span className="text-cyan-400 font-medium">personalized timelines</span> that
              answer their questions before they even ask, building trust and positioning you as the expert.
            </p>
          </div>
        </div>

        {/* What makes it work */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            What Makes Your Bot Stand Out
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Your Stories</p>
                <p className="text-slate-400 text-xs mt-1">
                  Real experiences from past clients that make timelines relatable
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Personal Advice</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your expert tips attached to each timeline phase
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Lower Anxiety</p>
                <p className="text-slate-400 text-xs mt-1">
                  Clear timelines reduce the "unknown" that stresses clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Setup Process */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
      >
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-400" />
          Setup Your Bot in 2 Steps
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1: Stories */}
          <div className="relative">
            <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 ml-4">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                Add Your Stories & Knowledge
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Share real client experiences and your expert advice. These become the
                personalized content that appears in timelines.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Client success stories
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Tips for each phase of the journey
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Common questions & answers
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2: Timeline */}
          <div className="relative">
            <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 ml-4">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-400" />
                Configure Your Timeline
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Use the Setup Wizard to customize timeline phases, chatbot questions,
                and how your stories appear.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  Customize timeline phases
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  Edit chatbot questions
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  Preview your bot live
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={handleStartSetup}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/30 transition-all"
          >
            <BookOpen className="h-5 w-5" />
            Start with Stories
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={handleGoToTimeline}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all"
          >
            <Play className="h-5 w-5" />
            Go to Timeline Setup
          </button>
        </div>
      </motion.div>

      {/* Quick Stats (placeholder for future) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">-</p>
          <p className="text-xs text-slate-400">Leads Captured</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <MessageSquare className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">-</p>
          <p className="text-xs text-slate-400">Conversations</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <BookOpen className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">-</p>
          <p className="text-xs text-slate-400">Stories Added</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Play className="h-6 w-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">-</p>
          <p className="text-xs text-slate-400">Timelines Generated</p>
        </div>
      </motion.div>
    </div>
  );
}
