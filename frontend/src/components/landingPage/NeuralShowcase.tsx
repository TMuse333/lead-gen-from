"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import NeuralNetwork from "./svg/NeuralNetwork";
import IntentClassifier from "./svg/IntentClassifier";
import DataEnrichment from "./svg/DataEnrichment";
import ChatToOffer from "./svg/ChatToOffer";
import TimelineHero from "./svg/TimelineHero";
import StoryBridge from "./svg/StoryBridge";
import LearningLoop from "./svg/LearningLoop";

/**
 * NeuralShowcase - Main landing page showcasing the AI Timeline Generator
 * Based on Neural AI Showcase pattern with timeline-specific content
 */

export default function NeuralShowcase() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = (timestamp: number) => {
      setTime(timestamp / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const bgNodes = Array.from({ length: 15 }, (_, i) => ({
    x: 10 + (i % 5) * 22,
    y: 10 + Math.floor(i / 5) * 35,
    delay: i * 0.2,
  }));

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#06b6d4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating neural nodes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {bgNodes.map((node, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-500/20"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              opacity: 0.1 + Math.sin(time * 0.5 + node.delay) * 0.1,
              transform: `scale(${1 + Math.sin(time + node.delay) * 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div
              className={`space-y-6 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400 text-xs font-semibold tracking-wider">AI TIMELINE GENERATOR</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Give Every Lead a
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Personalized Buying Timeline
                </span>
              </h1>

              <p className="text-white/50 text-lg leading-relaxed max-w-md">
                Capture leads with an AI chatbot that creates customized home-buying roadmaps.
                Buyers see their journey from pre-approval to closing — personalized to their budget,
                timeline, and goals.
              </p>

              {/* Hero CTA */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth/signin">
                  <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                    <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                    Get Started Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button
                  onClick={() => document.getElementById('capture')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 border border-white/20 hover:bg-white/5 rounded-lg transition-all font-semibold text-white/80 hover:text-white"
                >
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right: Hero SVG */}
            <div
              className={`flex justify-center transition-all duration-700 delay-200 ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <NeuralNetwork size={300} />
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section id="capture" className="relative z-10 py-20 px-6 border-b border-white/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-500 ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <IntentClassifier width={480} height={300} />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full">
                <span className="text-cyan-400 text-xs font-mono">01</span>
                <span className="text-cyan-400 text-sm font-semibold">CAPTURE</span>
              </div>
              <h2 className="text-3xl font-bold">Smart Lead Qualification</h2>
              <p className="text-white/50 leading-relaxed">
                The AI chatbot qualifies leads in real-time by understanding their intent.
                Whether they&apos;re looking to buy, sell, or browse — the bot classifies and
                routes each conversation to generate the perfect timeline.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { label: "Buy Intent", value: "94%" },
                  { label: "Sell Intent", value: "89%" },
                  { label: "Browse Intent", value: "76%" },
                  { label: "Refinance", value: "82%" },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/40">{item.label}</p>
                    <p className="text-lg font-mono font-bold text-cyan-400">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Section CTA */}
              <Link href="/auth/signin">
                <button className="mt-4 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Start capturing leads
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Generation Section */}
      <section id="timeline" className="relative z-10 py-20 px-6 border-b border-white/5 bg-gradient-to-b from-transparent to-cyan-500/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                <span className="text-blue-400 text-xs font-mono">02</span>
                <span className="text-blue-400 text-sm font-semibold">GENERATE</span>
              </div>
              <h2 className="text-3xl font-bold">Personalized Timeline Creation</h2>
              <p className="text-white/50 leading-relaxed">
                From basic contact info, the AI generates a complete buying timeline.
                Budget, timeline, location preferences, and pre-approval status — all
                factored into a personalized roadmap from Halifax to Bedford and beyond.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Budget", "Timeline", "Location", "Pre-Approval", "Home Type", "Must-Haves"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Section CTA */}
              <Link href="/auth/signin">
                <button className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Create your first timeline
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <div
              className={`flex justify-center lg:order-2 transition-all duration-500 ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <DataEnrichment width={500} height={320} />
            </div>
          </div>
        </div>
      </section>

      {/* Mid-page CTA Banner */}
      <section className="relative z-10 py-12 px-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">Limited Time</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Start Free — No Credit Card Required</h3>
          <p className="text-white/50 mb-6">Set up your AI timeline generator in under 10 minutes</p>
          <Link href="/auth/signin">
            <button className="group px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
              Get Started Free
              <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Stories & Trust Section - THE KEY DIFFERENTIATOR */}
      <section id="stories" className="relative z-10 py-20 px-6 border-b border-white/5 bg-gradient-to-b from-cyan-500/5 to-amber-500/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full mb-4">
              <span className="text-amber-400 text-xs font-mono">03</span>
              <span className="text-amber-400 text-sm font-semibold">THE SECRET SAUCE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stories Build <span className="text-amber-400">Trust</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
              This is what sets your timeline apart from every other lead capture tool.
              Real stories from past clients that match the buyer&apos;s situation create
              instant credibility and emotional connection.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`flex justify-center transition-all duration-500 ${
                mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <StoryBridge />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-amber-300">Why Stories Matter</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Situation Matching",
                    desc: "AI matches buyer's situation (first-time buyer, budget, location) with relevant past client stories",
                  },
                  {
                    title: "Emotional Connection",
                    desc: "\"Sarah was nervous about buying in Halifax too, but here's how it worked out...\"",
                  },
                  {
                    title: "Proof of Expertise",
                    desc: "Real outcomes from real clients show you've successfully guided others through similar journeys",
                  },
                  {
                    title: "Reduce Anxiety",
                    desc: "Buyers feel less alone knowing others faced the same challenges and succeeded",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-amber-500/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-200">{item.title}</h4>
                      <p className="text-white/50 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section CTA */}
              <Link href="/auth/signin">
                <button className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 font-medium transition-all">
                  Add your stories
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Preview Section */}
      <section className="relative z-10 py-20 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">What Your Leads See</h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-12">
            A personalized buying timeline with their name, budget, and journey phases —
            generated instantly from the chat conversation.
          </p>
          <div
            className={`flex justify-center transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <TimelineHero
              width={600}
              height={420}
              buyerName="Sarah"
              location="Halifax"
              buyerType="First-Time Buyer"
              budget="$450,000"
              timeline="8 weeks"
            />
          </div>

          {/* CTA below timeline preview */}
          <div className="mt-10">
            <Link href="/auth/signin">
              <button className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
                Create Timelines Like This
                <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Complete Pipeline Section */}
      <section className="relative z-10 py-20 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Complete Pipeline</h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-12">
            From first message to personalized timeline — see the entire flow in action.
          </p>
          <div
            className={`flex justify-center transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <ChatToOffer width={580} height={300} />
          </div>
        </div>
      </section>

      {/* Learning Loop Section */}
      <section id="learn" className="relative z-10 py-20 px-6 border-b border-white/5 bg-gradient-to-b from-transparent to-purple-500/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full">
                <span className="text-purple-400 text-xs font-mono">04</span>
                <span className="text-purple-400 text-sm font-semibold">IMPROVE</span>
              </div>
              <h2 className="text-3xl font-bold">Continuous Improvement</h2>
              <p className="text-white/50 leading-relaxed">
                Your feedback helps improve the system. Track which stories resonate,
                which phases need adjustment, and which questions convert best.
                The AI learns from every interaction.
              </p>
              <div className="space-y-3 pt-4">
                {[
                  { stage: "Capture", desc: "Collect lead data from conversations" },
                  { stage: "Generate", desc: "Create personalized timelines" },
                  { stage: "Track", desc: "Monitor engagement and conversions" },
                  { stage: "Improve", desc: "Refine stories and phases" },
                ].map((item, i) => (
                  <div key={item.stage} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-white/80">{item.stage}</span>
                      <span className="text-white/40 ml-2">— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section CTA */}
              <Link href="/auth/signin">
                <button className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Start improving your conversions
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <div
              className={`flex justify-center lg:order-2 transition-all duration-500 ${
                mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <LearningLoop width={400} height={400} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-t from-cyan-500/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">Ready to transform your lead capture?</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold">
            Start Generating Personalized Timelines
            <br />
            <span className="text-cyan-400">In Under 10 Minutes</span>
          </h2>

          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Join real estate agents across Halifax, Bedford, and beyond who are
            converting more leads with AI-powered personalized timelines.
          </p>

          <div className="flex justify-center gap-4 flex-wrap pt-4">
            <Link href="/auth/signin">
              <button className="group px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all text-lg shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105">
                <Sparkles className="inline-block mr-2 h-5 w-5 group-hover:animate-pulse" />
                Get Started Free
                <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Setup in 10 minutes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
