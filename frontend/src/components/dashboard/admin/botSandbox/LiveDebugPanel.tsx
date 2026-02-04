'use client';

import { useRef, useEffect, useState } from 'react';
import type { SandboxDebugState } from '@/lib/sandbox/sandboxBroadcaster';
import type { SessionEvent, SessionEventKind, TransitionInfo } from '@/hooks/useSandboxDebug';
import type { OutgoingEdge } from '@/components/dashboard/admin/botSandbox/flowData';
import { Loader2, MessageSquare, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, ArrowRightCircle, Circle } from 'lucide-react';

interface Props {
  debugState: SandboxDebugState | null;
  activeNodeId: string | null;
  sessionEvents: SessionEvent[];
  possibleNextNodes: OutgoingEdge[];
  lastTransition: TransitionInfo | null;
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

export default function LiveDebugPanel({ debugState, activeNodeId, sessionEvents, possibleNextNodes, lastTransition }: Props) {
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

      {/* Flow State */}
      <Section title="Flow State">
        <div className="space-y-2 bg-[#060d1f] rounded-lg px-3 py-2.5 border border-blue-500/15">
          <Row label="Offer" value={debugState.selectedOffer || '—'} />
          <Row label="Intent" value={debugState.currentIntent || '—'} />
          <Row label="Question" value={debugState.currentQuestionId || '—'} />
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
