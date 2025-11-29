// components/documentExtractor/hooks/useDocumentExtractor.ts

import { useState, useEffect } from 'react';
import axios from 'axios';
import type { FlowIntention } from '@/stores/onboardingStore/onboarding.store';
import type { ExtractedItem, ConditionRule, LogicOperator, Step } from '../types';
import type { RuleGroup } from '@/types/rules.types';

interface UseDocumentExtractorProps {
  flows: FlowIntention[];
  onComplete?: (items: ExtractedItem[]) => void;
  addKnowledgeBaseItem: (item: any) => void;
}

export function useDocumentExtractor({
  flows,
  onComplete,
  addKnowledgeBaseItem,
}: UseDocumentExtractorProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [documentSize, setDocumentSize] = useState<number>(0);
  const [contextPrompt, setContextPrompt] = useState<string>('');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [addingRulesTo, setAddingRulesTo] = useState<number | null>(null);
  const [itemRules, setItemRules] = useState<Record<number, ConditionRule[]>>({});
  const [itemLogic, setItemLogic] = useState<Record<number, LogicOperator>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File upload handler
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post('/api/document-extraction/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setExtractedText(response.data.text);
        setDocumentType(response.data.type);
        setDocumentSize(response.data.size);
        setStep('context');
      } else {
        throw new Error(response.data.error || 'Failed to extract text');
      }
    } catch (err: any) {
      console.error('Error extracting text:', err);
      setError(err.response?.data?.error || err.message || 'Failed to extract text');
    } finally {
      setLoading(false);
    }
  };

  // Process with LLM
  const handleProcess = async () => {
    if (!contextPrompt.trim()) {
      setError('Please provide a context prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/document-extraction/process', {
        text: extractedText,
        contextPrompt,
        flows,
        documentType,
        documentSize,
      });

      if (response.data.success) {
        const items: ExtractedItem[] = response.data.items.map((item: any) => ({
          ...item,
          flows: flows,
          tags: [],
          ruleGroups: [],
        }));
        setExtractedItems(items);
        setSelectedItems(new Set(items.map((_, i) => i)));
        setStep('review');
      } else {
        throw new Error(response.data.error || 'Failed to process document');
      }
    } catch (err: any) {
      console.error('Error processing document:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process document');
    } finally {
      setLoading(false);
    }
  };

  // Upload selected items
  const handleUpload = async () => {
    const itemsToUpload = Array.from(selectedItems).map((i) => extractedItems[i]);

    setLoading(true);
    setError(null);
    setStep('uploading');

    try {
      for (const item of itemsToUpload) {
        await addKnowledgeBaseItem({
          title: item.title,
          advice: item.advice,
          flows: item.flows || [],
          tags: item.tags || [],
          ruleGroups: item.ruleGroups || [],
        });
      }

      if (onComplete) {
        onComplete(itemsToUpload);
      }
    } catch (err: any) {
      console.error('Error uploading items:', err);
      setError(err.message || 'Failed to upload items');
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  // Item management
  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const startEditing = (index: number) => {
    setExtractedItems(
      extractedItems.map((item, i) =>
        i === index
          ? {
              ...item,
              editing: true,
              editedTitle: item.title,
              editedAdvice: item.advice,
            }
          : item
      )
    );
  };

  const saveEdit = (index: number) => {
    setExtractedItems(
      extractedItems.map((item, i) =>
        i === index
          ? {
              ...item,
              title: item.editedTitle || item.title,
              advice: item.editedAdvice || item.advice,
              editing: false,
            }
          : item
      )
    );
  };

  const cancelEdit = (index: number) => {
    setExtractedItems(
      extractedItems.map((item, i) =>
        i === index ? { ...item, editing: false } : item
      )
    );
  };

  const updateItem = (index: number, updates: Partial<ExtractedItem>) => {
    setExtractedItems(
      extractedItems.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  // Rules management
  const handleSaveRules = (index: number) => {
    const rules = itemRules[index] || [];
    const logic = itemLogic[index] || 'AND';

    if (rules.length > 0) {
      const ruleGroup: RuleGroup = {
        id: crypto.randomUUID(),
        name: `Rules for ${extractedItems[index].title}`,
        logic,
        conditions: rules.map((rule) => ({
          id: crypto.randomUUID(),
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          weight: rule.weight,
        })),
      };

      setExtractedItems(
        extractedItems.map((item, i) =>
          i === index
            ? { ...item, ruleGroups: [...(item.ruleGroups || []), ruleGroup] }
            : item
        )
      );
    }

    setAddingRulesTo(null);
  };

  const handleCancelRules = (index: number) => {
    setAddingRulesTo(null);
    setItemRules({ ...itemRules, [index]: [] });
    setItemLogic({ ...itemLogic, [index]: 'AND' });
  };

  return {
    // State
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
    // Setters
    setStep,
    setContextPrompt,
    setAddingRulesTo,
    setItemRules,
    setItemLogic,
    setIsDragging,
    // Handlers
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
  };
}
