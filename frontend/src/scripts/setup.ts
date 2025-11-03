// ============================================
// QDRANT SETUP & TEST SCRIPT
// ============================================
// Simple script to test Qdrant connection and add agent advice
// Run with: npx tsx scripts/setup-qdrant.ts

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import crypto from 'crypto'
import 'dotenv/config'
import dotenv from 'dotenv';


dotenv.config({ path: '../../.env' });
// Initialize clients
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const COLLECTION_NAME = 'chris-crowell-lead-form';
const AGENT_ID = crypto.randomUUID();

// Sample advice scenarios
const ADVICE_SCENARIOS = [
  {
    scenario: 'First-time seller worried about market timing',
    advice: `Timing the market perfectly is nearly impossible, even for experienced investors. What matters more is your personal readiness and motivation. If you need to sell due to life circumstances (job relocation, upsizing, downsizing), waiting for the "perfect" market can mean missing out on life opportunities.

That said, we can look at current market indicators to make an informed decision. If inventory is low and days-on-market are short, it's generally a seller's market. We'll price strategically and market aggressively to maximize your outcome regardless of broader market conditions.`,
    tags: ['timing', 'first_time_seller', 'market_concerns'],
    propertyType: ['house', 'condo', 'townhouse'],
    sellingReason: ['exploring', 'lifestyle'],
  },
  {
    scenario: 'Homeowner considering renovations before selling',
    advice: `Not all renovations provide equal return on investment. In Halifax's current market, focus on these high-ROI updates:

1. Fresh paint (neutral colors) - typically 100%+ ROI
2. Kitchen updates (not full reno) - new hardware, lighting, backsplash
3. Curb appeal - landscaping, front door, exterior touch-ups
4. Deep cleaning and decluttering - massive impact, minimal cost

AVOID major renovations like full kitchen/bathroom gut jobs that won't recoup costs. My rule: Don't spend more than 2-3% of your home's value on pre-sale updates.`,
    tags: ['renovations', 'pre_sale_prep', 'roi'],
    propertyType: ['house', 'townhouse'],
    sellingReason: ['upsizing', 'downsizing', 'investment'],
  },
  {
    scenario: 'Urgent sale needed within 3 months',
    advice: `With a tight timeline, we need to be strategic and move quickly. Here's our action plan:

Week 1-2: Property preparation - professional photos, minor repairs, staging, decluttering
Week 3-4: Marketing blitz - MLS listing, social media, email to buyer database, open houses
Week 5-8: Negotiations and closing - review offers quickly, be flexible on possession date

Pro tip: Price it 3-5% below market value to generate multiple offers quickly. Multiple offers often drive the price back up, and you'll sell faster with less stress.`,
    tags: ['urgent_sale', 'quick_timeline', 'strategy'],
    propertyType: ['house', 'condo', 'townhouse', 'multi_unit'],
    sellingReason: ['relocating', 'investment'],
  },
  {
    scenario: 'Downsizing empty nesters concerned about emotional attachment',
    advice: `Selling the family home is an emotional process. Here's how we'll navigate this together:

1. Take your time with the decision - no rush if you're exploring
2. Start with one room at a time - don't try to pack 20+ years of memories in a weekend
3. The right buyer will love this home as much as you did
4. Downsizing often means upgrading your lifestyle - less maintenance, more freedom

I've helped dozens of families through this transition. We'll move at YOUR pace, and I'll be here to support you through every step.`,
    tags: ['downsizing', 'emotional_support', 'empty_nesters', 'lifestyle_change'],
    propertyType: ['house'],
    sellingReason: ['downsizing', 'lifestyle'],
  },
  {
    scenario: 'Investor looking to maximize profit on rental property',
    advice: `As an investor, you're focused on the numbers - let's maximize your return:

1. TIMING: Review your capital gains tax situation with your accountant
2. CONDITION: Professional cleaning, minor repairs, don't over-improve
3. MARKETING: Highlight rental income potential, provide rent rolls, target investor buyers
4. PRICING: Price at 90-95% of market value for quick sale. Time on market costs you rental income.

Bottom line: Treat this as a business transaction. Speed and net proceeds matter more than list price.`,
    tags: ['investor', 'rental_property', 'profit_maximization', 'strategy'],
    propertyType: ['condo', 'townhouse', 'multi_unit'],
    sellingReason: ['investment'],
  },
];

