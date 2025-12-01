// app/api/rules/recommend/route.ts
// Generate recommended rules based on user's flow

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection, getRuleRecommendationsCollection } from '@/lib/mongodb/db';
import OpenAI from 'openai';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { getAllConcepts } from '@/lib/rules/concepts';
import type { RuleRecommendation } from '@/lib/rules/ruleTypes';
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { RulesGenerationUsage } from '@/types/tokenUsage.types';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limits
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit('rulesGeneration', session.user.id, ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${rateLimit.resetAt.toISOString()}`,
          resetAt: rateLimit.resetAt,
          remaining: rateLimit.remaining,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const { flow, forceRegenerate } = await request.json();

    // Get user's configuration
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.conversationFlows) {
      return NextResponse.json(
        { error: 'User configuration not found' },
        { status: 404 }
      );
    }

    // Discover fields from user's flows
    const userFields = discoverFieldsFromFlows(userConfig.conversationFlows);
    const concepts = getAllConcepts();

    // Filter fields by flow if specified
    const relevantFields = flow
      ? userFields.filter(f => f.flow === flow)
      : userFields;

    if (relevantFields.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No fields found in the specified flow',
      });
    }

    // Check for existing saved recommendations (unless forceRegenerate is true)
    if (!forceRegenerate) {
      const recommendationsCollection = await getRuleRecommendationsCollection();
      const existing = await recommendationsCollection.findOne({
        userId: session.user.id,
        flow: flow || null,
      });

      if (existing && existing.recommendations.length > 0) {
        console.log('✅ Returning existing saved recommendations');
        return NextResponse.json({
          success: true,
          recommendations: existing.recommendations,
          fields: fieldsContext,
          saved: true,
          generatedAt: existing.generatedAt,
        });
      }
    }

    // Build prompt for LLM
    const fieldsContext = relevantFields.map(f => ({
      fieldId: f.fieldId,
      label: f.label,
      concept: f.concept?.concept,
      values: f.values,
      type: f.type,
    }));

    const conceptsContext = concepts.map(c => ({
      concept: c.concept,
      label: c.label,
      description: c.description,
      commonValues: c.commonValues,
    }));

    const prompt = `You are a real estate rule recommendation system. Based on the user's conversation flow, suggest useful rules for targeting advice.

USER'S FLOW FIELDS:
${JSON.stringify(fieldsContext, null, 2)}

AVAILABLE CONCEPTS:
${JSON.stringify(conceptsContext, null, 2)}

TASK:
Generate 3-5 rule recommendations that would be useful for targeting advice based on these fields.

For each recommendation, provide:
1. A descriptive title
2. A description of when this rule would be useful
3. A RuleGroup structure with the EXACT format shown below
4. Reasoning for why this rule is recommended
5. Confidence score (0-1)

CRITICAL - Field Structure:
Each rule's field MUST be an object with BOTH concept and fieldId:
{
  "field": {
    "concept": "property-type",  // The concept name
    "fieldId": "propertyType"     // The actual fieldId from user's flow
  },
  "operator": "equals",
  "value": "house"
}

DO NOT use field as a string. It MUST be an object.

Return as a JSON object with a "recommendations" key containing an array:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Urgent Timeline Rule",
      "description": "Targets users with urgent timelines",
      "ruleGroup": {
        "logic": "AND",
        "rules": [...]
      },
      "reasoning": "This rule helps target time-sensitive advice...",
      "confidence": 0.9
    }
  ]
}

CRITICAL - Value Requirements:
- ONLY use values from the "values" array provided for each field
- NEVER use placeholder values like "button-1", "button-2", "btn-*", "option-*", etc.
- NEVER use generic single-letter values like "re", "a", "b", etc.
- If a field has an empty values array, it's a text field - use realistic example values based on the field's purpose
- If you see placeholder values in the values array, skip that field or use concept-based values instead

Focus on:
- Common real estate scenarios (urgent timelines, first-time buyers, specific property types)
- Combinations that make sense (e.g., urgent + relocating)
- Rules that would actually be useful for advice targeting

