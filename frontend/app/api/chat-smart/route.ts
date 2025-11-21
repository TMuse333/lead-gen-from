// app/api/chat-smart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { classifyUserIntent } from '@/lib/openai/classifiers/classifyIntent';
import type { IntentAnalysis } from '@/lib/openai/classifiers/classifyIntent';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    } = body;

    const flow = flowConfig;
    const currentQuestion = questionConfig;

    if (!flow || !currentQuestion) {
      return NextResponse.json({ error: 'Flow/question config required' }, { status: 400 });
    }

    const currentIndex = flow.questions.findIndex((q: any) => q.id === currentNodeId);
    const nextQuestion = flow.questions[currentIndex + 1];
    const isLastQuestion = !nextQuestion;
    const progress = Math.round(((currentIndex + 1) / flow.questions.length) * 100);

    const isButtonClick = !!buttonId && !!buttonValue;
    const isFreeText = !!freeText && !isButtonClick;

    let answerValue: string | null = null;
    let intent: IntentAnalysis | null = null;

    // ————————————————————————
    // 1. BUTTON CLICK → Always advance
    // ————————————————————————
    if (isButtonClick) {
      answerValue = buttonValue!;
      console.log('User clicked button → treating as answer:', answerValue);
    }

    // ————————————————————————
    // 2. FREE TEXT → Classify intent first
    // ————————————————————————
    else if (isFreeText) {
      const previousContext = body.messages
        ?.slice(-3)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      intent = await classifyUserIntent({
        userMessage: freeText!,
        currentQuestion: currentQuestion.question,
        flowName: flow.name,
        previousContext,
      });

      // THIS IS YOUR DEBUG SUPERPOWER
      if (intent.primary === 'direct_answer') {
        console.log('LLM CLASSIFIER → DIRECT ANSWER (advancing)');
        console.log('   Extracted partialAnswer:', intent.partialAnswer || '(none)');
        answerValue = intent.partialAnswer || freeText!;
      } else {
        console.log(`LLM CLASSIFIER → ${intent.primary.toUpperCase()} (NOT advancing — re-asking)`);
        if (intent.clarification) console.log('   Sub-intent (clarification):', intent.clarification);
        if (intent.objection) console.log('   Sub-intent (objection):', intent.objection);
        if (intent.suggestedTone) console.log('   Suggested tone:', intent.suggestedTone);

        // Generate helpful response + re-ask
        const helpPrompt = `You are Chris's warm, expert AI assistant.

Current question: "${currentQuestion.question}"
User said: "${freeText}"
Detected intent: ${intent.primary}${
          intent.clarification ? ` (${intent.clarification})` : ''
        }${intent.objection ? ` (${intent.objection})` : ''}

Respond in 2–3 short, natural sentences:
• Acknowledge what they said
• Briefly help, reassure, or clarify
• Clearly re-ask the original question: "${currentQuestion.question}"

Tone: ${intent.suggestedTone || 'empathetic'}
Be concise, kind, and never pushy.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: helpPrompt }],
          temperature: 0.8,
          max_tokens: 180,
        });

        const reply = completion.choices[0].message.content?.trim() || `No problem! Just to clarify: ${currentQuestion.question}`;

        return NextResponse.json({
          reply,
          nextQuestion: {
            id: currentQuestion.id,
            question: currentQuestion.question,
            buttons: currentQuestion.buttons || [],
            allowFreeText: currentQuestion.allowFreeText,
            mappingKey: currentQuestion.mappingKey,
          },
          progress,
          isComplete: false,
          intent: intent.primary,
          subIntent: intent.clarification || intent.objection,
        });
      }
    } else {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // ————————————————————————
    // 3. PROCEED WITH ANSWER (button or confirmed free text)
    // ————————————————————————
    console.log('ADVANCING TO NEXT QUESTION with answer:', answerValue);

    const systemPrompt = `You are Chris's AI assistant for ${flow.name}.

Current question: ${currentQuestion.question}
User's answer: ${answerValue}
${nextQuestion ? `Next question: "${nextQuestion.question}"` : 'This is the final question.'}

Provide a warm 2-3 sentence response that:
1. Acknowledges their answer positively
2. Adds brief helpful context
${nextQuestion ? `3. Naturally transitions to: "${nextQuestion.question}"` : '3. Thanks them for completing the questions'}

Keep it concise and conversational.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answerValue! },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const reply = completion.choices[0].message.content || 'Great, thanks!';

    return NextResponse.json({
      reply,
      extracted: {
        mappingKey: currentQuestion.mappingKey,
        value: answerValue!,
      },
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
  } catch (error) {
    console.error('chat-smart API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}