// frontend/src/components/dashboard/user/offers/OfferEditor.tsx
/**
 * Main Offer Editor Component
 * Simplified tabbed interface with unified Offer Builder
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  Settings,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  BookOpen,
  Wand2,
  MessageSquare,
  Image,
  Award,
  Sparkles,
} from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { EditorTab } from '@/types/offers/offerCustomization.types';
import type { GenerationMetadata } from '@/lib/offers/core/types';
import { useOfferEditor } from '@/hooks/offers/useOfferEditor';
import { useOfferCustomizations } from '@/hooks/offers/useOfferCustomizations';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { SettingsTab } from './tabs/SettingsTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { UnifiedOfferBuilder } from './tabs/UnifiedOfferBuilder';
import { SummaryTab } from './tabs/SummaryTab';
import { LivePreviewTab } from './tabs/LivePreviewTab';
import { InstructionsTab } from './tabs/InstructionsTab';
import { EndingCTATab } from './tabs/EndingCTATab';
import { HeroSectionTab } from './tabs/HeroSectionTab';
import { AgentStatsTab } from './tabs/AgentStatsTab';
import { QuickSetupWizard } from './tabs/QuickSetupWizard';
import type { EndingCTAConfig } from '@/lib/mongodb/models/clientConfig';
import type { AgentProfile } from '@/lib/userConfig/getUserConfig';

// Tab structure - Instructions, Setup Wizard, Hero/CTA/Stats, Summary, Live Preview, Settings, Analytics
const TABS = [
  { id: 'instructions', label: 'Instructions', icon: BookOpen, highlight: true },
  // { id: 'easy-setup', label: 'Easy Setup', icon: Sparkles, highlight: true }, // Commented out for now
  { id: 'setup-wizard', label: 'Setup Wizard', icon: Wand2, highlight: true },
  { id: 'hero-section', label: 'Hero Section', icon: Image, highlight: true },
  { id: 'ending-cta', label: 'Ending CTA', icon: MessageSquare, highlight: true },
  { id: 'agent-stats', label: 'Agent Stats', icon: Award, highlight: false },
  { id: 'summary', label: 'Summary', icon: GitBranch, highlight: false },
  { id: 'live-preview', label: 'Live Preview', icon: Eye, highlight: false },
  { id: 'settings', label: 'Settings', icon: Settings, highlight: false },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, highlight: false },
] as const;

interface OfferEditorProps {
  offerType: OfferType;
  onBack: () => void;
}

export function OfferEditor({ offerType, onBack }: OfferEditorProps) {
  const searchParams = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  const [showTabHint, setShowTabHint] = useState(true);
  const [showTabGlow, setShowTabGlow] = useState(true);
  const [initialTabSet, setInitialTabSet] = useState(false);

  // Hide hint and glow after user interacts or after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTabHint(false);
    }, 5000); // Hint fades after 5 seconds

    const glowTimer = setTimeout(() => {
      setShowTabGlow(false);
    }, 8000); // Glow fades after 8 seconds

    return () => {
      clearTimeout(timer);
      clearTimeout(glowTimer);
    };
  }, []);

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

  const { config, refetch: refetchConfig } = useUserConfig();
  const isOfferInConfig = config?.selectedOffers?.includes(offerType) || false;

  const isLoading = editorLoading || dataLoading;
  const error = editorError || dataError;

  // Read tab from URL params on initial load
  useEffect(() => {
    if (initialTabSet) return;

    const tabParam = searchParams.get('tab');
    const validTabs = ['instructions', 'setup-wizard', 'summary', 'live-preview', 'hero-section', 'ending-cta', 'agent-stats', 'settings', 'analytics'];

    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as EditorTab);
    } else if (!validTabs.includes(activeTab)) {
      setActiveTab('instructions' as EditorTab);
    }

    setInitialTabSet(true);
  }, [searchParams, activeTab, setActiveTab, initialTabSet]);

  // Handle opening wizard from InstructionsTab
  const handleOpenWizard = () => {
    setActiveTab('setup-wizard' as EditorTab);
    setShowTabHint(false);
    setShowTabGlow(false);
  };

  // Handle tab click - dismiss hints
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as EditorTab);
    setShowTabHint(false);
    if (tabId !== 'instructions') {
      setShowTabGlow(false);
    }
  };

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

  const handleSaveEndingCTA = async (ctaConfig: EndingCTAConfig) => {
    setEditorLoading(true);
    setEditorError(null);

    try {
      const response = await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endingCTA: ctaConfig }),
      });

      if (!response.ok) {
        throw new Error('Failed to save CTA configuration');
      }

      await refetchConfig();
      setSuccess('CTA settings saved successfully');
    } catch (err: any) {
      setEditorError(err.message || 'Failed to save CTA configuration');
      throw err; // Re-throw so EndingCTATab can handle it
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSaveAgentStats = async (agentProfile: AgentProfile) => {
    setEditorLoading(true);
    setEditorError(null);

    try {
      const response = await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentProfile }),
      });

      if (!response.ok) {
        throw new Error('Failed to save agent stats');
      }

      await refetchConfig();
      setSuccess('Agent stats saved successfully');
    } catch (err: any) {
      setEditorError(err.message || 'Failed to save agent stats');
      throw err;
    } finally {
      setEditorLoading(false);
    }
  };

  const handleAddOrSaveOffer = async () => {
    if (!config) {
      setEditorError('Configuration not loaded');
      return;
    }

    setEditorLoading(true);
    setEditorError(null);

    try {
      const currentOffers = config.selectedOffers || [];
      const updatedOffers = isOfferInConfig
        ? currentOffers
        : [...currentOffers, offerType];

      const response = await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOffers: updatedOffers }),
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      if (customization) {
        await saveCustomizations(customization);
      }

      await refetchConfig();

      setSuccess(
        isOfferInConfig
          ? 'Changes saved successfully'
          : 'Offer added to your configuration'
      );
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setEditorError(err.message || 'Failed to save offer');
    } finally {
      setEditorLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{definition.label} Configuration</h1>
            <p className="text-sm text-slate-400 mt-1">
              Build your chatbot flow and customize the timeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Add/Save Button */}
          <button
            onClick={handleAddOrSaveOffer}
            disabled={isLoading}
            className={`
              px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
              ${isOfferInConfig
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-400/50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isOfferInConfig ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isOfferInConfig ? 'Save Changes' : 'Add Offer'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
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

      {/* Tabs */}
      <div className="border-b border-slate-700 relative">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const shouldGlow = showTabGlow && tab.highlight;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-all relative ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'
                }`}
                animate={shouldGlow ? {
                  boxShadow: [
                    '0 0 0 0 rgba(6, 182, 212, 0)',
                    '0 0 20px 2px rgba(6, 182, 212, 0.4)',
                    '0 0 0 0 rgba(6, 182, 212, 0)',
                  ],
                } : {}}
                transition={shouldGlow ? {
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                } : {}}
              >
                <Icon className={`w-4 h-4 ${shouldGlow ? 'text-cyan-400' : ''}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab hint text */}
        {showTabHint && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -bottom-6 left-0 text-xs text-cyan-400/70 italic"
            style={{
              animation: 'fadeOut 5s forwards',
            }}
          >
            Explore each tab to configure your chatbot: Instructions → Setup Wizard → Hero/CTA → Summary
          </motion.p>
        )}
      </div>

      {/* Add spacing when hint is shown */}
      {showTabHint && <div className="h-4" />}

      {/* Main Content */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-6">
        {activeTab === 'instructions' && (
          <InstructionsTab onOpenWizard={handleOpenWizard} />
        )}
        {/* Easy Setup commented out for now
        {activeTab === 'easy-setup' && (
          <QuickSetupWizard
            isOpen={true}
            onClose={() => setActiveTab('summary' as EditorTab)}
            onComplete={() => {
              setSuccess('Timeline setup saved successfully!');
              setActiveTab('summary' as EditorTab);
            }}
            embedded={true}
          />
        )}
        */}
        {activeTab === 'setup-wizard' && (
          <UnifiedOfferBuilder
            externalShowWizard={true}
            onWizardClose={() => setActiveTab('summary' as EditorTab)}
            wizardOnlyMode={true}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryTab />
        )}
        {activeTab === 'live-preview' && (
          <LivePreviewTab />
        )}
        {activeTab === 'hero-section' && (
          <HeroSectionTab
            config={config?.endingCTA}
            onSave={handleSaveEndingCTA}
          />
        )}
        {activeTab === 'ending-cta' && (
          <EndingCTATab
            config={config?.endingCTA}
            onSave={handleSaveEndingCTA}
          />
        )}
        {activeTab === 'agent-stats' && (
          <AgentStatsTab
            agentProfile={config?.agentProfile}
            onSave={handleSaveAgentStats}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            definition={definition}
            onSave={handleSaveSettings}
            onReset={handleReset}
            hasCustomizations={hasCustomizations}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab offerType={offerType} />}
      </div>
    </div>
  );
}
