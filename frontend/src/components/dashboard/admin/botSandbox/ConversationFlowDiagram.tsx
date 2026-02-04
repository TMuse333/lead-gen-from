'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import FlowNodeComponent from './FlowNode';
import { flowNodes, flowEdges, type FlowNodeData } from './flowData';

const nodeTypes = { flowNode: FlowNodeComponent };

const defaultEdgeOptions = {
  style: { stroke: '#334577', strokeWidth: 1.5 },
  labelStyle: { fill: '#cbd5e1', fontSize: 10, fontWeight: 500 },
  labelBgStyle: { fill: '#070e20', fillOpacity: 0.9 },
  labelBgPadding: [4, 6] as [number, number],
  labelBgBorderRadius: 4,
};

const legend: { nodeType: FlowNodeData['nodeType']; label: string; color: string }[] = [
  { nodeType: 'entry',        label: 'Entry',       color: 'bg-cyan-400' },
  { nodeType: 'bot_response', label: 'Bot Response', color: 'bg-emerald-400' },
  { nodeType: 'llm_prompt',   label: 'LLM Prompt',  color: 'bg-purple-400' },
  { nodeType: 'decision',     label: 'Decision',    color: 'bg-amber-400' },
  { nodeType: 'intel',        label: 'Intel',       color: 'bg-orange-400' },
  { nodeType: 'completion',   label: 'Completion',  color: 'bg-green-400' },
  { nodeType: 'error',        label: 'Error',       color: 'bg-red-400' },
];

// Sections for quick-jump navigation
const sections: { label: string; nodeIds: string[]; shortcut: string }[] = [
  { label: 'Entry',          nodeIds: ['initial-greeting'],                                                        shortcut: '1' },
  { label: 'Pre-flow',       nodeIds: ['preflow-buy', 'preflow-sell', 'preflow-greeting', 'preflow-question', 'preflow-general'], shortcut: '2' },
  { label: 'Selection',      nodeIds: ['offer-selection', 'intent-selection'],                                     shortcut: '3' },
  { label: 'Question Loop',  nodeIds: ['display-question', 'intent-classification', 'direct-answer', 'rephrase-prompt', 'intel-save-flow'], shortcut: '4' },
  { label: 'Output',         nodeIds: ['reply-generation', 'schema-normalization'],                                shortcut: '5' },
  { label: 'Completion',     nodeIds: ['flow-complete', 'error-fallback'],                                         shortcut: '6' },
];

interface Props {
  onNodeSelect: (id: string | null, data: FlowNodeData | null) => void;
  selectedNodeId: string | null;
  activeNodeId?: string | null;
}

function FlowCanvas({ onNodeSelect, selectedNodeId, activeNodeId }: Props) {
  const { fitView, setCenter, getViewport, setViewport, zoomIn, zoomOut } = useReactFlow();
  const PAN_STEP = 80;

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id, node.data as unknown as FlowNodeData);
    },
    [onNodeSelect],
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect(null, null);
  }, [onNodeSelect]);

  const jumpToSection = useCallback(
    (nodeIds: string[]) => {
      // Find the nodes in this section
      const sectionNodes = flowNodes.filter((n) => nodeIds.includes(n.id));
      if (sectionNodes.length === 0) return;

      // Calculate center of the section
      const xs = sectionNodes.map((n) => n.position.x + 100); // +100 for half node width
      const ys = sectionNodes.map((n) => n.position.y + 30);  // +30 for half node height
      const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
      const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

      const zoom = sectionNodes.length <= 2 ? 1.2 : 0.85;
      setCenter(centerX, centerY, { zoom, duration: 400 });
    },
    [setCenter],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Number keys 1-6 for section jumps
      const num = parseInt(e.key);
      if (num >= 1 && num <= sections.length) {
        e.preventDefault();
        jumpToSection(sections[num - 1].nodeIds);
        return;
      }

      // 0 or Home to fit all
      if (e.key === '0' || e.key === 'Home') {
        e.preventDefault();
        fitView({ padding: 0.15, duration: 400 });
        return;
      }

      // Arrow keys to pan
      const v = getViewport();
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          setViewport({ x: v.x, y: v.y + PAN_STEP, zoom: v.zoom }, { duration: 150 });
          return;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          setViewport({ x: v.x, y: v.y - PAN_STEP, zoom: v.zoom }, { duration: 150 });
          return;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          setViewport({ x: v.x + PAN_STEP, y: v.y, zoom: v.zoom }, { duration: 150 });
          return;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          setViewport({ x: v.x - PAN_STEP, y: v.y, zoom: v.zoom }, { duration: 150 });
          return;
      }

      // +/- or =/_ to zoom
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn({ duration: 200 });
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jumpToSection, fitView, getViewport, setViewport, zoomIn, zoomOut]);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: legend + section jumps */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#070e20]/90 border-b border-blue-500/15 flex-shrink-0">
        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mr-1">Legend:</span>
          {legend.map((item) => (
            <div key={item.nodeType} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[11px] text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section jump bar */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#070e20]/70 border-b border-blue-500/10 flex-shrink-0">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mr-1">Jump to:</span>
        {sections.map((section) => (
          <button
            key={section.label}
            onClick={() => jumpToSection(section.nodeIds)}
            className="px-2.5 py-1 text-[11px] font-medium text-white/70 hover:text-white bg-blue-500/8 hover:bg-blue-500/20 border border-blue-500/15 hover:border-blue-500/30 rounded-md transition"
          >
            <span className="text-blue-400/60 mr-1 text-[10px]">{section.shortcut}</span>
            {section.label}
          </button>
        ))}
        <button
          onClick={() => fitView({ padding: 0.15, duration: 400 })}
          className="px-2.5 py-1 text-[11px] font-medium text-white/70 hover:text-white bg-blue-500/8 hover:bg-blue-500/20 border border-blue-500/15 hover:border-blue-500/30 rounded-md transition ml-1"
        >
          <span className="text-blue-400/60 mr-1 text-[10px]">0</span>
          Fit All
        </button>
      </div>

      {/* Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes.map((n) => ({
            ...n,
            selected: n.id === selectedNodeId,
            data: { ...n.data, isLiveActive: n.id === activeNodeId },
          }))}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#162040" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-[#0b1530] !border-blue-500/20 !rounded-lg [&>button]:!bg-[#0b1530] [&>button]:!border-blue-500/20 [&>button]:!text-white/70 [&>button:hover]:!bg-blue-500/10"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrapper that provides ReactFlow context
export default function ConversationFlowDiagram(props: Props) {
  return <FlowCanvas {...props} />;
}
