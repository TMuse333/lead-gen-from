// app/api/chat-smart/route.ts (FIXED - reads config from request)
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildChatPrompt } from '@/lib/chat/chatPromptBuilder';

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
  
  // ADD: Send flow config from client
  flowConfig?: any;
  questionConfig?: any;
}

export async function POST(req: NextRequest) {
  console.log('🚀 Route called');
  
  try {
    const body: ChatRequest = await req.json();
    const {
      buttonId,
      buttonValue,
      freeText,
      currentFlow,
      currentNodeId,
      userInput,
      messages = [],
      flowConfig,
      questionConfig,
    } = body;

    console.log('📨 Request:', { buttonId, freeText, currentFlow, currentNodeId });

    // Use config sent from client (since store is client-only)
    const flow = flowConfig;
    const currentQuestion = questionConfig;

    if (!flow || !currentQuestion) {
      return NextResponse.json(
        { error: 'Flow/question config required in request' },
        { status: 400 }
      );
    }

    // Determine if this is a button click or free text
    const isButtonClick = !!buttonId && !!buttonValue;
    const isFreeTextQuestion = !!freeText && !isButtonClick;

    // Find button if button click
    let selectedButton;
    if (isButtonClick) {
      selectedButton = currentQuestion.buttons?.find((b: any) => b.id === buttonId);
    }

    // Get next question for smooth transitions
    const currentIndex = flow.questions.findIndex((q: any) => q.id === currentNodeId);
    const nextQuestion = flow.questions[currentIndex + 1];

    // Build appropriate prompt based on input type
    let systemPrompt: string;

    if (isFreeTextQuestion) {
      // User asked a question instead of clicking - answer it and guide back
      systemPrompt = `You are Chris's AI assistant for ${flow.name}.

CURRENT QUESTION THEY SHOULD ANSWER: "${currentQuestion.question}"

USER ASKED: "${freeText}"

YOUR TASK:
1. Answer their question helpfully and concisely (2-3 sentences)
2. Relate your answer to the current question context if possible
3. Gently guide them back to answering: "${currentQuestion.question}"

EXAMPLE RESPONSES:
User asks: "How does age affect my home value?"
You say: "Great question! Home age significantly impacts value - newer homes typically command 10-15% premiums, while older homes may need pricing adjustments for deferred maintenance. Now, ${currentQuestion.question.toLowerCase()}"

User asks: "What's the market like?"
You say: "Halifax's market is strong with steady demand! Knowing your timeline helps me tailor advice to current conditions. So, ${currentQuestion.question.toLowerCase()}"

Keep it warm, helpful, and naturally guide them back to the current question.`;
    } else {
      // Normal button click - acknowledge and transition
      systemPrompt = `You are Chris's AI assistant for ${flow.name}.

Current question: ${currentQuestion.question}
User selection: ${buttonValue || freeText}
${nextQuestion ? `\nNext question: "${nextQuestion.question}"\n⚠️ End your response by naturally leading into this next question.` : '\nThis is the final question - wrap up warmly.'}

Provide a warm, personalized 2-3 sentence response that:
1. Acknowledges their choice
2. Adds helpful context
${nextQuestion ? `3. Smoothly transitions to: "${nextQuestion.question}"` : '3. Wraps up the conversation'}

Keep it concise and conversational.`;
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: isFreeTextQuestion ? freeText! : (buttonValue || freeText || '') },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const reply = completion.choices[0].message.content || 'Great choice!';

    // For free-text questions, don't advance - stay on same question
    // For button clicks, advance to next question
    const responseNextQuestion = isFreeTextQuestion ? currentQuestion : nextQuestion;
    const responseProgress = isFreeTextQuestion 
      ? Math.round((currentIndex / flow.questions.length) * 100)
      : Math.round(((currentIndex + 1) / flow.questions.length) * 100);

    return NextResponse.json({
      reply,
      nextQuestion: responseNextQuestion ? {
        id: responseNextQuestion.id,
        question: responseNextQuestion.question,
        buttons: responseNextQuestion.buttons || [],
        allowFreeText: responseNextQuestion.allowFreeText,
        mappingKey: responseNextQuestion.mappingKey,
      } : null,
      extracted: isButtonClick ? {
        mappingKey: currentQuestion.mappingKey,
        value: buttonValue || '',
      } : null, // Don't extract answer for free-text questions
      progress: responseProgress,
      isComplete: !nextQuestion && isButtonClick, // Only complete on button clicks
      isFreeTextResponse: isFreeTextQuestion, // Flag to indicate this was a question
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}