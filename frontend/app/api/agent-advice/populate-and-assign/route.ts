// app/api/agent-advice/populate-and-assign/route.ts
/**
 * Auto-populate sample stories AND assign them to corresponding phases
 * This is a dev convenience endpoint that:
 * 1. Creates sample stories in Qdrant
 * 2. Links them to action steps in the appropriate phases
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getUserCollectionName } from '@/lib/userConfig/getUserCollection';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { storeUserStory } from '@/lib/qdrant/collections/vector/advice/upsertUser';
import { getFlowTemplate } from '@/lib/offers/definitions/timeline/timeline-templates';
import OpenAI from 'openai';
import type { CustomPhaseConfig, CustomActionableStep, TimelineFlow } from '@/types/timelineBuilder.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample stories with placements - these define which phases they should be assigned to
const SAMPLE_STORIES = [
  {
    title: 'First-Time Buyer Success in Competitive Market',
    situation: 'A young couple was looking to buy their first home in a hot seller\'s market. They had been outbid on 3 properties already and were feeling discouraged. Their budget was $450K and they needed to close within 60 days due to their lease ending.',
    action: 'I helped them get fully underwritten pre-approval (not just pre-qualified) which made their offer stronger. We also wrote a personal letter to the sellers and offered a rent-back option in case they needed extra time. I advised them to waive the appraisal gap up to $15K since they had extra savings.',
    outcome: 'They won the fourth house they bid on, even though their offer was $10K lower than another offer. The sellers loved the personal letter and the flexibility. They closed in 45 days and are now happily settled in their new home.',
    tags: ['first-time-buyer', 'competitive-market', 'negotiation', 'pre-approval'],
    flows: ['buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['financial-prep', 'make-offer'],
    },
  },
  {
    title: 'Navigating Inspection Issues',
    situation: 'After going under contract on a 1980s home, the inspection revealed significant foundation issues and an outdated electrical panel. The buyers were panicking and ready to walk away from their dream home.',
    action: 'I brought in a structural engineer to get a professional assessment and actual repair costs (turned out to be $8K, not the $25K the inspector estimated). For the electrical, I got 3 contractor quotes. We then negotiated a $12K credit from the seller instead of asking them to do repairs.',
    outcome: 'The buyers got the home at effectively $12K less than their offer price. They used our recommended contractors and the repairs were done properly. The foundation fix actually came with a transferable warranty, adding value for future resale.',
    tags: ['inspection', 'negotiation', 'repairs', 'due-diligence'],
    flows: ['buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['under-contract'],
    },
  },
  {
    title: 'Relocating Family Finds Home Remotely',
    situation: 'A family was relocating from California to Austin for a job. They had 3 weeks to find a home, couldn\'t visit in person until the final weekend, and had two kids who needed to be in a good school district.',
    action: 'I created detailed video walkthroughs of 12 properties, including driving the neighborhoods at different times. I researched school ratings and commute times for each. We narrowed it down to 3 homes via Zoom tours, then they flew in to see them in person.',
    outcome: 'They made an offer on their top choice that same weekend and closed 30 days later. The kids started school on time in one of the top-rated districts. They\'ve since referred me to two other relocating families.',
    tags: ['relocation', 'remote-buying', 'schools', 'video-tours'],
    flows: ['buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['find-agent', 'house-hunting'],
    },
  },
  {
    title: 'Downsizing Empty Nesters',
    situation: 'A retired couple wanted to sell their 4-bedroom family home of 25 years and downsize to a low-maintenance condo. They were emotionally attached to the home and overwhelmed by decades of belongings.',
    action: 'I connected them with a senior move manager who helped sort and donate items over 6 weeks. We staged the home with a mix of their furniture and rental pieces. I also coordinated the timing so they could close on their condo the same day they sold.',
    outcome: 'Their home sold for $35K over asking with multiple offers. The synchronized closing meant they only had to move once. They now have a beautiful condo with a view and much lower maintenance costs.',
    tags: ['downsizing', 'empty-nester', 'staging', 'selling'],
    flows: ['sell', 'buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['financial-prep', 'closing'],
    },
  },
  {
    title: 'Investment Property Win',
    situation: 'An investor client wanted to buy a duplex as their first rental property. They were nervous about tenant laws, financing, and whether the numbers would actually work. They had $100K to invest.',
    action: 'I ran detailed cash flow analysis on 8 properties using actual rent comps and expense estimates. I connected them with a lender who specialized in investment properties and a property manager for quotes. We found a duplex where one unit would cover 80% of the mortgage.',
    outcome: 'They closed on a duplex that cash flows $400/month after all expenses. Both units were already rented with good tenants. One year later, they\'ve used the equity to buy a second property.',
    tags: ['investment', 'duplex', 'cash-flow', 'rental'],
    flows: ['buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['financial-prep', 'house-hunting'],
    },
  },
  {
    title: 'Closing Day Save',
    situation: 'Three days before closing, the lender discovered a previously missed judgment on the buyer\'s credit report. The title company was ready to cancel the closing, and the seller was threatening to keep the earnest money.',
    action: 'I immediately got on calls with the lender, title company, and the judgment holder. Turns out it was a medical bill that had been paid but not properly recorded. I got a same-day letter of satisfaction and hand-delivered it to the title company.',
    outcome: 'We closed just one day late. The seller agreed to the extension once they understood the situation. The buyers got their keys and we celebrated with champagne at their new home.',
    tags: ['closing', 'problem-solving', 'title', 'credit'],
    flows: ['buy'] as TimelineFlow[],
    placements: {
      'real-estate-timeline': ['closing'],
    },
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Convert template phases to CustomPhaseConfig format (same as custom-phases route)
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

export async function POST() {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's collection name
    const collectionName = await getUserCollectionName(session.user.id);
    if (!collectionName) {
      return NextResponse.json(
        { error: 'No knowledge base collection found. Complete onboarding first.' },
        { status: 400 }
      );
    }

    // Get MongoDB collection for updating phases
    const configCollection = await getClientConfigsCollection();
    const userConfig = await configCollection.findOne({ userId: session.user.id });
    if (!userConfig) {
      return NextResponse.json({ error: 'User config not found' }, { status: 404 });
    }

    // Track created stories with their IDs and placements
    const createdStories: { id: string; title: string; placements: Record<string, string[]>; flows: TimelineFlow[] }[] = [];

    // Step 1: Create all stories in Qdrant
    for (const story of SAMPLE_STORIES) {
      try {
        const embeddingText = `${story.title}. Situation: ${story.situation}. Action: ${story.action}. Outcome: ${story.outcome}`;
        const embedding = await generateEmbedding(embeddingText);

        const storyId = await storeUserStory({
          collectionName,
          title: story.title,
          situation: story.situation,
          action: story.action,
          outcome: story.outcome,
          embedding,
          metadata: {
            tags: story.tags,
            flows: story.flows,
            placements: story.placements,
          },
        });

        createdStories.push({
          id: storyId,
          title: story.title,
          placements: story.placements,
          flows: story.flows,
        });
      } catch (err) {
        console.error(`Failed to create story: ${story.title}`, err);
      }
    }

    // Step 2: Assign stories to phases
    const flowsToUpdate = new Set<TimelineFlow>();
    createdStories.forEach(story => {
      story.flows.forEach(flow => flowsToUpdate.add(flow));
    });

    const assignmentResults: { flow: string; phase: string; story: string }[] = [];

    for (const flow of flowsToUpdate) {
      // Get current phases for this flow (or defaults)
      let phases = userConfig.customPhases?.[flow];
      if (!phases || phases.length === 0) {
        phases = templateToCustomPhases(flow);
      }

      // Make a mutable copy
      const updatedPhases = JSON.parse(JSON.stringify(phases)) as CustomPhaseConfig[];

      // For each story that should be assigned to this flow
      for (const story of createdStories) {
        if (!story.flows.includes(flow)) continue;

        const timelinePlacements = story.placements['real-estate-timeline'] || [];

        for (const phaseId of timelinePlacements) {
          // Find the phase
          const phaseIndex = updatedPhases.findIndex(p => p.id === phaseId);
          if (phaseIndex === -1) continue;

          const phase = updatedPhases[phaseIndex];

          // Find an action step that doesn't already have a linked story
          const stepIndex = phase.actionableSteps.findIndex(step => !step.linkedStoryId);
          if (stepIndex === -1) {
            // All steps have stories, add to the first step
            if (phase.actionableSteps.length > 0 && !phase.actionableSteps[0].linkedStoryId) {
              phase.actionableSteps[0].linkedStoryId = story.id;
              assignmentResults.push({ flow, phase: phase.name, story: story.title });
            }
          } else {
            phase.actionableSteps[stepIndex].linkedStoryId = story.id;
            assignmentResults.push({ flow, phase: phase.name, story: story.title });
          }
        }
      }

      // Save updated phases back to MongoDB
      await configCollection.updateOne(
        { userId: session.user.id },
        {
          $set: {
            [`customPhases.${flow}`]: updatedPhases,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdStories.length} stories and made ${assignmentResults.length} assignments`,
      storiesCreated: createdStories.length,
      assignments: assignmentResults,
    });
  } catch (error) {
    console.error('Error in populate-and-assign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to populate and assign stories' },
      { status: 500 }
    );
  }
}
