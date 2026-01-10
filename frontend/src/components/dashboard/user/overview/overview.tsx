// components/dashboard/user/overview/overview.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Palette,
  Map,
  Home,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  ChevronRight,
  Heart,
  Zap,
  Target,
  Star,
} from 'lucide-react';
import Link from 'next/link';

// Import sample SVGs to show
import { PreApprovalSuccess, HomeValuation, NeighborhoodExplore } from '@/components/svg/timeline';
// Story emphasis SVGs
import { StoryBridge, SocialProofPulse, EmptyVsFull } from '@/components/svg/stories';

const QUICK_LINKS = [
  {
    title: 'Configure Offers',
    description: 'Set up what your bot generates',
    href: '/dashboard?section=offers',
    icon: FileText,
    color: 'cyan',
  },
  {
    title: 'Knowledge Base',
    description: 'Add tips, advice & stories',
    href: '/dashboard?section=knowledge-base',
    icon: BookOpen,
    color: 'emerald',
  },
  {
    title: 'Customize Colors',
    description: 'Match your brand',
    href: '/dashboard?section=settings',
    icon: Palette,
    color: 'purple',
  },
  {
    title: 'Test Your Bot',
    description: 'Preview the client experience',
    href: '/',
    icon: MessageSquare,
    color: 'amber',
  },
];

const INTENT_CARDS = [
  {
    intent: 'buy',
    title: 'Home Buying',
    description: '7-phase journey from pre-approval to move-in',
    icon: Home,
    phases: ['Pre-Approval', 'Find Agent', 'House Hunting', 'Make Offer', 'Under Contract', 'Closing', 'Move In'],
    color: 'from-cyan-500 to-blue-600',
    SampleSvg: PreApprovalSuccess,
  },
  {
    intent: 'sell',
    title: 'Home Selling',
    description: '7-phase journey from valuation to closing',
    icon: TrendingUp,
    phases: ['Home Valuation', 'Staging', 'List Property', 'Showings', 'Review Offers', 'Under Contract', 'Closing'],
    color: 'from-emerald-500 to-teal-600',
    SampleSvg: HomeValuation,
  },
  {
    intent: 'browse',
    title: 'Just Browsing',
    description: '5-phase educational journey for future buyers',
    icon: Search,
    phases: ['Explore Options', 'Financial Education', 'Market Research', 'Compare Homes', 'Next Steps'],
    color: 'from-purple-500 to-indigo-600',
    SampleSvg: NeighborhoodExplore,
  },
];

export default function WelcomeOverview() {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm font-medium">Real Estate Timeline Generator</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Turn Conversations into
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"> Personalized Timelines</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Your AI chatbot collects client information and generates beautiful, step-by-step real estate journeys
            powered by your expertise.
          </p>
        </motion.div>

        {/* STORIES - The Secret Weapon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-2xl border-2 border-amber-500/30 p-8 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Heart className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Stories Are Your Secret Weapon</h2>
                  <p className="text-amber-200/70">This is what makes your bot actually convert leads</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {/* StoryBridge SVG */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-center mb-3">
                    <StoryBridge className="scale-75" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-center">Bridge the Gap</h3>
                  <p className="text-sm text-slate-400 text-center">
                    Your experience + their situation = instant trust
                  </p>
                </div>

                {/* SocialProofPulse SVG */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-center mb-3">
                    <SocialProofPulse className="scale-75" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-center">Multiply Your Impact</h3>
                  <p className="text-sm text-slate-400 text-center">
                    One story influences every matching lead
                  </p>
                </div>

                {/* EmptyVsFull SVG */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-center mb-3 overflow-hidden">
                    <EmptyVsFull className="scale-[0.6]" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-center">The Difference</h3>
                  <p className="text-sm text-slate-400 text-center">
                    Phases with stories convert 3x better
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <Link
                  href="/dashboard?section=knowledge-base"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  <Target className="h-5 w-5" />
                  Add Your Stories Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-slate-500 text-sm">Takes 5 minutes, impacts every lead</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How It Works - Simple Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-12"
        >
          <h2 className="text-lg font-semibold text-slate-300 mb-6 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Step 1 */}
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-white">Client Chats</p>
                <p className="text-sm text-slate-400">Answers a few questions</p>
              </div>
            </div>

            <ChevronRight className="h-6 w-6 text-slate-600 hidden md:block" />
            <div className="text-slate-600 md:hidden">↓</div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Your Knowledge</p>
                <p className="text-sm text-slate-400">Tips & stories injected</p>
              </div>
            </div>

            <ChevronRight className="h-6 w-6 text-slate-600 hidden md:block" />
            <div className="text-slate-600 md:hidden">↓</div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Map className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Timeline Generated</p>
                <p className="text-sm text-slate-400">Personalized roadmap</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Three Intents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Three Client Journeys</h2>
          <p className="text-slate-400 text-center mb-8">Each intent has unique phases and custom illustrations</p>

          <div className="grid md:grid-cols-3 gap-6">
            {INTENT_CARDS.map((card, index) => {
              const Icon = card.icon;
              const SvgComponent = card.SampleSvg;
              return (
                <motion.div
                  key={card.intent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
                >
                  {/* SVG Preview */}
                  <div className={`bg-gradient-to-br ${card.color} p-6 flex items-center justify-center`}>
                    <div className="w-32 h-32 opacity-90">
                      <SvgComponent />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{card.description}</p>

                    {/* Phase Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {card.phases.slice(0, 4).map((phase) => (
                        <span
                          key={phase}
                          className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300"
                        >
                          {phase}
                        </span>
                      ))}
                      {card.phases.length > 4 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-400">
                          +{card.phases.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Knowledge Base */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Knowledge Base</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Your expertise powers the timelines. Add tips for each phase and client stories that build trust.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Tips matched to timeline phases</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Client stories with outcomes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Auto-populate sample stories</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Output */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Map className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Timeline Output</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Beautiful, interactive timelines with your branding. Each phase has custom SVG illustrations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">Animated SVG illustrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">Interactive action checklists</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">Custom color themes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link, index) => {
              const Icon = link.icon;
              const colorClasses = {
                cyan: 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30',
                emerald: 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30',
                purple: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30',
                amber: 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30',
              }[link.color];

              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center mb-3 transition-colors`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-400">{link.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Go</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Coming Soon: PDF Reports & Home Estimates</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
