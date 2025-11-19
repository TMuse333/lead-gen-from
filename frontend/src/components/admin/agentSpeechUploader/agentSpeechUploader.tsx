'use client';
import { useState, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import axios from 'axios';

import ModeSelector from './components/modeSelector';
import FlowSelector from './components/flowSelector';
import ManualQuestionInput from './components/manualQuestionInput';
import AIScriptGenerator from './components/aiScriptGenerator';
import QuestionList from './components/questionList';
import UploadSection from './components/uploadSection';
import EmptyState from './components/emptyState';

import { Question, Mode, Flow, RecordingStatus } from '@/types/recording.types';
import HelpModal from './components/helpModal';
import RecordingModal from './components/recordingModal';

export default function AgentAdviceSpeechUploader() {
  const [mode, setMode] = useState<Mode>('manual');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

const handleSaveRecording = (questionId: string, blob: Blob, transcript: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, recording: { status: 'completed', duration: 60, audioUrl: URL.createObjectURL(blob), transcript } }
        : q
    ));
  };

  // MediaRecorder refs
  const mediaRecorderRefs = useRef<{ [key: string]: MediaRecorder }>({});
  const audioChunksRefs = useRef<{ [key: string]: Blob[] }>({});

  // === HANDLERS ===
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const question: Question = {
      id: `q-${Date.now()}`,
      text: newQuestion.trim(),
      recording: { status: 'idle', duration: 0 },
    };
    setQuestions(prev => [...prev, question]);
    setNewQuestion('');
  };

  const handleGenerateScript = async () => {
    if (!scriptPrompt.trim() && selectedFlows.length === 0) return;

    setIsGenerating(true);

    try {
      const response = await axios.post('/api/generate-voice-script', {
        flows: selectedFlows,
        customPrompt: scriptPrompt,
        agentName: 'Sarah Chen', // Replace with real data later
        yearsExperience: 12,
        specialty: 'luxury condos and downtown living',
      });

      const generatedTexts: string[] = response.data.questions;

      const newQuestions: Question[] = generatedTexts.map((text: string) => ({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        recording: { status: 'idle', duration: 0 },
      }));

      setQuestions(newQuestions);
      setScriptPrompt(''); // clear prompt after success
    } catch (err: any) {
      console.error('Generate script failed:', err);
      alert('Failed to generate script: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (id: string, currentText: string) => {
    setEditingId(id);
    setEditValue(currentText);
  };

  const saveEdit = () => {
    if (!editingId || !editValue.trim()) return;
    setQuestions(prev =>
      prev.map(q =>
        q.id === editingId ? { ...q, text: editValue.trim() } : q
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleStartRecording = async (questionId: string) => {
    // Same recording logic as before (unchanged)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setQuestions(prev =>
          prev.map(q =>
            q.id === questionId
              ? {
                  ...q,
                  recording: {
                    status: 'completed' as RecordingStatus,
                    duration: Math.round(blob.size / 1024 / 10),
                    audioUrl,
                    transcript: '[Processing...]',
                  },
                }
              : q
          )
        );
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRefs.current[questionId] = recorder;
      audioChunksRefs.current[questionId] = chunks;

      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? { ...q, recording: { ...q.recording!, status: 'recording' as RecordingStatus } }
            : q
        )
      );
    } catch (err) {
      alert('Please allow microphone access!');
    }
  };

  const handleStopRecording = (questionId: string) => {
    const recorder = mediaRecorderRefs.current[questionId];
    recorder?.stop();
  };

  const handleDeleteRecording = (questionId: string) => {
    const recorder = mediaRecorderRefs.current[questionId];
    recorder?.stream.getTracks().forEach(t => t.stop());
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, recording: { status: 'idle', duration: 0, audioUrl: undefined, transcript: undefined } }
          : q
      )
    );
    delete mediaRecorderRefs.current[questionId];
    delete audioChunksRefs.current[questionId];
  };

  const handleDeleteQuestion = (questionId: string) => {
    handleDeleteRecording(questionId);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleUploadAdvice = async () => {
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 3000));
    setUploadStatus('Successfully uploaded advice to Qdrant!');
    setTimeout(() => {
      setUploadStatus('');
      setQuestions([]);
      setIsUploading(false);
    }, 4000);
  };

  const hasIncomplete = questions.some(q => q.recording?.status !== 'completed');

  const openRecordingModal = (index: number) => {
    setCurrentQuestionIndex(index);
    setRecordingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <HelpModal/>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Voice Advice Uploader</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[60px]">
            Record your real estate expertise to build personalized AI responses
          </p>
        </div>

        <ModeSelector mode={mode} onModeChange={setMode} />

        <FlowSelector
          selectedFlows={selectedFlows}
          onToggleFlow={(flow) =>
            setSelectedFlows(prev =>
              prev.includes(flow) ? prev.filter(f => f !== flow) : [...prev, flow]
            )
          }
        />

        {mode === 'manual' ? (
          <ManualQuestionInput
            value={newQuestion}
            onChange={setNewQuestion}
            onAdd={handleAddQuestion}
          />
        ) : (
          <div className="space-y-6">
            <AIScriptGenerator
              prompt={scriptPrompt}
              onPromptChange={setScriptPrompt}
              onGenerate={handleGenerateScript}
              isGenerating={isGenerating}
            />

            {/* Generating State */}
            {isGenerating && (
              <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-8 text-center">
                <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-xl font-semibold text-purple-300">Generating your personalized script...</p>
                <p className="text-sm text-purple-400 mt-2">This usually takes 5–10 seconds</p>
              </div>
            )}

            {/* Generated Questions Preview (Editable) */}
            {questions.length > 0 && !isGenerating && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-400">Generated Script</span>
                  <span className="text-sm font-normal text-slate-400">(click any question to edit)</span>
                </h2>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-3 group">
                      <span className="text-xs font-bold text-slate-500 w-8">Q{i + 1}</span>
                      {editingId === q.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          onBlur={saveEdit}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-indigo-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p
                          onClick={() => startEditing(q.id, q.text)}
                          className="flex-1 text-white cursor-pointer hover:bg-slate-700/50 px-3 py-2 rounded-lg transition"
                        >
                          {q.text}
                        </p>
                      )}
                      {editingId === q.id && (
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-white">
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <QuestionList
          questions={questions}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onDeleteRecording={handleDeleteRecording}
          onDeleteQuestion={handleDeleteQuestion}
          openRecordingModal={openRecordingModal}
        />

{recordingModalOpen && (
  <RecordingModal
    questions={questions}
    currentIndex={currentQuestionIndex}
    onClose={() => setRecordingModalOpen(false)}
    onSaveRecording={handleSaveRecording}
    onNext={() => setCurrentQuestionIndex(i => Math.min(i + 1, questions.length - 1))}
    onPrev={() => setCurrentQuestionIndex(i => Math.max(i - 1, 0))}
  />
)}

        {questions.length > 0 ? (
          <UploadSection
            isUploading={isUploading}
            uploadStatus={uploadStatus}
            hasIncompleteRecordings={hasIncomplete}
            onUpload={handleUploadAdvice}
          />
        ) : (
          !isGenerating && <EmptyState mode={mode} />
        )}
      </div>
    </div>
  );
}