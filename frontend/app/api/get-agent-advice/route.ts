// ============================================
// API ROUTE: /api/get-agent-advice
// Fetch all agent advice from Qdrant
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';

export const runtime = "nodejs"; // Ensure Node.js runtime

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log(`📋 Fetching advice for agent: ${agentId || 'ALL'}`);
    console.log(`📦 Using collection: ${COLLECTION_NAME}`);

    // Fetch from Qdrant
    const response = await client.scroll(COLLECTION_NAME, {
      limit,
      with_payload: true,
      with_vector: false,
    });

    console.log(`✅ Found ${response.points.length} points`);

    // Transform to friendly format
    const adviceList = response.points
      .filter((point) => {
        // Filter by agentId if provided
        if (agentId && point.payload?.agentId !== agentId) {
          return false;
        }
        return true;
      })
      .map((point) => ({
        id: point.id,
        scenario: point.payload?.scenario as string,
        advice: point.payload?.advice as string,
        tags: (point.payload?.tags as string[]) || [],
        propertyType: (point.payload?.propertyType as string[]) || [],
        sellingReason: (point.payload?.sellingReason as string[]) || [],
        timeline: (point.payload?.timeline as string[]) || [],
        createdAt: point.payload?.createdAt as string,
      }));

    return NextResponse.json({
      success: true,
      count: adviceList.length,
      advice: adviceList,
    });

  } catch (error) {
    console.error('❌ Error fetching agent advice:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adviceId = searchParams.get('id');

    if (!adviceId) {
      return NextResponse.json(
        { success: false, error: 'Advice ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️  Deleting advice: ${adviceId}`);

    await client.delete(COLLECTION_NAME, {
      wait: true,
      points: [adviceId],
    });

    console.log('✅ Advice deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Advice deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error deleting advice:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}