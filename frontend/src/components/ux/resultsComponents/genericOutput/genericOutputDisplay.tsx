'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { OutputValue } from '@/types/genericOutput.types';
import { isValidOutputComponent } from '@/types/genericOutput.types';

/**
 * Generic component to display flexible LLM output
 * Accepts any object structure and renders it in a readable format
 */
interface GenericOutputDisplayProps {
  data: Record<string, OutputValue>;
  title?: string;
  className?: string;
}

export function GenericOutputDisplay({ 
  data, 
  title = 'Generated Content',
  className = '' 
}: GenericOutputDisplayProps) {
  if (!isValidOutputComponent(data) || Object.keys(data).length === 0) {
    return null;
  }

  const renderValue = (value: OutputValue, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === 'string') {
      // If it's a long string, treat it as content
      if (value.length > 100) {
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
          </div>
        );
      }
      return <span className="text-gray-700">{value}</span>;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return <span className="text-gray-700 font-medium">{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 italic">Empty array</span>;
      
      return (
        <ul className="space-y-2 ml-4">
          {value.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1">•</span>
              <div className="flex-1">{renderValue(item, depth + 1)}</div>
            </li>
          ))}
        </ul>
      );
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, OutputValue>;
      return (
        <div className={`space-y-3 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
          {Object.entries(obj).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
              </div>
              <div className="ml-4">{renderValue(val, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-500">{String(value)}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-indigo-100">AI-generated content</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {renderValue(value)}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

