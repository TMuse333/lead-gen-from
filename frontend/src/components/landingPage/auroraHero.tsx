"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
  useInView,
} from "framer-motion";
import Link from "next/link";
import logo from "../../../public/logo.png";
import Image from "next/image";
import { scrollToId } from "@/lib/scrollTo";

const COLORS_TOP = ["#00eeff", "#00c8ff", "#00a0ff", "#0088ee", "#0066cc"];

const AuroraHero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, { once: true, margin: "-10%" });

  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`
    radial-gradient(125% 125% at 50% 0%, #0a1525 40%, ${color}20)
  `;
  const border = useMotionTemplate`1px solid ${color}60`;
  const boxShadow = useMotionTemplate`0px 4px 30px ${color}40`;

  return (
    <motion.section
      ref={heroRef}
      style={{ backgroundImage }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-[#0a1525] px-6 py-24 text-white"
    >
      {/* Animated background blobs */}
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-300 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000" />
      </div> */}

      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <Image
            src={logo}
            alt="Logo"
            width={600}
            height={1300}
            className="w-[40vw] max-w-[160px] h-auto object-contain drop-shadow-2xl shadow-cyan-400/50"
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-8 mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/20 backdrop-blur-md px-5 py-2.5 text-sm font-semibold border border-cyan-400/40"
        >
          <Brain className="h-4 w-4 text-cyan-300" />
          <span className="text-cyan-200">Next-Gen Neural AI Platform by FocusFlow Software</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
        >
          Turn Conversations Into
          <br />
          <span className="text-cyan-100">Conversions</span> with Neural Intelligence
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-3xl text-lg sm:text-xl text-cyan-100/70 leading-relaxed"
        >
          Engage visitors with deeply personalized AI conversations, gamified flows, and instant value —
          powered by a <strong className="text-cyan-300">Neural Knowledge Engine</strong> that truly understands your expertise.
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-8 text-sm"
        >
          {[
            { dot: "bg-cyan-400", text: "Real-time Personalization" },
            { dot: "bg-blue-400", text: "Instant Lead Qualification" },
            { dot: "bg-cyan-300", text: "Zero Code Required" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 ${item.dot} rounded-full animate-pulse shadow-lg shadow-${item.dot}/50`} />
              <span className="text-cyan-200/80">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row gap-5"
        >
          
            <motion.button

            onClick={()=> scrollToId('chatbot')}
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-9 py-4.5 text-white font-bold text-lg shadow-2xl hover:shadow-cyan-400/50 transition-all"
            >
              <Zap className="h-6 w-6" />
              Try Live Demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
       

          <Link href="#specs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full border-2 border-cyan-500/60 bg-transparent px-8 py-4 text-cyan-100 font-semibold backdrop-blur-sm hover:bg-cyan-500/10 transition-all"
            >
              Explore Features
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust line */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-10 text-sm text-cyan-300/60"
        >
          Trusted by innovative teams • No credit card required • Instant setup
        </motion.p> */}
      </div>
    </motion.section>
  );
};

export default AuroraHero;