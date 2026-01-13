// components/dashboard/user/offers/editor/tabs/HeroSectionTab.tsx
/**
 * Hero Section Tab - Configure the agent info displayed in the results page hero banner
 * Uses the same EndingCTAConfig data for consistency
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  User,
  Building2,
  Check,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import { HeadshotUpload } from '@/components/dashboard/shared/HeadshotUpload';
import type { EndingCTAConfig } from '@/lib/mongodb/models/clientConfig';

interface HeroSectionTabProps {
  config?: EndingCTAConfig;
  onSave: (config: EndingCTAConfig) => Promise<void>;
}

const DEFAULT_CONFIG: Partial<EndingCTAConfig> = {
  displayName: '',
  style: 'questions-form',
};

export function HeroSectionTab({ config, onSave }: HeroSectionTabProps) {
  const [formData, setFormData] = useState<Partial<EndingCTAConfig>>(config || DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset form when config changes
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = <K extends keyof EndingCTAConfig>(
    field: K,
    value: EndingCTAConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleHeadshotUpload = (url: string) => {
    handleChange('headshot', url);
  };

  const handleHeadshotRemove = () => {
    setFormData((prev) => {
      const { headshot, ...rest } = prev;
      return rest;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Merge with existing config to preserve CTA-specific fields
      const fullConfig: EndingCTAConfig = {
        ...(config || { displayName: '', style: 'questions-form' }),
        ...formData,
        displayName: formData.displayName || '',
        style: formData.style || config?.style || 'questions-form',
      };
      await onSave(fullConfig);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save hero config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Hero Section Settings
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure your agent profile that appears in the results page hero banner
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all
            ${hasChanges && !isSaving
              ? 'bg-cyan-600 text-white hover:bg-cyan-700'
              : saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-cyan-300">
            Your agent profile appears in two places on the results page:
          </p>
          <ul className="text-sm text-cyan-400/80 mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Hero banner at the top (small badge with your photo)</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Ending CTA section at the bottom (full contact card)</span>
            </li>
          </ul>
          <p className="text-xs text-cyan-500 mt-2">
            Changes here will update both sections automatically.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Agent Profile */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-500" />
              Your Profile
            </h3>

            {/* Headshot Upload */}
            <div className="mb-6">
              <HeadshotUpload
                currentHeadshot={formData.headshot}
                agentName={formData.displayName}
                onUpload={handleHeadshotUpload}
                onRemove={handleHeadshotRemove}
              />
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="John Smith"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                This appears next to your photo in the hero banner
              </p>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title / Role
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Real Estate Agent"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Shown as your subtitle in the hero
              </p>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company / Brokerage
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="ABC Realty"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4">
              Hero Preview
            </h3>

            {/* Mock Hero Badge */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6">
              <p className="text-white/60 text-xs mb-3">How it appears in the hero:</p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-full pl-1.5 pr-4 py-1.5">
                  {formData.headshot ? (
                    <img
                      src={formData.headshot}
                      alt={formData.displayName || 'Agent'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                      <User className="h-5 w-5 text-white/80" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {formData.displayName || 'Your Name'}
                    </p>
                    <p className="text-xs text-white/70">
                      {formData.title || 'Your title'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/50 text-xs mt-4">
                This badge appears below the timeline summary in the hero section
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Tips</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Use a professional, friendly headshot</li>
              <li>• Keep your title concise (e.g., "Real Estate Agent")</li>
              <li>• Your photo builds trust with leads immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
