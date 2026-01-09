// app/api/rules/attach/route.ts
// Attach recommended rules to a single advice item

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getRuleRecommendationsCollection, getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ruleId, adviceItemIds, ruleGroup } = await request.json();

    // Support both single and multiple advice items
    const adviceIds = Array.isArray(adviceItemIds) ? adviceItemIds : adviceItemIds ? [adviceItemIds] : [];

    if (!ruleId || adviceIds.length === 0) {
      return NextResponse.json(
        { error: 'ruleId and adviceItemIds array are required' },
        { status: 400 }
      );
    }

    // If ruleGroup is provided directly, use it (for SmartRuleGroup conversion)
    // Otherwise, fetch from MongoDB
    let ruleGroupToAttach: any = null;
    
    if (ruleGroup) {
      ruleGroupToAttach = ruleGroup;
    } else {
      // Fetch from MongoDB if not provided
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

      const ruleToAttach = savedRecommendations.recommendations.find((rec: any) =>
        rec.id === ruleId
      );

      if (!ruleToAttach || !ruleToAttach.ruleGroup) {
        return NextResponse.json(
          { error: 'Rule not found or has no ruleGroup' },
          { status: 404 }
        );
      }

      // Convert SmartRuleGroup to RuleGroup if needed
      const { smartRuleGroupToRuleGroup } = await import('@/lib/rules/ruleConverter');
      ruleGroupToAttach = smartRuleGroupToRuleGroup(ruleToAttach.ruleGroup);
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

    // Get all advice items from Qdrant
    const retrieveResult = await qdrant.retrieve(collectionName, {
      ids: adviceIds,
      with_payload: true,
      with_vector: false,
    });

    if (retrieveResult.length === 0) {
      return NextResponse.json(
        { error: 'No advice items found in Qdrant' },
        { status: 404 }
      );
    }

    // Update each advice item
    const results = [];
    for (const point of retrieveResult) {
      const payload = point.payload as any;
      const existingRuleGroups = payload.ruleGroups || [];

      // Check if this ruleGroup already exists (simple comparison)
      const exists = existingRuleGroups.some((existing: any) =>
        JSON.stringify(existing) === JSON.stringify(ruleGroupToAttach)
      );

      if (!exists) {
        const newRuleGroups = [...existingRuleGroups, ruleGroupToAttach];

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

        results.push({ id: point.id, success: true });
      } else {
        results.push({ id: point.id, success: false, reason: 'Rule already attached' });
      }
    }

    const successful = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Attached client situation to ${successful} of ${adviceIds.length} advice item(s)`,
      rulesAttached: successful,
      totalItems: adviceIds.length,
      results,
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

