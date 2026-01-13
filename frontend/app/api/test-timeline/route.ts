// app/api/test-timeline/route.ts
// Test endpoint to run timeline generation server-side and see logs in terminal
// DELETE THIS FILE before production!

import { NextRequest, NextResponse } from 'next/server';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { generateFastTimeline } from '@/lib/offers/definitions/timeline/fast-timeline-generator';
import type { CustomPhaseConfig, TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { clientId, userInput } = await request.json();

    console.log('\n' + '🧪'.repeat(30));
    console.log('TEST TIMELINE GENERATION ENDPOINT');
    console.log('🧪'.repeat(30));

    // Fetch config from MongoDB
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ businessName: clientId, isActive: true });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    console.log('\n📡 Config loaded for:', config.businessName);
    console.log('customPhases exists:', !!config.customPhases);

    // Get custom phases for the flow
    const flow = userInput.flow as TimelineFlow;
    const customPhases = config.customPhases?.[flow] as CustomPhaseConfig[] | undefined;

    console.log(`\nFlow: ${flow}`);
    console.log(`Custom phases for this flow: ${customPhases?.length || 0}`);

    if (customPhases && customPhases.length > 0) {
      console.log('\n📦 RAW customPhases from MongoDB:');
      customPhases.forEach((phase, i) => {
        console.log(`\n  Phase ${i + 1}: ${phase.name} (${phase.id})`);
        phase.actionableSteps?.forEach((step, j) => {
          const icon = step.inlineExperience ? '✅' : '❌';
          console.log(`    ${icon} Step ${j + 1}: "${step.title}"`);
          if (step.inlineExperience) {
            console.log(`       └─ inlineExperience: "${step.inlineExperience.substring(0, 100)}..."`);
          }
        });
      });
    }

    // Generate timeline
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CALLING generateFastTimeline()...');
    console.log('='.repeat(60));

    const timeline = generateFastTimeline(
      {
        flow: userInput.flow,
        location: userInput.location,
        budget: userInput.budget,
        timeline: userInput.timeline,
        isFirstTimeBuyer: userInput.isFirstTimeBuyer,
      },
      customPhases
    );

    console.log('\n' + '='.repeat(60));
    console.log('✅ GENERATION COMPLETE');
    console.log('='.repeat(60));

    // Summary of advice sources
    console.log('\n📊 ADVICE SOURCE SUMMARY:');
    timeline.phases.forEach((phase, i) => {
      console.log(`  ${i + 1}. ${phase.name}: ${phase.agentAdvice?.length || 0} advice items`);
    });

    return NextResponse.json({
      success: true,
      timeline,
      debug: {
        customPhasesFound: !!customPhases,
        customPhasesCount: customPhases?.length || 0,
        flow,
      },
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
