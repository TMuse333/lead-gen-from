// app/api/chat-smart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple conversation flows
const FLOWS = {
  sell: {
    propertyType: {
      question: "What type of property do you have?",
      buttons: [
        { id: 'house', label: 'Single-family house', value: 'single-family house' },
        { id: 'condo', label: 'Condo/Apartment', value: 'condo' },
        { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
        { id: 'multi', label: 'Multi-family', value: 'multi-family' },
      ]
    },
    propertyAge: {
      question: "How old is your home?",
      buttons: [
        { id: 'new', label: '< 10 years', value: '0-10' },
        { id: 'mid1', label: '10-20 years', value: '10-20' },
        { id: 'mid2', label: '20-30 years', value: '20-30' },
        { id: 'old', label: '30+ years', value: '30+' },
      ]
    },
    renovations: {
      question: "Have you done any major renovations?",
      buttons: [
        { id: 'yes-kitchen', label: 'Kitchen', value: 'kitchen' },
        { id: 'yes-bath', label: 'Bathroom', value: 'bathroom' },
        { id: 'yes-both', label: 'Both', value: 'kitchen and bathroom' },
        { id: 'no', label: 'No major renovations', value: 'none' },
      ]
    },
    timeline: {
      question: "When are you looking to sell?",
      buttons: [
        { id: 'asap', label: '0-3 months (ASAP)', value: '0-3' },
        { id: 'soon', label: '3-6 months', value: '3-6' },
        { id: 'planning', label: '6-12 months', value: '6-12' },
        { id: 'exploring', label: 'Just exploring', value: '12+' },
      ]
    },
    sellingReason: {
      question: "What's your main reason for selling?",
      buttons: [
        { id: 'relocate', label: 'Relocating', value: 'relocating' },
        { id: 'upsize', label: 'Upsizing', value: 'upsizing' },
        { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
        { id: 'investment', label: 'Investment', value: 'investment' },
      ]
    },
    email: {
      question: "What's your email address?",
      buttons: []
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📨 Request body:', JSON.stringify(body, null, 2));

    const { messages, currentAnswers = [], currentFlow = null } = body;

    const systemPrompt = `You are Chris's AI assistant helping with home selling in Halifax.

Current answers collected: ${currentAnswers.length}

CRITICAL: You MUST provide a friendly conversational response.
Keep it SHORT (1-2 sentences).
Example: "Great! I'd love to help you sell your home."

Then call the function to extract data and provide options.`;

    console.log('🤖 Calling OpenAI...');

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
                enum: ['propertyType', 'propertyAge', 'renovations', 'timeline', 'sellingReason', 'email', 'none']
              },
              flowType: {
                type: 'string',
                enum: ['sell', 'buy', 'value']
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
          console.log('🎯 Flow type detected:', flowType);
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
          const flow = FLOWS.sell[args.nextQuestion as keyof typeof FLOWS.sell];
          if (flow) {
            buttons = flow.buttons;
            console.log('🔘 Buttons:', buttons.length);
          }
        }
      }
    }

    // CRITICAL CHECK
    if (!reply || reply.trim() === '') {
      console.log('⚠️ Empty reply - constructing from question...');
      
      // If we have a next question, use that
      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments);
          if (args.nextQuestion && args.nextQuestion !== 'none') {
            const flow = FLOWS.sell[args.nextQuestion as keyof typeof FLOWS.sell];
            if (flow) {
              // Construct a natural reply
              if (args.flowType === 'sell') {
                reply = "Great! I'd love to help you sell your home. " + flow.question;
              } else if (extracted) {
                reply = "Got it! " + flow.question;
              } else {
                reply = flow.question;
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
      progress: Math.round(((currentAnswers.length + (extracted ? 1 : 0)) / 6) * 100)
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ERROR:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}