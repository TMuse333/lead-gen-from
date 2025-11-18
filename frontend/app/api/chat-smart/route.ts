// app/api/chat-smart/route.ts - SIMPLIFIED (Free text = answers only)
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  console.log('🚀 API Route called');
  
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

    console.log('📦 Request:', { 
      buttonId, 
      buttonValue, 
      freeText, 
      currentFlow, 
      currentNodeId 
    });

    const flow = flowConfig;
    const currentQuestion = questionConfig;

    if (!flow || !currentQuestion) {
      return NextResponse.json(
        { error: 'Flow/question config required' },
        { status: 400 }
      );
    }

    // Determine input type
    const isButtonClick = !!buttonId && !!buttonValue;
    const isFreeText = !!freeText && !isButtonClick;

    // Extract the answer value
    let answerValue: string;
    if (isButtonClick) {
      answerValue = buttonValue!;
    } else if (isFreeText) {
      answerValue = freeText!;
    } else {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    console.log('✅ Answer extracted:', answerValue);

    // Get next question
    const currentIndex = flow.questions.findIndex((q: any) => q.id === currentNodeId);
    const nextQuestion = flow.questions[currentIndex + 1];
    const isLastQuestion = !nextQuestion;

    console.log('📊 Progress:', {
      currentIndex,
      totalQuestions: flow.questions.length,
      hasNext: !!nextQuestion,
      isLast: isLastQuestion
    });

    // Build prompt for AI response
    const systemPrompt = `You are Chris's AI assistant for ${flow.name}.

Current question: ${currentQuestion.question}
User's answer: ${answerValue}
${nextQuestion ? `Next question: "${nextQuestion.question}"` : 'This is the final question.'}

Provide a warm 2-3 sentence response that:
1. Acknowledges their answer positively
2. Adds brief helpful context
${nextQuestion ? `3. Naturally transitions to: "${nextQuestion.question}"` : '3. Thanks them for completing the questions'}

Keep it concise and conversational.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answerValue },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const reply = completion.choices[0].message.content || 'Great, thanks!';

    // Calculate progress
    const progress = Math.round(((currentIndex + 1) / flow.questions.length) * 100);

    // Build response
    const response = {
      reply,
      extracted: {
        mappingKey: currentQuestion.mappingKey,
        value: answerValue,
      },
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        question: nextQuestion.question,
        buttons: nextQuestion.buttons || [],
        allowFreeText: nextQuestion.allowFreeText,
        mappingKey: nextQuestion.mappingKey,
      } : null,
      progress,
      isComplete: isLastQuestion,
      isFreeTextResponse: false, // Never treat as question anymore
    };

    console.log('✅ Sending response:', {
      extracted: response.extracted,
      progress: response.progress,
      isComplete: response.isComplete,
      hasNextQuestion: !!response.nextQuestion
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}