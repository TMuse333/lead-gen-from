// app/api/rules/bulk-attach/route.ts
// Bulk attach recommended rules to advice items in Qdrant

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getRuleRecommendationsCollection, getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';
import { getUserCollectionName } from '@/lib/userConfig/getUserCollection';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ruleIds, adviceItemIds } = await request.json();

    if (!ruleIds || !Array.isArray(ruleIds) || ruleIds.length === 0) {
      return NextResponse.json(
        { error: 'ruleIds array is required' },
        { status: 400 }
      );
    }

    if (!adviceItemIds || !Array.isArray(adviceItemIds) || adviceItemIds.length === 0) {
      return NextResponse.json(
        { error: 'adviceItemIds array is required' },
        { status: 400 }
      );
    }

    // Get user's Qdrant collection name
    const clientConfigsCollection = await getClientConfigsCollection();
    const userConfig = await clientConfigsCollection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'User configuration not found or Qdrant collection not set up' },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;

    // Fetch all recommended rules from MongoDB
    const recommendationsCollection = await getRuleRecommendationsCollection();
    const savedRecommendations = await recommendationsCollection.findOne({
      userId: session.user.id,
    });

    if (!savedRecommendations || !savedRecommendations.recommendations) {
      return NextResponse.json(
        { error: 'No recommendations found' },
        { status: 404 }
      );
    }

    // Filter to only the requested rule IDs
    const rulesToAttach = savedRecommendations.recommendations.filter((rec: any) =>
      ruleIds.includes(rec.id)
    );

    if (rulesToAttach.length === 0) {
      return NextResponse.json(
        { error: 'No matching rules found' },
        { status: 404 }
      );
    }

    // Extract ruleGroups from the rules
    const ruleGroupsToAdd = rulesToAttach.map((rec: any) => rec.ruleGroup);

    // Fetch all advice items from Qdrant
    const scrollResult = await qdrant.scroll(collectionName, {
      limit: 1000,
      with_payload: true,
      with_vector: false,
    });

    // Filter to only the requested advice item IDs
    const adviceItemsToUpdate = scrollResult.points.filter((point) =>
      adviceItemIds.includes(point.id as string)
    );

    if (adviceItemsToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'No matching advice items found in Qdrant' },
        { status: 404 }
      );
    }

    // Update each advice item with the ruleGroups
    const updatePromises = adviceItemsToUpdate.map(async (point) => {
      const payload = point.payload as any;
      const existingRuleGroups = payload.ruleGroups || [];

      // Merge new ruleGroups with existing ones (avoid duplicates)
      const newRuleGroups = [...existingRuleGroups];
      ruleGroupsToAdd.forEach((newRuleGroup) => {
        // Check if this ruleGroup already exists (simple comparison)
        const exists = newRuleGroups.some((existing: any) =>
          JSON.stringify(existing) === JSON.stringify(newRuleGroup)
        );
        if (!exists) {
          newRuleGroups.push(newRuleGroup);
        }
      });

      // Update the payload
      const updatedPayload = {
        ...payload,
        ruleGroups: newRuleGroups,
        updatedAt: new Date().toISOString(),
      };

      // Update in Qdrant
      await qdrant.setPayload(collectionName, {
        payload: updatedPayload,
        points: [point.id],
      });

      return {
        adviceId: point.id,
        title: payload.title,
        rulesAdded: ruleGroupsToAdd.length,
        totalRules: newRuleGroups.length,
      };
    });

    const results = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Attached ${rulesToAttach.length} rule(s) to ${results.length} advice item(s)`,
      results,
      summary: {
        rulesAttached: rulesToAttach.length,
        adviceItemsUpdated: results.length,
        ruleTitles: rulesToAttach.map((r: any) => r.title),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to attach rules',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

