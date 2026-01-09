// app/api/chat/smart/route.ts - UNIFIED OFFER SYSTEM
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { normalizeToRealEstateSchemaPrompt } from '@/lib/openai/normalizers/normalizeToRealEstateSchema';
import { classifyIntentPrompt } from '@/lib/openai/classifiers/classifyIntent';
import { auth } from '@/lib/auth/authConfig';
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { ChatIntentClassificationUsage, ChatReplyGenerationUsage } from '@/types/tokenUsage.types';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';
import {
  getOffer,
  getQuestion,
  getNextQuestion,
  getQuestionCount,
  type OfferType,
  type Intent,
} from '@/lib/offers/unified';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ChatRequest {
  // Button click
  buttonId?: string;
  buttonValue?: string;
  buttonLabel?: string;
  // Free text
  freeText?: string;
  // Unified offer system (new)
  selectedOffer?: OfferType;
  currentIntent?: Intent;
  currentQuestionId?: string;
  // Legacy support
  currentFlow?: string;
  currentNodeId?: string;
  // Common
  userInput: Record<string, string>;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  flowConfig?: any;
  questionConfig?: any;
}

// ————————————————————————
// Shared JSON LLM helper
// ————————————————————————
async function callJsonLlm<T = unknown>(prompt: string, model = 'gpt-4o-mini'): Promise<T> {
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
    throw parseError;
  }
}

// ————————————————————————
// Intent classification
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
  userId?: string;
  conversationId?: string;
}): Promise<IntentAnalysis> {
  const prompt = classifyIntentPrompt({
    userMessage: params.userMessage,
    currentQuestion: params.currentQuestion,
    flowName: params.flowName,
    previousContext: params.previousContext,
  });

  const startTime = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    const endTime = Date.now();

    const content = completion.choices[0].message.content?.trim();
    if (!content) throw new Error('Empty response from LLM');

    const result = JSON.parse(content) as IntentAnalysis;

    // Track usage
    const baseTracking = createBaseTrackingObject({
      userId: params.userId,
      sessionId: params.conversationId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiType: 'chat',
      startTime,
    });

    const usage: ChatIntentClassificationUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        finishReason: completion.choices[0].finish_reason || undefined,
        contentLength: content.length,
        endTime,
      }),
      feature: 'chat.intentClassification',
      apiType: 'chat',
      model: 'gpt-4o-mini',
      featureData: {
        conversationId: params.conversationId,
        currentQuestion: params.currentQuestion,
        userMessage: params.userMessage,
        flow: params.flowName,
        intentResult: {
          primary: result.primary || 'clarification_question',
          confidence: result.confidence ?? 0.9,
        },
      },
    };

    trackUsageAsync(usage);

    return {
      primary: result.primary || 'clarification_question',
      clarification: result.clarification,
      objection: result.objection,
      confidence: result.confidence ?? 0.9,
      partialAnswer: result.partialAnswer,
      suggestedTone: result.suggestedTone,
    };
  } catch (error) {
    return { primary: 'clarification_question', confidence: 0.5 };
  }
}

