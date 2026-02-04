'use client';

// INTENTIONAL BUILD BREAKER — prevents Vercel deploy. Remove these 2 lines when ready to go live.
function _BLOCK_DEPLOY(x: number): void { return x; }

import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ConversationFlowDiagram from './ConversationFlowDiagram';
import LiveDebugPanel from './LiveDebugPanel';
import type { FlowNodeData } from './flowData';
import { getOutgoingEdges, getIncomingEdges, flowNodes } from './flowData';
import { useSandboxDebug } from '@/hooks/useSandboxDebug';
import { ChevronDown, ChevronUp, RotateCcw, FileCode, HelpCircle, X, ArrowRightLeft, Database, MessageSquare } from 'lucide-react';

interface SelectedNodeInfo {
  id: string;
  data: FlowNodeData;
}

export default function BotSandbox() {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [detailTab, setDetailTab] = useState<'prompt' | 'connections' | 'data'>('prompt');
  const [iframeKey, setIframeKey] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const { debugState, activeNodeId, sessionEvents, clearEvents, possibleNextNodes, lastTransition } = useSandboxDebug();

  const handleNodeSelect = useCallback((id: string | null, data: FlowNodeData | null) => {
    if (id && data) {
      setSelectedNode({ id, data });
      setDetailOpen(true);
      setDetailTab('prompt');
    } else {
      setSelectedNode(null);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Flowchart */}
      <div className="bg-[#0a1228]/80 backdrop-blur-md rounded-lg border border-blue-500/25 overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Conversation Flow</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">17 nodes &middot; click any node for details</span>
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition"
            >
              <HelpCircle size={13} />
              How This Works
            </button>
          </div>
        </div>
        <div style={{ height: '55vh' }}>
          <ReactFlowProvider>
            <ConversationFlowDiagram
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id ?? null}
              activeNodeId={activeNodeId}
            />
          </ReactFlowProvider>
        </div>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="bg-[#0a1228]/80 backdrop-blur-md rounded-lg border border-blue-500/25 overflow-hidden">
          <button
            onClick={() => setDetailOpen(!detailOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <FileCode size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">{selectedNode.data.label}</span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedNode.data.fullPath}{selectedNode.data.line ? `:${selectedNode.data.line}` : ''}
              </span>
            </div>
            {detailOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {detailOpen && (
            <div className="border-t border-blue-500/15">
              {/* Summary blurb */}
              <p className="px-4 pt-3 text-xs text-slate-400 leading-relaxed">
                {selectedNode.data.summary}
              </p>

              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-3">
                {([
                  { key: 'prompt', label: 'Prompt', icon: <MessageSquare size={13} /> },
                  { key: 'connections', label: 'Connected Nodes', icon: <ArrowRightLeft size={13} /> },
                  { key: 'data', label: 'Node Data', icon: <Database size={13} /> },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition ${
                      detailTab === tab.key
                        ? 'bg-[#060d1f] text-blue-300 border border-blue-500/30 border-b-transparent'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-4 pb-4">
                {/* Prompt tab */}
                {detailTab === 'prompt' && (
                  <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-[#060d1f] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    {selectedNode.data.promptText}
                  </pre>
                )}

                {/* Connected Nodes tab */}
                {detailTab === 'connections' && (
                  <div className="mt-2 bg-[#060d1f] rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-4">
                    {(() => {
                      const incoming = getIncomingEdges(selectedNode.id);
                      const outgoing = getOutgoingEdges(selectedNode.id);
                      const nodeTypeColor: Record<string, string> = {
                        entry: 'bg-cyan-400',
                        bot_response: 'bg-emerald-400',
                        llm_prompt: 'bg-purple-400',
                        decision: 'bg-amber-400',
                        intel: 'bg-orange-400',
                        completion: 'bg-green-400',
                        error: 'bg-red-400',
                      };
                      const dot = nodeTypeColor[selectedNode.data.nodeType] || 'bg-slate-400';

                      return (
                        <>
                          {/* Incoming */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                              Incoming ({incoming.length})
                            </h5>
                            {incoming.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">No incoming connections (entry point)</p>
                            ) : (
                              <div className="space-y-1.5">
                                {incoming.map((edge, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                    <span className="text-white font-medium">{edge.sourceLabel}</span>
                                    {edge.edgeLabel && (
                                      <span className="text-slate-500">&rarr; {edge.edgeLabel}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Outgoing */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                              Outgoing ({outgoing.length})
                            </h5>
                            {outgoing.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">No outgoing connections (terminal node)</p>
                            ) : (
                              <div className="space-y-1.5">
                                {outgoing.map((edge, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                    <span className="text-white font-medium">{edge.targetLabel}</span>
                                    {edge.edgeLabel && (
                                      <span className="text-slate-500">&rarr; {edge.edgeLabel}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Node Data tab */}
                {detailTab === 'data' && (
                  <div className="mt-2 bg-[#060d1f] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <div className="space-y-2 text-xs">
                      {([
                        ['id', selectedNode.id],
                        ['role', selectedNode.data.role],
                        ['file', selectedNode.data.file],
                        ['line', selectedNode.data.line],
                        ['fullPath', selectedNode.data.fullPath],
                        ['nodeType', selectedNode.data.nodeType],
                        ['buttons', selectedNode.data.buttons?.join(', ')],
                      ] as [string, string | undefined][])
                        .filter(([, v]) => v)
                        .map(([key, value]) => (
                          <div key={key} className="flex gap-3">
                            <span className="text-slate-500 font-mono w-20 shrink-0">{key}</span>
                            <span className="text-slate-200">{value}</span>
                          </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[11px] text-slate-600 italic">
                      Future: Objection counters, state machine config
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bot iframe + Debug panel */}
      <div className="bg-[#0a1228]/80 backdrop-blur-md rounded-lg border border-blue-500/25 overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Live Bot Preview</h2>
          <button
            onClick={() => { setIframeKey((k) => k + 1); clearEvents(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition"
          >
            <RotateCcw size={12} />
            Reset Bot
          </button>
        </div>
        <div className="flex p-4 gap-4">
          {/* Iframe */}
          <div className="flex-shrink-0">
            <iframe
              key={iframeKey}
              src="/bot/thomas-musial-real-estate?embed=true&sandbox=true"
              className="w-[450px] rounded-xl border border-slate-700/50"
              style={{ height: 500 }}
              title="Bot Sandbox Preview"
            />
          </div>
          {/* Debug panel */}
          <div className="flex-1 min-w-0 bg-[#060d1f]/80 rounded-xl border border-blue-500/15" style={{ height: 500 }}>
            <LiveDebugPanel debugState={debugState} activeNodeId={activeNodeId} sessionEvents={sessionEvents} possibleNextNodes={possibleNextNodes} lastTransition={lastTransition} />
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div
            className="bg-[#0b1530] border border-blue-500/30 rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-blue-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500/20">
              <h3 className="text-xl font-bold text-white">Bot Sandbox &mdash; How It Works</h3>
              <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-6 text-sm leading-relaxed">
              {/* What is this */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">What is this?</h4>
                <p className="text-slate-300">
                  This is a visual map of every decision the bot makes during a conversation. The flowchart above shows the
                  exact path a lead takes from first message to contact capture &mdash; every prompt template, every LLM call,
                  every branching decision. Click any node to see the actual prompt text sent to the model.
                </p>
              </section>

              {/* The goal */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">The Goal</h4>
                <p className="text-slate-300">
                  The bot&rsquo;s job is to convert an anonymous website visitor into a qualified lead with contact info &mdash;
                  in the fewest, most natural-feeling turns possible. Every question is designed to simultaneously:
                </p>
                <ul className="mt-2 space-y-1.5 text-slate-300">
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">1.</span> Collect a piece of qualifying data (budget, timeline, property type, etc.)</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> Make the user feel understood and closer to their goal</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">3.</span> Build enough perceived value that they willingly give their contact info at the end</li>
                </ul>
              </section>

              {/* Information Theory */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">Entropy Reduction (Information Theory)</h4>
                <p className="text-slate-300">
                  Think of each visitor as a probability distribution over all possible lead types. At the start, we know
                  nothing &mdash; maximum entropy. Every question is chosen to <strong className="text-white">maximally reduce that
                  entropy</strong>, narrowing down who this person is and what they need.
                </p>
                <div className="mt-3 bg-[#060d1f] rounded-lg p-4 border border-blue-500/15 space-y-2 text-xs font-mono text-slate-400">
                  <div><span className="text-blue-400">H(lead)</span> = initial uncertainty about visitor (high)</div>
                  <div><span className="text-blue-400">Q1: buy or sell?</span> &rarr; eliminates ~50% of state space instantly</div>
                  <div><span className="text-blue-400">Q2: timeline?</span> &rarr; separates hot leads from cold browsers</div>
                  <div><span className="text-blue-400">Q3: budget?</span> &rarr; qualifies seriousness and price bracket</div>
                  <div><span className="text-blue-400">...</span></div>
                  <div><span className="text-green-400">H(lead|answers)</span> = near-zero &rarr; fully qualified profile</div>
                </div>
                <p className="mt-3 text-slate-300">
                  The key insight: <strong className="text-white">button choices are higher-information-gain than free text</strong>.
                  A button click yields an exact, classifiable answer with zero ambiguity (0 bits of noise). Free text requires an
                  LLM classification step that can fail &mdash; so we default to buttons and only fall back to intent classification
                  when the user goes off-script.
                </p>
              </section>

              {/* Flow architecture */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">Flow Architecture</h4>
                <div className="space-y-3 text-slate-300">
                  <p>
                    <strong className="text-white">Pre-flow (top rows):</strong> Before the user picks Buy/Sell, any free text gets
                    keyword-matched to show a contextual response. Questions and general statements are saved as <em>intel</em> &mdash;
                    signals of intent even before the structured flow begins.
                  </p>
                  <p>
                    <strong className="text-white">Question loop (middle):</strong> Each question comes from MongoDB (configured per-client
                    in the setup wizard). The user can click a button (fast path &rarr; direct extraction) or type free text (slow path &rarr;
                    LLM intent classification &rarr; extraction or rephrase). If classification fails, we rephrase warmly and re-ask
                    the same question &mdash; never advancing until we get a usable answer.
                  </p>
                  <p>
                    <strong className="text-white">Background processes (dashed edges):</strong> Intel saves and schema normalization
                    run async and never block the user. The schema normalizer continuously rebuilds a structured JSON profile
                    from all answers so far.
                  </p>
                  <p>
                    <strong className="text-white">Completion:</strong> Once all questions are answered, the contact modal fires.
                    By this point the user has invested enough effort (sunk cost + perceived value of their &ldquo;personalized timeline&rdquo;)
                    that conversion rates are high.
                  </p>
                </div>
              </section>

              {/* Node types */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">Node Color Key</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-400" /> <span className="text-white">Entry</span> <span className="text-slate-500">&mdash; conversation start</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /> <span className="text-white">Bot Response</span> <span className="text-slate-500">&mdash; static/template replies</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-400" /> <span className="text-white">LLM Prompt</span> <span className="text-slate-500">&mdash; calls to gpt-4o-mini</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" /> <span className="text-white">Decision</span> <span className="text-slate-500">&mdash; branching logic</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> <span className="text-white">Intel</span> <span className="text-slate-500">&mdash; background signal capture</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-400" /> <span className="text-white">Completion</span> <span className="text-slate-500">&mdash; lead capture modal</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> <span className="text-white">Error</span> <span className="text-slate-500">&mdash; fallback handling</span></div>
                </div>
              </section>

              {/* Node Reference */}
              <section>
                <h4 className="text-base font-semibold text-white mb-2">Node Reference</h4>
                <p className="text-slate-300 mb-3">
                  Every node in the flow and what it does. Click any node in the flowchart above to see its full prompt and connections.
                </p>
                <div className="space-y-2">
                  {flowNodes.map((node) => {
                    const colorMap: Record<string, string> = {
                      entry: 'bg-cyan-400',
                      bot_response: 'bg-emerald-400',
                      llm_prompt: 'bg-purple-400',
                      decision: 'bg-amber-400',
                      intel: 'bg-orange-400',
                      completion: 'bg-green-400',
                      error: 'bg-red-400',
                    };
                    return (
                      <div key={node.id} className="flex gap-2.5 items-start text-xs">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${colorMap[node.data.nodeType] || 'bg-slate-400'}`} />
                        <div>
                          <span className="text-white font-medium">{node.data.label}</span>
                          <span className="text-slate-500 ml-1.5">&mdash; {node.data.summary}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
