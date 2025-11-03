// ============================================
// API ROUTE: /api/add-agent-advice
// Handles adding agent advice from frontend uploader
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { storeAgentAdvice } from '@/lib/qdrant/qdrant';
import { getEmbedding } from '@/lib/openai/embedding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scenario,
      advice,
      tags = [],
      propertyTypes = [],
      sellingReasons = [],
      timelines = [],
    } = body;

    // Validate required fields
    if (!scenario || !advice) {
      return NextResponse.json(
        { success: false, error: 'Scenario and advice are required' },
        { status: 400 }
      );
    }

    console.log('📝 Adding agent advice:', scenario);

    // Generate embedding for semantic search
    const textToEmbed = `${scenario}. ${advice}`;
    console.log('⏳ Generating embedding...');
    const embedding = await getEmbedding(textToEmbed);
    console.log('✅ Embedding generated');

    // Store in Qdrant
    console.log('⏳ Storing in Qdrant...');
    const adviceId = await storeAgentAdvice(
      '82ae0d4d-c3d7-4997-bc7b-12b2261d167e', // TODO: Get from session/auth when multi-agent
      scenario,
      advice,
      embedding,
      {
        tags,
        propertyType: propertyTypes,
        sellingReason: sellingReasons,
        timeline: timelines,
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