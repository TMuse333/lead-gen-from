'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import KnowledgeNodeComponent, { type KnowledgeNodeData } from './KnowledgeNode';

const nodeTypes = { knowledgeNode: KnowledgeNodeComponent };

const defaultEdgeOptions = {
  style: { stroke: '#0891b2', strokeWidth: 2 },
  type: 'smoothstep',
  animated: true,
};

// All knowledge categories - Stories and Tips are primary, then agent knowledge categories
const CATEGORIES = [
  { id: 'stories', label: 'Stories', row: 1 },
  { id: 'tips', label: 'Tips & Advice', row: 1 },
  { id: 'about', label: 'About', row: 2 },
  { id: 'services', label: 'Services', row: 2 },
  { id: 'process', label: 'Process', row: 2 },
  { id: 'value-proposition', label: 'Value Props', row: 2 },
  { id: 'testimonials', label: 'Testimonials', row: 2 },
  { id: 'faq', label: 'FAQ', row: 2 },
  { id: 'general', label: 'General', row: 2 },
];

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  text: string;
  chunkCount?: number;
  kind?: 'story' | 'tip';
  source?: string;
  tags?: string[];
  // Story-specific
  situation?: string;
  action?: string;
  outcome?: string;
}

export interface CategoryData {
  id: string;
  label: string;
  count: number;
  items: KnowledgeEntry[];
  // Custom category fields
  isCustom?: boolean;
  icon?: string;
  color?: string;
  description?: string;
  parentId?: string | null;
}

export interface CustomCategoryInfo {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
}

interface Props {
  businessName: string;
  categories: Record<string, CategoryData>;
  totalCount: number;
  onCategorySelect: (category: string | null, entries: KnowledgeEntry[]) => void;
  selectedCategory: string | null;
}

function KnowledgeBrainCanvas({ businessName, categories, totalCount, onCategorySelect, selectedCategory }: Props) {
  // Get all entries for master node click
  const allEntries = useMemo(() => {
    return Object.values(categories).flatMap(cat => cat.items);
  }, [categories]);

  // Generate nodes
  const nodes = useMemo(() => {
    const result: Node[] = [];

    // Master node at top center
    result.push({
      id: 'master',
      type: 'knowledgeNode',
      position: { x: 400, y: 0 },
      data: {
        label: `${businessName}'s Brain`,
        category: 'master',
        count: totalCount,
        nodeType: 'master',
      } as KnowledgeNodeData,
      selected: selectedCategory === null,
    });

    // Row 1: Stories and Tips (primary knowledge)
    const row1Cats = CATEGORIES.filter(c => c.row === 1);
    const row1Width = 180;
    const row1Gap = 60;
    const row1TotalWidth = row1Cats.length * row1Width + (row1Cats.length - 1) * row1Gap;
    const row1StartX = 400 - row1TotalWidth / 2 + row1Width / 2;

    row1Cats.forEach((cat, index) => {
      const catData = categories[cat.id];
      result.push({
        id: cat.id,
        type: 'knowledgeNode',
        position: {
          x: row1StartX + index * (row1Width + row1Gap),
          y: 130,
        },
        data: {
          label: cat.label,
          category: cat.id,
          count: catData?.count || 0,
          nodeType: 'category',
        } as KnowledgeNodeData,
        selected: selectedCategory === cat.id,
      });
    });

    // Row 2: Agent knowledge categories
    const row2Cats = CATEGORIES.filter(c => c.row === 2);
    const row2Width = 130;
    const row2Gap = 15;
    const row2TotalWidth = row2Cats.length * row2Width + (row2Cats.length - 1) * row2Gap;
    const row2StartX = 400 - row2TotalWidth / 2 + row2Width / 2;

    row2Cats.forEach((cat, index) => {
      const catData = categories[cat.id];
      result.push({
        id: cat.id,
        type: 'knowledgeNode',
        position: {
          x: row2StartX + index * (row2Width + row2Gap),
          y: 280,
        },
        data: {
          label: cat.label,
          category: cat.id,
          count: catData?.count || 0,
          nodeType: 'category',
        } as KnowledgeNodeData,
        selected: selectedCategory === cat.id,
      });
    });

    return result;
  }, [businessName, totalCount, categories, selectedCategory]);

  // Generate edges
  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];

    // Edges from master to row 1
    const row1Cats = CATEGORIES.filter(c => c.row === 1);
    for (const cat of row1Cats) {
      const catData = categories[cat.id];
      const hasItems = (catData?.count || 0) > 0;
      result.push({
        id: `master-${cat.id}`,
        source: 'master',
        target: cat.id,
        type: 'smoothstep',
        animated: hasItems,
        style: {
          stroke: hasItems ? '#0891b2' : '#334155',
          strokeWidth: hasItems ? 2 : 1,
          opacity: hasItems ? 1 : 0.4,
        },
      });
    }

    // Edges from master to row 2
    const row2Cats = CATEGORIES.filter(c => c.row === 2);
    for (const cat of row2Cats) {
      const catData = categories[cat.id];
      const hasItems = (catData?.count || 0) > 0;
      result.push({
        id: `master-${cat.id}`,
        source: 'master',
        target: cat.id,
        type: 'smoothstep',
        animated: hasItems,
        style: {
          stroke: hasItems ? '#0891b2' : '#334155',
          strokeWidth: hasItems ? 2 : 1,
          opacity: hasItems ? 1 : 0.4,
        },
      });
    }

    return result;
  }, [categories]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id === 'master') {
        onCategorySelect(null, allEntries);
      } else {
        const catData = categories[node.id];
        onCategorySelect(node.id, catData?.items || []);
      }
    },
    [onCategorySelect, allEntries, categories],
  );

  const handlePaneClick = useCallback(() => {
    // Don't auto-select on pane click
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#1e3a5f" gap={24} size={1} />
        <Controls
          showInteractive={false}
          className="!bg-slate-800 !border-cyan-500/20 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-cyan-500/20 [&>button]:!text-white/70 [&>button:hover]:!bg-cyan-500/10"
        />
      </ReactFlow>
    </div>
  );
}

// Wrapper that provides ReactFlow context
export default function KnowledgeBrainGraph(props: Props) {
  return <KnowledgeBrainCanvas {...props} />;
}
