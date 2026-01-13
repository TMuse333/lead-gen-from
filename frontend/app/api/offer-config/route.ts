// app/api/offer-config/route.ts
// Simple endpoint to get offer configuration for client-side generation
// No LLM calls - just returns config data from MongoDB

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

/**
 * GET /api/offer-config
 *
 * Query params:
 * - clientId: (optional) Business name for public bot access
 *
 * Returns config needed for client-side offer generation:
 * - businessName
 * - agentProfile
 * - storyMappings
 * - selectedOffers
 * - qdrantCollectionName (for story fetching)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let config: any = null;

    // Priority 1: clientId for public bot access
    if (clientId) {
      const collection = await getClientConfigsCollection();
      config = await collection.findOne({ businessName: clientId, isActive: true });
    } else {
      // Priority 2: Authenticated user's config
      const session = await auth();
      if (session?.user?.id) {
        const collection = await getClientConfigsCollection();
        config = await collection.findOne({ userId: session.user.id });
      }
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Debug: Log custom phases from MongoDB
    console.log('\n' + '='.repeat(60));
    console.log('📡 [offer-config API] Fetching config for:', clientId || 'authenticated user');
    console.log('='.repeat(60));
    console.log('customPhases in MongoDB:', config.customPhases ? 'EXISTS' : 'NOT FOUND');

    if (config.customPhases) {
      Object.entries(config.customPhases).forEach(([flow, phases]: [string, any]) => {
        console.log(`\n  Flow "${flow}": ${Array.isArray(phases) ? phases.length : 0} phases`);
        if (Array.isArray(phases)) {
          phases.forEach((phase: any, i: number) => {
            console.log(`    Phase ${i + 1}: ${phase.name}`);
            if (phase.actionableSteps) {
              phase.actionableSteps.forEach((step: any) => {
                const hasAdvice = step.inlineExperience ? '✅' : '❌';
                console.log(`      ${hasAdvice} Step: "${step.title}" - inlineExperience: ${step.inlineExperience ? 'SET' : 'NOT SET'}`);
              });
            }
          });
        }
      });
    }

    // Return only what's needed for client-side generation
    return NextResponse.json({
      success: true,
      config: {
        businessName: config.businessName,
        agentProfile: config.agentProfile || null,
        storyMappings: config.storyMappings || {},
        selectedOffers: config.selectedOffers || [],
        qdrantCollectionName: config.qdrantCollectionName,
        colorConfig: config.colorConfig || null,
        customPhases: config.customPhases || null, // Custom phase configurations
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
