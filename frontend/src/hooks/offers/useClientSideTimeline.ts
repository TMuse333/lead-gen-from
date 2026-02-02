// src/hooks/offers/useClientSideTimeline.ts
// Client-side timeline generation hook
// No LLM calls - uses static templates and fetches stories by ID

import { useState, useCallback } from 'react';
import {
  generateFastTimeline,
  type UserTimelineInput,
} from '@/lib/offers/definitions/timeline/fast-timeline-generator';
import type {
  TimelineOutput,
  TimelinePhase,
  ActionItem,
} from '@/lib/offers/definitions/timeline/timeline-types';
import type { StoriesByPhase, StoryMappings } from '@/types/advice.types';
import type { FlowPhaseConfigs } from '@/types/timelineBuilder.types';

// Default disclaimer
const DEFAULT_DISCLAIMER = `This timeline is a general guide based on typical real estate transactions.
Actual timelines may vary based on market conditions, financing, and other factors.
Consult with your real estate agent and other professionals for specific advice.`;

export interface OfferConfig {
  businessName: string;
  agentProfile: any | null;
  storyMappings: StoryMappings;
  selectedOffers: string[];
  qdrantCollectionName: string;
  colorConfig: any | null;
  customPhases?: FlowPhaseConfigs; // Custom phase configurations
}

export interface GenerateTimelineInput {
  flow: 'buy' | 'sell'; // browse commented out for MVP
  userInput: Record<string, any>;
  config: OfferConfig;
}

export interface GenerateTimelineResult {
  timeline: TimelineOutput;
  storiesByPhase: StoriesByPhase;
  generationTime: number;
}

