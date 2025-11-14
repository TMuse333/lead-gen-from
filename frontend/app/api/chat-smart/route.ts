// app/api/chat-smart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CONVERSATION_FLOWS } from '@/data/conversationFlows/conversationFlows';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type FlowType = 'sell' | 'buy' | 'browse';

const FLOW_CONFIG = {
  sell: {
    name: 'Selling',
    totalQuestions: 6,
    questionOrder: ['propertyType', 'propertyAge', 'renovations', 'timeline', 'sellingReason', 'email'],
    completionMessage: "Perfect! I have everything I need."
  },
  buy: {
    name: 'Buying',
    totalQuestions: 6,
    questionOrder: ['propertyType', 'budget', 'bedrooms', 'timeline', 'buyingReason', 'email'],
    completionMessage: "Excellent! I have all the information."
  },
  browse: {
    name: 'Browsing',
    totalQuestions: 6,
    questionOrder: ['interest', 'location', 'priceRange', 'timeline', 'goal', 'email'],
    completionMessage: "Great! I have what I need to help you."
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, currentAnswers = {}, currentFlow = null } = body;

    const activeFlow: FlowType = currentFlow || 'sell';
    const flowConfig = FLOW_CONFIG[activeFlow];
    const flow = CONVERSATION_FLOWS[activeFlow];
    
    const isFirstMessage = Object.keys(currentAnswers).length === 0 && !currentFlow;
    const answeredKeys = Object.keys(currentAnswers);

    const systemPrompt = `You are Chris's AI assistant helping with ${flowConfig.name.toLowerCase()} in Halifax.

Current answers collected: ${answeredKeys.length}/${flowConfig.totalQuestions}

VALID QUESTIONS FOR THIS FLOW (${activeFlow.toUpperCase()}):
${flowConfig.questionOrder.map((q, i) => `${i + 1}. ${q} (mappingKey: "${q}")`).join('\n')}

YOU MUST ONLY USE THESE mappingKeys IN nextQuestion!

${isFirstMessage ? `
FIRST MESSAGE: The user just selected "${activeFlow}". You MUST:
1. Set flowType: "${activeFlow}"
2. Ask the FIRST question: "${flowConfig.questionOrder[0]}"
3. Return nextQuestion: "${flowConfig.questionOrder[0]}"
` : `
NEXT STEPS:
- Extract the answer if user provided one (use the mappingKey from current question)
- Ask the NEXT unanswered question from the list above
- NEVER use questions from other flows
`}

CRITICAL: Provide a SHORT conversational response (1-2 sentences).
Then call determine_next_step with the correct nextQuestion mappingKey from the list above.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'determine_next_step',
          description: 'Extract answer and determine next question',
          parameters: {
            type: 'object',
            properties: {
              extractedAnswer: {
                type: 'object',
                properties: {
                  mappingKey: { type: 'string' },
                  value: { type: 'string' },
                }
              },
              nextQuestion: { 
                type: 'string',
                enum: [
                  'propertyType', 'propertyAge', 'renovations', 'timeline', 'sellingReason',
                  'budget', 'bedrooms', 'buyingReason',
                  'interest', 'location', 'priceRange', 'goal',
                  'email', 'none'
                ]
              },
              flowType: {
                type: 'string',
                enum: ['sell', 'buy', 'browse']
              }
            },
            required: ['nextQuestion']
          }
        }
      }],
      tool_choice: {
        type: 'function',
        function: { name: 'determine_next_step' }
      },
    });

    let reply = completion.choices[0].message.content || '';
    let buttons: any[] = [];
    let extracted = null;
    let flowType = null;

    const toolCalls = completion.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      
      if (toolCall.type === 'function') {
        const func = toolCall.function;
        const args = JSON.parse(func.arguments);

        if (args.flowType) {
          flowType = args.flowType;
        }

        if (args.extractedAnswer) {
          extracted = {
            mappingKey: args.extractedAnswer.mappingKey,
            value: args.extractedAnswer.value,
          };
        }

        if (args.nextQuestion && args.nextQuestion !== 'none') {
          const currentFlow: FlowType = flowType || activeFlow;
          const flowData = CONVERSATION_FLOWS[currentFlow];
          const questionData = flowData[args.nextQuestion as keyof typeof flowData];
          
          if (questionData) {
            buttons = questionData.buttons || [];
          }
        }
      }
    }

    // Construct reply if empty
    if (!reply || reply.trim() === '') {
      const totalAnswersAfter = answeredKeys.length + (extracted ? 1 : 0);
      const isComplete = totalAnswersAfter >= flowConfig.totalQuestions;
      
      if (isComplete) {
        reply = flowConfig.completionMessage + "\n\nI'm now generating your personalized report. This will just take a moment...";
      } else if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments);
          if (args.nextQuestion && args.nextQuestion !== 'none') {
            const currentFlow: FlowType = activeFlow;
            const flowData = CONVERSATION_FLOWS[currentFlow];
            const questionData = flowData[args.nextQuestion as keyof typeof flowData];
            
            if (questionData) {
              if (args.flowType && !currentFlow) {
                reply = `Great! I'd love to help you with ${FLOW_CONFIG[args.flowType as FlowType].name.toLowerCase()}. ${questionData.question}`;
              } else if (extracted) {
                reply = "Perfect! " + questionData.question;
              } else {
                reply = questionData.question;
              }
            }
          }
        }
      }
      
      if (!reply || reply.trim() === '') {
        reply = "Let me help you with that!";
      }
    }

    const newAnswerCount = answeredKeys.length + (extracted ? 1 : 0);
    const response = {
      reply,
      buttons,
      extracted,
      flowType: flowType || activeFlow,
      progress: Math.round((newAnswerCount / flowConfig.totalQuestions) * 100),
      isComplete: newAnswerCount >= flowConfig.totalQuestions
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ERROR:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}