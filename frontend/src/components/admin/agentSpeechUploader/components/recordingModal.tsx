'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, X, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { Question, RecordingStatus } from '@/types/recording.types';

interface RecordingModalProps {
  questions: Question[];
  currentIndex: number;
  onClose: () => void;
  onSaveRecording: (questionId: string, audioBlob: Blob, transcript: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function RecordingModal({
  questions,
  currentIndex,
  onClose,
  onSaveRecording,
  onNext,
  onPrev,
}: RecordingModalProps) {
  const question = questions[currentIndex];
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        transcribeAudio(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Timer
      setTimer(0);
      timerInterval.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);

    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    // Simulate Whisper API call
    await new Promise(r => setTimeout(r, 2000));
    setTranscript("This is a simulated transcript. In production, this will be real Whisper output from your voice recording. It will be 95%+ accurate and editable.");
    setIsTranscribing(false);
  };

  const saveAndNext = () => {
    if (audioBlob && transcript) {
      onSaveRecording(question.id, audioBlob, transcript);
      onNext();
      // Reset for next question
      setAudioBlob(null);
      setTranscript('');
      setTimer(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onPrev} disabled={currentIndex === 0} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <p className="text-sm text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                <h2 className="text-2xl font-bold text-white">Record Your Answer</h2>
              </div>
              <button onClick={onNext} disabled={currentIndex === questions.length - 1} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-10">
            {/* Question */}
            <div className="mb-10 p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
              <p className="text-xl lg:text-2xl font-medium text-white leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Recording Area */}
            {!audioBlob ? (
              <div className="text-center py-20">
                {isRecording ? (
                  <div className="space-y-8">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div
                          key={i}
                          className="w-3 bg-red-500 rounded-full"
                          animate={{ height: [20, 60, 20] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <p className="text-5xl font-bold text-red-400">{formatTime(timer)}</p>
                    <button
                      onClick={stopRecording}
                      className="mt-8 px-10 py-5 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-xl flex items-center gap-3 mx-auto shadow-2xl shadow-red-500/30 animate-pulse"
                    >
                      <Square className="h-8 w-8" />
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="px-16 py-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-2xl font-bold rounded-2xl shadow-2xl flex flex-col items-center gap-4 mx-auto"
                  >
                    <Mic className="h-20 w-20" />
                    Start Recording
                  </button>
                )}
              </div>
            ) : (
              /* After Recording */
              <div className="space-y-8">
                <div className="p-8 bg-slate-800/50 border border-green-700/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="h-6 w-6 text-green-400" />
                    <p className="text-green-400 font-bold">Recording Complete • {formatTime(timer)}</p>
                  </div>
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                </div>

                {/* Transcript */}
                <div>
                  <p className="text-lg font-semibold text-white mb-3">Transcript {isTranscribing && '(generating...)'}</p>
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    rows={6}
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Transcript will appear here..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => { setAudioBlob(null); setTranscript(''); }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Re-record
                  </button>

                  <button
                    onClick={saveAndNext}
                    disabled={!transcript.trim()}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl flex items-center gap-3 shadow-xl disabled:opacity-50"
                  >
                    Save & Next Question
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}