// ————————————————————————
// Main POST handler
// ————————————————————————
export async function POST(req: NextRequest) {
  try {
    // Check rate limits
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch {
      // Not authenticated, continue
    }

    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit('chat.replyGeneration', userId, ip);

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

    const body: ChatRequest = await req.json();
    const {
      buttonId,
      buttonValue,
      freeText,
      selectedOffer,
      currentIntent,
      currentQuestionId,
      userInput,
      messages,
      questionConfig,
      // Legacy
      currentFlow,
      currentNodeId,
      flowConfig,
    } = body;

    // ——————————————————
    // Resolve current question - unified or legacy
    // ——————————————————
    let currentQuestion: { id: string; text: string; mappingKey: string; buttons?: any[] } | null = null;
    let nextQuestion: { id: string; text: string; mappingKey: string; buttons?: any[] } | null = null;
    let totalQuestions = 6;
    let currentIndex = 0;
    let offerLabel = 'Real Estate Assistant';

    if (selectedOffer && currentIntent && currentQuestionId) {
      // Use unified offer system
      const offer = getOffer(selectedOffer);
      if (offer) {
        offerLabel = offer.label;
        totalQuestions = getQuestionCount(selectedOffer, currentIntent);

        const question = getQuestion(selectedOffer, currentIntent, currentQuestionId);
        if (question) {
          currentQuestion = {
            id: question.id,
            text: question.text,
            mappingKey: question.mappingKey,
            buttons: question.buttons?.map(b => ({
              id: b.id,
              label: b.label,
              value: b.value,
            })),
          };

          // Find current index
          const questions = offer.questions[currentIntent] || [];
          currentIndex = questions.findIndex(q => q.id === currentQuestionId);
        }

        const next = getNextQuestion(selectedOffer, currentIntent, currentQuestionId);
        if (next) {
          nextQuestion = {
            id: next.id,
            text: next.text,
            mappingKey: next.mappingKey,
            buttons: next.buttons?.map(b => ({
              id: b.id,
              label: b.label,
              value: b.value,
            })),
          };
        }
      }
    } else if (questionConfig && flowConfig) {
      // Legacy flow system
      currentQuestion = {
        id: questionConfig.id,
        text: questionConfig.question,
        mappingKey: questionConfig.mappingKey,
        buttons: questionConfig.buttons,
      };

      const questions = flowConfig.questions || [];
      totalQuestions = questions.length;
      currentIndex = questions.findIndex((q: any) => q.id === (currentNodeId || currentQuestionId));
      const nextQ = questions[currentIndex + 1];

      if (nextQ) {
        nextQuestion = {
          id: nextQ.id,
          text: nextQ.question,
          mappingKey: nextQ.mappingKey,
          buttons: nextQ.buttons,
        };
      }

      offerLabel = flowConfig.name || 'Real Estate Assistant';
    }

    if (!currentQuestion || !currentQuestion.mappingKey) {
      return NextResponse.json({ error: 'Invalid question config' }, { status: 400 });
    }

    const isLastQuestion = !nextQuestion;
    const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

    const isButtonClick = !!buttonId && !!buttonValue;
    const isFreeText = !!freeText && !isButtonClick;

    let answerValue: string;

    // ——————————————————
    // 1. Button Click → Fast path
    // ——————————————————
    if (isButtonClick) {
      answerValue = buttonValue!;
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
        currentQuestion: currentQuestion.text,
        flowName: offerLabel,
        previousContext,
        userId,
        conversationId: (body as any)?.conversationId,
      });

      if (intent.primary !== 'direct_answer') {
        const helpPrompt = `User said: "${freeText}"
They were asked: "${currentQuestion.text}"
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

        const reply = completion.choices[0].message.content?.trim() || `Got it! Just to clarify: ${currentQuestion.text}`;

        return NextResponse.json({
          reply,
          nextQuestion: {
            id: currentQuestion.id,
            question: currentQuestion.text,
            buttons: currentQuestion.buttons || [],
            mappingKey: currentQuestion.mappingKey,
          },
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
        const intentForNormalization = currentIntent || currentFlow;
        if (intentForNormalization) {
          const prompt = normalizeToRealEstateSchemaPrompt(userInput, intentForNormalization as any);
          await callJsonLlm(prompt);
        }
      } catch (error) {
        // Background normalization failed silently
      }
    })();

    // ——————————————————
    // 5. Generate warm reply
    // ——————————————————
    const systemPrompt = `You are a friendly AI assistant for ${offerLabel}.

User just answered: "${answerValue}"
They were asked: "${currentQuestion.text}"
${nextQuestion ? `Next question will be: "${nextQuestion.text}"` : 'This was the final question.'}

Reply in 2–3 warm, natural sentences:
- Acknowledge their answer positively
- Add brief context or excitement
${nextQuestion ? `- Smoothly transition to the next question` : `- Celebrate completion and build excitement`}

Be kind, human, and engaging.`;

    const replyStartTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answerValue },
      ],
      temperature: 0.75,
      max_tokens: 160,
    });
    const replyEndTime = Date.now();

    const reply = completion.choices[0].message.content?.trim() || 'Thanks!';

    // Track usage
    const baseTracking = createBaseTrackingObject({
      userId,
      sessionId: (body as any)?.conversationId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiType: 'chat',
      startTime: replyStartTime,
    });

    const usage: ChatReplyGenerationUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        finishReason: completion.choices[0].finish_reason || undefined,
        contentLength: reply.length,
        endTime: replyEndTime,
      }),
      feature: 'chat.replyGeneration',
      apiType: 'chat',
      model: 'gpt-4o-mini',
      featureData: {
        conversationId: (body as any)?.conversationId,
        answerValue,
        currentQuestion: currentQuestion.text,
        nextQuestion: nextQuestion?.text,
        isLastQuestion,
        replyLength: reply.length,
      },
    };

    trackUsageAsync(usage);

    return NextResponse.json({
      reply,
      extracted,
      nextQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            question: nextQuestion.text,
            buttons: nextQuestion.buttons || [],
            mappingKey: nextQuestion.mappingKey,
          }
        : null,
      progress,
      isComplete: isLastQuestion,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
