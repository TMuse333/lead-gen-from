// components/documentExtractor/DocumentExtractor.tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore/onboarding.store';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { useDocumentExtractor } from './hooks/useDocumentExtractor';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import UploadStep from './steps/UploadStep';
import ContextStep from './steps/ContextStep';
import ReviewStep from './steps/ReviewStep';
import SuccessState from './components/SuccessState';
import type { DocumentExtractorProps } from './types';

export default function DocumentExtractor({
  onComplete,
  onCancel,
  initialFlows = [],
}: DocumentExtractorProps) {
  const { selectedIntentions, addKnowledgeBaseItem } = useOnboardingStore();
  const { config } = useUserConfig();
  const flows = initialFlows.length > 0 ? initialFlows : selectedIntentions;

  // Use custom hook for document extraction logic
  const {
    step,
    file,
    extractedText,
    documentType,
    documentSize,
    contextPrompt,
    extractedItems,
    selectedItems,
    addingRulesTo,
    itemRules,
    itemLogic,
    loading,
    error,
    isDragging,
    setStep,
    setContextPrompt,
    setAddingRulesTo,
    setItemRules,
    setItemLogic,
    setIsDragging,
    handleFileUpload,
    handleProcess,
    handleUpload,
    toggleItemSelection,
    startEditing,
    saveEdit,
    cancelEdit,
    updateItem,
    handleSaveRules,
    handleCancelRules,
  } = useDocumentExtractor({
    flows,
    onComplete,
    addKnowledgeBaseItem,
  });

  // Dynamic fields from user's flow
  const [userFields, setUserFields] = React.useState<any[]>([]);

  useEffect(() => {
    if (config?.conversationFlows) {
      const fields = discoverFieldsFromFlows(config.conversationFlows);
      setUserFields(fields);
    }
  }, [config]);

  // Drag and drop handlers
  const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useDragAndDrop({
    isDragging,
    setIsDragging,
    onFileSelect: handleFileUpload,
    onError: (err) => console.error(err),
  });

  return (
    <div className="bg-slate-900 rounded-lg shadow-xl p-6 max-w-4xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Document Knowledge Extraction</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <UploadStep
          file={file}
          loading={loading}
          error={error}
          isDragging={isDragging}
          onFileSelect={handleFileUpload}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}

      {/* Step 2: Context */}
      {step === 'context' && (
        <ContextStep
          contextPrompt={contextPrompt}
          extractedText={extractedText}
          documentType={documentType}
          documentSize={documentSize}
          loading={loading}
          onContextPromptChange={setContextPrompt}
          onProcess={handleProcess}
          onBack={() => setStep('upload')}
        />
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <ReviewStep
          extractedItems={extractedItems}
          selectedItems={selectedItems}
          addingRulesTo={addingRulesTo}
          itemRules={itemRules}
          itemLogic={itemLogic}
          userFields={userFields}
          loading={loading}
          onToggleSelection={toggleItemSelection}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onItemChange={updateItem}
          onToggleRulesBuilder={(index) =>
            setAddingRulesTo(addingRulesTo === index ? null : index)
          }
          onRulesChange={(index, rules) => setItemRules({ ...itemRules, [index]: rules })}
          onLogicChange={(index, logic) => setItemLogic({ ...itemLogic, [index]: logic })}
          onSaveRules={handleSaveRules}
          onCancelRules={handleCancelRules}
          onBack={() => setStep('context')}
          onUpload={handleUpload}
        />
      )}

      {/* Step 4: Uploading/Success */}
      {step === 'uploading' && (
        <SuccessState loading={loading} selectedItemsCount={selectedItems.size} />
      )}

      {/* Cancel Button */}
      {onCancel && step !== 'uploading' && (
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition mt-4"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
