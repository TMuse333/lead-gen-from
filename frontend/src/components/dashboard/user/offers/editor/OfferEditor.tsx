// frontend/src/components/dashboard/user/offers/OfferEditor.tsx
/**
 * Main Offer Editor Component
 * Complete tabbed interface for editing offer configurations
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ClipboardList,
  FileCode,
  Database,
  Settings,
  Play,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { EditorTab } from '@/types/offers/offerCustomization.types';
import type { GenerationMetadata } from '@/lib/offers/core/types';
import { useOfferEditor } from '@/hooks/offers/useOfferEditor';
import { useOfferCustomizations } from '@/hooks/offers/useOfferCustomizations';
import { OverviewTab } from './tabs/OverviewTab';
import { InputsTab } from './tabs/InputsTab';
import { PromptTab } from './tabs/PromptTab';
import { OutputTab } from './tabs/OutputTab';
import { SettingsTab } from './tabs/SettingsTab';
import { TestTab } from './tabs/TestTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'inputs', label: 'Input Requirements', icon: ClipboardList },
  { id: 'prompt', label: 'Prompt', icon: FileCode },
  { id: 'output', label: 'Output Schema', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'test', label: 'Test', icon: Play },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

interface OfferEditorProps {
  offerType: OfferType;
  onBack: () => void;
}

export function OfferEditor({ offerType, onBack }: OfferEditorProps) {
  const {
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isLoading: editorLoading,
    setIsLoading: setEditorLoading,
    error: editorError,
    setError: setEditorError,
    success,
    setSuccess,
  } = useOfferEditor();

  const {
    definition,
    customization,
    hasCustomizations,
    isLoading: dataLoading,
    error: dataError,
    saveCustomizations,
    resetToDefaults,
  } = useOfferCustomizations(offerType);

  const isLoading = editorLoading || dataLoading;
  const error = editorError || dataError;

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!definition) return;
    setEditorLoading(true);
    setEditorError(null);

    const success = await saveCustomizations({
      ...customization,
      enabled,
    });

    if (success) {
      setSuccess(enabled ? 'Offer enabled' : 'Offer disabled');
    } else {
      setEditorError('Failed to update offer status');
    }
    setEditorLoading(false);
  };

  const handleSaveSettings = async (metadata: Partial<GenerationMetadata>) => {
    if (!definition) return;
    setEditorLoading(true);
    setEditorError(null);

    const success = await saveCustomizations({
      ...customization,
      generationMetadata: metadata,
    });

    if (success) {
      setSuccess('Settings saved successfully');
      setHasUnsavedChanges(false);
    } else {
      setEditorError('Failed to save settings');
    }
    setEditorLoading(false);
  };

  const handleReset = async () => {
    if (!confirm('Reset all customizations to system defaults?')) return;
    setEditorLoading(true);
    setEditorError(null);

    const success = await resetToDefaults();
    if (success) {
      setSuccess('Reset to system defaults');
      setHasUnsavedChanges(false);
    } else {
      setEditorError('Failed to reset customizations');
    }
    setEditorLoading(false);
  };

  if (isLoading && !definition) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Offer definition not found</p>
          <button onClick={onBack} className="mt-4 text-cyan-400 hover:text-cyan-300">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{definition.label} Configuration</h1>
            <p className="text-sm text-slate-400 mt-1">
              Customize settings, test generation, and view analytics
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="text-green-400">{success}</p>
        </motion.div>
      )}

      <div className="border-b border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EditorTab)}
                className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-6">
        {activeTab === 'overview' && (
          <OverviewTab
            definition={definition}
            customization={customization}
            hasCustomizations={hasCustomizations}
            onToggleEnabled={handleToggleEnabled}
          />
        )}
        {activeTab === 'inputs' && <InputsTab definition={definition} />}
        {activeTab === 'prompt' && <PromptTab definition={definition} />}
        {activeTab === 'output' && <OutputTab definition={definition} />}
        {activeTab === 'settings' && (
          <SettingsTab
            definition={definition}
            onSave={handleSaveSettings}
            onReset={handleReset}
            hasCustomizations={hasCustomizations}
          />
        )}
        {activeTab === 'test' && <TestTab offerType={offerType} />}
        {activeTab === 'analytics' && <AnalyticsTab offerType={offerType} />}
      </div>
    </div>
  );
}
