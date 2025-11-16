// components/chat/MessageBubble.tsx
'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  index: number;
}

export function MessageBubble({ role, content, index }: MessageBubbleProps) {
  const isUser = role === 'user';

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
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 border-2 border-purple-200 rounded-tl-sm shadow-lg'
        }`}
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

        <p className="text-sm leading-relaxed relative z-10">{content}</p>

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