// app/api/generate-voice-script/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createVoiceScriptPrompt } from '@/lib/openai/createVoiceScriptPrompt';
import { Flow } from '@/types/recording.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface RequestBody {
  flows: Flow[];
  customPrompt?: string;
  agentName?: string;
  yearsExperience?: number;
  specialty?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      flows = [],
      customPrompt = '',
      agentName = 'the agent',
      yearsExperience = 10,
      specialty = 'residential real estate',
    } = body as RequestBody;

    // Basic validation
    if (!Array.isArray(flows)) {
      return NextResponse.json(
        { error: "'flows' must be an array of strings" },
        { status: 400 }
      );
    }

    const validFlows = flows.filter((f): f is Flow =>
      ['sell', 'buy', 'browse'].includes(f)
    );

    const prompt = createVoiceScriptPrompt({
      agentId: 'placeholder', // you can use real agent ID later
      flows: validFlows,
      customPrompt,
      agentName,
      yearsExperience,
      specialty,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // cheap & fast — or use gpt-4o for even better
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';

    if (!raw) {
      return NextResponse.json(
        { error: 'Empty response from OpenAI' },
        { status: 500 }
      );
    }

    let questions: string[];
    try {
      questions = JSON.parse(raw);
      if (!Array.isArray(questions) || questions.some(q => typeof q !== 'string')) {
        throw new Error('Not a valid string array');
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid response format from AI', raw },
        { status: 500 }
      );
    }

    // Final sanity filter
    const cleanedQuestions = questions
      .map(q => q.trim())
      .filter(q => q && q.endsWith('?') && q.length > 15 && q.length < 300);

    return NextResponse.json({
      questions: cleanedQuestions,
      _debug: {
        model: 'gpt-4o-mini',
        rawResponse: raw,
        promptLength: prompt.length,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}