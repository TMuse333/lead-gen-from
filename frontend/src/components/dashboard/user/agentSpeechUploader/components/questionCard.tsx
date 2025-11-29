import { motion } from 'framer-motion';
import { Mic, Square, Play, Check, Trash2 } from 'lucide-react';
import { Question } from '@/types/recording.types';

interface QuestionCardProps {
  question: Question;
  index: number;
  openRecordingModal: (index: number) => void; // New prop to open modal
  onDeleteRecording: () => void;
  onDeleteQuestion: () => void;
}

export default function QuestionCard({
  question,
  index,
  openRecordingModal,
  onDeleteRecording,
  onDeleteQuestion,
}: QuestionCardProps) {
  const status = question.recording?.status || 'idle';
  const isRecording = status === 'recording';
  const isCompleted = status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-slate-600 transition-all"
    >
      {/* Question Number */}
      <div className="flex-shrink-0 w-8 text-center">
        <span className="text-xs font-bold text-slate-500">Q{index + 1}</span>
      </div>

      {/* Question Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm leading-relaxed break-words">
          {question.text}
        </p>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCompleted ? (
          <>
            <button className="p-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition">
              <Check className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
              <Play className="h-4 w-4" />
            </button>
          </>
        ) : 
        
        <button
  onClick={() => openRecordingModal(index)}
  className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
>
  <Mic className="h-4 w-4" />
</button>
        
        }

        {/* Delete Question */}
        <button
          onClick={onDeleteQuestion}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Recording Indicator (shown below when active) */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-8 left-12 flex items-center gap-2 text-red-400 text-xs font-medium"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-3 bg-red-400 rounded-full"
                animate={{ height: [6, 16, 6] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span>Recording...</span>
        </motion.div>
      )}
    </motion.div>
  );
}