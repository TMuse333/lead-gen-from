// app/api/agent-advice/auto-assign-stories/route.ts
/**
 * Auto-assign stories from the user's actual knowledge base to timeline phases
 * Uses story metadata (tags, flows, placements) to intelligently match stories to phases
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getUserCollectionName } from '@/lib/userConfig/getUserCollection';
import { QdrantClient } from '@qdrant/js-client-rest';
import { getFlowTemplate } from '@/lib/offers/definitions/timeline/timeline-templates';
import type { CustomPhaseConfig, CustomActionableStep, TimelineFlow } from '@/types/timelineBuilder.types';

// Sample story titles to exclude (in case they weren't deleted)
const SAMPLE_STORY_TITLES = [
  'First-Time Buyer Success in Competitive Market',
  'Navigating Inspection Issues',
  'Relocating Family Finds Home Remotely',
  'Downsizing Empty Nesters',
  'Investment Property Win',
  'Closing Day Save',
];

// Phase keywords for matching stories without explicit placements
const PHASE_KEYWORDS: Record<string, string[]> = {
  'financial-prep': ['mortgage', 'pre-approval', 'budget', 'financing', 'loan', 'credit', 'down payment', 'savings', 'afford'],
  'find-agent': ['agent', 'realtor', 'representation', 'interview', 'hire'],
  'house-hunting': ['search', 'viewing', 'tour', 'showing', 'open house', 'listings', 'neighborhood', 'schools'],
  'make-offer': ['offer', 'negotiate', 'bid', 'contract', 'terms', 'contingency', 'competitive'],
  'under-contract': ['inspection', 'appraisal', 'contingency', 'repairs', 'negotiate', 'due diligence'],
  'closing': ['closing', 'settlement', 'title', 'escrow', 'keys', 'final walkthrough', 'moving'],
  'prepare-home': ['staging', 'repairs', 'declutter', 'photography', 'curb appeal', 'prepare'],
  'list-property': ['listing', 'mls', 'marketing', 'showings', 'open house', 'price'],
  'review-offers': ['offers', 'multiple offers', 'negotiate', 'counter', 'terms'],
  'post-close': ['move', 'settle', 'utilities', 'address change'],
};

interface StoryPayload {
  title?: string;
  situation?: string;
  action?: string;
  outcome?: string;
  advice?: string;
  tags?: string[];
  flows?: string[];
  placements?: Record<string, string[]>;
  type?: string;
}

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

/**
 * Convert template phases to CustomPhaseConfig format
 */
function templateToCustomPhases(flow: TimelineFlow): CustomPhaseConfig[] {
  const template = getFlowTemplate(flow);

  return template.phases.map((phase, phaseIndex) => ({
    id: phase.id,
    name: phase.name,
    timeline: phase.baseTimeline,
    description: phase.description,
    order: phase.order,
    isOptional: phase.isOptional || false,
    actionableSteps: phase.suggestedActionItems.map((item, stepIndex): CustomActionableStep => ({
      id: `${phase.id}-step-${stepIndex + 1}`,
      title: item,
      priority: stepIndex === 0 ? 'high' : stepIndex < 3 ? 'medium' : 'low',
      order: stepIndex + 1,
    })),
  }));
}

/**
 * Score how well a story matches a phase based on content analysis
 */
function scoreStoryForPhase(story: StoryPayload, phaseId: string): number {
  let score = 0;

  // Check explicit placements first (highest priority)
  if (story.placements?.['real-estate-timeline']?.includes(phaseId)) {
    score += 100;
  }

  // Check tags against phase keywords
  const phaseKeywords = PHASE_KEYWORDS[phaseId] || [];
  const storyTags = story.tags || [];

  for (const tag of storyTags) {
    const tagLower = tag.toLowerCase();
    for (const keyword of phaseKeywords) {
      if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
        score += 10;
      }
    }
  }

  // Check story content against phase keywords
  const storyContent = [
    story.title || '',
    story.situation || '',
    story.action || '',
    story.outcome || '',
    story.advice || '',
  ].join(' ').toLowerCase();

  for (const keyword of phaseKeywords) {
    if (storyContent.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }

  return score;
}

