// app/api/chat/smart/route.ts - UNIFIED OFFER SYSTEM + STATE MACHINE
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { normalizeToRealEstateSchemaPrompt } from '@/lib/openai/normalizers/normalizeToRealEstateSchema';
import { classifyIntentPrompt } from '@/lib/openai/classifiers/classifyIntent';
import {
  classifyAndExtractPrompt,
  parseClassifyAndExtractResponse,
  type ClassifyAndExtractParams,
} from '@/lib/openai/classifiers/classifyAndExtract';
import { auth } from '@/lib/auth/authConfig';
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { ChatIntentClassificationUsage, ChatReplyGenerationUsage } from '@/types/tokenUsage.types';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit/getRateLimit';
import { getIntelItemsCollection } from '@/lib/mongodb/db';
import type { IntelItemDocument } from '@/lib/mongodb/models/intelItem';
import {
  getOffer,
  getQuestion,
  getNextQuestion,
  getQuestionCount,
  type OfferType,
  type Intent,
} from '@/lib/offers/unified';
import type { ConversationState, ClassifyAndExtractResult } from '@/types/stateMachine.types';

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
  nextQuestionConfig?: any; // MongoDB next question for LLM context
  // Intel tracking
  clientIdentifier?: string;
  conversationId?: string;
  // State machine (Phase 2)
  currentState?: {
    id: string;
    goal: string;
    prompt: string;
    collects: ConversationState['collects'];
  };
  allCollectableFields?: Array<{
    mappingKey: string;
    label: string;
    extractionHint: string;
  }>;
  objectionCounter?: string; // Pre-looked-up objection response from engine
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
      nextQuestionConfig, // MongoDB next question for LLM context
      clientIdentifier,
      conversationId: bodyConversationId,
      // Legacy
      currentFlow,
      currentNodeId,
      flowConfig,
      // State machine
      currentState: smCurrentState,
      allCollectableFields,
      objectionCounter,
    } = body;

    console.log('[API] Received request:', {
      currentQuestionId,
      hasQuestionConfig: !!questionConfig,
      hasNextQuestionConfig: !!nextQuestionConfig,
      nextQuestionId: nextQuestionConfig?.id,
      hasStateMachine: !!smCurrentState,
    });

    // ——————————————————
    // STATE MACHINE BRANCH: If currentState is present, use state-machine-aware logic
    // ——————————————————
    if (smCurrentState && allCollectableFields) {
      console.log('[API] State machine branch — state:', smCurrentState.id);
      const offerLabelSM = currentIntent
        ? `${currentIntent.charAt(0).toUpperCase() + currentIntent.slice(1)} Journey`
        : 'Real Estate Assistant';

      const isButtonClickSM = !!buttonId && !!buttonValue;
      const isFreeTextSM = !!freeText && !isButtonClickSM;

      // For button clicks, fast path: return extracted value + generate reply
      if (isButtonClickSM) {
        // Find which mappingKey this button maps to
        const mappingKey = smCurrentState.collects[0]?.mappingKey || currentQuestionId || smCurrentState.id;

        const replyPrompt = `You are a friendly AI assistant for ${offerLabelSM}.
User clicked a button: "${buttonValue}"
State goal: ${smCurrentState.goal}
Reply in 1-2 warm, natural sentences acknowledging their choice. Be kind and engaging.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: replyPrompt }],
          temperature: 0.75,
          max_tokens: 120,
        });

        const reply = completion.choices[0].message.content?.trim() || 'Got it!';

        return NextResponse.json({
          reply,
          classifyResult: {
            intent: { primary: 'direct_answer', confidence: 1.0 },
            extracted: [{ mappingKey, value: buttonValue!, confidence: 1.0 }],
          } as ClassifyAndExtractResult,
        });
      }

      // For free text, use unified classify-and-extract
      if (isFreeTextSM) {
        const previousContext = messages
          ?.slice(-3)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n');

        const classifyParams: ClassifyAndExtractParams = {
          userMessage: freeText!,
          currentState: smCurrentState,
          allCollectableFields,
          alreadyCollected: userInput || {},
          flowName: offerLabelSM,
          previousContext,
        };

        const prompt = classifyAndExtractPrompt(classifyParams);
        const startTime = Date.now();

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          response_format: { type: 'json_object' },
          max_tokens: 800,
        });
        const endTime = Date.now();

        const content = completion.choices[0].message.content?.trim();
        if (!content) {
          return NextResponse.json({
            reply: 'I didn\'t quite catch that. Could you try again?',
            classifyResult: {
              intent: { primary: 'clarification_question', confidence: 0.5 },
              extracted: [],
            },
          });
        }

        const classifyResult = parseClassifyAndExtractResponse(JSON.parse(content));

        // Track usage
        const baseTracking = createBaseTrackingObject({
          userId,
          sessionId: bodyConversationId,
          provider: 'openai',
          model: 'gpt-4o-mini',
          apiType: 'chat',
          startTime,
        });
        const usageSM: ChatIntentClassificationUsage = {
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
            conversationId: bodyConversationId,
            currentQuestion: smCurrentState.prompt,
            userMessage: freeText!,
            flow: offerLabelSM,
            intentResult: {
              primary: classifyResult.intent.primary,
              confidence: classifyResult.intent.confidence,
            },
          },
        };
        trackUsageAsync(usageSM);

        // Generate contextual reply based on intent
        let replySystemPrompt: string;
        const intentPrimary = classifyResult.intent.primary;

        if (intentPrimary === 'direct_answer' || intentPrimary === 'multi_answer') {
          const fieldsExtracted = classifyResult.extracted.map((e) => e.mappingKey).join(', ');
          replySystemPrompt = `You are a friendly AI assistant for ${offerLabelSM}.
User answered: "${freeText}"
State goal: ${smCurrentState.goal}
Fields extracted: ${fieldsExtracted || 'none'}
Reply in 1-2 warm, natural sentences acknowledging their answer. Be kind and engaging.`;
        } else if (intentPrimary === 'objection') {
          // Use pre-computed objection counter if available
          if (objectionCounter) {
            return NextResponse.json({
              reply: objectionCounter,
              classifyResult,
            });
          }
          const tone = classifyResult.intent.suggestedTone || 'empathetic';
          replySystemPrompt = `You are a friendly AI assistant for ${offerLabelSM}.
User said: "${freeText}" (this is an objection)
State goal: ${smCurrentState.goal}
Question was: "${smCurrentState.prompt}"
Tone: ${tone}
Respond warmly to their concern in 2-3 sentences, then gently redirect back to the question.`;
        } else if (intentPrimary === 'change_previous_answer') {
          replySystemPrompt = `You are a friendly AI assistant for ${offerLabelSM}.
User wants to change a previous answer: "${freeText}"
Acknowledge the change warmly in 1-2 sentences.`;
        } else {
          // chitchat, off_topic, clarification, etc.
          replySystemPrompt = `You are a friendly AI assistant for ${offerLabelSM}.
User said: "${freeText}"
Question was: "${smCurrentState.prompt}"
They seem to be going off-topic or need clarification.
Respond briefly and kindly, then steer back to the question.`;
        }

        const replyCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: replySystemPrompt }],
          temperature: 0.75,
          max_tokens: 180,
        });

        const reply = replyCompletion.choices[0].message.content?.trim() || 'Got it!';

        // Save intel for objections/questions
        if (
          (intentPrimary === 'clarification_question' || intentPrimary === 'objection') &&
          clientIdentifier &&
          freeText &&
          freeText.length > 15
        ) {
          const intelType = intentPrimary === 'objection' ? 'pain_point' : 'question';
          const tagKeywords = ['mortgage', 'down payment', 'closing cost', 'inspection', 'appraisal', 'pre-approval', 'credit', 'interest rate', 'first-time', 'investment', 'condo', 'townhouse', 'detached', 'school', 'neighbourhood', 'neighborhood', 'renovation', 'property tax', 'offer', 'bidding', 'market', 'price', 'afford'];
          const lowerFreeText = freeText.toLowerCase();
          const tags = tagKeywords.filter((kw) => lowerFreeText.includes(kw));
          const origin = req.headers.get('origin') || '';
          const intelEnvironment = origin.includes('localhost') || origin.includes('127.0.0.1') ? 'test' : 'production';

          (async () => {
            try {
              const intelCollection = await getIntelItemsCollection();
              const intelItem: IntelItemDocument = {
                clientId: clientIdentifier,
                conversationId: bodyConversationId || undefined,
                type: intelType,
                content: freeText,
                summary: freeText.slice(0, 120),
                tags,
                environment: intelEnvironment,
                createdAt: new Date(),
              };
              await intelCollection.insertOne(intelItem);
            } catch (err) {
              console.error('[Intel] Failed to save state-machine intel:', err);
            }
          })();
        }

        return NextResponse.json({
          reply,
          classifyResult,
        });
      }

      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // ——————————————————
    // LEGACY BRANCH: Original linear question flow logic (unchanged)
    // ——————————————————

    // ——————————————————
    // Resolve current question - PRIORITY: MongoDB custom questions > unified offer system
    // ——————————————————
    let currentQuestion: { id: string; text: string; mappingKey: string; buttons?: any[] } | null = null;
    let nextQuestion: { id: string; text: string; mappingKey: string; buttons?: any[] } | null = null;
    let totalQuestions = 6;
    let currentIndex = 0;
    let offerLabel = 'Real Estate Assistant';

    // PRIORITY 1: Use MongoDB custom questions if provided (from setup wizard)
    // CustomQuestion uses 'question' field, not 'text'
    const questionText = questionConfig?.text || questionConfig?.question;
    if (questionConfig && questionText) {
      console.log('[API] Using MongoDB custom question:', questionConfig.id, questionText);
      currentQuestion = {
        id: questionConfig.id,
        text: questionText,
        mappingKey: questionConfig.mappingKey || questionConfig.id,
        buttons: questionConfig.buttons?.map((b: any) => ({
          id: b.id,
          label: b.label,
          value: b.value,
        })),
      };

      // Note: nextQuestion will be determined by frontend based on MongoDB questions
      // We don't calculate it here - the API just validates the current question
      offerLabel = currentIntent ? `${currentIntent.charAt(0).toUpperCase() + currentIntent.slice(1)} Journey` : 'Real Estate Assistant';
    }
    // PRIORITY 2: Fall back to unified offer system (hardcoded questions)
    else if (selectedOffer && currentIntent && currentQuestionId) {
      console.log('[API] Using unified offer system question:', currentQuestionId);
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
    }
    // PRIORITY 3: Legacy flow system
    else if (questionConfig && flowConfig) {
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

    // Check if there's a next question from EITHER MongoDB or unified system
    const hasNextQuestion = !!(nextQuestionConfig?.question || nextQuestionConfig?.text || nextQuestion);
    const isLastQuestion = !hasNextQuestion;

    console.log('[API] Question completion check:', {
      hasMongoDBNext: !!(nextQuestionConfig?.question || nextQuestionConfig?.text),
      hasUnifiedNext: !!nextQuestion,
      isLastQuestion,
    });

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

        // Save as intel if user asked a genuine question or raised an objection
        // Skip trivial clarifications like "what do you mean?" or "I don't understand"
        if (
          (intent.primary === 'clarification_question' || intent.primary === 'objection') &&
          clientIdentifier &&
          freeText &&
          freeText.length > 15
        ) {
          const intelType = intent.primary === 'objection' ? 'pain_point' : 'question';
          const tagKeywords = ['mortgage', 'down payment', 'closing cost', 'inspection', 'appraisal', 'pre-approval', 'credit', 'interest rate', 'first-time', 'investment', 'condo', 'townhouse', 'detached', 'school', 'neighbourhood', 'neighborhood', 'renovation', 'property tax', 'offer', 'bidding', 'market', 'price', 'afford'];
          const lowerFreeText = freeText.toLowerCase();
          const tags = tagKeywords.filter(kw => lowerFreeText.includes(kw));

          // Detect environment from request headers
          const origin = req.headers.get('origin') || '';
          const intelEnvironment = origin.includes('localhost') || origin.includes('127.0.0.1') ? 'test' : 'production';

          // Save in background - don't block the response
          (async () => {
            try {
              const intelCollection = await getIntelItemsCollection();
              const intelItem: IntelItemDocument = {
                clientId: clientIdentifier,
                conversationId: bodyConversationId || undefined,
                type: intelType,
                content: freeText,
                summary: freeText.slice(0, 120),
                tags,
                environment: intelEnvironment,
                createdAt: new Date(),
              };
              await intelCollection.insertOne(intelItem);
              console.log('[Intel] Saved during-flow intel:', intelType, freeText.slice(0, 50));
            } catch (err) {
              console.error('[Intel] Failed to save during-flow intel:', err);
            }
          })();
        }

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
    // Use MongoDB next question if available, otherwise use unified system next question
    const nextQuestionText = nextQuestionConfig?.question || nextQuestionConfig?.text || nextQuestion?.text;

    console.log('[API] Generating reply with next question:', nextQuestionText || 'NONE (final question)');

    const systemPrompt = `You are a friendly AI assistant for ${offerLabel}.

User just answered: "${answerValue}"
They were asked: "${currentQuestion.text}"
${nextQuestionText ? `Next question will be: "${nextQuestionText}"` : 'This was the final question.'}

Reply in 2–3 warm, natural sentences:
- Acknowledge their answer positively
- Add brief context or excitement
${nextQuestionText ? `- Smoothly transition to the next question` : `- Celebrate completion and build excitement`}

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

    // Note: When using MongoDB custom questions, nextQuestion is calculated by frontend
    // We return null here and let the frontend handle the flow
    const usingMongoDBQuestions = !!(questionConfig?.text || questionConfig?.question);
    const shouldReturnNextQuestion = nextQuestion && !usingMongoDBQuestions;

    console.log('[API] Response:', {
      extracted: extracted.mappingKey,
      hasNextQuestion: !!shouldReturnNextQuestion,
      usingMongoDBQuestions,
    });

    return NextResponse.json({
      reply,
      extracted,
      nextQuestion: shouldReturnNextQuestion && nextQuestion
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
