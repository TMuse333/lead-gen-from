// components/HelpButtonWithModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  HelpCircle, 
  X, 
  Sparkles, 
  Edit2, 
  Eye, 
  Settings, 
  Copy, 
  Trash2, 
  FileJson 
} from 'lucide-react';

export default function HelpButtonWithModal() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      
      

        {/* The Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </button>


      {/* Self-contained animated modal — no props needed */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Flow Manager Help</h2>
                    <p className="text-sm text-slate-600">Everything you need to know</p>
                  </div>
                </div>
                <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 text-slate-700">
                <section>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Welcome to the Flow Manager</h3>
                  <p className="leading-relaxed">
                    This is your command center for designing every conversation your real estate chat widget has with users — 
                    Seller Journey, Buyer Journey, Market Explorer, and any custom flows you create.
                  </p>
                </section>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-3"><Edit2 className="h-6 w-6 text-white" /></div>
                    <h4 className="font-semibold text-indigo-900">Flows</h4>
                    <p className="text-sm mt-1">Full conversation journeys</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3"><Eye className="h-6 w-6 text-white" /></div>
                    <h4 className="font-semibold text-purple-900">Questions</h4>
                    <p className="text-sm mt-1">Steps with buttons & validation</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-3"><Settings className="h-6 w-6 text-white" /></div>
                    <h4 className="font-semibold text-emerald-900">Tracker</h4>
                    <p className="text-sm mt-1">Live messages users see</p>
                  </div>
                </div>

                <section className="bg-slate-50 rounded-xl p-6 space-y-4 text-sm">
                  <div className="flex items-center gap-3"><Upload className="h-5 w-5" /> Import Flow (.json)</div>
                  <div className="flex items-center gap-3"><Plus className="h-5 w-5 text-indigo-600" /> Create new flow</div>
                  <div className="flex items-center gap-3"><Copy className="h-5 w-5" /> Duplicate (hover card)</div>
                  <div className="flex items-center gap-3"><Trash2 className="h-5 w-5 text-red-600" /> Delete (hover card)</div>
                  <div className="flex items-center gap-3"><FileJson className="h-5 w-5" /> Export (hover card)</div>
                </section>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3">Pro Tips</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• All changes auto-save instantly</li>
                    <li>• Hover any flow card → quick actions appear</li>
                    <li>• Click any flow → preview → “Edit Flow” to modify</li>
                    <li>• Your flows are saved in your browser</li>
                  </ul>
                </div>

                <div className="text-center pt-6 text-sm text-slate-500">
                  Built in Nova Scotia by{' '}
                  <a href="https://x.com/thomasmusial333" target="_blank" className="text-indigo-600 hover:underline font-medium">
                    @thomasmusial333
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}