'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Database, 
  Clock, 
  Brain, 
  Zap,
  X
} from 'lucide-react';
import type { GenerationDebugInfo } from '@/stores/chatStore';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

interface CompactDebugPanelProps {
  debugInfo: GenerationDebugInfo | null;
  className?: string;
}

export function CompactDebugPanel({ 
  debugInfo, 
  className = '' 
}: CompactDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!debugInfo) {
    return null;
  }

  const totalCollections = debugInfo.qdrantRetrieval?.length || 0;
  const totalItems = debugInfo.qdrantRetrieval?.reduce((sum, m) => sum + m.count, 0) || 0;
  const avgScore = debugInfo.qdrantRetrieval
    ?.flatMap(m => m.items)
    .filter(item => item.score !== undefined)
    .reduce((sum, item, _, arr) => 
      arr.length > 0 ? sum + (item.score || 0) / arr.length : 0, 0
    ) || 0;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
      >
        <Database className="h-5 w-5" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${className}`}
      style={{ width: isExpanded ? '400px' : '280px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">Generation Debug</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-white" />
            ) : (
              <ChevronUp className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Compact View */}
      <div className="p-4 space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Brain className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Advice Used</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{debugInfo.adviceUsed}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Database className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Collections</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{totalCollections}</div>
          </div>
        </div>

        {debugInfo.generationTime && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Generation Time</span>
            </div>
            <span className="font-semibold text-gray-900">
              {(debugInfo.generationTime / 1000).toFixed(2)}s
            </span>
          </div>
        )}

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-200 space-y-3">
                {/* Prompt Length (only show for server-side generation) */}
                {debugInfo.promptLength !== undefined && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Prompt Length</span>
                    <span className="font-semibold text-gray-900">
                      {debugInfo.promptLength.toLocaleString()} chars
                    </span>
                  </div>
                )}

                {/* Flow */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Flow</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {debugInfo.flow}
                  </span>
                </div>

                {/* Average Score */}
                {avgScore > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Avg Match Score</span>
                    <span className="font-semibold text-gray-900">
                      {(avgScore * 100).toFixed(1)}%
                    </span>
                  </div>
                )}

                {/* Collections Summary */}
                {totalCollections > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Collections ({totalItems} items)
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {debugInfo.qdrantRetrieval?.map((meta, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium truncate flex-1">
                              {meta.collection}
                            </span>
                            <span className="text-gray-500 ml-2">{meta.count}</span>
                          </div>
                          <div className="text-gray-500 text-[10px] mt-0.5">
                            {meta.type} • {meta.items.length} items
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

