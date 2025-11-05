// app/api/chat-smart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CONVERSATION_FLOWS, FLOW_CONFIG, FlowType } from '@/data/conversationFlows/conversationFlows';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📨 Request body:', JSON.stringify(body, null, 2));

    const { messages, currentAnswers = [], currentFlow = null } = body;

    // Get the active flow or default to 'sell'
    const activeFlow: FlowType = currentFlow || 'sell';
    const flowConfig = FLOW_CONFIG[activeFlow];
    const flow = CONVERSATION_FLOWS[activeFlow];
    
    const isFirstMessage = currentAnswers.length === 0 && !currentFlow;

    const systemPrompt = `You are Chris's AI assistant helping with ${flowConfig.name.toLowerCase()} in Halifax.

Current answers collected: ${currentAnswers.length}/${flowConfig.totalQuestions}
${isFirstMessage ? `
FIRST MESSAGE: The user just selected their path. You MUST:
1. Detect their flow type from their message
2. Set flowType in the function call ('sell', 'buy', or 'browse')
3. Ask the FIRST question from that flow
` : ''}

CRITICAL: You MUST provide a friendly conversational response.
Keep it SHORT (1-2 sentences).

Then call the function to extract data and provide options.`;

    console.log('🤖 Calling OpenAI... Flow:', activeFlow, 'Is First:', isFirstMessage);

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
                  questionId: { type: 'string' },
                  value: { type: 'string' },
                }
              },
              nextQuestion: { 
                type: 'string',
                enum: [
                  // Seller questions
                  'propertyType', 'propertyAge', 'renovations', 'timeline', 'sellingReason',
                  // Buyer questions
                  'budget', 'bedrooms', 'buyingReason',
                  // Browser questions
                  'interest', 'location', 'priceRange', 'goal',
                  // Common
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
      // Force it to call the function
      tool_choice: {
        type: 'function',
        function: { name: 'determine_next_step' }
      },
    });

    console.log('✅ OpenAI Response received');
    console.log('📝 Content:', completion.choices[0].message.content);
    console.log('🔧 Tool calls:', completion.choices[0].message.tool_calls);

    let reply = completion.choices[0].message.content || '';
    let buttons: any[] = [];
    let extracted = null;
    let flowType = null;

    // Handle tool calls
    const toolCalls = completion.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      console.log('🔍 Processing tool call...');
      const toolCall = toolCalls[0];
      
      if (toolCall.type === 'function') {
        const func = toolCall.function;
        console.log('📦 Function name:', func.name);
        console.log('📦 Function args:', func.arguments);
        
        const args = JSON.parse(func.arguments);

        if (args.flowType) {
          flowType = args.flowType;
          console.log('🎯 Flow type detected from AI:', flowType);
        }

        if (args.extractedAnswer) {
          extracted = {
            questionId: args.extractedAnswer.questionId,
            question: 'Question',
            value: args.extractedAnswer.value,
            answeredAt: new Date(),
          };
          console.log('✅ Extracted:', extracted);
        }

        if (args.nextQuestion && args.nextQuestion !== 'none') {
          const currentFlow: FlowType = flowType || activeFlow;
          console.log('📍 Using flow for buttons:', currentFlow);
          
          const flowData = CONVERSATION_FLOWS[currentFlow];
          const questionData = flowData[args.nextQuestion as keyof typeof flowData];
          
          if (questionData) {
            buttons = questionData.buttons;
            console.log('🔘 Buttons:', buttons.length);
          } else {
            console.warn('⚠️ No question data found for:', args.nextQuestion, 'in flow:', currentFlow);
          }
        }
      }
    }

    // CRITICAL CHECK
    if (!reply || reply.trim() === '') {
      console.log('⚠️ Empty reply - constructing from question...');
      
      // Check if we're done collecting answers
      const totalAnswersAfter = currentAnswers.length + (extracted ? 1 : 0);
      const isComplete = totalAnswersAfter >= flowConfig.totalQuestions;
      
      if (isComplete) {
        // COMPLETION MESSAGE - use flow-specific message
        reply = flowConfig.completionMessage + "\n\nI'm now generating your personalized report. This will just take a moment...";
        console.log('✅ Form complete! Sending completion message');
      } else if (toolCalls && toolCalls.length > 0) {
        // Regular question flow
        const toolCall = toolCalls[0];
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments);
          if (args.nextQuestion && args.nextQuestion !== 'none') {
            const currentFlow: FlowType =  activeFlow;
            const flowData = CONVERSATION_FLOWS[currentFlow];
            const questionData = flowData[args.nextQuestion as keyof typeof flowData];
            
            if (questionData) {
              // Construct a natural reply
              if (args.flowType && !currentFlow) {
                reply = `Great! I'd love to help you with ${FLOW_CONFIG[args.flowType as FlowType].name.toLowerCase()}. ${questionData.question}`;
              } else if (extracted) {
                reply = "Perfect! " + questionData.question;
              } else {
                reply = questionData.question;
              }
              console.log('✅ Constructed reply:', reply);
            }
          }
        }
      }
      
      // Final fallback
      if (!reply || reply.trim() === '') {
        reply = "Let me help you with that!";
      }
    }

    const response = {
      reply,
      buttons,
      extracted,
      flowType,
      progress: Math.round(((currentAnswers.length + (extracted ? 1 : 0)) / flowConfig.totalQuestions) * 100),
      isComplete: (currentAnswers.length + (extracted ? 1 : 0)) >= flowConfig.totalQuestions
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ERROR:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}