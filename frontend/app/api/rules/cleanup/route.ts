// app/api/rules/cleanup/route.ts
// Clean up existing rules by removing/fixing placeholder values

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getRuleRecommendationsCollection } from '@/lib/mongodb/db';
import { isPlaceholderValue, isGenericValue } from '@/lib/rules/fieldValidation';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

/**
 * Recursively clean a rule group by removing rules with placeholder values
 */
function cleanRuleGroup(ruleGroup: any, userFields: any[]): any | null {
  if (!ruleGroup || !ruleGroup.rules) return null;

  const cleanedRules: any[] = [];

  for (const rule of ruleGroup.rules) {
    // Nested rule group
    if ('logic' in rule && rule.rules) {
      const cleanedNested = cleanRuleGroup(rule, userFields);
      if (cleanedNested && cleanedNested.rules.length > 0) {
        cleanedRules.push(cleanedNested);
      }
      continue;
    }

    // Condition rule
    const fieldId = typeof rule.field === 'string' 
      ? rule.field 
      : rule.field?.fieldId || rule.field?.concept || '';

    // Find matching user field
    const userField = userFields.find(f => 
      f.fieldId === fieldId || 
      f.concept?.concept === fieldId ||
      f.concept?.concept === rule.field?.concept
    );

    // Check if value is a placeholder
    const value = rule.value;
    const isArray = Array.isArray(value);
    const valuesToCheck = isArray ? value : [value];
    
    const hasPlaceholder = valuesToCheck.some(v => 
      isPlaceholderValue(String(v)) || isGenericValue(String(v))
    );

    // If it's a placeholder and we have valid values, try to replace it
    if (hasPlaceholder && userField && userField.values.length > 0) {
      // Skip this rule - it has placeholder values
      continue;
    }

    // If value is valid or field doesn't have predefined values, keep the rule
    if (!hasPlaceholder || !userField || userField.values.length === 0) {
      cleanedRules.push(rule);
    }
  }

  // If no rules left, return null
  if (cleanedRules.length === 0) {
    return null;
  }

  return {
    ...ruleGroup,
    rules: cleanedRules,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flow, removeInvalidOnly } = await request.json();

    // Get user's configuration
    const configCollection = await getClientConfigsCollection();
    const userConfig = await configCollection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.conversationFlows) {
      return NextResponse.json(
        { error: 'User configuration not found' },
        { status: 404 }
      );
    }

    // Get user fields
    const userFields = discoverFieldsFromFlows(userConfig.conversationFlows);

    // Get existing recommendations
    const recommendationsCollection = await getRuleRecommendationsCollection();
    const saved = await recommendationsCollection.findOne({
      userId: session.user.id,
      flow: flow || null,
    });

    if (!saved || !saved.recommendations || saved.recommendations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recommendations to clean',
        cleaned: 0,
        removed: 0,
      });
    }

    let cleaned = 0;
    let removed = 0;
    const cleanedRecommendations: any[] = [];

    for (const rec of saved.recommendations) {
      if (!rec.ruleGroup) {
        // Keep recommendations without rule groups
        cleanedRecommendations.push(rec);
        continue;
      }

      const cleanedRuleGroup = cleanRuleGroup(rec.ruleGroup, userFields);

      if (!cleanedRuleGroup || cleanedRuleGroup.rules.length === 0) {
        // Rule group became empty after cleaning
        removed++;
        if (!removeInvalidOnly) {
          // Optionally keep it with a note
          cleanedRecommendations.push({
            ...rec,
            ruleGroup: null,
            description: `${rec.description || ''} (Note: Rules removed due to placeholder values)`.trim(),
          });
        }
      } else {
        // Check if any rules were actually removed
        const originalRuleCount = countRules(rec.ruleGroup);
        const cleanedRuleCount = countRules(cleanedRuleGroup);
        
        if (originalRuleCount !== cleanedRuleCount) {
          cleaned++;
        }

        cleanedRecommendations.push({
          ...rec,
          ruleGroup: cleanedRuleGroup,
        });
      }
    }

    // Update in database
    await recommendationsCollection.updateOne(
      { userId: session.user.id, flow: flow || null },
      {
        $set: {
          recommendations: cleanedRecommendations,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned ${cleaned} recommendation(s), removed ${removed} invalid recommendation(s)`,
      cleaned,
      removed,
      total: cleanedRecommendations.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to clean rules',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Count total rules in a rule group (recursive)
 */
function countRules(ruleGroup: any): number {
  if (!ruleGroup || !ruleGroup.rules) return 0;
  
  let count = 0;
  for (const rule of ruleGroup.rules) {
    if ('logic' in rule && rule.rules) {
      count += countRules(rule);
    } else {
      count++;
    }
  }
  return count;
}

