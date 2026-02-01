// ============================================
// API ROUTE: /api/stories/parse
// Uses LLM to parse raw story text into structured format (situation, action, outcome)
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

interface ParsedStory {
  title: string;
  situation: string;
  action: string;
  outcome: string;
  suggestedTags: string[];
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rawText } = body;

    if (!rawText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Story text is required' },
        { status: 400 }
      );
    }

    // 2. Build prompt for LLM
    const prompt = `You are an expert at analyzing real estate agent success stories. Parse the following story into a structured format.

RAW STORY TEXT:
"""
${rawText.trim()}
"""

TASK:
Extract the story into three parts following the SAO (Situation-Action-Outcome) framework:

1. **Situation**: What was the client's problem, challenge, or starting point? (The "before" state)
2. **Action**: What specific steps did the agent take to help? (What the agent did)
3. **Outcome**: What was the result? (The "after" state, ideally with specific numbers/details)

Also suggest:
- A concise, compelling title for this story
- 2-4 relevant tags from this list or suggest new ones: first-time-buyer, seller, competitive-market, negotiation, financing, relocation, investment, luxury, quick-close, multiple-offers, downsizing, upsizing

Return ONLY valid JSON in this exact format:
{
  "title": "A compelling title for the story",
  "situation": "The client's initial situation/challenge...",
  "action": "What the agent did to help...",
  "outcome": "The positive result achieved...",
  "suggestedTags": ["tag1", "tag2"]
}

Guidelines:
- Keep each section 1-3 sentences, concise but complete
- If the story is vague about a section, make reasonable inferences
- Focus on making it relatable and trust-building
- Use active voice and specific details where available`;

    // 3. Call LLM
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a story parsing assistant. Always return valid JSON only, no markdown or other formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';

    // 4. Parse and validate response
    let parsed: ParsedStory;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!parsed.situation || !parsed.action || !parsed.outcome) {
      return NextResponse.json(
        { success: false, error: 'AI could not extract all story parts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      parsed: {
        title: parsed.title || 'Untitled Story',
        situation: parsed.situation,
        action: parsed.action,
        outcome: parsed.outcome,
        suggestedTags: parsed.suggestedTags || [],
      },
    });
  } catch (error) {
    console.error('[stories/parse] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
