// app/api/chat/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REQUIRED_FIELDS = [
  { id: 'property-type', question: 'What type of property do you have?', weight: 20 },
  { id: 'property-age', question: 'How old is your property?', weight: 15 },
  { id: 'renovations', question: 'Have you done any renovations?', weight: 15 },
  { id: 'selling-reason', question: 'Why are you selling?', weight: 20 },
  { id: 'timeline', question: 'When are you looking to sell?', weight: 15 },
  { id: 'email', question: "What's your email?", weight: 15 },
];

export async function POST(req: NextRequest) {
  try {
    const { messages, currentAnswers } = await req.json();

    const systemPrompt = `You are a friendly real estate assistant for Chris Crowell in Halifax.

YOUR GOAL: Naturally extract these details through conversation:
${REQUIRED_FIELDS.map(f => `- ${f.question}`).join('\n')}

ALREADY EXTRACTED: ${currentAnswers.map((a: any) => `${a.questionId}: ${a.value}`).join(', ') || 'Nothing yet'}

RULES:
1. Be conversational, not interrogative
2. Extract info from user's responses naturally
3. Only ask 1 question at a time
4. Reference the progress tracker: "I'm building your analysis!"
5. When you have 3+ answers, say: "Great progress! I almost have enough..."
6. When you have 5+ answers: "Almost there! Just need your email to send the report"
7. Celebrate milestones: "Awesome! That's really helpful 🎉"

Current progress: ${currentAnswers.length}/${REQUIRED_FIELDS.length} answered`;

    // Call OpenAI with function calling for extraction
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      functions: [{
        name: 'extract_form_answer',
        description: 'Extract structured answer from conversation',
        parameters: {
          type: 'object',
          properties: {
            questionId: { 
              type: 'string', 
              enum: REQUIRED_FIELDS.map(f => f.id),
              description: 'Which question this answers'
            },
            value: { type: 'string', description: 'The extracted value' },
            confidence: { type: 'number', description: 'Confidence 0-1' },
          },
          required: ['questionId', 'value', 'confidence'],
        }
      }],
      function_call: 'auto',
    });

    const reply = completion.choices[0].message.content || '';
    const functionCall = completion.choices[0].message.function_call;

    let extracted = null;
    if (functionCall && functionCall.name === 'extract_form_answer') {
      const args = JSON.parse(functionCall.arguments);
      const field = REQUIRED_FIELDS.find(f => f.id === args.questionId);
      
      if (field && args.confidence > 0.7) {
        extracted = {
          questionId: args.questionId,
          question: field.question,
          value: args.value,
          answeredAt: new Date(),
        };
      }
    }

    // Calculate progress
    const totalAnswers = currentAnswers.length + (extracted ? 1 : 0);
    const progress = {
      current: totalAnswers,
      total: REQUIRED_FIELDS.length,
      percentage: Math.round((totalAnswers / REQUIRED_FIELDS.length) * 100),
      needsMore: totalAnswers < REQUIRED_FIELDS.length,
      readyForAnalysis: totalAnswers >= REQUIRED_FIELDS.length,
      motivationText: getMotivationText(totalAnswers),
    };

    return NextResponse.json({
      reply,
      extracted,
      progress,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

function getMotivationText(answersCount: number): string {
  if (answersCount === 1) {
    return "Great start! I'm beginning to build your analysis 🎉";
  } else if (answersCount === 2) {
    return "Awesome! Your personalized report is taking shape ✨";
  } else if (answersCount === 3) {
    return "Excellent! I'm gathering comparable homes for you 🏠";
  } else if (answersCount === 4) {
    return "Almost there! Your market analysis is nearly complete 📊";
  } else if (answersCount >= 5) {
    return "Perfect! Just need your email to send your full report 📧";
  }
  return "";
}