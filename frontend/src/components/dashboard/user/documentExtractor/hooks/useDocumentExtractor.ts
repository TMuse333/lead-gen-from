// components/documentExtractor/hooks/useDocumentExtractor.ts

import { useState } from 'react';
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
      setError(err.response?.data?.error || err.message || 'Failed to extract text');
    } finally {
      setLoading(false);
    }
  };

  // Process with LLM
  const handleProcess = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use default prompt if none provided
      const effectivePrompt = contextPrompt.trim() || 'Extract relevant advice and knowledge from this document. Focus on actionable, practical recommendations suitable for a knowledge base.';

      const response = await axios.post('/api/document-extraction/process', {
        text: extractedText,
        contextPrompt: effectivePrompt,
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
      setError(err.response?.data?.error || err.message || 'Failed to process document');
    } finally {
      setLoading(false);
    }
  };

  // Upload selected items
  const handleUpload = async () => {
    const itemsToUpload = Array.from(selectedItems).map((i) => extractedItems[i]);

    if (itemsToUpload.length === 0) {
      setError('Please select at least one item to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('uploading');

    try {
      // Upload via API
      const response = await axios.post('/api/document-extraction/upload', {
        items: itemsToUpload.map((item) => {
          const originalIndex = extractedItems.findIndex((it) => it === item);
          const rules = itemRules[originalIndex] || [];
          const logic = itemLogic[originalIndex] || 'AND';
          
          // Convert rules to RuleGroup format
          const ruleGroups: RuleGroup[] = rules.length > 0 
            ? [{
                logic,
                rules: rules.map((rule) => ({
                  field: rule.field,
                  operator: rule.operator,
                  value: rule.value,
                  weight: rule.weight,
                })),
              }]
            : item.ruleGroups || [];
          
          return {
            title: item.title,
            advice: item.advice,
            flows: item.flows || flows,
            tags: item.tags || [],
            ruleGroups: ruleGroups,
            type: 'general-advice',
          };
        }),
      });

      if (response.data.success) {
        // Add to onboarding store
        itemsToUpload.forEach((item) => {
          addKnowledgeBaseItem({
            title: item.title,
            advice: item.advice,
            flows: item.flows || flows,
            tags: item.tags || [],
            source: 'document',
          });
        });

        if (onComplete) {
          onComplete(itemsToUpload);
        }
      } else {
        throw new Error(response.data.error || 'Failed to upload items');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to upload items');
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
      extractedItems.map((item, i) => (i === index ? { ...item, editing: false } : item))
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
        logic,
        rules: rules.map((rule) => ({
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

