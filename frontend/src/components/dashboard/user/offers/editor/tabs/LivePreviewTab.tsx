// src/components/dashboard/user/offers/editor/tabs/LivePreviewTab.tsx
/**
 * Live Preview Tab - Real-time preview of the timeline offer
 * Updates as the agent makes changes in the Timeline Builder
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Monitor, Smartphone, RefreshCw, Loader2, AlertCircle, User, Maximize2, Minimize2, X } from 'lucide-react';
import { TimelineLandingPage } from '@/components/ux/resultsComponents/timeline/TimelineLandingPage';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
import type { AgentCredentials } from '@/components/ux/resultsComponents/timeline/components/AgentExpertise';
import type { MatchedStory } from '@/components/ux/resultsComponents/timeline/components/StoryCard';
import type { CustomPhaseConfig, TimelineFlow, AvailableStory } from '@/types/timelineBuilder.types';
import type { EndingCTAConfig } from '@/lib/mongodb/models/clientConfig';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import { getTheme } from '@/lib/colors/colorUtils';

const FLOW_OPTIONS: { id: TimelineFlow; label: string }[] = [
  { id: 'buy', label: 'Buyer' },
  { id: 'sell', label: 'Seller' },
  // { id: 'browse', label: 'Browser' }, // Commented out for MVP
];

// Mock user data for preview
const MOCK_USER_DATA = {
  name: 'Preview User',
  location: 'Halifax, NS',
  budget: '$450,000',
  timeline: '6 months',
  propertyType: 'Single-family home',
};

export function LivePreviewTab() {
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [phases, setPhases] = useState<CustomPhaseConfig[]>([]);
  const [stories, setStories] = useState<Map<string, AvailableStory>>(new Map());
  const [agentProfile, setAgentProfile] = useState<AgentCredentials | null>(null);
  const [endingCTA, setEndingCTA] = useState<EndingCTAConfig | null>(null);
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Fetch phases and stories
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch phases, user config in parallel
      const [phasesRes, configRes] = await Promise.all([
        fetch(`/api/custom-phases?flow=${selectedFlow}`),
        fetch('/api/user/config'),
      ]);

      const phasesData = await phasesRes.json();
      const configData = await configRes.json();

      if (!phasesRes.ok) throw new Error(phasesData.error || 'Failed to fetch phases');

      setPhases(phasesData.phases || []);

      if (configData.success) {
        if (configData.config?.agentProfile) {
          setAgentProfile(configData.config.agentProfile);
        }
        if (configData.config?.endingCTA) {
          setEndingCTA(configData.config.endingCTA);
        }
        // Extract and convert color theme from user config
        if (configData.config?.colorConfig) {
          const theme = getTheme(configData.config.colorConfig);
          setColorTheme(theme);
        }
      }

      // Collect all story IDs from phases
      const storyIds = new Set<string>();
      (phasesData.phases || []).forEach((phase: CustomPhaseConfig) => {
        phase.actionableSteps.forEach((step) => {
          if (step.linkedStoryId) {
            storyIds.add(step.linkedStoryId);
          }
        });
      });

      // Fetch stories if we have any IDs
      if (storyIds.size > 0) {
        const storiesRes = await fetch('/api/stories/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyIds: Array.from(storyIds) }),
        });

        if (storiesRes.ok) {
          const storiesData = await storiesRes.json();
          const storyMap = new Map<string, AvailableStory>();
          (storiesData.stories || []).forEach((story: AvailableStory) => {
            storyMap.set(story.id, story);
          });
          setStories(storyMap);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Convert custom phases to TimelineOutput format
  const timelineOutput = useMemo((): TimelineOutput => {
    const convertedPhases = phases.map((phase) => {
      // Get agent advice (tips only) from inline experiences
      // Stories are handled separately via storiesByPhase - don't add them to agentAdvice
      const agentAdvice: string[] = [];
      phase.actionableSteps.forEach((step) => {
        if (step.inlineExperience) {
          agentAdvice.push(step.inlineExperience);
        }
        // Note: linkedStoryId content goes to storiesByPhase, not agentAdvice
      });

      return {
        id: phase.id,
        name: phase.name,
        timeline: phase.timeline,
        description: phase.description,
        actionItems: phase.actionableSteps.map((step) => ({
          task: step.title,
          priority: step.priority as 'high' | 'medium' | 'low',
          estimatedTime: step.description,
        })),
        agentAdvice, // Always provide array (empty if no advice)
        order: phase.order,
        isOptional: phase.isOptional,
      };
    });

    const flowLabel = selectedFlow === 'buy' ? 'Buying' : selectedFlow === 'sell' ? 'Selling' : 'Exploring';

    return {
      id: 'preview-timeline',
      type: 'real-estate-timeline',
      businessName: agentProfile?.company || 'Your Business',
      flow: selectedFlow,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      title: `Your Personal Home ${flowLabel} Timeline`,
      subtitle: `Customized for ${MOCK_USER_DATA.propertyType} in ${MOCK_USER_DATA.location}`,
      userSituation: {
        flow: selectedFlow,
        timeline: MOCK_USER_DATA.timeline,
        location: MOCK_USER_DATA.location,
        budget: MOCK_USER_DATA.budget,
        currentStage: 'Just starting',
        isFirstTime: true,
        propertyType: MOCK_USER_DATA.propertyType,
      },
      phases: convertedPhases,
      totalEstimatedTime: calculateTotalTime(phases),
      disclaimer: 'Timelines are estimates and can vary based on market conditions.',
      metadata: {
        phasesCount: phases.length,
        totalActionItems: phases.reduce((sum, p) => sum + p.actionableSteps.length, 0),
      },
    };
  }, [phases, stories, selectedFlow, agentProfile]);

  // Convert to stories by phase format for TimelineLandingPage
  const storiesByPhase = useMemo((): Record<string, MatchedStory[]> => {
    const result: Record<string, MatchedStory[]> = {};

    phases.forEach((phase) => {
      const phaseStories: MatchedStory[] = [];
      const seenStoryIds = new Set<string>(); // Track seen IDs for deduplication

      phase.actionableSteps.forEach((step) => {
        if (step.linkedStoryId) {
          // Skip if we've already added this story to this phase
          if (seenStoryIds.has(step.linkedStoryId)) {
            return;
          }

          const story = stories.get(step.linkedStoryId);
          if (story) {
            seenStoryIds.add(step.linkedStoryId);

            // Convert AvailableStory to MatchedStory format
            // Use structured fields if available, fallback to parsing legacy advice
            let situation = story.situation || '';
            let action = story.action || '';
            let outcome = story.outcome || '';

            // If no structured fields, try to parse legacy advice format
            if (!situation && !action && !outcome && story.advice) {
              const lines = story.advice.split('\n');
              for (const line of lines) {
                if (line.startsWith('Situation:')) {
                  situation = line.replace('Situation:', '').trim();
                } else if (line.startsWith('What I did:')) {
                  action = line.replace('What I did:', '').trim();
                } else if (line.startsWith('Outcome:')) {
                  outcome = line.replace('Outcome:', '').trim();
                }
              }
              // If still no structured content, use advice as situation
              if (!situation && !action && !outcome) {
                situation = story.advice.replace('[CLIENT STORY]', '').trim().slice(0, 150);
              }
            }

            phaseStories.push({
              id: story.id,
              title: story.title,
              situation: situation || 'Client situation',
              action: action || 'Provided guidance and support',
              outcome: outcome || 'Achieved their goals',
              matchReasons: story.tags.slice(0, 3),
            });
          }
        }
      });

      if (phaseStories.length > 0) {
        result[phase.id] = phaseStories;
      }
    });

    return result;
  }, [phases, stories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Live Preview</h3>
          <p className="text-sm text-slate-400 mt-1">
            See how your timeline will look to leads
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Flow Selector */}
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            {FLOW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedFlow(opt.id)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedFlow === opt.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Fullscreen preview"
          >
            <Maximize2 className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Mock User Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4" />
          <span>Preview as:</span>
          <span className="text-slate-200">{MOCK_USER_DATA.name}</span>
          <span>|</span>
          <span>{MOCK_USER_DATA.location}</span>
          <span>|</span>
          <span>{MOCK_USER_DATA.budget}</span>
          <span>|</span>
          <span>{MOCK_USER_DATA.timeline} timeline</span>
        </div>
      </div>

      {/* Preview Frame */}
      <div
        className={`bg-slate-950 border border-slate-700 rounded-xl overflow-hidden transition-all ${
          viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
        }`}
      >
        {/* Browser Chrome */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-700 rounded-full px-4 py-1 text-xs text-slate-400 text-center">
              yoursite.com/timeline-preview
            </div>
          </div>
        </div>

        {/* Timeline Preview */}
        <div className={`max-h-[600px] overflow-y-auto ${viewMode === 'mobile' ? 'p-2' : 'p-4'}`}>
          {phases.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No phases configured for this flow</p>
              <p className="text-sm mt-1">Add phases in the Timeline Builder tab</p>
            </div>
          ) : (
            <TimelineLandingPage
              data={timelineOutput}
              agentCredentials={agentProfile || undefined}
              storiesByPhase={storiesByPhase}
              endingCTA={endingCTA || undefined}
              colorTheme={colorTheme || undefined}
              forceMobileLayout={viewMode === 'mobile'}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Preview Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950">
          {/* Fullscreen Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-100">Preview</h3>

                {/* Flow Selector */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                  {FLOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedFlow(opt.id)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        selectedFlow === opt.id
                          ? 'bg-cyan-500 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'desktop'
                        ? 'bg-cyan-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Desktop view"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'mobile'
                        ? 'bg-cyan-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Mobile view"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Press ESC to exit</span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Exit fullscreen"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Preview Content */}
          <div className="pt-16 h-full overflow-y-auto">
            <div
              className={`min-h-full ${
                viewMode === 'mobile' ? 'max-w-sm mx-auto px-4 py-6' : ''
              }`}
            >
              {phases.length === 0 ? (
                <div className="flex items-center justify-center h-[calc(100vh-100px)] text-slate-400">
                  <div className="text-center">
                    <p>No phases configured for this flow</p>
                    <p className="text-sm mt-1">Add phases in the Timeline Builder tab</p>
                  </div>
                </div>
              ) : (
                <TimelineLandingPage
                  data={timelineOutput}
                  agentCredentials={agentProfile || undefined}
                  storiesByPhase={storiesByPhase}
                  endingCTA={endingCTA || undefined}
                  colorTheme={colorTheme || undefined}
                  forceMobileLayout={viewMode === 'mobile'}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to calculate total time from phases
function calculateTotalTime(phases: CustomPhaseConfig[]): string {
  if (phases.length === 0) return 'N/A';

  // Try to extract week numbers from timeline strings
  let maxWeek = 0;
  phases.forEach((phase) => {
    const match = phase.timeline.match(/(\d+)/g);
    if (match) {
      match.forEach((num) => {
        const week = parseInt(num, 10);
        if (week > maxWeek) maxWeek = week;
      });
    }
  });

  if (maxWeek === 0) return 'Variable';

  const months = Math.ceil(maxWeek / 4);
  return `${months}-${months + 1} months`;
}

export default LivePreviewTab;
