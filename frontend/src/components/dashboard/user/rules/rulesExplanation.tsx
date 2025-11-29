// components/admin/rules/rulesExplanation.tsx
// Visual explanation of the rules system

'use client';

import { motion } from 'framer-motion';
import { Info, Lightbulb, Zap, Target, Layers, Database, Search, Filter, CheckCircle2, XCircle, ArrowRight, Sparkles, Brain } from 'lucide-react';
import { getAllConcepts } from '@/lib/rules/concepts';
import { RULE_TERMINOLOGY } from '@/lib/rules/terminology';

export default function RulesExplanation() {
  const concepts = getAllConcepts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Client Situations Explained</h2>
        </div>
        <p className="text-slate-300 mb-2">
          Here are some different situations your clients could be in based on their conversation answers. Client Situations help you target specific advice to clients based on their unique circumstances.
        </p>
        <p className="text-sm text-slate-400">
          {RULE_TERMINOLOGY.explanation}
        </p>
      </div>

      {/* How Client Situations Work with Vectors */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Info className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">How Client Situations Work with Vectors</h2>
        </div>

        {/* Visual Flow Diagram */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            The Client Situation Filtering Process
          </h3>
          
          {/* Flow Steps */}
          <div className="space-y-4">
            {/* Step 1: User Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-blue-300">Client Completes Conversation</span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Flow:</span>
                    <span className="px-2 py-0.5 bg-blue-900/50 rounded text-xs">sell</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">Answers:</span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">timeline: "0-3 months"</span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">propertyType: "house"</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-indigo-400" />
            </div>

            {/* Step 2: Vector Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-purple-400" />
                  <span className="font-medium text-purple-300">Qdrant Vector Search</span>
                </div>
                <div className="text-sm text-slate-300">
                  <p>🔍 Searches for semantically similar advice vectors</p>
                  <p className="text-xs text-slate-400 mt-1">Returns top candidates based on content similarity</p>
                </div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-indigo-400" />
            </div>

            {/* Step 3: Client Situation Filtering */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-indigo-400" />
                  <span className="font-medium text-indigo-300">Client Situation Filtering</span>
                </div>
                <div className="text-sm text-slate-300">
                  <p>📋 Each vector's client situations are checked against the client's answers</p>
                  <p className="text-xs text-slate-400 mt-1">Only vectors with matching client situations pass through</p>
                </div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-indigo-400" />
            </div>

            {/* Step 4: Final Results */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">4</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-green-300">Filtered Advice</span>
                </div>
                <div className="text-sm text-slate-300">
                  <p>✅ Only advice that matches both semantic similarity AND client situations</p>
                  <p className="text-xs text-slate-400 mt-1">Sent to LLM for personalized generation</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-400" />
            Examples: Client Situations in Action
          </h3>

          {/* Example 1: Client Situation Excludes Advice (Urgent Timeline) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border-2 border-red-700/50 rounded-lg p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                  ❌ Example 1: Renovation Advice EXCLUDED (Urgent Timeline)
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Scenario:</div>
                    <div className="text-sm text-white font-medium mb-2">User wants to sell their house</div>
                    <div className="text-xs text-slate-300 space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Last renovation:</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded">10-15 years ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Timeline:</span>
                        <span className="px-2 py-0.5 bg-red-900/50 rounded text-red-300">Need to sell within 2 months (urgent)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Vector in Qdrant:</div>
                    <div className="text-sm text-white font-medium mb-2">"Home Renovation Guide Before Selling"</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Client situation attached:</span>
                        <span className="px-2 py-0.5 bg-indigo-900/50 rounded">timeline ≠ "0-2 months"</span>
                      </div>
                      <p className="text-slate-400 mt-2 italic">(Only recommend if user has time for renovations)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-red-400" />
                    <span className="text-slate-300">User's timeline:</span>
                    <span className="px-2 py-0.5 bg-red-900/50 rounded text-red-300">"0-2 months" (urgent)</span>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-3 border border-red-700">
                    <div className="flex items-center gap-2 text-sm text-red-200 mb-2">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">❌ Client situation doesn't match! Renovation advice is EXCLUDED</span>
                    </div>
                    <div className="text-xs text-red-300/80 bg-red-900/20 rounded p-2 border border-red-800/50">
                      <strong>Summary:</strong> The renovation advice was NOT recommended because the client needs to sell within 2 months, but the client situation requires a timeline longer than 2 months. Even though the client's home hasn't been renovated in 10-15 years (which would normally suggest renovation), the client situation prevents this advice from being shown since they're in a rush and don't have time for renovations. This ensures they get advice that matches their actual situation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Example 2: Client Situation Includes Advice (Flexible Timeline) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-900/20 border-2 border-green-700/50 rounded-lg p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                  ✅ Example 2: Renovation Advice INCLUDED (Flexible Timeline)
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Scenario:</div>
                    <div className="text-sm text-white font-medium mb-2">User wants to sell their house</div>
                    <div className="text-xs text-slate-300 space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Last renovation:</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded">10-15 years ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Timeline:</span>
                        <span className="px-2 py-0.5 bg-green-900/50 rounded text-green-300">6-12 months (flexible)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Vector in Qdrant:</div>
                    <div className="text-sm text-white font-medium mb-2">"Home Renovation Guide Before Selling"</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Client situation attached:</span>
                        <span className="px-2 py-0.5 bg-indigo-900/50 rounded">timeline ≠ "0-2 months"</span>
                      </div>
                      <p className="text-slate-400 mt-2 italic">(Only recommend if user has time for renovations)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">User's timeline:</span>
                    <span className="px-2 py-0.5 bg-green-900/50 rounded text-green-300">"6-12 months" (flexible)</span>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-700">
                    <div className="flex items-center gap-2 text-sm text-green-200 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">✅ Client situation matches! Renovation advice is INCLUDED</span>
                    </div>
                    <div className="text-xs text-green-300/80 bg-green-900/20 rounded p-2 border border-green-800/50">
                      <strong>Summary:</strong> The renovation advice WAS recommended because the client has a flexible timeline (6-12 months), which satisfies the client situation requirement (timeline ≠ "0-2 months"). Since their home hasn't been renovated in 10-15 years and they have time, this advice is relevant and helpful. The client situation ensures that renovation advice is only shown when the client actually has time to complete renovations before selling.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Points */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-cyan-200 mb-2">Key Points</h3>
              <ul className="space-y-2 text-sm text-cyan-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Vector search happens first</strong> - finds semantically similar advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Client situations filter the results</strong> - only vectors with matching client situations pass through</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Both must match</strong> - semantic similarity AND client situation conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Vectors without client situations</strong> are universal - they always pass (if semantically similar)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Client Situation Types Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Client Situation Types</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-600 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-blue-200">Predefined Concepts</h3>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Universal real estate concepts that work across all users:
            </p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• Property Type</li>
              <li>• Timeline</li>
              <li>• Budget</li>
              <li>• Location</li>
              <li>• And more...</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-600 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-purple-200">Dynamic Fields</h3>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Automatically extracted from your conversation flows:
            </p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• Your custom questions</li>
              <li>• Your button values</li>
              <li>• Your field names</li>
              <li>• Mapped to concepts</li>
            </ul>
          </motion.div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-cyan-200 mb-1">How They Work Together</h3>
              <p className="text-sm text-cyan-200/80">
                Client situations use <strong>concepts</strong> (like "property-type") which automatically map to your actual fields 
                (like "homeType" or "propertyKind"). This means client situations work even if you change your field names later!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Available Concepts</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.map((concept, index) => (
            <motion.div
              key={concept.concept}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
            >
              <h3 className="font-semibold text-white mb-1">{concept.label}</h3>
              <p className="text-xs text-slate-400 mb-2">{concept.description}</p>
              {concept.commonValues && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {concept.commonValues.slice(0, 3).map((value) => (
                    <span
                      key={value}
                      className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded"
                    >
                      {value}
                    </span>
                  ))}
                  {concept.commonValues.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{concept.commonValues.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

