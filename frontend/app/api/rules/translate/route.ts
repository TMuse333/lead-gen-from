// app/api/rules/translate/route.ts
// Translate natural language to structured rules

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import OpenAI from 'openai';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { getAllConcepts } from '@/lib/rules/concepts';
import type { SmartRuleGroup } from '@/lib/rules/ruleTypes';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { naturalLanguage, flow } = await request.json();

    if (!naturalLanguage || typeof naturalLanguage !== 'string') {
      return NextResponse.json(
        { error: 'naturalLanguage is required' },
        { status: 400 }
      );
    }

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

    // Build prompt for LLM
    const fieldsContext = userFields.map(f => ({
      fieldId: f.fieldId,
      label: f.label,
      concept: f.concept?.concept,
      values: f.values,
      type: f.type,
    }));

    const conceptsContext = concepts.map(c => ({
      concept: c.concept,
      label: c.label,
      aliases: c.aliases,
      commonValues: c.commonValues,
    }));

    const prompt = `You are a rule translator. Convert natural language conditions into structured rules.

AVAILABLE CONCEPTS:
${JSON.stringify(conceptsContext, null, 2)}

USER'S ACTUAL FIELDS:
${JSON.stringify(fieldsContext, null, 2)}

USER INPUT: "${naturalLanguage}"

TASK:
1. Identify which concept(s) the user is referring to
2. Find the matching field(s) from the user's actual fields
3. Convert to a RuleGroup structure with:
   - logic: 'AND' | 'OR'
   - rules: Array of ConditionRule objects
   - Each ConditionRule should have:
     - field: { concept: string, fieldId: string }
     - operator: 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between'
     - value: string | string[]

IMPORTANT:
- Use concept-based field references when possible
- Map to user's actual fieldId values
- Use user's actual button values when available
- Return ONLY valid JSON matching this structure:
{
  "logic": "AND",
  "rules": [
    {
      "field": {
        "concept": "property-type",
        "fieldId": "propertyType"
      },
      "operator": "equals",
      "value": "house"
    }
  ]
}

Return ONLY the JSON, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a rule translator. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const ruleGroup = JSON.parse(response.choices[0].message.content || '{}') as SmartRuleGroup;

    // Validate the structure
    if (!ruleGroup.logic || !ruleGroup.rules) {
      return NextResponse.json(
        { error: 'Invalid rule structure returned from LLM' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ruleGroup,
      fields: fieldsContext,
    });
  } catch (error) {
    console.error('Error translating rules:', error);
    return NextResponse.json(
      {
        error: 'Failed to translate rules',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

