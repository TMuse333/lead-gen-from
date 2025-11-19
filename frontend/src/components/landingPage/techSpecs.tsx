"use client";

import { useEffect } from "react";
import { Sparkles, Zap, Layout, Settings, Gift, Target, Brain } from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import Image from "next/image";

// New icy-cyan palette (matches the brain exactly)
const COLORS_ACCENT = ["#00eeff", "#00c3ff", "#0099ff", "#0077ee", "#0055cc"];

interface TechSpecsProps {
  imageSrc?: string;
}

const TechSpecs = ({ imageSrc }: TechSpecsProps) => {
  const color = useMotionValue(COLORS_ACCENT[0]);

  useEffect(() => {
    animate(color, COLORS_ACCENT, {
      ease: "easeInOut",
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`
    radial-gradient(125% 125% at 50% 0%, #0a1525 40%, ${color})
  `;
  const borderGlow = useMotionTemplate`1px solid ${color}`;

  const specs = [
    {
      icon: Gift,
      title: "Instant Personalized Offers",
      description: "Auto-generated landing pages tailored to each user's unique situation, delivered in real-time with zero wait.",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: Sparkles,
      title: "Gamified Experience",
      description: "Progress bars, rewards, celebrations, and visual feedback keep users engaged and excited throughout the journey.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Target,
      title: "Guided Smart Flows",
      description: "Contextual questions, dynamic branching, and intelligent tracking ensure users never get bored or lose interest.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: Layout,
      title: "Visual & Interactive",
      description: "Rich animations, smooth transitions, and delightful micro-interactions make every conversation memorable.",
      gradient: "from-cyan-400 to-teal-500",
    },
    {
      icon: Settings,
      title: "Powerful Configuration Dashboard",
      description: "No-code admin panel to customize flows, questions, advice, and content — complete control without touching code.",
      gradient: "from-blue-500 to-cyan-700",
    },
    {
      icon: Brain,
      title: "Neural Knowledge Engine",
      description: "Your expert content is instantly understood and turned into perfectly relevant, deeply personalized answers using next-gen AI.",
      gradient: "from-cyan-300 to-blue-700",
    },
  ];

  return (
    <motion.section
      style={{ backgroundImage }}
      className="relative overflow-hidden bg-[#0a1525] px-4 py-24 text-white"
    >
      {/* Subtle animated blobs — now cyan/teal with a whisper of violet */}
      <div className="absolute inset-0 z-0 opacity-25">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm rounded-full mb-4 border border-cyan-400/40"
          >
            <Zap className="h-4 w-4 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-200">
              Powered by Neural Intelligence
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Not Your Average{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Chatbot
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-cyan-100/80 max-w-3xl mx-auto"
          >
            Built with cutting-edge neural AI and engineered for maximum engagement and conversion
          </motion.p>
        </div>

        {/* Optional showcase image */}
        {imageSrc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
              <Image src={imageSrc} alt="Platform showcase" width={1200} height={600} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1525]/70 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Specs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-900/60 
                  transition-all duration-300 
                  hover:border-cyan-400/80 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-500/20
                  group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${spec.gradient} mb-4 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2 text-cyan-50">
                  {spec.title}
                </h3>

                <p className="text-cyan-200/70 text-sm leading-relaxed">
                  {spec.description}
                </p>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/5 transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <p className="text-cyan-100 mb-6 text-lg">
            Ready to experience neural intelligence?
          </p>
          <motion.button
            style={{ border: borderGlow }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-semibold shadow-xl shadow-cyan-500/40 transition-all hover:shadow-2xl hover:shadow-cyan-400/50"
          >
            <Sparkles className="h-5 w-5" />
            Explore the Future
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TechSpecs;