async function main() {
  try {
    console.log('🚀 Starting Qdrant setup...\n');

    // Step 1: Test connection
    console.log('📡 Testing Qdrant connection...');
    // const health = await qdrant.api('cluster').clusterStatus();
    // console.log('✅ Qdrant is healthy:', health.status);

    // Step 2: Check if collection exists
    console.log('\n📦 Checking for existing collection...');
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(col => col.name === COLLECTION_NAME);

    if (exists) {
      console.log(`⚠️  Collection "${COLLECTION_NAME}" already exists`);
      const answer = 'yes'; // In production, you'd prompt the user
      if (answer === 'yes') {
        console.log('🗑️  Deleting existing collection...');
        await qdrant.deleteCollection(COLLECTION_NAME);
        console.log('✅ Collection deleted');
      } else {
        console.log('❌ Aborted - collection already exists');
        return;
      }
    }

    // Step 3: Create collection
    console.log('\n🏗️  Creating collection...');
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536, // OpenAI ada-002 embedding size
        distance: 'Cosine',
      },
    });
    console.log('✅ Collection created');

    // Step 4: Test OpenAI connection
    console.log('\n🤖 Testing OpenAI connection...');
    const testEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'test',
    });
    console.log('✅ OpenAI is working');

    // Step 5: Add advice scenarios
    console.log('\n💾 Adding agent advice scenarios...');
    
    for (let i = 0; i < ADVICE_SCENARIOS.length; i++) {
      const advice = ADVICE_SCENARIOS[i];
      
      console.log(`\n[${i + 1}/${ADVICE_SCENARIOS.length}] Processing: "${advice.scenario}"`);
      
      // Generate embedding
      const textToEmbed = `${advice.scenario}. ${advice.advice}`;
      console.log('  ⏳ Generating embedding...');
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: textToEmbed,
      });
      const embedding = embeddingResponse.data[0].embedding;
      console.log(`  ✅ Embedding generated (${embedding.length} dimensions)`);

      // Store in Qdrant
      console.log('  ⏳ Storing in Qdrant...');
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: crypto.randomUUID(),
            vector: embedding,
            payload: {
              agentId: AGENT_ID,
              scenario: advice.scenario,
              advice: advice.advice,
              tags: advice.tags,
              propertyType: advice.propertyType,
              sellingReason: advice.sellingReason,
              createdAt: new Date().toISOString(),
            },
          },
        ],
      });
      console.log('  ✅ Stored in Qdrant');
    }

    // Step 6: Verify data
    console.log('\n🔍 Verifying stored data...');
    const scrollResult = await qdrant.scroll(COLLECTION_NAME, {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });
    console.log(`✅ Found ${scrollResult.points.length} advice pieces in collection`);

    // Step 7: Test search
    console.log('\n🔎 Testing semantic search...');
    const testQuery = "I'm worried about selling my house in the current market";
    console.log(`   Query: "${testQuery}"`);
    
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: testQuery,
    });
    
    const searchResults = await qdrant.search(COLLECTION_NAME, {
      vector: queryEmbedding.data[0].embedding,
      limit: 3,
      with_payload: true,
    });

    console.log('\n   Top 3 relevant advice pieces:');
    searchResults.forEach((result, idx) => {
      console.log(`\n   ${idx + 1}. Score: ${result.score.toFixed(3)}`);
      console.log(`      Scenario: ${result.payload?.scenario}`);
      console.log(`      Tags: ${(result.payload?.tags as string[]).join(', ')}`);
    });

    console.log('\n\n🎉 Setup complete! Qdrant is ready to use.');
    console.log('\n📊 Summary:');
    console.log(`   • Collection: ${COLLECTION_NAME}`);
    console.log(`   • Agent ID: ${AGENT_ID}`);
    console.log(`   • Advice pieces: ${scrollResult.points.length}`);
    console.log(`   • Vector dimensions: 1536`);
    console.log(`   • Distance metric: Cosine`);
    
    console.log('\n✅ You can now run your form and it will use this advice!');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Tip: Make sure Qdrant is running!');
        console.log('   Docker: docker run -p 6333:6333 qdrant/qdrant');
        console.log('   Or use Qdrant Cloud: https://cloud.qdrant.io');
      } else if (error.message.includes('API key')) {
        console.log('\n💡 Tip: Check your OPENAI_KEY in .env.local');
      }
    }
    
    process.exit(1);
  }
}

// Run the script
main();