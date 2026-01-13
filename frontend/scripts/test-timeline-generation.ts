#!/usr/bin/env npx ts-node
/**
 * Test script to verify timeline generation and advice flow
 * Run with: npx ts-node scripts/test-timeline-generation.ts
 *
 * Or use the curl commands at the bottom for quick API testing
 */

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = 'bob real estate'; // Change this to your client ID

interface TestUserInput {
  flow: 'buy' | 'sell' | 'browse';
  location?: string;
  budget?: string;
  timeline?: string;
  isFirstTimeBuyer?: boolean;
}

async function testTimelineGeneration() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TIMELINE GENERATION TEST');
  console.log('='.repeat(70));

  // Step 1: Fetch offer config
  console.log('\n📡 Step 1: Fetching offer config from MongoDB...\n');

  const configRes = await fetch(`${BASE_URL}/api/offer-config?clientId=${encodeURIComponent(CLIENT_ID)}`);
  const configData = await configRes.json();

  if (!configData.success) {
    console.error('❌ Failed to fetch config:', configData.error);
    return;
  }

  const { customPhases } = configData.config;

  console.log('Config loaded for:', configData.config.businessName);
  console.log('customPhases exists:', !!customPhases);

  if (customPhases) {
    console.log('\n📦 Custom Phases in MongoDB:');
    Object.entries(customPhases).forEach(([flow, phases]: [string, any]) => {
      console.log(`\n  Flow "${flow}":`);
      if (Array.isArray(phases)) {
        phases.forEach((phase: any, i: number) => {
          console.log(`    ${i + 1}. ${phase.name} (${phase.id})`);
          if (phase.actionableSteps) {
            phase.actionableSteps.forEach((step: any, j: number) => {
              const icon = step.inlineExperience ? '✅' : '❌';
              console.log(`       ${icon} Step ${j + 1}: "${step.title}"`);
              if (step.inlineExperience) {
                console.log(`          Advice: "${step.inlineExperience.substring(0, 80)}..."`);
              }
            });
          }
        });
      }
    });
  } else {
    console.log('\n⚠️  No customPhases found - will use default templates');
  }

  // Step 2: Simulate timeline generation (server-side test endpoint)
  console.log('\n\n' + '='.repeat(70));
  console.log('🔧 Step 2: Testing timeline generation...');
  console.log('='.repeat(70));

  const testInput: TestUserInput = {
    flow: 'buy',
    location: 'Halifax',
    budget: '$400,000-$600,000',
    timeline: '3-6 months',
    isFirstTimeBuyer: true,
  };

  console.log('\nTest User Input:', JSON.stringify(testInput, null, 2));

  // Call the test endpoint
  const genRes = await fetch(`${BASE_URL}/api/test-timeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      userInput: testInput,
    }),
  });

  if (!genRes.ok) {
    console.log('\n⚠️  Test endpoint not available. Creating it...');
    console.log('Run the server and try again after the endpoint is created.');
    return;
  }

  const genData = await genRes.json();

  console.log('\n📊 Generated Timeline:');
  console.log('Title:', genData.timeline?.title);
  console.log('Total time:', genData.timeline?.totalEstimatedTime);

  if (genData.timeline?.phases) {
    console.log('\n🎯 Phases with Advice Sources:');
    genData.timeline.phases.forEach((phase: any, i: number) => {
      console.log(`\n  ${i + 1}. ${phase.name}`);
      console.log(`     Timeline: ${phase.timeline}`);
      console.log(`     Agent Advice (${phase.agentAdvice?.length || 0} items):`);
      phase.agentAdvice?.forEach((advice: string, j: number) => {
        console.log(`       ${j + 1}. "${advice.substring(0, 70)}..."`);
      });
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Test complete!');
  console.log('='.repeat(70));
}

// Run the test
testTimelineGeneration().catch(console.error);

/*
 * ============================================================================
 * QUICK CURL COMMANDS (copy/paste into terminal)
 * ============================================================================
 *
 * 1. Check what's in MongoDB for your client:
 *
 * curl -s "http://localhost:3000/api/offer-config?clientId=bob%20real%20estate" | jq '.config.customPhases'
 *
 * 2. Check a specific flow's phases:
 *
 * curl -s "http://localhost:3000/api/offer-config?clientId=bob%20real%20estate" | jq '.config.customPhases.buy'
 *
 * 3. Check if inlineExperience is set on steps:
 *
 * curl -s "http://localhost:3000/api/offer-config?clientId=bob%20real%20estate" | jq '.config.customPhases.buy[].actionableSteps[] | {title, hasAdvice: (.inlineExperience != null)}'
 *
 * 4. Get full step details with advice:
 *
 * curl -s "http://localhost:3000/api/offer-config?clientId=bob%20real%20estate" | jq '.config.customPhases.buy[].actionableSteps[] | select(.inlineExperience != null) | {title, advice: .inlineExperience}'
 *
 */
