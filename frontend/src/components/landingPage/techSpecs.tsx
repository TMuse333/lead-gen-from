"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Zap, Layout, Calendar, Target, MessageSquare, Settings } from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
  useInView,
} from "framer-motion";
import Image from "next/image";
import { scrollToId } from "@/lib/scrollTo";

const COLORS_ACCENT = ["#00eeff", "#00c8ff", "#00a0ff", "#0088ee", "#0066cc"];

interface TechSpecsProps {
  imageSrc?: string;
}

const TechSpecs = ({ imageSrc }: TechSpecsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const color = useMotionValue(COLORS_ACCENT[0]);
  useEffect(() => {
    animate(color, COLORS_ACCENT, {
      ease: "easeInOut",
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #0a1525 40%, ${color}20)`;
  const borderGlow = useMotionTemplate`1px solid ${color}80`;

  const specs = [
    { icon: Calendar, title: "Personalized Buying Timeline",        description: "Auto-generated roadmaps tailored to each buyer's budget, timeline, and goals — from pre-approval to closing day.", gradient: "from-cyan-400 to-blue-500" },
    { icon: MessageSquare, title: "AI Chat Assistant",              description: "Smart conversational AI gathers buyer info naturally, qualifying leads while providing immediate value.", gradient: "from-cyan-500 to-blue-600" },
    { icon: Target,  title: "Milestone Tracking",                   description: "Visual phases and tasks help buyers understand each step of their journey — Pre-Approval, Home Search, Offer, Closing.", gradient: "from-blue-500 to-cyan-600" },
    { icon: Layout,  title: "Branded Experience",                   description: "Your name, your style. Each timeline is generated with your branding and personalized agent touch.", gradient: "from-cyan-400 to-teal-500" },
    { icon: Settings,title: "Easy Customization",                   description: "No-code dashboard to customize phases, questions, and content. Add your own advice and stories for each step.", gradient: "from-blue-500 to-cyan-700" },
    { icon: Sparkles,title: "Instant Lead Notifications",           description: "Get notified immediately when a new lead completes their timeline. Full conversation history included.", gradient: "from-cyan-300 to-blue-700" },
  ];

  return (
    <motion.section
      id="specs"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0a1525] px-4 py-24 text-white"
      style={{ backgroundImage }}
    >
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm rounded-full mb-4 border border-cyan-400/40">
            <Zap className="h-4 w-4 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-200">Built for Real Estate Agents</span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Capture Leads</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-cyan-100/80 max-w-3xl mx-auto">
            A complete lead generation system that qualifies buyers and delivers personalized value — all while you focus on closing deals.
          </motion.p>
        </div>

        {imageSrc && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 1, delay: 0.3 }} className="mb-16">
            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
              <Image src={imageSrc} alt="Platform showcase" width={1200} height={600} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1525]/70 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* FIXED GRID – NO FLASH AT ALL */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.title}
                initial={{ opacity: 0, y: 70 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.2 + i * 0.08,
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative group"
              >
                {/* This inner div holds backdrop-blur + border → never animated */}
                <div className="absolute inset-0 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-cyan-900/60 
                  transition-all duration-500 group-hover:border-cyan-400/80 group-hover:bg-slate-900/80 
                  group-hover:shadow-xl group-hover:shadow-cyan-500/20" 
                />

                {/* This div is the only one that animates → pure transform + opacity */}
                <div
                  className="relative h-full p-6 rounded-2xl"
                  style={{ transform: "translateZ(0)" }}   // forces its own GPU layer
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${spec.gradient} mb-4 shadow-lg shadow-cyan-500/30 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-cyan-50">{spec.title}</h3>
                  <p className="text-cyan-200/70 text-sm leading-relaxed">{spec.description}</p>

                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 
                    group-hover:from-cyan-500/10 group-hover:to-blue-600/5 transition-all duration-700 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA – also flash-free */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.9 }} className="text-center mt-20">
          <p className="text-cyan-100 mb-8 text-lg">Ready to start capturing more leads?</p>
          <motion.button
            onClick={() => scrollToId("chatbot")}
            style={{ border: borderGlow, willChange: "border-color" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-shadow duration-300"
          >
            <Sparkles className="h-6 w-6" />
            Try the Demo
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TechSpecs;