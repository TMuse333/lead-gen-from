// src/components/dashboard/user/offers/editor/tabs/TimelineBuilderTab.tsx
/**
 * Timeline Builder Tab - Simplified UI with accordion view and guided wizard
 * Allows agents to customize their offer phases and steps
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ChevronDown,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Link,
  X,
  GripVertical,
  Sparkles,
  Settings2,
  ChevronUp,
} from 'lucide-react';
import { useTimelineBuilder } from '@/hooks/offers/useTimelineBuilder';
import { DraggableList } from '@/components/dashboard/shared/DraggableList';
import { StoryPickerModal } from '@/components/dashboard/shared/StoryPickerModal';
import { TimelineWizardModal } from './TimelineWizardModal';
import type { CustomPhaseConfig, CustomActionableStep, TimelineFlow } from '@/types/timelineBuilder.types';
import { PHASE_CONSTRAINTS } from '@/types/timelineBuilder.types';

const FLOW_OPTIONS: { id: TimelineFlow; label: string }[] = [
  { id: 'buy', label: 'Buyers' },
  { id: 'sell', label: 'Sellers' },
  { id: 'browse', label: 'Browsers' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: 'text-red-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'low', label: 'Low', color: 'text-green-400' },
] as const;

export function TimelineBuilderTab() {
  const {
    phases,
    selectedFlow,
    isLoading,
    isSaving,
    error,
    successMessage,
    isDirty,
    isCustom,
    validationErrors,
    setSelectedFlow,
    addPhase,
    removePhase,
    updatePhase,
    reorderPhases,
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    linkStory,
    setInlineExperience,
    clearStoryLink,
    savePhases,
    resetToDefaults,
    discardChanges,
    canAddPhase,
    canRemovePhase,
  } = useTimelineBuilder();

  // Accordion: only one phase expanded at a time (null = all collapsed)
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [storyPickerState, setStoryPickerState] = useState<{
    isOpen: boolean;
    phaseId: string;
    stepId: string;
    currentStoryId?: string;
    currentInlineText?: string;
  }>({ isOpen: false, phaseId: '', stepId: '' });

  // Accordion toggle - collapse others when opening one
  const togglePhaseExpanded = (phaseId: string) => {
    setExpandedPhaseId(prev => prev === phaseId ? null : phaseId);
  };

  const openStoryPicker = (phaseId: string, step: CustomActionableStep) => {
    setStoryPickerState({
      isOpen: true,
      phaseId,
      stepId: step.id,
      currentStoryId: step.linkedStoryId,
      currentInlineText: step.inlineExperience,
    });
  };

  const handleStorySelect = (storyId: string) => {
    if (storyId) {
      linkStory(storyPickerState.phaseId, storyPickerState.stepId, storyId);
    } else {
      clearStoryLink(storyPickerState.phaseId, storyPickerState.stepId);
    }
  };

  const handleInlineSave = (text: string) => {
    setInlineExperience(storyPickerState.phaseId, storyPickerState.stepId, text);
  };

  const handleWizardComplete = (flow: TimelineFlow, newPhases: CustomPhaseConfig[]) => {
    // Apply wizard results by updating each phase
    if (flow !== selectedFlow) {
      setSelectedFlow(flow);
    }
    // The hook will refetch, but we can directly update for immediate feedback
    newPhases.forEach(phase => {
      updatePhase(phase.id, phase);
    });
  };

  // Bulk apply phases from wizard (replace all)
  const applyWizardPhases = (flow: TimelineFlow, newPhases: CustomPhaseConfig[]) => {
    if (flow !== selectedFlow) {
      setSelectedFlow(flow);
    }
    reorderPhases(newPhases);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-100">Timeline Builder</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Customize the phases and steps of your timeline
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCustom && (
            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">
              Customized
            </span>
          )}
          {isDirty && (
            <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Flow Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
        {FLOW_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedFlow(option.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFlow === option.id
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Quick Setup Wizard Button */}
      <button
        onClick={() => setShowWizard(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all text-sm w-fit"
      >
        <Sparkles className="w-4 h-4" />
        Quick Setup Wizard
      </button>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-400 text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors (collapsed by default) */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-yellow-400 text-sm">
              {validationErrors.length} validation {validationErrors.length === 1 ? 'issue' : 'issues'} to fix before saving
            </span>
          </div>
        </div>
      )}

      {/* Phase List - Accordion Style */}
      <div className="space-y-2">
        <DraggableList
          items={phases}
          onReorder={reorderPhases}
          showDragHandle={false}
          renderItem={(phase, index, isDragging, isDropTarget) => (
            <PhaseCard
              phase={phase}
              index={index}
              isExpanded={expandedPhaseId === phase.id}
              onToggleExpand={() => togglePhaseExpanded(phase.id)}
              onUpdate={(updates) => updatePhase(phase.id, updates)}
              onRemove={() => removePhase(phase.id)}
              onAddStep={() => addStep(phase.id)}
              onRemoveStep={(stepId) => removeStep(phase.id, stepId)}
              onUpdateStep={(stepId, updates) => updateStep(phase.id, stepId, updates)}
              onReorderSteps={(steps) => reorderSteps(phase.id, steps)}
              onOpenStoryPicker={(step) => openStoryPicker(phase.id, step)}
              canRemove={canRemovePhase}
              isDragging={isDragging}
              isDropTarget={isDropTarget}
            />
          )}
        />

        {/* Add Phase Button */}
        <button
          onClick={addPhase}
          disabled={!canAddPhase}
          className="w-full py-2.5 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Phase ({phases.length}/{PHASE_CONSTRAINTS.MAX_PHASES})
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={resetToDefaults}
          disabled={isSaving || !isCustom}
          className="px-3 py-1.5 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={discardChanges}
              disabled={isSaving}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
            >
              Discard
            </button>
          )}
          <button
            onClick={savePhases}
            disabled={isSaving || !isDirty || validationErrors.length > 0}
            className="px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Timeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Picker Modal */}
      <StoryPickerModal
        isOpen={storyPickerState.isOpen}
        onClose={() => setStoryPickerState((s) => ({ ...s, isOpen: false }))}
        onSelectStory={handleStorySelect}
        onSaveInline={handleInlineSave}
        flow={selectedFlow}
        currentStoryId={storyPickerState.currentStoryId}
        currentInlineText={storyPickerState.currentInlineText}
      />

      {/* Wizard Modal */}
      <TimelineWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={applyWizardPhases}
        initialFlow={selectedFlow}
        initialPhases={phases}
      />
    </div>
  );
}

