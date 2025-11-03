// ============================================
// API ROUTE: /api/debug-qdrant
// Debug endpoint to see what's actually in Qdrant
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { qdrantClient } from '@/lib/qdrant/qdrant';

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging Qdrant collection:', COLLECTION_NAME);

    // Get collection info
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log('Collection info:', collectionInfo);

    // Scroll through ALL points without any filter
    const result = await qdrantClient.scroll(COLLECTION_NAME, {
      limit: 5, // Just get first 5 points
      with_payload: true,
      with_vector: false,
    });

    console.log(`Found ${result.points.length} points`);

    // Show the raw structure of the first point
    const samplePoint = result.points[0];
    console.log('Sample point structure:', JSON.stringify(samplePoint, null, 2));

    return NextResponse.json({
      success: true,
      collection: {
        name: COLLECTION_NAME,
        pointsCount: collectionInfo.points_count,
        vectorSize: collectionInfo.config.params.vectors.size,
      },
      samplePoints: result.points.map(point => ({
        id: point.id,
        payload: point.payload,
        payloadKeys: point.payload ? Object.keys(point.payload) : [],
      })),
      rawSamplePoint: samplePoint,
    });

  } catch (error) {
    console.error('❌ Error debugging Qdrant:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}