export function useClientSideTimeline() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch offer config from API
   */
  const fetchConfig = useCallback(async (clientId?: string): Promise<OfferConfig | null> => {
    try {
      const url = clientId
        ? `/api/offer-config?clientId=${encodeURIComponent(clientId)}`
        : '/api/offer-config';

      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch config');
      }

      const data = await response.json();
      return data.config;
    } catch (err) {
      console.error('[useClientSideTimeline] Failed to fetch config:', err);
      return null;
    }
  }, []);

  /**
   * Fetch stories by phase from API
   */
  const fetchStories = useCallback(async (
    flow: 'buy' | 'sell' | 'browse',
    storyMappings: StoryMappings,
    collectionName: string
  ): Promise<StoriesByPhase> => {
    try {
      const response = await fetch('/api/stories-by-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow, storyMappings, collectionName }),
      });

      if (!response.ok) {
        console.error('[useClientSideTimeline] Failed to fetch stories');
        return {};
      }

      const data = await response.json();
      return data.storiesByPhase || {};
    } catch (err) {
      console.error('[useClientSideTimeline] Error fetching stories:', err);
      return {};
    }
  }, []);

  /**
   * Generate timeline client-side using static templates
   * This is the main function - no LLM calls
   */
  const generateTimeline = useCallback(async (
    input: GenerateTimelineInput
  ): Promise<GenerateTimelineResult | null> => {
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const { flow, userInput, config } = input;

      // 1. Build timeline input
      const timelineInput: UserTimelineInput = {
        flow,
        location: userInput.location,
        budget: userInput.budget,
        timeline: userInput.timeline,
        isFirstTimeBuyer: userInput.isFirstTimeBuyer || userInput.buyerType === 'first-time',
        isPreApproved: userInput.preApproval === 'yes' || userInput.isPreApproved,
        currentStage: userInput.currentStage,
        motivation: userInput.motivation,
        additionalContext: userInput.additionalContext,
      };

      // 2. Generate timeline using static templates (pure function, no network)
      // Use custom phases if available for this flow
      const customPhasesForFlow = config.customPhases?.[flow];
      const generatedTimeline = generateFastTimeline(timelineInput, customPhasesForFlow);

      // 3. Fetch stories by ID (simple lookup, no embeddings)
      const storiesByPhase = await fetchStories(
        flow,
        config.storyMappings,
        config.qdrantCollectionName
      );

      // 4. Convert to TimelineOutput format
      const phases: TimelinePhase[] = generatedTimeline.phases
        .filter((p) => !p.isSkipped)
        .map((phase, index) => ({
          id: phase.id,
          name: phase.name,
          timeline: phase.timeline,
          description: phase.description,
          actionItems: phase.actionItems.map((item) => ({
            task: item.text,
            priority: item.priority,
            details: item.details,
          })) as ActionItem[],
          agentAdvice: phase.agentAdvice || [],
          isOptional: false,
          conditionalNote: phase.skipReason,
          order: index + 1,
        }));

      const timelineOutput: TimelineOutput = {
        id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'real-estate-timeline',
        businessName: config.businessName || 'Your Agent',
        flow,
        generatedAt: new Date().toISOString(),
        version: '2.0-client',
        title: generatedTimeline.title,
        subtitle: generatedTimeline.subtitle,
        userSituation: {
          flow: generatedTimeline.flow,
          timeline: generatedTimeline.userSituation.timeline,
          location: generatedTimeline.userSituation.location,
          budget: generatedTimeline.userSituation.budget,
          isFirstTime: generatedTimeline.userSituation.isFirstTimeBuyer,
          contactName: userInput.contactName,
          contactEmail: userInput.contactEmail,
        },
        phases,
        totalEstimatedTime: generatedTimeline.totalEstimatedTime,
        disclaimer: DEFAULT_DISCLAIMER,
        metadata: {
          generatedBy: 'client-side-static',
          phasesCount: phases.length,
          totalActionItems: phases.reduce((sum, p) => sum + p.actionItems.length, 0),
          storyCount: Object.values(storiesByPhase).flat().length,
        },
      };

      const generationTime = Date.now() - startTime;

      return {
        timeline: timelineOutput,
        storiesByPhase,
        generationTime,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate timeline';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStories]);

  /**
   * Full generation flow: fetch config + generate timeline
   * Convenience method that handles everything
   */
  const generateFromScratch = useCallback(async (
    rawFlow: 'buy' | 'sell' | 'browse', // Accept browse for legacy support
    userInput: Record<string, any>,
    clientId?: string
  ): Promise<GenerateTimelineResult | null> => {
    setIsLoading(true);
    setError(null);

    // Map browse to buy for MVP
    const flow = (rawFlow === 'browse' ? 'buy' : rawFlow) as 'buy' | 'sell';

    try {
      // 1. Fetch config
      const config = await fetchConfig(clientId);
      if (!config) {
        setError('Failed to load configuration');
        return null;
      }

      // 2. Generate timeline
      return await generateTimeline({ flow, userInput, config });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate timeline';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchConfig, generateTimeline]);

  return {
    isLoading,
    error,
    fetchConfig,
    fetchStories,
    generateTimeline,
    generateFromScratch,
  };
}

// =============================================================================
// FUTURE LLM INTEGRATION POINTS
// =============================================================================
//
// When ready to add LLM capabilities, here's where they would plug in:
//
// 1. PERSONALIZED PHASE DESCRIPTIONS
//    Instead of static descriptions, use LLM to write context-aware descriptions:
//    ```
//    const personalizedDescription = await generatePhaseDescription(
//      phase.id,
//      userInput,
//      agentProfile
//    );
//    ```
//
// 2. SMART ACTION ITEM PRIORITIZATION
//    Use LLM to reorder/customize action items based on user's specific situation:
//    ```
//    const prioritizedItems = await prioritizeActionItems(
//      phase.actionItems,
//      userInput,
//      { urgency: userInput.timeline, budget: userInput.budget }
//    );
//    ```
//
// 3. SEMANTIC STORY MATCHING (re-enable Qdrant vector search)
//    Instead of static mappings, use embeddings to find most relevant stories:
//    ```
//    const relevantStories = await queryRelevantStories(
//      embedding,
//      userInput,
//      { limit: 2, phase: phase.id }
//    );
//    ```
//
// 4. DYNAMIC TIP GENERATION
//    Generate tips based on user's specific situation:
//    ```
//    const tips = await generateContextualTips(
//      phase.id,
//      userInput,
//      agentProfile.specializations
//    );
//    ```
//
// 5. OFFER SUMMARY/INTRO
//    Generate personalized intro paragraph:
//    ```
//    const intro = await generateOfferIntro(
//      userInput.contactName,
//      flow,
//      agentProfile
//    );
//    ```
//
// =============================================================================