// ============================================================
// Simplified Phase Card Component
// ============================================================

interface PhaseCardProps {
  phase: CustomPhaseConfig;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<CustomPhaseConfig>) => void;
  onRemove: () => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
  onUpdateStep: (stepId: string, updates: Partial<CustomActionableStep>) => void;
  onReorderSteps: (steps: CustomActionableStep[]) => void;
  onOpenStoryPicker: (step: CustomActionableStep) => void;
  canRemove: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
}

function PhaseCard({
  phase,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onReorderSteps,
  onOpenStoryPicker,
  canRemove,
  isDragging,
  isDropTarget,
}: PhaseCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canAddStep = phase.actionableSteps.length < PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE;
  const canRemoveStep = phase.actionableSteps.length > PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE;

  return (
    <div
      className={`bg-slate-800/80 border rounded-lg overflow-hidden transition-all ${
        isDropTarget ? 'border-cyan-400 ring-1 ring-cyan-400/30' : 'border-slate-700'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-700/30 transition-colors text-left"
      >
        <div className="cursor-grab text-slate-600 hover:text-slate-400">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Phase Number */}
        <span className="w-6 h-6 flex items-center justify-center bg-slate-700 text-slate-400 text-xs rounded-full flex-shrink-0">
          {index + 1}
        </span>

        {/* Phase Name */}
        <span className="flex-1 font-medium text-slate-200 truncate">
          {phase.name || 'Untitled Phase'}
        </span>

        {/* Step Count Badge */}
        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded flex-shrink-0">
          {phase.actionableSteps.length} {phase.actionableSteps.length === 1 ? 'step' : 'steps'}
        </span>

        {/* Timeline Badge */}
        {phase.timeline && (
          <span className="px-2 py-0.5 bg-slate-700/50 text-slate-500 text-xs rounded flex-shrink-0">
            {phase.timeline}
          </span>
        )}

        {/* Expand/Collapse Icon */}
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700"
          >
            <div className="p-4 space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Phase Name</label>
                  <input
                    type="text"
                    value={phase.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Phase name"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2.5 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Timeline</label>
                  <input
                    type="text"
                    value={phase.timeline}
                    onChange={(e) => onUpdate({ timeline: e.target.value })}
                    placeholder="Week X-Y"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2.5 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Description</label>
                <textarea
                  value={phase.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="What happens in this phase?"
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2.5 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Advanced Options (collapsed by default) */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  Advanced options
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showAdvanced && (
                  <div className="mt-2 p-2 bg-slate-700/30 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phase.isOptional || false}
                        onChange={(e) => onUpdate({ isOptional: e.target.checked })}
                        className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/50 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-400">Optional phase (can be skipped)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Actionable Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">Action Steps</label>
                  <span className="text-xs text-slate-600">
                    {phase.actionableSteps.length}/{PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE}
                  </span>
                </div>

                <div className="space-y-2">
                  {phase.actionableSteps.map((step, stepIndex) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      stepIndex={stepIndex}
                      onUpdate={(updates) => onUpdateStep(step.id, updates)}
                      onRemove={() => onRemoveStep(step.id)}
                      onOpenStoryPicker={() => onOpenStoryPicker(step)}
                      canRemove={canRemoveStep}
                    />
                  ))}

                  {canAddStep && (
                    <button
                      onClick={onAddStep}
                      className="w-full py-1.5 border border-dashed border-slate-600 rounded text-slate-500 hover:text-slate-400 hover:border-slate-500 transition-colors text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Step
                    </button>
                  )}
                </div>
              </div>

              {/* Delete Phase */}
              {canRemove && (
                <div className="pt-2 border-t border-slate-700">
                  <button
                    onClick={onRemove}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete this phase
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Compact Step Card Component
// ============================================================

interface StepCardProps {
  step: CustomActionableStep;
  stepIndex: number;
  onUpdate: (updates: Partial<CustomActionableStep>) => void;
  onRemove: () => void;
  onOpenStoryPicker: () => void;
  canRemove: boolean;
}

function StepCard({
  step,
  stepIndex,
  onUpdate,
  onRemove,
  onOpenStoryPicker,
  canRemove,
}: StepCardProps) {
  const hasStoryLink = !!step.linkedStoryId || !!step.inlineExperience;

  return (
    <div className="bg-slate-700/50 border border-slate-600/50 rounded p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600 w-4">{stepIndex + 1}.</span>
        <input
          type="text"
          value={step.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Step title"
          className="flex-1 bg-transparent text-slate-200 text-sm focus:outline-none placeholder:text-slate-500"
        />
        <select
          value={step.priority}
          onChange={(e) => onUpdate({ priority: e.target.value as 'high' | 'medium' | 'low' })}
          className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-slate-400 focus:outline-none"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={onOpenStoryPicker}
          className={`p-1 rounded transition-colors ${
            hasStoryLink
              ? 'text-cyan-400 bg-cyan-500/20'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title={hasStoryLink ? 'Story linked' : 'Link a story'}
        >
          {hasStoryLink ? <BookOpen className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
        </button>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TimelineBuilderTab;
