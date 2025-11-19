'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Sparkles, Rocket, Target, Shield, ArrowRight } from 'lucide-react';

export default function WhyDifferentSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#0a1525]">
      {/* Animated background glows – same as Hero */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Floating badge */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-md mb-8"
        >
          <Brain className="h-5 w-5 text-cyan-300" />
          <span className="text-cyan-200 font-medium">Beyond Traditional Chatbots</span>
        </motion.div>

        {/* Main headline – glowing cyan */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
        >
          Most Chatbots Are Stuck in 2023.
          <br />
          <span className="text-cyan-100">We Live in 2026.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-6 text-xl text-cyan-100/70 max-w-3xl mx-auto"
        >
          While others are still prompting LLMs like it&apos;s a science fair project,
          we built a <span className="text-cyan-300 font-semibold">living neural system</span> that thinks, adapts, and converts — instantly.
        </motion.p>

        {/* Diagonal split comparison – futuristic twist */}
        <div className="mt-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Old way (dimmed, blurred) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 0.5, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50"
          >
            <h3 className="text-2xl font-bold text-gray-500 mb-8">Traditional Chatbots</h3>
            <ul className="space-y-4 text-left text-gray-500">
              {["Generic answers", "Text walls", "No memory", "High bounce rate", "Manual setup"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">×</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Our way (glowing, sharp) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-cyan-800/30 backdrop-blur-xl border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/30"
          >
            <h3 className="text-3xl font-bold text-cyan-100 mb-8 flex items-center gap-3 justify-start">
              <Rocket className="h-8 w-8 text-cyan-400" />
              The Neural Advantage
            </h3>
            <ul className="space-y-5 text-left text-cyan-100">
              {[
                "Understands context like a human expert",
                "Gamified journey with real rewards",
                "Remembers everything forever",
                "Converts 5–10× better (real data)",
                "Zero code · Instant deployment",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/30 border border-cyan-300 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-cyan-300" />
                  </div>
                  <span className="font-medium text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Floating highlight cards – orbital style */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Brain, title: "Neural Memory", desc: "Never forgets a user detail — ever" },
            { icon: Target, title: "Hyper-Conversion", desc: "Designed from day one to sell & qualify" },
            { icon: Shield, title: "Future-Proof", desc: "Evolves with your knowledge automatically" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-700/50 backdrop-blur-md hover:border-cyan-400/80 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl bg-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
              <item.icon className="h-10 w-10 text-cyan-400 mb-4" />
              <h4 className="text-xl font-bold text-cyan-100 mb-2">{item.title}</h4>
              <p className="text-cyan-200/70 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA – glowing button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all"
          >
            <Sparkles className="h-6 w-6" />
            Experience the Neural Difference Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}