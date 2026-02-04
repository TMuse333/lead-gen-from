// scripts/analyze-chris-timeline.ts
// Analyze Chris Crowell's timeline and generate recommended stories/advice

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || '';

interface ActionableStep {
  id: string;
  title: string;
  description?: string;
  priority: string;
  order: number;
  linkedStoryId?: string;
  inlineExperience?: string;
}

interface Phase {
  id: string;
  name: string;
  timeline: string;
  description: string;
  order: number;
  isOptional: boolean;
  actionableSteps: ActionableStep[];
}

// Story recommendations based on common real estate scenarios
const STORY_RECOMMENDATIONS: Record<string, { phase: string; recommendations: string[] }> = {
  'financial-prep': {
    phase: 'Financial Preparation',
    recommendations: [
      'Story about helping a client improve their credit score before buying',
      'Experience with a client who thought they couldn\'t afford a home but found creative financing options',
      'Story about helping first-time buyers understand the true costs beyond the down payment',
      'Example of pre-approval success that helped win a competitive offer',
    ],
  },
  'find-agent': {
    phase: 'Finding an Agent',
    recommendations: [
      'Story about how your local expertise helped a client find a hidden gem',
      'Experience with an out-of-town buyer you guided through the process remotely',
      'Example of how your negotiation skills saved a client money',
    ],
  },
  'house-hunting': {
    phase: 'House Hunting',
    recommendations: [
      'Story about helping a client refine their must-haves vs nice-to-haves',
      'Experience finding the perfect home after a client was discouraged',
      'Example of identifying red flags during showings that saved a client from a bad purchase',
      'Story about helping a family find the right school district',
    ],
  },
  'make-offer': {
    phase: 'Making an Offer',
    recommendations: [
      'Story about winning in a multiple-offer situation',
      'Experience with creative offer terms that made your client stand out',
      'Example of knowing when to walk away from a deal',
      'Story about successful negotiation that got the client under asking price',
    ],
  },
  'under-contract': {
    phase: 'Under Contract',
    recommendations: [
      'Story about navigating tricky inspection findings',
      'Experience renegotiating after appraisal came in low',
      'Example of managing contingencies and deadlines smoothly',
      'Story about coordinating repairs before closing',
    ],
  },
  'closing': {
    phase: 'Closing',
    recommendations: [
      'Story about resolving last-minute title issues',
      'Experience with a smooth closing process and what made it work',
      'Example of helping a nervous first-time buyer through closing day',
      'Story about coordinating simultaneous buy/sell transactions',
    ],
  },
  'prepare-home': {
    phase: 'Preparing Home for Sale',
    recommendations: [
      'Story about staging that dramatically increased sale price',
      'Experience with cost-effective improvements that boosted value',
      'Example of decluttering/depersonalizing transformation',
      'Story about professional photography making a difference',
    ],
  },
  'list-property': {
    phase: 'Listing the Property',
    recommendations: [
      'Story about pricing strategy that generated multiple offers',
      'Experience with marketing that attracted the right buyers',
      'Example of timing the market effectively',
    ],
  },
  'review-offers': {
    phase: 'Reviewing Offers',
    recommendations: [
      'Story about choosing the right offer (not always the highest)',
      'Experience managing multiple offers professionally',
      'Example of negotiating favorable terms for a seller',
    ],
  },
};

async function analyzeChrisTimeline() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('agent_lead_gen');
    const collection = db.collection('client_configs');

    // Find Chris's config
    const chris = await collection.findOne({ businessName: 'chris-crowell-real-estate' });

    if (!chris) {
      console.log('❌ Chris Crowell config not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('📊 CHRIS CROWELL TIMELINE ANALYSIS');
    console.log('='.repeat(80));
    console.log(`\nBusiness: ${chris.businessName}`);
    console.log(`Agent: ${chris.agentFirstName} ${chris.agentLastName || ''}`);
    console.log(`Email: ${chris.notificationEmail}`);
    console.log(`Qdrant Collection: ${chris.qdrantCollectionName}`);

    // Analyze each flow
    const flows = ['buy', 'sell', 'browse'] as const;

    const allRecommendations: { flow: string; phase: string; phaseName: string; currentStories: number; recommendations: string[] }[] = [];

    for (const flow of flows) {
      const phases = chris.customPhases?.[flow] as Phase[] | undefined;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 ${flow.toUpperCase()} FLOW`);
      console.log('='.repeat(80));

      if (!phases || phases.length === 0) {
        console.log('   No custom phases configured (using defaults)');
        continue;
      }

      console.log(`\n   Found ${phases.length} phases:\n`);

      for (const phase of phases) {
        const stepsWithStories = phase.actionableSteps.filter(s => s.linkedStoryId).length;
        const stepsWithTips = phase.actionableSteps.filter(s => s.inlineExperience).length;

        console.log(`   📌 ${phase.name} (${phase.id})`);
        console.log(`      Timeline: ${phase.timeline}`);
        console.log(`      Action Steps: ${phase.actionableSteps.length}`);
        console.log(`      Steps with Stories: ${stepsWithStories}`);
        console.log(`      Steps with Tips: ${stepsWithTips}`);

        // List action steps
        phase.actionableSteps.forEach((step, idx) => {
          const hasStory = step.linkedStoryId ? '📖' : '  ';
          const hasTip = step.inlineExperience ? '💡' : '  ';
          console.log(`         ${idx + 1}. ${hasStory}${hasTip} ${step.title}`);
        });

        // Get recommendations for this phase
        const recs = STORY_RECOMMENDATIONS[phase.id];
        if (recs && stepsWithStories < phase.actionableSteps.length) {
          allRecommendations.push({
            flow,
            phase: phase.id,
            phaseName: phase.name,
            currentStories: stepsWithStories,
            recommendations: recs.recommendations,
          });
        }

        console.log('');
      }
    }

    // Print recommendations summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDED STORIES FOR CHRIS TO ADD');
    console.log('='.repeat(80));

    if (allRecommendations.length === 0) {
      console.log('\n   All phases have stories linked! 🎉');
    } else {
      allRecommendations.forEach(rec => {
        console.log(`\n📌 ${rec.phaseName} (${rec.flow} flow)`);
        console.log(`   Current stories: ${rec.currentStories}`);
        console.log(`   Suggested stories to add:`);
        rec.recommendations.forEach((r, idx) => {
          console.log(`      ${idx + 1}. ${r}`);
        });
      });
    }

    // Generate formatted output for notification
    console.log('\n' + '='.repeat(80));
    console.log('📧 FORMATTED RECOMMENDATIONS FOR CHRIS');
    console.log('='.repeat(80));
    console.log(`
Hey Chris!

To make your chatbot timeline more personalized and engaging, here are some story/experience suggestions you could add to your knowledge base:

${allRecommendations.map(rec => `
**${rec.phaseName}** (${rec.flow} flow):
${rec.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
`).join('\n')}

These stories will appear as "Pro Tips" in your timeline results, showing leads that you have real experience helping clients in similar situations.

To add a story:
1. Go to your Dashboard → Knowledge Base
2. Click "Add Story"
3. Fill in the Situation, What You Did, and Outcome
4. Tag it with relevant keywords

Let me know if you have questions!
`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

analyzeChrisTimeline();
