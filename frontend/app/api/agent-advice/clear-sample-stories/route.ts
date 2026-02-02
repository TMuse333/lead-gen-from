// app/api/agent-advice/clear-sample-stories/route.ts
/**
 * Clear sample/generic stories and their links from phases
 * This removes the pre-populated test data so only real user stories are used
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getUserCollectionName } from '@/lib/userConfig/getUserCollection';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { CustomPhaseConfig, TimelineFlow } from '@/types/timelineBuilder.types';

// Sample story titles to identify and remove
const SAMPLE_STORY_TITLES = [
  'First-Time Buyer Success in Competitive Market',
  'Navigating Inspection Issues',
  'Relocating Family Finds Home Remotely',
  'Downsizing Empty Nesters',
  'Investment Property Win',
  'Closing Day Save',
];

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

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

    // Get MongoDB collection
    const configCollection = await getClientConfigsCollection();
    const userConfig = await configCollection.findOne({ userId });

    if (!userConfig) {
      return NextResponse.json({ error: 'User config not found' }, { status: 404 });
    }

    const results = {
      storiesDeleted: 0,
      linksCleared: 0,
      flowsUpdated: [] as string[],
    };

    // Step 1: Find and delete sample stories from Qdrant
    if (collectionName) {
      try {
        // Search for stories with sample titles
        for (const title of SAMPLE_STORY_TITLES) {
          try {
            // Scroll through collection to find stories with matching titles
            const scrollResult = await qdrantClient.scroll(collectionName, {
              filter: {
                must: [
                  {
                    key: 'title',
                    match: { value: title },
                  },
                ],
              },
              limit: 10,
              with_payload: true,
            });

            if (scrollResult.points && scrollResult.points.length > 0) {
              const pointIds = scrollResult.points.map(p => p.id);
              await qdrantClient.delete(collectionName, {
                points: pointIds as (string | number)[],
              });
              results.storiesDeleted += pointIds.length;
              console.log(`[clear-sample-stories] Deleted ${pointIds.length} points for "${title}"`);
            }
          } catch (searchErr) {
            console.warn(`[clear-sample-stories] Could not search/delete story "${title}":`, searchErr);
          }
        }
      } catch (qdrantErr) {
        console.warn('[clear-sample-stories] Qdrant operations failed:', qdrantErr);
        // Continue with clearing links even if Qdrant fails
      }
    }

    // Step 2: Clear linkedStoryId from all phases (browse commented out for MVP)
    const flows: TimelineFlow[] = ['buy', 'sell'];

    for (const flow of flows) {
      const phases = userConfig.customPhases?.[flow] as CustomPhaseConfig[] | undefined;
      if (!phases || phases.length === 0) continue;

      let flowModified = false;
      const updatedPhases = phases.map(phase => ({
        ...phase,
        actionableSteps: phase.actionableSteps.map(step => {
          if (step.linkedStoryId) {
            results.linksCleared++;
            flowModified = true;
            // Remove the linkedStoryId
            const { linkedStoryId, ...stepWithoutLink } = step;
            return stepWithoutLink;
          }
          return step;
        }),
      }));

      if (flowModified) {
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
      message: `Cleared ${results.storiesDeleted} sample stories and ${results.linksCleared} story links`,
      ...results,
    });
  } catch (error) {
    console.error('[clear-sample-stories] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear sample stories' },
      { status: 500 }
    );
  }
}
