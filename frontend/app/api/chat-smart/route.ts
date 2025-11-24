// app/api/chat-smart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { normalizeToRealEstateSchemaPrompt } from '@/lib/openai/normalizers/normalizeToRealEstateSchema';
import { classifyIntentPrompt } from '@/lib/openai/classifiers/classifyIntent';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ChatRequest {
  buttonId?: string;
  buttonValue?: string;
  buttonLabel?: string;
  freeText?: string;
  currentFlow: string;
  currentNodeId: string;
  userInput: Record<string, string>;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  flowConfig?: any;
  questionConfig?: any;
}

// ————————————————————————
// Shared JSON LLM helper (safe + consistent)
// ————————————————————————
async function callJsonLlm<T = any>(prompt: string, model = 'gpt-4o-mini'): Promise<T> {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    response_format: { type: 'json_object' },
    max_tokens: 500,
  });

  const content = completion.choices[0].message.content?.trim();
  if (!content) throw new Error('Empty response from LLM');

  try {
    return JSON.parse(content) as T;
  } catch (parseError) {
    console.error('Failed to parse LLM JSON:', content);
    throw parseError;
  }
}

// ————————————————————————
// Intent classification (replaces old classifyUserIntent)
// ————————————————————————
interface IntentAnalysis {
  primary:
    | 'direct_answer'
    | 'clarification_question'
    | 'objection'
    | 'chitchat'
    | 'escalation_request'
    | 'off_topic'
    | 'attempted_answer_but_unclear';
  clarification?:
    | 'needs_definition'
    | 'needs_examples'
    | 'scope_concern'
    | 'privacy_concern'
    | 'not_sure_how_to_answer'
    | 'too_many_options';
  objection?:
    | 'privacy_refusal'
    | 'trust_issue'
    | 'time_constraint'
    | 'price_sensitivity'
    | 'not_ready';
  confidence?: number;
  partialAnswer?: string;
  suggestedTone?: 'empathetic' | 'firm' | 'playful' | 'educational';
}

async function analyzeUserIntent(params: {
  userMessage: string;
  currentQuestion: string;
  flowName: string;
  previousContext?: string;
}): Promise<IntentAnalysis> {
  const prompt = classifyIntentPrompt({
    userMessage: params.userMessage,
    currentQuestion: params.currentQuestion,
    flowName: params.flowName,
    previousContext: params.previousContext,
  });

  try {
    const result = await callJsonLlm<IntentAnalysis>(prompt);
    return {
      primary: result.primary || 'clarification_question',
      clarification: result.clarification,
      objection: result.objection,
      confidence: result.confidence ?? 0.9,
      partialAnswer: result.partialAnswer,
      suggestedTone: result.suggestedTone,
    };
  } catch (error) {
    console.error('Intent analysis failed:', error);
    return { primary: 'clarification_question', confidence: 0.5 };
  }
}

// ————————————————————————
// Main POST handler
// ————————————————————————
export async function POST(req: NextRequest) {
  console.log('API Route: /api/chat-smart called');

  try {
    const body: ChatRequest = await req.json();
    const {
      buttonId,
      buttonValue,
      freeText,
      currentFlow,
      currentNodeId,
      userInput,
      flowConfig,
      questionConfig,
      messages,
    } = body;

    const flow = flowConfig;
    const currentQuestion = questionConfig;

    if (!flow || !currentQuestion || !currentQuestion.mappingKey) {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }

    const currentIndex = flow.questions.findIndex((q: any) => q.id === currentNodeId);
    const nextQuestion = flow.questions[currentIndex + 1];
    const isLastQuestion = !nextQuestion;
    const progress = Math.round(((currentIndex + 1) / flow.questions.length) * 100);

    const isButtonClick = !!buttonId && !!buttonValue;
    const isFreeText = !!freeText && !isButtonClick;

    let answerValue: string;

    // ——————————————————
    // 1. Button Click → Fast path
    // ——————————————————
    if (isButtonClick) {
      answerValue = buttonValue!;
      console.log('Button click → answer:', answerValue);
    }
    // ——————————————————
    // 2. Free Text → Classify intent
    // ——————————————————
    else if (isFreeText) {
      const previousContext = messages
        ?.slice(-3)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const intent = await analyzeUserIntent({
        userMessage: freeText!,
        currentQuestion: currentQuestion.question,
        flowName: flow.name,
        previousContext,
      });

      if (intent.primary !== 'direct_answer') {
        const helpPrompt = `User said: "${freeText}"
They were asked: "${currentQuestion.question}"
But they gave a ${intent.primary} response.

Rephrase the question warmly and clearly.
Tone: ${intent.suggestedTone || 'empathetic'}
Keep it short and kind.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: helpPrompt }],
          temperature: 0.8,
          max_tokens: 180,
        });

        const reply = completion.choices[0].message.content?.trim() || `Got it! Just to clarify: ${currentQuestion.question}`;

        return NextResponse.json({
          reply,
          nextQuestion: { ...currentQuestion },
          progress,
          isComplete: false,
        });
      }

      answerValue = intent.partialAnswer || freeText!;
    } else {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // ——————————————————
    // 3. Extract & save answer
    // ——————————————————
    const extracted = {
      mappingKey: currentQuestion.mappingKey,
      value: answerValue,
    };

    // ——————————————————
    // 4. Background: Normalize full profile
    // ——————————————————
    (async () => {
      try {
        const prompt = normalizeToRealEstateSchemaPrompt(userInput, currentFlow as any);
        const normalized = await callJsonLlm(prompt);

        console.log('Profile normalized:', normalized);
        // TODO: Save to DB, Redis, or emit via WebSocket
      } catch (error) {
        console.error('Background normalization failed:', error);
      }
    })();

    // ——————————————————
    // 5. Generate warm reply
    // ——————————————————
    const systemPrompt = `You are Chris's friendly AI assistant for ${flow.name}.

User just answered: "${answerValue}"
They were asked: "${currentQuestion.question}"
${nextQuestion ? `Next question will be: "${nextQuestion.question}"` : 'This was the final question.'}

Reply in 2–3 warm, natural sentences:
- Acknowledge their answer positively
- Add brief context or excitement
${nextQuestion ? `- Smoothly transition to the next question` : `- Celebrate completion and build excitement`}

Be kind, human, and engaging.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answerValue },
      ],
      temperature: 0.75,
      max_tokens: 160,
    });

    const reply = completion.choices[0].message.content?.trim() || 'Thanks!';

    return NextResponse.json({
      reply,
      extracted,
      nextQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            question: nextQuestion.question,
            buttons: nextQuestion.buttons || [],
            allowFreeText: nextQuestion.allowFreeText,
            mappingKey: nextQuestion.mappingKey,
          }
        : null,
      progress,
      isComplete: isLastQuestion,
    });
  } catch (error: any) {
    console.error('chat-smart error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}