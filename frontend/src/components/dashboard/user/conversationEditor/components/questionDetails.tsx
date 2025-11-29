// components/admin/QuestionDetails.tsx
'use client';

import { useState } from 'react';
import { QuestionNode } from '@/types/conversation.types';
import { X } from 'lucide-react';
import BasicInfoSection from './basicInfoSection';
import ButtonsSection from './buttonsSection';
import ValidationSection from './validationSection';
import PromptSection from './promptSection';

interface Props {
  flowId: string;
  question: QuestionNode;
  onClose: () => void;
}

export default function QuestionDetails({ flowId, question, onClose }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full flex flex-col max-h-[calc(100vh-180px)] sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-semibold text-lg">Question Details</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <BasicInfoSection flowId={flowId} question={question} />
        <ButtonsSection flowId={flowId} question={question} />
        <PromptSection flowId={flowId} question={question} />
        <ValidationSection flowId={flowId} question={question} />
      </div>
    </div>
  );
}