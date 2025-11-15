// ============================================
// API ROUTE: /api/add-agent-advice
// Handles adding agent advice from frontend uploader (NEW FORMAT)
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { storeAgentAdvice } from '@/lib/qdrant/client';
import { getEmbedding } from '@/lib/openai/embedding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      advice,
      tags = [],
      flow = [],
      conditions = {},
    } = body;

    // Validate required fields
    if (!title || !advice) {
      return NextResponse.json(
        { success: false, error: 'Title and advice are required' },
        { status: 400 }
      );
    }

    // Validate flow if provided
    if (flow.length > 0) {
      const validFlows = ['sell', 'buy', 'browse'];
      const invalidFlows = flow.filter((f: string) => !validFlows.includes(f));
      if (invalidFlows.length > 0) {
        return NextResponse.json(
          { success: false, error: `Invalid flow(s): ${invalidFlows.join(', ')}` },
          { status: 400 }
        );
      }
    }

    console.log('📝 Adding agent advice:', title);

    // Generate embedding for semantic search
    const textToEmbed = `${title}. ${advice}`;
    console.log('⏳ Generating embedding...');
    const embedding = await getEmbedding(textToEmbed);
    console.log('✅ Embedding generated');

    // Store in Qdrant
    console.log('⏳ Storing in Qdrant...');
    const adviceId = await storeAgentAdvice(
      process.env.AGENT_ID!,
      title,
      advice,
      embedding,
      {
        tags,
        flow,
        conditions,
      }
    );

    console.log('✅ Stored in Qdrant with ID:', adviceId);

    return NextResponse.json({
      success: true,
      adviceId,
      message: 'Advice added successfully',
    });
  } catch (error) {
    console.error('❌ Error adding agent advice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}