export async function POST() {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getEffectiveUserId() || session.user.id;

    // Get user's Qdrant collection name
    const collectionName = await getUserCollectionName(userId);
    if (!collectionName) {
      return NextResponse.json(
        { error: 'No knowledge base found. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    // Get MongoDB collection
    const configCollection = await getClientConfigsCollection();
    const userConfig = await configCollection.findOne({ userId });

    if (!userConfig) {
      return NextResponse.json({ error: 'User config not found' }, { status: 404 });
    }

    const results = {
      storiesFound: 0,
      storiesAssigned: 0,
      assignments: [] as { flow: string; phase: string; story: string }[],
      flowsUpdated: [] as string[],
    };

    // Step 1: Fetch all stories from user's Qdrant collection
    let allStories: { id: string | number; payload: StoryPayload }[] = [];

    try {
      // Scroll through all points in the collection
      let offset: string | number | null | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const scrollResult = await qdrantClient.scroll(collectionName, {
          limit: 100,
          offset,
          with_payload: true,
          filter: {
            should: [
              { key: 'type', match: { value: 'story' } },
              { key: 'type', match: { value: 'agent-advice' } },
              // Also include items without a type field (legacy stories)
            ],
          },
        });

        if (scrollResult.points && scrollResult.points.length > 0) {
          const validStories = scrollResult.points
            .filter(p => {
              const payload = p.payload as StoryPayload;
              // Exclude sample stories by title
              if (payload.title && SAMPLE_STORY_TITLES.includes(payload.title)) {
                return false;
              }
              // Must have some content
              return payload.title || payload.situation || payload.advice;
            })
            .map(p => ({
              id: p.id,
              payload: p.payload as StoryPayload,
            }));

          allStories = allStories.concat(validStories);
          offset = scrollResult.next_page_offset as string | number | null | undefined;
          hasMore = !!offset;
        } else {
          hasMore = false;
        }
      }

      results.storiesFound = allStories.length;
      console.log(`[auto-assign-stories] Found ${allStories.length} stories in knowledge base`);

    } catch (qdrantErr) {
      console.error('[auto-assign-stories] Failed to fetch stories from Qdrant:', qdrantErr);
      return NextResponse.json(
        { error: 'Failed to fetch stories from knowledge base' },
        { status: 500 }
      );
    }

    if (allStories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories found in knowledge base to assign',
        ...results,
      });
    }

    // Step 2: Assign stories to phases for each flow (browse commented out for MVP)
    const flows: TimelineFlow[] = ['buy', 'sell'];

    for (const flow of flows) {
      // Get current phases for this flow (or defaults)
      let phases = userConfig.customPhases?.[flow] as CustomPhaseConfig[] | undefined;
      if (!phases || phases.length === 0) {
        phases = templateToCustomPhases(flow);
      }

      // Make a mutable copy
      const updatedPhases = JSON.parse(JSON.stringify(phases)) as CustomPhaseConfig[];

      // Filter stories that are relevant to this flow
      const flowStories = allStories.filter(s => {
        const storyFlows = s.payload.flows || [];
        // Include if explicitly marked for this flow, or if no flows specified (assign to all)
        return storyFlows.length === 0 || storyFlows.includes(flow);
      });

      // Track which stories have been assigned to avoid duplicates within a flow
      const assignedStoryIds = new Set<string | number>();

      // For each phase, find the best matching stories
      for (const phase of updatedPhases) {
        // Score all unassigned stories for this phase
        const scoredStories = flowStories
          .filter(s => !assignedStoryIds.has(s.id))
          .map(s => ({
            ...s,
            score: scoreStoryForPhase(s.payload, phase.id),
          }))
          .filter(s => s.score > 0) // Only consider stories with some relevance
          .sort((a, b) => b.score - a.score);

        // Assign top story to first action step without a linked story
        if (scoredStories.length > 0) {
          const bestStory = scoredStories[0];

          // Find an action step without a linked story
          const stepIndex = phase.actionableSteps.findIndex(step => !step.linkedStoryId);
          if (stepIndex !== -1) {
            phase.actionableSteps[stepIndex].linkedStoryId = String(bestStory.id);
            assignedStoryIds.add(bestStory.id);
            results.storiesAssigned++;
            results.assignments.push({
              flow,
              phase: phase.name,
              story: bestStory.payload.title || 'Untitled Story',
            });
          }
        }
      }

      // Save updated phases back to MongoDB if any assignments were made
      const flowAssignments = results.assignments.filter(a => a.flow === flow);
      if (flowAssignments.length > 0) {
        await configCollection.updateOne(
          { userId },
          {
            $set: {
              [`customPhases.${flow}`]: updatedPhases,
              updatedAt: new Date(),
            },
          }
        );
        results.flowsUpdated.push(flow);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${results.storiesFound} stories, assigned ${results.storiesAssigned} to phases`,
      ...results,
    });
  } catch (error) {
    console.error('[auto-assign-stories] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to auto-assign stories' },
      { status: 500 }
    );
  }
}
