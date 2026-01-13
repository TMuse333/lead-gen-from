// components/chat/MessageBubble.tsx
'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { determineTextColorForGradient } from '@/lib/colors/contrastUtils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  index: number;
}

/**
 * Simple markdown renderer for chat messages
 * Supports: **bold**, bullet points (• and -), line breaks
 */
function renderMarkdown(content: string, isUser: boolean): React.ReactNode {
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    // Process bold text (**text**)
    const processLine = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let keyIndex = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

        if (boldMatch && boldMatch.index !== undefined) {
          // Add text before bold
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          // Add bold text
          parts.push(
            <strong key={`bold-${lineIndex}-${keyIndex++}`} className="font-semibold">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        } else {
          parts.push(remaining);
          break;
        }
      }

      return parts;
    };

    // Check if line is a bullet point
    const bulletMatch = line.match(/^(\s*)(•|-)\s+(.*)$/);

    if (bulletMatch) {
      const [, indent, , bulletContent] = bulletMatch;
      const indentLevel = Math.floor(indent.length / 2);

      return (
        <div
          key={lineIndex}
          className="flex items-start gap-2"
          style={{ paddingLeft: `${indentLevel * 16}px` }}
        >
          <span className={`flex-shrink-0 mt-1 ${isUser ? 'opacity-90' : 'text-cyan-500'}`}>•</span>
          <span>{processLine(bulletContent)}</span>
        </div>
      );
    }

    // Empty line becomes spacing
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-2" />;
    }

    // Regular line
    return (
      <div key={lineIndex}>
        {processLine(line)}
      </div>
    );
  });
}

export function MessageBubble({ role, content, index }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  // Helper to get CSS variable value
  const getCSSVar = (varName: string, fallback: string = '#3b82f6'): string => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-indigo-500 to-purple-500'
        }`}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(99, 102, 241, 0.7)',
            '0 0 0 10px rgba(99, 102, 241, 0)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        className={`max-w-[70%] px-5 py-3 rounded-2xl relative ${
          isUser
            ? 'bg-gradient-to-br rounded-tr-sm'
            : 'bg-white text-gray-900 border-2 border-purple-200 rounded-tl-sm shadow-lg'
        }`}
        style={isUser ? {
          background: `linear-gradient(to bottom right, var(--color-gradient-from), var(--color-gradient-to))`,
          color: determineTextColorForGradient(
            getCSSVar('--color-gradient-from', '#3b82f6'),
            getCSSVar('--color-gradient-to', '#2563eb')
          ),
        } : {}}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {/* Shine effect for user messages */}
        {isUser && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              background: [
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              ],
              backgroundPosition: ['-200%', '200%'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="text-sm leading-relaxed relative z-10 space-y-1">
          {renderMarkdown(content, isUser)}
        </div>

        {/* Sparkle for assistant */}
        {!isUser && (
          <motion.div
            className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}