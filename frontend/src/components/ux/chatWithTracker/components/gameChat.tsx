// components/chat/GameChat.tsx (Reversed - Chat LEFT, Tracker RIGHT)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { RewardSystem } from './rewardSystem';
import { MessageBubble } from './messageBubble';
import { IntegratedTracker } from './integratedTracker';

interface ChatButton {
  id: string;
  label: string;
  value: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  buttons?: ChatButton[];
}

interface GameChatProps {
  messages: Message[];
  loading: boolean;
  onSend: (message: string) => Promise<void>;
  onButtonClick: (button: ChatButton) => void;
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
  userInput: Record<string, string>;
  currentFlow?: string;
  progress: number;
}

export function GameChat({
  messages,
  loading,
  onSend,
  onButtonClick,
  totalSteps,
  currentStep,
  completedSteps,
  userInput,
  currentFlow,
  progress,
}: GameChatProps) {
  const [input, setInput] = useState('');
  const [rewardTrigger, setRewardTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCompletedRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (completedSteps > prevCompletedRef.current) {
      setRewardTrigger((prev) => prev + 1);
      prevCompletedRef.current = completedSteps;
    }
  }, [completedSteps]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input;
    setInput('');
    await onSend(message);
  };

  const handleButtonClick = (button: ChatButton) => {
    onButtonClick(button);
  };

  return (
    <div className="flex gap-4 w-full max-w-7xl mx-auto">
      <RewardSystem trigger={rewardTrigger} />

      {/* Chat Container - LEFT Side (Reversed) */}
      <motion.div
        className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 h-[700px] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={`${msg.timestamp?.getTime()}-${i}`} className="space-y-3">
              <MessageBubble role={msg.role} content={msg.content} index={i} />

              {msg.buttons && msg.buttons.length > 0 && i === messages.length - 1 && (
                <motion.div
                  className="flex flex-wrap gap-2 mr-13" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {msg.buttons.map((btn) => (
                    <motion.button
                      key={btn.id}
                      onClick={() => handleButtonClick(btn)}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-medium hover:shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {btn.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-purple-600 mr-13"  
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t-2 border-purple-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full disabled:opacity-50 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Integrated Tracker - RIGHT Side (Reversed) */}
      <div className="w-80 flex-shrink-0">
        <IntegratedTracker
          totalSteps={totalSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          userInput={userInput}
          currentFlow={currentFlow}
          progress={progress}
        />
      </div>
    </div>
  );
}