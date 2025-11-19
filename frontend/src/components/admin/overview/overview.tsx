// components/admin/WelcomeOverview.tsx
'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Zap, Database, Workflow, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WelcomeOverview() {
  return (
    <div className="min-h-screen bg-[#0a1525] pt-24 pb-32 px-6 overflow-hidden">
    
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 -left-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md mb-8">
            <Brain className="h-6 w-6 text-cyan-300" />
            <span className="text-cyan-200 font-semibold">Admin Center — Your Neural Engine</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-cyan-50 leading-tight">
  This is where you create
  <br />
  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
    A Digital Version of your business knowledge
  </span>
</h1>


          <p className="mt-8 text-xl md:text-2xl text-cyan-100/80 max-w-4xl mx-auto leading-relaxed">
            Every piece of expertise you add here becomes part of a living neural system that understands your clients, speaks in your voice, and converts 24/7 — even while you sleep.
          </p>
        </motion.div>

        {/* Core Truth */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-transparent border border-cyan-500/30 backdrop-blur-xl">
            <p className="text-2xl md:text-3xl font-semibold text-cyan-100">
              Your bot is only as smart as the data you give it.
            </p>
            <p className="mt-4 text-cyan-300">
              The more real expertise you feed it — the more powerful, unique, and profitable it becomes.
            </p>
          </div>
        </motion.div>

        {/* How It Works – Two Pillars */}
        <div className="grid md:grid-cols-2 gap-10 mb-20">
          {/* Vector Search */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-3xl blur-3xl group-hover:from-cyan-500/20 transition-all duration-700" />
            <div className="relative bg-slate-900/70 backdrop-blur-xl rounded-3xl p-10 border border-cyan-500/30">
              <div className="p-4 w-fit rounded-2xl bg-cyan-500/20 mb-6">
                <Brain className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-bold text-cyan-50 mb-4">Neural Understanding</h3>
              <p className="text-cyan-100/80 leading-relaxed">
                Upload your real advice. The system turns it into mathematical meaning (embeddings) and instantly finds the perfect response for every user's unique situation — even if they never said the exact words.
              </p>
              <div className="mt-6 flex items-center gap-2 text-cyan-400 font-medium">
                <Sparkles size={20} />
                Semantic search · Context-aware · Feels human
              </div>
            </div>
          </motion.div>

          {/* Rule-Based */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl blur-3xl group-hover:from-blue-500/20 transition-all duration-700" />
            <div className="relative bg-slate-900/70 backdrop-blur-xl rounded-3xl p-10 border border-blue-500/30">
              <div className="p-4 w-fit rounded-2xl bg-blue-500/20 mb-6">
                <Workflow className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-cyan-50 mb-4">Precision Control</h3>
              <p className="text-cyan-100/80 leading-relaxed">
                Define exact rules: “If timeline &lt; 60 days AND condo → show fast-sale checklist”. Guarantee specific advice appears when conditions are met.
              </p>
              <div className="mt-6 flex items-center gap-2 text-blue-400 font-medium">
                <Target size={20} />
                Deterministic · Guaranteed delivery · Your exact process
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-12 border border-cyan-700/40 text-center"
        >
          <h3 className="text-2xl font-bold text-cyan-100 mb-8">How Your Expertise Becomes Intelligence</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-cyan-300">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-500/20 rounded-2xl">
                <Database className="h-8 w-8" />
              </div>
              <span className="text-lg">You upload advice</span>
            </div>
            <ArrowRight size={32} className="hidden md:block text-cyan-500" />
            <div className="text-3xl md:hidden">↓</div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-2xl">
                <Brain className="h-8 w-8" />
              </div>
              <span className="text-lg">Turned into neural embeddings</span>
            </div>
            <ArrowRight size={32} className="hidden md:block text-cyan-500" />
            <div className="text-3xl md:hidden">↓</div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-500/20 rounded-2xl">
                <Zap className="h-8 w-8" />
              </div>
              <span className="text-lg">User gets perfect personalized advice</span>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-20"
        >
          <p className="text-2xl text-cyan-200 mb-8">
            Ready to make your bot truly intelligent?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/admin/flow-editor"
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-all flex items-center gap-3 justify-center"
            >
              <Workflow className="h-6 w-6" />
              Start Designing Your Conversation Flow
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </a>

            <a
              href="/admin/advice-library"
              className="px-10 py-5 rounded-2xl border-2 border-cyan-500/60 bg-transparent text-cyan-100 font-bold text-xl backdrop-blur-sm hover:bg-cyan-500/10 transition-all flex items-center gap-3 justify-center"
            >
              <Brain className="h-6 w-6" />
              Upload Your First Advice
            </a>
          </div>

          {/* <p className="mt-10 text-cyan-300/70">
            Most clients see conversion lifts within the first week of adding their real expertise.
          </p> */}
        </motion.div>
      </div>
    </div>
  );
}