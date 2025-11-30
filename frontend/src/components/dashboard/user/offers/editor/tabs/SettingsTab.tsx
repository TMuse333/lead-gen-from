// frontend/src/components/dashboard/user/offers/editor/tabs/SettingsTab.tsx
/**
 * Generation Settings tab for offer editor
 * Allows editing model, temperature, tokens, etc.
 */

'use client';

import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import type { OfferDefinition, GenerationMetadata } from '@/lib/offers/core/types';

interface SettingsTabProps {
  definition: OfferDefinition;
  onSave: (metadata: Partial<GenerationMetadata>) => void;
  onReset: () => void;
  hasCustomizations: boolean;
}

export function SettingsTab({
  definition,
  onSave,
  onReset,
  hasCustomizations,
}: SettingsTabProps) {
  const [metadata, setMetadata] = useState(definition.generationMetadata);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof GenerationMetadata, value: any) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(metadata);
    setHasChanges(false);
  };

  const handleReset = () => {
    onReset();
    setMetadata(definition.generationMetadata);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Model
        </label>
        <select
          value={metadata.model}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
        >
          <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
          <option value="gpt-4o">GPT-4o (Balanced)</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Premium)</option>
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Choose the AI model for generation
        </p>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Temperature: {metadata.temperature}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={metadata.temperature}
          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Precise (0)</span>
          <span>Balanced (1)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Max Tokens
        </label>
        <input
          type="number"
          min="100"
          max="8000"
          step="100"
          value={metadata.maxTokens}
          onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
        />
        <p className="text-xs text-slate-400 mt-1">
          Maximum tokens for output (100-8000)
        </p>
      </div>

      {/* Advanced Settings */}
      <details className="bg-slate-800/30 rounded-lg border border-slate-700">
        <summary className="px-4 py-3 cursor-pointer text-slate-300 hover:text-slate-100">
          Advanced Settings
        </summary>
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Top P
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={metadata.topP || 1}
              onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100"
            />
          </div>
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        {hasCustomizations && (
          <button
            onClick={handleReset}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2.5 rounded-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        )}
      </div>
    </div>
  );
}
