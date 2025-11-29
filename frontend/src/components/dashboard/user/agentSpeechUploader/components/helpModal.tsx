'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Mic, Sparkles, Upload, Brain, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Trigger button (always visible in top-right corner of screen)
  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 z-50 p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50"
        title="How to use Voice Advice Uploader"
      >
        <HelpCircle className="h-6 w-6 text-white" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
            >
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="p-8">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">How to Record Your Voice Advice</h2>
                        <p className="text-slate-400 text-sm">This powers your AI agent</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Hero Message */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-xl">
                    <p className="text-xl font-bold text-indigo-300 flex items-center gap-3">
                      <Brain className="h-7 w-7" />
                      Your voice = Your AI’s soul
                    </p>
                    <p className="text-slate-300 mt-3">
                      Every answer you record here becomes the <span className="text-indigo-400 font-bold">real knowledge</span> your AI uses to sound exactly like you — 24/7.
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-6">
                    <Step
                      icon={<Sparkles className="h-6 w-6" />}
                      color="text-purple-400"
                      title="Generate Smart Questions"
                      desc="Hit “AI Generate” — we’ll create 8–12 high-impact questions based on your flows and expertise."
                    />
                    <Step
                      icon={<Mic className="h-6 w-6" />}
                      color="text-indigo-400"
                      title="Record Like You’re on a Call"
                      desc="30–90 seconds. No script reading. Just real talk. Clients will hear the difference."
                    />
                    <Step
                      icon={<CheckCircle2 className="h-6 w-6" />}
                      color="text-green-400"
                      title="Get text output and edit"
                      desc="Once you get the text, you can revise it to ensure it's what you want."
                    />
                    <Step
                      icon={<Upload className="h-6 w-6" />}
                      color="text-emerald-400"
                      title="Upload → Done"
                      desc="Your voice + transcripts get vectorized and stored in Qdrant. Your AI now knows you inside out."
                    />
                  </div>

                  {/* Final Callout */}
                  <div className="mt-10 p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-700/50 rounded-xl text-center">
                    <p className="text-emerald-300 font-bold text-lg">
                      This isn’t just content. This is your legacy in AI form.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      Do this once — win forever.
                    </p>
                  </div>

                  {/* Close Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-purple-500/50"
                    >
                      Got It — Let’s Build My AI
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Reusable Step
function Step({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}