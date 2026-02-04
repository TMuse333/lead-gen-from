// app/api/diagnostics/stories/route.ts
// Diagnostic endpoint to debug story fetching issues

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // 1. Check authentication
    const session = await auth();
    diagnostics.checks.auth = {
      status: session?.user?.id ? 'OK' : 'FAILED',
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
    };

    if (!session?.user?.id) {
      return NextResponse.json({
        ...diagnostics,
        error: 'Not authenticated',
      });
    }

    // 2. Check MongoDB connection and config
    try {
      const collection = await getClientConfigsCollection();
      const config = await collection.findOne({ userId: session.user.id });

      diagnostics.checks.mongodb = {
        status: config ? 'OK' : 'NO_CONFIG',
        hasConfig: !!config,
        businessName: config?.businessName || null,
        qdrantCollectionName: config?.qdrantCollectionName || null,
      };

      if (!config) {
        return NextResponse.json({
          ...diagnostics,
          error: 'No client config found. User may need to complete onboarding.',
        });
      }

      const collectionName = config.qdrantCollectionName;

      if (!collectionName) {
        return NextResponse.json({
          ...diagnostics,
          error: 'No Qdrant collection configured',
        });
      }

      // 3. Check Qdrant connection
      try {
        const result = await qdrant.scroll(collectionName, {
          limit: 5,
          with_payload: true,
          with_vector: false,
        });

        diagnostics.checks.qdrant = {
          status: 'OK',
          collectionName,
          pointsFound: result.points.length,
          samplePoints: result.points.map(p => ({
            id: p.id,
            title: (p.payload as any)?.title,
            kind: (p.payload as any)?.kind,
          })),
        };
      } catch (qdrantError) {
        diagnostics.checks.qdrant = {
          status: 'FAILED',
          collectionName,
          error: qdrantError instanceof Error ? qdrantError.message : 'Unknown Qdrant error',
        };
      }
    } catch (mongoError) {
      diagnostics.checks.mongodb = {
        status: 'FAILED',
        error: mongoError instanceof Error ? mongoError.message : 'Unknown MongoDB error',
      };
    }

    // 4. Environment check
    diagnostics.checks.environment = {
      hasQdrantUrl: !!process.env.QDRANT_URL,
      hasQdrantApiKey: !!process.env.QDRANT_API_KEY,
      hasMongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      ...diagnostics,
      success: diagnostics.checks.auth.status === 'OK' &&
               diagnostics.checks.mongodb?.status === 'OK' &&
               diagnostics.checks.qdrant?.status === 'OK',
    });
  } catch (error) {
    return NextResponse.json({
      ...diagnostics,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