Return ONLY valid JSON, no other text.`;

    const llmStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a rule recommendation system. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    const llmEndTime = Date.now();

    const content = response.choices[0].message.content || '{}';
    
    // Track usage
    const baseTracking = createBaseTrackingObject({
      userId: session.user.id,
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiType: 'chat',
      startTime: llmStartTime,
    });

    let usage: RulesGenerationUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        finishReason: response.choices[0].finish_reason || undefined,
        contentLength: content.length,
        endTime: llmEndTime,
      }),
      feature: 'rulesGeneration',
      apiType: 'chat',
      model: 'gpt-4o-mini',
      featureData: {
        flow: flow || undefined,
        userFieldsCount: relevantFields.length,
        conceptsCount: concepts.length,
        recommendationsGenerated: 0, // Will be updated after parsing
        savedToMongoDB: false, // Will be updated after saving
        forceRegenerate: forceRegenerate || false,
      },
    };
    
    let parsed: any;
    
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse LLM response:', content);
      return NextResponse.json(
        { error: 'Invalid response from LLM' },
        { status: 500 }
      );
    }
    
    // Handle both array and object with recommendations key
    let recommendations: RuleRecommendation[] = [];
    
    if (Array.isArray(parsed)) {
      recommendations = parsed;
    } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      recommendations = parsed.recommendations;
    } else if (parsed.recommendation) {
      recommendations = [parsed.recommendation];
    }
    
    // Helper to fix field structure in rules
    const fixRuleField = (rule: any, userFields: typeof relevantFields): any => {
      if (!rule || typeof rule !== 'object') return rule;
      
      // If it's a nested rule group
      if ('logic' in rule && rule.rules) {
        return {
          ...rule,
          rules: rule.rules.map((r: any) => fixRuleField(r, userFields)),
        };
      }
      
      // If it's a condition rule
      if (rule.field) {
        let fixedField: any = {};
        
        // If field is a string, convert to object
        if (typeof rule.field === 'string') {
          const matchingField = userFields.find(f => f.fieldId === rule.field);
          fixedField = {
            fieldId: rule.field,
            concept: matchingField?.concept?.concept,
            label: matchingField?.label,
          };
        } else if (typeof rule.field === 'object') {
          // Field is already an object, but ensure it has fieldId
          fixedField = {
            fieldId: rule.field.fieldId || rule.field.concept || 'unknown',
            concept: rule.field.concept,
            label: rule.field.label,
          };
          
          // If no fieldId but we have concept, try to find matching field
          if (!fixedField.fieldId && fixedField.concept) {
            const matchingField = userFields.find(f => f.concept?.concept === fixedField.concept);
            if (matchingField) {
              fixedField.fieldId = matchingField.fieldId;
              fixedField.label = matchingField.label;
            }
          }
          
          // If no concept but we have fieldId, try to find concept
          if (!fixedField.concept && fixedField.fieldId) {
            const matchingField = userFields.find(f => f.fieldId === fixedField.fieldId);
            if (matchingField?.concept) {
              fixedField.concept = matchingField.concept.concept;
              fixedField.label = matchingField.label;
            }
          }
        }
        
        return {
          ...rule,
          field: fixedField,
        };
      }
      
      return rule;
    };
    
    // Validate and clean recommendations
    recommendations = recommendations
      .filter((rec: any) => rec && rec.ruleGroup && rec.title)
      .map((rec: any) => {
        // Fix field structures in ruleGroup
        const fixedRuleGroup = fixRuleField(rec.ruleGroup, relevantFields);
        
        return {
          id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: rec.title || 'Untitled Rule',
          description: rec.description || '',
          ruleGroup: fixedRuleGroup,
          reasoning: rec.reasoning || 'No reasoning provided',
          confidence: typeof rec.confidence === 'number' ? rec.confidence : 0.5,
        };
      });

    // Save recommendations to MongoDB
    const recommendationsCollection = await getRuleRecommendationsCollection();
    const now = new Date();
    
    const recommendationsToSave = recommendations.map(rec => ({
      ...rec,
      isManual: false,
      createdAt: now,
    }));

    // Upsert: update if exists, create if not
    await recommendationsCollection.updateOne(
      {
        userId: session.user.id,
        flow: flow || null,
      },
      {
        $set: {
          userId: session.user.id,
          flow: flow || null,
          recommendations: recommendationsToSave,
          generatedAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    console.log(`✅ Saved ${recommendations.length} recommendations to MongoDB`);

    // Update usage tracking with final counts
    usage.featureData.recommendationsGenerated = recommendations.length;
    usage.featureData.savedToMongoDB = true;
    trackUsageAsync(usage);

    return NextResponse.json({
      success: true,
      recommendations,
      fields: fieldsContext,
      saved: true,
      generatedAt: now,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

