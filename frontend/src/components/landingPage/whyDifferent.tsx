'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Brain, Sparkles, Rocket, Target, Shield, ArrowRight } from 'lucide-react';

export default function WhyDifferentSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-[#0a1525] transition-all"
    >
      {/* Animated background glows */}
      {/* <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-4000" />
      </div> */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-md mb-8
          
          "
        >
          <Brain className="h-5 w-5 text-cyan-300" />
          <span className="text-cyan-200 font-medium">Beyond Traditional Chatbots</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
        >
          Most Chatbots Are Stuck in 2023.
          <br />
          <span className="text-cyan-100">We Live in 2026.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-xl text-cyan-100/70 max-w-3xl mx-auto"
        >
         While most chatbots today are just basic websites with a chatgpt wrapper
         and a few details about their business,
          we built a <span className="text-cyan-300 font-semibold">living neural system</span> that thinks, adapts, and converts — instantly.
        </motion.p>

        {/* Diagonal Split Comparison */}
        <div className="mt-20 grid md:grid-cols-2 gap-10 items-stretch">
          {/* LEFT: Old way – now more visible but still clearly inferior */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-md border border-cyan-800/40 shadow-xl shadow-black/50"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-cyan-900/10 to-transparent opacity-30" />
            
            <h3 className="relative text-2xl font-bold text-cyan-200/80 mb-8 flex items-center gap-3 justify-start">
              <span className="text-cyan-400/60">Traditional Chatbots</span>
            </h3>
            <ul className="space-y-5 text-left text-cyan-300/70">
              {[
                "Generic answers",
                "Text walls",
                "No memory",
                "High bounce rate",
                "Manual setup",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700/80 border border-gray-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-sm">×</span>
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT: Our way – glowing and dominant */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-cyan-800/40 backdrop-blur-xl border-2 border-cyan-400/80 shadow-2xl shadow-cyan-500/40"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5" />
            
            <h3 className="relative text-3xl font-bold text-cyan-100 mb-8 flex items-center gap-4 justify-start">
              <Rocket className="h-9 w-9 text-cyan-300" />
              The Neural Advantage
            </h3>
            <ul className="space-y-6 text-left text-cyan-50">
              {[
                "Understands context like a human expert",
                "Gamified journey with real rewards",
                "Remembers everything forever",
                "You can customize the flow of conversation",
                "Upload all your business knowledge for the bot to use",
              ].map((item) => (
                <li key={item} className="flex items-center gap-5">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/40 border border-cyan-300 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4.5 w-4.5 text-cyan-200" />
                  </div>
                  <span className="font-semibold text-lg leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Floating highlight cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Brain, title: "Neural Memory", desc: "Upload all your business knowledge into the neural engine so your chatbot delivers accurate information" },
            { icon: Target, title: "Guided conversations", desc: "Visuals to guide user to conversion and motivate them to continue using the form" },
            { icon: Shield, title: "Instant personalized offer", desc: "The chatbot automatically generates a personalized analysis of the users situation" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.7 }}
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-4 px-12 py-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl shadow-2xl shadow-cyan-500/60 hover:shadow-cyan-400/80 transition-all duration-300"
          >
            <Sparkles className="h-7 w-7" />
            Experience the Neural Difference Now
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-3" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}