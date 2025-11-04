// ============================================
// API ROUTE: /api/get-instant-reaction
// Get quick personalized reaction after each answer
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

export const runtime = "nodejs";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';
const AGENT_ID = '82ae0d4d-c3d7-4997-bc7b-12b2261d167e';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, answer, questionText } = body as {
      questionId: string;
      answer: string | string[];
      questionText: string;
    };

    console.log(`💬 Getting reaction for: ${questionId} = ${answer}`);

    // Create a search query based on the answer
    const searchQuery = `${questionText}: ${Array.isArray(answer) ? answer.join(', ') : answer}`;
    
    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: searchQuery,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Search Qdrant for relevant advice
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 3,
      with_payload: true,
    });

    // Filter by agentId
    const agentAdvice = searchResult
      .filter((result) => result.payload?.agentId === AGENT_ID)
      .slice(0, 1); // Just get the top match

    // Generate quick reaction using GPT
    let reaction = '';
    
    if (agentAdvice.length > 0) {
      const adviceText = agentAdvice[0].payload?.advice as string;
      
      // Ask GPT to create a brief, conversational reaction
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Faster, cheaper for quick reactions
        messages: [
          {
            role: 'system',
            content: `You are Chris Crowell, a helpful real estate agent. Based on what the user just told you, give a brief, encouraging 1-2 sentence reaction. Be conversational, warm, and insightful. Reference specific details from their answer. Don't ask questions, just acknowledge their situation with helpful context.`,
          },
          {
            role: 'user',
            content: `The user just answered: "${questionText}: ${Array.isArray(answer) ? answer.join(', ') : answer}". 

Here's some relevant expertise to draw from:
${adviceText.substring(0, 300)}... 

Give a brief, encouraging reaction (1-2 sentences max).`,
          },
        ],
        temperature: 0.8,
        max_tokens: 80,
      });

      reaction = completion.choices[0].message.content || '';
    } else {
      // Fallback generic reactions based on question type
      reaction = getGenericReaction(questionId, answer);
    }

    return NextResponse.json({
      success: true,
      reaction,
    });

  } catch (error) {
    console.error('❌ Error getting instant reaction:', error);
    
    // Return a generic positive reaction on error
    return NextResponse.json({
      success: true,
      reaction: "Got it! Let's keep going.",
    });
  }
}

/**
 * Fallback generic reactions if Qdrant search fails
 */
function getGenericReaction(questionId: string, answer: string | string[]): string {
  const answerStr = Array.isArray(answer) ? answer.join(', ') : answer;

  const reactions: Record<string, Record<string, string>> = {
    property_type: {
      house: "Single-family homes have great appeal in Halifax! They're always in demand.",
      condo: "Condos can be a smart investment, especially in the right location.",
      townhouse: "Townhouses offer a great balance of space and affordability.",
      multi_unit: "Multi-units can be excellent income properties for the right buyer.",
    },
    property_age: {
      '0-5': "Newer properties typically command premium prices and sell quickly!",
      '5-15': "This is a sweet spot age - modern enough but with proven bones.",
      '15-30': "Established properties in this range often have great character and good equity potential.",
      '30+': "Mature properties can have tremendous charm and solid construction.",
    },
    renovations: {
      yes: "Recent renovations can significantly boost your home's value! That's excellent.",
      minor: "Smart! Even minor updates can make a big difference in buyer appeal.",
      no: "No problem! We can discuss which updates might maximize your return.",
    },
    mortgage_status: {
      paid_off: "Being mortgage-free gives you great flexibility in timing and pricing!",
      under_50: "Having significant equity built up puts you in a strong position.",
      over_50: "We'll make sure the numbers work well for your next move.",
    },
    selling_reason: {
      upsizing: "Growing families need space! The market for starter homes is strong.",
      downsizing: "This is a popular move - simpler living has real appeal!",
      relocating: "Job moves can be stressful, but we'll make the selling part smooth.",
      investment: "Smart! Investment properties are heating up in this market.",
      lifestyle: "Life changes are exciting! Let's make this transition easy.",
      exploring: "Perfect time to explore your options - knowledge is power!",
    },
    timeline: {
      '0-3': "Acting quickly can sometimes get you the best results!",
      '3-6': "This is a good timeline - enough time to prepare and market effectively.",
      '6-12': "Great! This gives us time to strategically position your property.",
      exploring: "No rush! Let's see what your options look like.",
    },
  };

  // Try to find a specific reaction
  if (reactions[questionId] && reactions[questionId][answerStr]) {
    return reactions[questionId][answerStr];
  }

  // Generic positive reactions
  const generic = [
    "That's helpful context - it'll help us get you the best value!",
    "Good to know! This will help us create the right strategy.",
    "Perfect! Every detail helps us serve you better.",
    "Thanks for sharing that - it's all part of the picture.",
  ];

  return generic[Math.floor(Math.random() * generic.length)];
}