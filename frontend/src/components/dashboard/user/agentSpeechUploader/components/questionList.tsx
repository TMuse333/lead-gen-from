import { AnimatePresence, motion } from 'framer-motion';
import QuestionCard from './questionCard';
import { Question } from '@/types/recording.types';

interface QuestionListProps {
  questions: Question[];
  onStartRecording: (id: string) => void;
  onStopRecording: (id: string) => void;
  onDeleteRecording: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  openRecordingModal: (index: number) => void; // New prop to open modal
}

export default function QuestionList({
  questions,
  onStartRecording,
  onStopRecording,
  onDeleteRecording,
  onDeleteQuestion,
  openRecordingModal
}: QuestionListProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 relative">
      {/* Optional Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Your Script ({questions.length} questions)
        </h2>
        <p className="text-sm text-slate-400">
          {questions.filter(q => q.recording?.status === 'completed').length} recorded
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
            openRecordingModal={openRecordingModal}
              onDeleteRecording={() => onDeleteRecording(question.id)}
              onDeleteQuestion={() => onDeleteQuestion(question.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}