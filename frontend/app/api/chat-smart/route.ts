// app/api/chat-smart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatMessage, ExtractedAnswer } from '@/types/chat.types';
import { CONVERSATION_FLOWS } from '@/data/conversationFlows/conversationFlows';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ──────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────
type FlowType = 'sell' | 'buy' | 'value';

type DetermineNextStepArgs = {
  extractedAnswer?: {
    questionId: string;
    value: string;
  };
  nextQuestion: string;
  celebration?: boolean;
  flowType?: FlowType;
};

interface RequestBody {
  messages: ChatMessage[];
  currentAnswers: ExtractedAnswer[];
  currentFlow?: FlowType | null;
}

// ──────────────────────────────────────────────────────────────────────
// MAIN POST HANDLER
// ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, currentAnswers, currentFlow }: RequestBody = await req.json();

    // Determine if we need to detect flow type
    const needsFlowDetection = !currentFlow && currentAnswers.length === 0;

    const systemPrompt = buildSystemPrompt(currentAnswers, currentFlow, needsFlowDetection);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
      functions: [{
        name: 'determine_next_step',
        description: 'Decide what to ask next, extract answers, and track progress',
        parameters: {
          type: 'object',
          properties: {
            extractedAnswer: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                value: { type: 'string' },
              },
              description: 'The answer extracted from the user message'
            },
            nextQuestion: { 
              type: 'string', 
              enum: ['propertyType', 'propertyAge', 'renovations', 'timeline', 'sellingReason', 'email', 'none'],
              description: 'The next question to ask'
            },
            celebration: { 
              type: 'boolean', 
              description: 'Should we celebrate this milestone?' 
            },
            flowType: {
              type: 'string',
              enum: ['sell', 'buy', 'value'],
              description: 'The type of flow the user selected (only set on first interaction)'
            }
          },
          required: ['nextQuestion']
        }
      }],
      function_call: 'auto',
    });

    let reply = completion.choices[0].message.content || '';
    let buttons: any[] = [];
    let extracted: ExtractedAnswer | null = null;
    let celebration = false;
    let detectedFlow: FlowType | undefined;

    // ── FUNCTION CALL HANDLING ───────────────────────────────────────
    const functionCall = completion.choices[0].message.function_call;
    if (functionCall) {
      const args = JSON.parse(functionCall.arguments) as DetermineNextStepArgs;

      // Detect flow type
      if (args.flowType) {
        detectedFlow = args.flowType;
      }

      // Extract answer
      if (args.extractedAnswer?.questionId) {
        extracted = {
          questionId: args.extractedAnswer.questionId,
          question: getQuestionText(args.extractedAnswer.questionId),
          value: args.extractedAnswer.value,
          answeredAt: new Date(),
        };
      }

      // Celebration on first answer
      if (currentAnswers.length === 0 && extracted) {
        celebration = true;
        reply = `Perfect! I'm starting to build your personalized home valuation report!\n\n${reply}`;
      }

      // Get next buttons
      if (args.nextQuestion && args.nextQuestion !== 'none') {
        const activeFlow = detectedFlow || currentFlow || 'sell';
        const flow = CONVERSATION_FLOWS[activeFlow]?.[args.nextQuestion];
        if (flow) {
          buttons = flow.buttons;
        }
      }
    }

    // Calculate progress
    const totalQuestions = 6;
    const answeredCount = currentAnswers.length + (extracted ? 1 : 0);
    const progress = Math.round((answeredCount / totalQuestions) * 100);

    return NextResponse.json({
      reply,
      buttons,
      extracted,
      celebration,
      progress,
      flowType: detectedFlow,
    });
  } catch (error) {
    console.error('Chat smart error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' }, 
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────────────────
function buildSystemPrompt(
  currentAnswers: ExtractedAnswer[], 
  currentFlow: FlowType | null | undefined,
  needsFlowDetection: boolean
): string {
  const basePrompt = `You are Chris's AI real estate assistant in Halifax, Nova Scotia.

CONVERSATION STATE: ${currentAnswers.length} answers collected
CURRENT FLOW: ${currentFlow || 'detecting...'}

YOUR GOAL: Guide users through a home selling conversation and extract:
1. Property type
2. Property age
3. Renovations
4. Selling timeline
5. Selling reason
6. Email address

CRITICAL RULES:
- Be warm, professional, and conversational
- Keep responses SHORT (2-3 sentences max)
- Always acknowledge their answer before asking the next question
- If user chose a path (sell/buy/value), stay focused on that goal
- After FIRST answer is extracted, respond with excitement
- Reference progress naturally: "Great! That helps me understand your situation better."
- Be enthusiastic when milestones hit
- Always provide button options when possible
- Extract answers even from natural language responses

CURRENT ANSWERS COLLECTED:
${JSON.stringify(currentAnswers, null, 2)}`;

  if (needsFlowDetection) {
    return basePrompt + `

IMPORTANT: This is the first interaction. Detect which flow the user wants:
- If they mention selling → flowType: "sell"
- If they mention buying → flowType: "buy"  
- If they want valuation → flowType: "value"`;
  }

  return basePrompt;
}

function getQuestionText(id: string): string {
  const mapping: Record<string, string> = {
    propertyType: 'What type of property do you have?',
    propertyAge: 'How old is your property?',
    renovations: 'Have you done any renovations?',
    timeline: 'When are you looking to sell?',
    sellingReason: "What's your main reason for selling?",
    email: "What's your email address?",
  };
  return mapping[id] || 'Question';
}