'use client';

import { useRef, useEffect, useState } from 'react';
import type { SandboxDebugState } from '@/lib/sandbox/sandboxBroadcaster';
import type { SessionEvent, SessionEventKind, TransitionInfo } from '@/hooks/useSandboxDebug';
import type { OutgoingEdge } from '@/components/dashboard/admin/botSandbox/flowData';
import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';
import { Loader2, MessageSquare, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, ArrowRightCircle, Circle, Database } from 'lucide-react';

interface Props {
  debugState: SandboxDebugState | null;
  activeNodeId: string | null;
  sessionEvents: SessionEvent[];
  possibleNextNodes: OutgoingEdge[];
  lastTransition: TransitionInfo | null;
  clientId?: string;
}

const nodeLabels: Record<string, string> = {
  'initial-greeting': 'Initial Greeting',
  'offer-selection': 'Offer Selection',
  'intent-selection': 'Intent Selection',
  'intent-classification': 'Intent Classification',
  'display-question': 'Display Question',
  'flow-complete': 'Flow Complete',
};

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        active ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
      }`}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

interface LoadedQuestions {
  buy: CustomQuestion[];
  sell: CustomQuestion[];
}

export default function LiveDebugPanel({ debugState, activeNodeId, sessionEvents, possibleNextNodes, lastTransition, clientId }: Props) {
  const [questions, setQuestions] = useState<LoadedQuestions | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Fetch questions when clientId changes
  useEffect(() => {
    if (!clientId) return;

    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const response = await fetch(`/api/custom-questions/all?clientId=${encodeURIComponent(clientId)}`);
        const data = await response.json();
        if (data.success) {
          setQuestions({
            buy: data.questions?.buy || [],
            sell: data.questions?.sell || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [clientId]);

  if (!debugState) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <MessageSquare size={28} className="text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500">Interact with the bot to see live debug data</p>
        </div>
      </div>
    );
  }

  const answerEntries = Object.entries(debugState.userInput);
  const currentFlow = debugState.currentIntent as TimelineFlow | null;
  const currentQuestions = currentFlow && questions ? questions[currentFlow] : [];
  const sortedQuestions = [...currentQuestions].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full overflow-y-auto space-y-4 p-4 text-sm">
      {/* Active Node */}
      <Section title="Active Node">
        <div className="flex items-center gap-2 bg-[#060d1f] rounded-lg px-3 py-2 border border-blue-500/15">
          <StatusDot active={!!activeNodeId} />
          <span className="text-white font-mono text-xs">
            {activeNodeId ? nodeLabels[activeNodeId] || activeNodeId : 'None'}
          </span>
        </div>
      </Section>

      {/* State Transitions */}
      <Section title="State Transitions">
        <div className="space-y-2.5 bg-[#060d1f] rounded-lg px-3 py-2.5 border border-blue-500/15">
          {/* Possible next nodes */}
          <div>
            <span className="text-[10px] text-slate-500 block mb-1.5">Possible next</span>
            {possibleNextNodes.length === 0 ? (
              <p className="text-[11px] text-slate-600 italic">No outgoing edges (terminal node)</p>
            ) : (
              <div className="space-y-1.5">
                {possibleNextNodes.map((edge) => (
                  <div key={edge.targetId} className="flex items-center gap-2 text-xs">
                    <ArrowRightCircle size={12} className="text-blue-400/60 shrink-0" />
                    <span className="text-white font-medium">{edge.targetLabel}</span>
                    {edge.edgeLabel && (
                      <span className="text-slate-500 italic truncate">{edge.edgeLabel}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last transition */}
          {lastTransition && (
            <div className="border-t border-blue-500/10 pt-2">
              <span className="text-[10px] text-slate-500 block mb-1.5">Last transition</span>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    lastTransition.moved ? 'bg-green-400' : 'bg-amber-400'
                  }`}
                />
                <span className={`text-[11px] font-semibold ${
                  lastTransition.moved ? 'text-green-300' : 'text-amber-300'
                }`}>
                  {lastTransition.moved
                    ? `Moved → ${nodeLabels[lastTransition.toNode!] || lastTransition.toNode}`
                    : 'Stayed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lastTransition.reason}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Current Question (MongoDB) */}
      {(() => {
        // Find current question from MongoDB based on state ID
        const currentQ = sortedQuestions.find(q =>
          `q_${q.id}` === debugState.currentQuestionId || q.id === debugState.currentQuestionId
        );
        const questionIndex = currentQ ? sortedQuestions.indexOf(currentQ) : -1;
        const mappingKey = currentQ?.mappingKey || currentQ?.id;

        return currentQ ? (
          <Section title="Current Question (MongoDB)">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                  #{questionIndex + 1} of {sortedQuestions.length}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {mappingKey}
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded ${
                  currentQ.inputType === 'buttons'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {currentQ.inputType}
                </span>
              </div>
              <p className="text-sm text-white font-medium leading-snug">
                {currentQ.question}
              </p>
              {currentQ.buttons && currentQ.buttons.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentQ.buttons.map((btn) => (
                    <span
                      key={btn.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300"
                    >
                      {btn.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-cyan-500/20 text-[10px] text-slate-400">
                <span className="text-slate-500">State ID: </span>
                <span className="font-mono text-cyan-400">{debugState.currentQuestionId}</span>
                <span className="text-slate-600 mx-1">→</span>
                <span className="text-slate-500">Collects: </span>
                <span className="font-mono text-green-400">{mappingKey}</span>
              </div>
            </div>
          </Section>
        ) : debugState.currentQuestionId ? (
          <Section title="Current State">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                State: <span className="font-mono">{debugState.currentQuestionId}</span>
              </p>
              <p className="text-[10px] text-amber-400/70 mt-1">
                (Not a MongoDB question - may be system state)
              </p>
            </div>
          </Section>
        ) : null;
      })()}

      {/* Flow State */}
      <Section title="Flow State">
        <div className="space-y-2 bg-[#060d1f] rounded-lg px-3 py-2.5 border border-blue-500/15">
          <Row label="Offer" value={debugState.selectedOffer || '—'} />
          <Row label="Intent" value={debugState.currentIntent || '—'} />
          <Row label="State ID" value={debugState.currentQuestionId || '—'} />
          <Row label="Messages" value={String(debugState.messageCount)} />
          {/* Progress bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Progress</span>
              <span className="text-[10px] text-slate-400 font-mono">{debugState.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${debugState.progress}%` }}
              />
            </div>
          </div>
          {/* Status flags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {debugState.isComplete && <Badge text="Complete" color="green" />}
            {debugState.showContactModal && <Badge text="Contact Modal" color="amber" />}
            {debugState.loading && <Badge text="Loading" color="purple" />}
          </div>
        </div>
      </Section>

      {/* MongoDB Question Flow */}
      {currentFlow && (
        <Section title={`Question Flow (${currentFlow.toUpperCase()})`}>
          {questionsLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 size={12} className="animate-spin" />
              Loading questions...
            </div>
          ) : sortedQuestions.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No questions configured</p>
          ) : (
            <div className="bg-[#060d1f] rounded-lg border border-blue-500/15 overflow-hidden">
              {sortedQuestions.map((q, index) => {
                const stateId = `q_${q.id}`;
                const mappingKey = q.mappingKey || q.id;
                const isCurrent = stateId === debugState.currentQuestionId || q.id === debugState.currentQuestionId;
                const isCompleted = mappingKey ? debugState.userInput[mappingKey] !== undefined : false;
                const isNext = !isCurrent && !isCompleted && sortedQuestions.slice(0, index).every(pq => {
                  const pk = pq.mappingKey || pq.id;
                  return pk ? debugState.userInput[pk] !== undefined : false;
                }) && index > 0;

                return (
                  <div
                    key={q.id}
                    className={`px-3 py-2 border-b border-blue-500/10 last:border-b-0 ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-l-2 border-l-cyan-400'
                        : isCompleted
                        ? 'bg-green-500/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Status indicator */}
                      {isCompleted ? (
                        <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                      ) : isCurrent ? (
                        <ArrowRight size={12} className="text-cyan-400 shrink-0 animate-pulse" />
                      ) : (
                        <Circle size={12} className="text-slate-600 shrink-0" />
                      )}

                      {/* Question number and key */}
                      <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {mappingKey}
                      </span>

                      {/* Input type badge */}
                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                        q.inputType === 'buttons'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {q.inputType}
                      </span>

                      {/* Current/completed badges */}
                      {isCurrent && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 ml-auto">
                          CURRENT
                        </span>
                      )}
                    </div>

                    {/* Question text (truncated) */}
                    <p className={`text-[11px] mt-1 truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                      {q.question}
                    </p>

                    {/* Show collected value if completed */}
                    {isCompleted && mappingKey && (
                      <div className="text-[10px] mt-1">
                        <span className="text-green-400">→ </span>
                        <span className="text-slate-300 font-mono">{debugState.userInput[mappingKey]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* Answers Collected */}
      <Section title={`Answers Collected (${answerEntries.length})`}>
        {answerEntries.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No answers yet</p>
        ) : (
          <div className="space-y-1 bg-[#060d1f] rounded-lg px-3 py-2.5 border border-blue-500/15">
            {answerEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="text-blue-400 font-mono shrink-0">{key}</span>
                <ArrowRight size={10} className="text-slate-600 mt-0.5 shrink-0" />
                <span className="text-slate-300 break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Last Exchange */}
      <Section title="Last Exchange">
        <div className="space-y-2 bg-[#060d1f] rounded-lg px-3 py-2.5 border border-blue-500/15">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">User</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {debugState.lastUserMessage || <span className="text-slate-600 italic">—</span>}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Assistant</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {debugState.lastAssistantMessage || <span className="text-slate-600 italic">—</span>}
            </p>
          </div>
        </div>
      </Section>

      {/* LLM Activity */}
      <Section title="LLM Activity">
        <div className="flex items-center gap-2 bg-[#060d1f] rounded-lg px-3 py-2 border border-blue-500/15">
          {debugState.loading ? (
            <>
              <Loader2 size={14} className="text-purple-400 animate-spin" />
              <span className="text-purple-300 text-xs font-medium">Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-slate-600" />
              <span className="text-slate-500 text-xs">Idle</span>
            </>
          )}
        </div>
      </Section>

      {/* Session Log */}
      <SessionLog events={sessionEvents} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-mono truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: 'green' | 'amber' | 'purple' }) {
  const colors = {
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {text}
    </span>
  );
}

const eventKindStyles: Record<SessionEventKind, { dot: string; text: string }> = {
  'node-change':       { dot: 'bg-blue-400',   text: 'text-blue-300' },
  'offer-selected':    { dot: 'bg-cyan-400',   text: 'text-cyan-300' },
  'intent-selected':   { dot: 'bg-cyan-400',   text: 'text-cyan-300' },
  'question-change':   { dot: 'bg-amber-400',  text: 'text-amber-300' },
  'llm-start':         { dot: 'bg-purple-400', text: 'text-purple-300' },
  'llm-end':           { dot: 'bg-purple-400', text: 'text-purple-300' },
  'answer-collected':  { dot: 'bg-green-400',  text: 'text-green-300' },
  'message-received':  { dot: 'bg-slate-400',  text: 'text-slate-300' },
  'contact-modal':     { dot: 'bg-amber-400',  text: 'text-amber-300' },
  'flow-complete':     { dot: 'bg-green-400',  text: 'text-green-300' },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function SessionLog({ events }: { events: SessionEvent[] }) {
  const [open, setOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length, open]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-2"
      >
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Session Log ({events.length})
        </h4>
        {open ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
      </button>
      {open && (
        <div className="bg-[#060d1f] rounded-lg border border-blue-500/15 max-h-[220px] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-slate-600 italic p-3">No events yet</p>
          ) : (
            <div className="p-2 space-y-0.5">
              {events.map((evt) => {
                const style = eventKindStyles[evt.kind] || eventKindStyles['node-change'];
                return (
                  <div key={evt.id} className="flex items-start gap-2 py-0.5">
                    <span className="text-[10px] text-slate-600 font-mono shrink-0 mt-px w-[52px]">
                      {formatTime(evt.timestamp)}
                    </span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${style.dot}`} />
                    <span className={`text-[11px] font-medium shrink-0 ${style.text}`}>
                      {evt.label}
                    </span>
                    {evt.detail && (
                      <span className="text-[10px] text-slate-500 truncate">
                        {evt.detail}
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
