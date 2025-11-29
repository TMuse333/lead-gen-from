'use client';

import { motion } from 'framer-motion';
import { Key, Database } from 'lucide-react';
import type { OutputValue } from '@/types/genericOutput.types';
import { isValidOutputComponent, formatKey, formatValue } from '@/types/genericOutput.types';

/**
 * Generic key-value list component
 * Displays structured data in a clean list format
 */
interface GenericKeyValueListProps {
  data: Record<string, OutputValue>;
  title?: string;
  maxItems?: number;
  className?: string;
}

export function GenericKeyValueList({
  data,
  title = 'Details',
  maxItems,
  className = '',
}: GenericKeyValueListProps) {
  if (!isValidOutputComponent(data) || Object.keys(data).length === 0) {
    return null;
  }

  const entries = Object.entries(data);
  const displayEntries = maxItems ? entries.slice(0, maxItems) : entries;
  const hasMore = maxItems && entries.length > maxItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      {title && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {title}
            </h4>
          </div>
        </div>
      )}

      {/* Key-Value Pairs */}
      <div className="divide-y divide-gray-100">
        {displayEntries.map(([key, value], index) => {
          const formattedValue = formatValue(value);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Key className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {formatKey(key)}
                  </div>
                  <div className="text-sm text-gray-900 break-words">
                    {formattedValue}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show More Indicator */}
      {hasMore && (
        <div className="px-4 py-2 bg-gray-50 text-center border-t border-gray-200">
          <span className="text-xs text-gray-500">
            +{entries.length - maxItems!} more items
          </span>
        </div>
      )}
    </motion.div>
  );
}

