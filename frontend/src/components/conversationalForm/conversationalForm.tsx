'use client';

import { FormAnswer, FormQuestion } from '@/types';
import { useState } from 'react';


/**
 * CONVERSATIONAL FORM FLOW - Modern UI/UX Approach
 * 
 * Design Philosophy:
 * - One question at a time (reduces cognitive load)
 * - Large, thumb-friendly buttons (mobile-first)
 * - Conversational feel (like texting with an assistant)
 * - Instant visual feedback
 * - Progress indicator for motivation
 * - Smooth animations (questions slide in, answers pop up)
 * 
 * User Flow:
 * 1. Question appears with animation (AI "typing" effect optional)
 * 2. User clicks button or types answer
 * 3. Their answer appears as a "user message bubble"
 * 4. Brief pause (200ms) - feels conversational
 * 5. Next question slides up
 * 6. Progress bar fills incrementally
 * 7. Email capture feels natural in the flow
 * 8. Final question transitions to "analyzing" state
 * 9. Results appear with celebration micro-animation
 */

interface ConversationalFormProps {
  questions: FormQuestion[];
  onComplete: (answers: FormAnswer[]) => void;
  agentName?: string;
  primaryColor?: string;
}

export default function ConversationalForm({
  questions,
  onComplete,
  agentName = "Your Agent",
  primaryColor = "#2563eb"
}: ConversationalFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = async (value: string | string[]) => {
    // Save answer
    const answer: FormAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      value,
      answeredAt: new Date(),
    };
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    // Transition animation
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Move to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsTransitioning(false);
    } else {
      // Form complete
      onComplete(newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar - Sticky at top */}
        <div className="mb-6 bg-white rounded-full p-1 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-[60px]">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Chat Container - Previous answers + Current question */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Show previous Q&As as chat history */}
          {answers.map((answer, idx) => (
            <div key={idx} className="space-y-3 animate-fade-in-up">
              {/* Previous question (left - AI side) */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                  <p className="text-gray-700">{answer.question}</p>
                </div>
              </div>
              
              {/* User's answer (right - user side) */}
              <div className="flex gap-3 justify-end">
                <div 
                  className="rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-white font-medium">
                    {Array.isArray(answer.value) 
                      ? answer.value.join(', ') 
                      : answer.value}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Current Question */}
          {!isTransitioning && (
            <div className="space-y-4 animate-slide-up">
              {/* AI Avatar + Question */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                  <p className="text-gray-900 font-medium text-lg">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.subtext && (
                    <p className="text-gray-500 text-sm mt-1">
                      {currentQuestion.subtext}
                    </p>
                  )}
                </div>
              </div>

              {/* Answer Options */}
              <div className="pl-11 space-y-3">
                {/* Button Select */}
                {currentQuestion.type === 'button-select' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.choices?.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleAnswer(choice.value)}
                        className="group relative bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-4 text-left transition-all hover:shadow-md active:scale-95"
                      >
                        <div className="flex items-center gap-3">
                          {choice.icon && (
                            <span className="text-2xl">{choice.icon}</span>
                          )}
                          <span className="font-medium text-gray-900 group-hover:text-blue-600">
                            {choice.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Input */}
                {currentQuestion.type === 'text' && (
                  <input
                    type="text"
                    placeholder={currentQuestion.placeholder}
                    className="w-full text-black px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleAnswer(e.currentTarget.value);
                      }
                    }}
                  />
                )}

                {/* Email Input - Special styling */}
                {currentQuestion.type === 'email' && (
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder={currentQuestion.placeholder}
                      className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.includes('@')) {
                          handleAnswer(e.currentTarget.value);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      🔒 Your email is safe and will only be used to send your personalized report
                    </p>
                  </div>
                )}

                {/* Textarea */}
                {currentQuestion.type === 'textarea' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder={currentQuestion.placeholder}
                      rows={4}
                      className="w-full text-black  px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    />
                    <button
                      onClick={() => {
                        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                        if (textarea?.value || !currentQuestion.required) {
                          handleAnswer(textarea?.value || 'No concerns');
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {currentQuestion.required ? 'Continue' : 'Skip'}
                    </button>
                  </div>
                )}

                {/* Multi-select */}
                {currentQuestion.type === 'multi-select' && (
                  <MultiSelectOptions
                    choices={currentQuestion.choices || []}
                    onSubmit={handleAnswer}
                  />
                )}
              </div>
            </div>
          )}

          {/* Loading state between questions */}
          {isTransitioning && (
            <div className="flex gap-3 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full" />
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Powered by footer */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Powered by AI • Personalized for {agentName}
          </p>
        </div>
      </div>
    </div>
  );
}

// Multi-select sub-component
function MultiSelectOptions({ 
  choices, 
  onSubmit 
}: { 
  choices: any[]; 
  onSubmit: (values: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleChoice = (value: string) => {
    setSelected(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => toggleChoice(choice.value)}
            className={`
              relative bg-white border-2 rounded-xl p-4 text-left transition-all
              ${selected.includes(choice.value)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {choice.icon && <span className="text-2xl">{choice.icon}</span>}
              <span className="font-medium text-gray-900">{choice.label}</span>
              {selected.includes(choice.value) && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit(selected)}
        disabled={selected.length === 0}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Continue {selected.length > 0 && `(${selected.length} selected)`}
      </button>
    </div>
  );
}