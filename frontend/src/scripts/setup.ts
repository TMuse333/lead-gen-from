// scripts/setup-qdrant.ts

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import crypto from 'crypto';
import 'dotenv/config';
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

const COLLECTION_NAME = process.env.DB_NAME!;
const AGENT_ID = process.env.AGENT_ID || crypto.randomUUID();

// Import types
type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

interface ConditionRule {
  field: string;
  operator: MatchOperator;
  value: string | string[];
  weight?: number;
}

interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

interface SampleAdvice {
  title: string;
  advice: string;
  tags: string[];
  applicableWhen: {
    flow?: string[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
}

// Sample advice scenarios (PROPER FORMAT)
const ADVICE_SCENARIOS: SampleAdvice[] = [
  // ==================== SELLER ADVICE ====================
  {
    title: 'Urgent Relocation Selling Strategy',
    advice: `When relocating in under 3 months, the #1 mistake sellers make is waiting to declutter. Start immediately - I have a 2-week prep checklist that's helped 20+ families sell fast without stress. Also, price it right from day 1 - we don't have time for price drops in your situation.`,
    tags: ['selling', 'urgent', 'relocation'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'sellingReason', operator: 'equals', value: 'relocating', weight: 8 },
          ],
        },
      ],
      minMatchScore: 0.7,
    },
  },
  {
    title: 'Kitchen Renovation Value Impact',
    advice: `A quality kitchen renovation typically adds $15K-25K in Halifax's market. I've seen this consistently with 30+ recent sales. The key is highlighting it properly in photos and description - buyers will pay premium for move-in ready kitchens.`,
    tags: ['selling', 'renovation', 'valuation'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'renovations', operator: 'equals', value: 'kitchen' },
            { field: 'renovations', operator: 'equals', value: 'kitchen and bathroom' },
          ],
        },
      ],
    },
  },
  {
    title: 'Downsizing with Emotional Attachment',
    advice: `Selling the family home is an emotional process. Here's how we'll navigate this together: Take your time with the decision, start with one room at a time, and remember the right buyer will love this home as much as you did. I've helped dozens of families through this transition. We'll move at YOUR pace.`,
    tags: ['selling', 'downsizing', 'emotional-support'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'sellingReason', operator: 'equals', value: 'downsizing' },
          ],
        },
      ],
    },
  },
  {
    title: 'General Seller Market Timing Advice',
    advice: `Timing the market perfectly is nearly impossible. What matters more is your personal readiness. If inventory is low and days-on-market are short, it's generally a seller's market. We'll price strategically and market aggressively to maximize your outcome regardless of broader market conditions.`,
    tags: ['selling', 'market', 'timing', 'general'],
    applicableWhen: {
      flow: ['sell'],
      // No ruleGroups - applies to all sellers
    },
  },

  // ==================== BUYER ADVICE ====================
  {
    title: 'First-Time Buyer Essentials',
    advice: `First-time buyers often get overwhelmed by the process. My advice: focus on 3 things in this order: 1) Get pre-approved (not just pre-qualified), 2) Identify your must-haves vs nice-to-haves, 3) Be ready to move fast - in Halifax's market, good homes go in days, not weeks.`,
    tags: ['buying', 'first-time', 'education'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'buyingReason', operator: 'equals', value: 'first-home', weight: 10 },
          ],
        },
      ],
    },
  },
  {
    title: 'Urgent Buyer Strategy',
    advice: `With your 0-3 month timeline, we need to act quickly but smartly. I have 3 off-market opportunities I can show you this week. Get your financing locked in ASAP. In this market, being ready to make a decision within 24 hours is crucial.`,
    tags: ['buying', 'urgent', 'strategy'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'timeline', operator: 'includes', value: ['0-3', '3-6'], weight: 10 },
          ],
        },
      ],
    },
  },
  {
    title: 'Downsizing Buyer Advice',
    advice: `Downsizing often means upgrading your lifestyle - less maintenance, more freedom. Focus on location and low-maintenance features. Condos and townhouses in established neighborhoods are perfect for this transition.`,
    tags: ['buying', 'downsizing', 'lifestyle'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'buyingReason', operator: 'equals', value: 'downsize' },
          ],
        },
      ],
    },
  },

  // ==================== BROWSER ADVICE ====================
  {
    title: 'Market Trends Overview',
    advice: `Halifax's market has seen consistent 8% year-over-year growth, driven by low inventory and strong demand. Understanding these trends now helps you make informed decisions when you're ready to enter the market.`,
    tags: ['market', 'trends', 'education'],
    applicableWhen: {
      flow: ['browse'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'interest', operator: 'equals', value: 'market-trends' },
          ],
        },
      ],
    },
  },
  {
    title: 'Investment Property Analysis',
    advice: `Halifax's rental market is thriving with 5.2% average yields in the $600K-$800K range. Multi-family and downtown condos offer the best ROI. I can provide detailed cash flow projections and connect you with property managers.`,
    tags: ['investment', 'rental', 'analysis'],
    applicableWhen: {
      flow: ['browse'],
      ruleGroups: [
        {
          logic: 'AND',
          rules: [
            { field: 'interest', operator: 'equals', value: 'investment' },
          ],
        },
      ],
    },
  },

  // ==================== UNIVERSAL ADVICE ====================
  {
    title: 'Halifax Real Estate Market Fundamentals',
    advice: `Halifax continues to be one of Canada's most resilient real estate markets. Low inventory, growing population, and strong employment make it attractive for both buyers and sellers. Understanding local neighborhood dynamics is crucial.`,
    tags: ['general', 'market', 'halifax'],
    applicableWhen: {
      flow: ['sell', 'buy', 'browse'],
      // No ruleGroups - universal advice
    },
  },
];

async function main() {
  try {
    console.log('🚀 Starting Qdrant setup with PROPER RuleGroup FORMAT...\n');

    // Step 1-4: Same as before (connection, collection creation, OpenAI test)
    console.log('📡 Testing Qdrant connection...');
    console.log('\n📦 Checking for existing collection...');
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(col => col.name === COLLECTION_NAME);

    if (exists) {
      console.log(`⚠️  Collection "${COLLECTION_NAME}" already exists`);
      const answer = 'yes';
      if (answer === 'yes') {
        console.log('🗑️  Deleting existing collection...');
        await qdrant.deleteCollection(COLLECTION_NAME);
        console.log('✅ Collection deleted');
      } else {
        console.log('❌ Aborted - collection already exists');
        return;
      }
    }

    console.log('\n🏗️  Creating collection...');
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });
    console.log('✅ Collection created');

    console.log('\n🤖 Testing OpenAI connection...');
    const testEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'test',
    });
    console.log('✅ OpenAI is working');

    // Step 5: Add advice scenarios with PROPER applicableWhen structure
    console.log('\n💾 Adding agent advice scenarios with RuleGroup format...');
    for (let i = 0; i < ADVICE_SCENARIOS.length; i++) {
      const advice = ADVICE_SCENARIOS[i];
      console.log(`\n[${i + 1}/${ADVICE_SCENARIOS.length}] Processing: "${advice.title}"`);

      // Generate embedding
      const textToEmbed = `${advice.title}. ${advice.advice}`;
      console.log('  ⏳ Generating embedding...');
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: textToEmbed,
      });
      const embedding = embeddingResponse.data[0].embedding;
      console.log(`  ✅ Embedding generated (${embedding.length} dimensions)`);

      // Store in Qdrant with applicableWhen
      console.log('  ⏳ Storing in Qdrant...');
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: crypto.randomUUID(),
            vector: embedding,
            payload: {
              agentId: AGENT_ID,
              title: advice.title,
              advice: advice.advice,
              tags: advice.tags,
              applicableWhen: advice.applicableWhen, // Store the full applicableWhen object
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              usageCount: 0,
            },
          },
        ],
      });
      console.log('  ✅ Stored in Qdrant');
    }

    // Step 6-7: Verification and testing (same as before)
    console.log('\n🔍 Verifying stored data...');
    const scrollResult = await qdrant.scroll(COLLECTION_NAME, {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });
    console.log(`✅ Found ${scrollResult.points.length} advice pieces in collection`);

    console.log('\n🔎 Testing semantic search...');
    const testQuery = "I need to sell my house quickly because I'm relocating";
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
      const applicableWhen = result.payload?.applicableWhen as any;
      console.log(`\n   ${idx + 1}. Score: ${result.score.toFixed(3)}`);
      console.log(`      Title: ${result.payload?.title}`);
      console.log(`      Flow: ${applicableWhen?.flow?.join(', ') || 'N/A'}`);
      console.log(`      Tags: ${(result.payload?.tags as string[]).join(', ')}`);
      if (applicableWhen?.ruleGroups) {
        console.log(`      Rule Groups: ${JSON.stringify(applicableWhen.ruleGroups, null, 2)}`);
      }
    });

    console.log('\n\n🎉 Setup complete! Qdrant is ready with RuleGroup format.');
    console.log('\n📊 Summary:');
    console.log(`   • Collection: ${COLLECTION_NAME}`);
    console.log(`   • Agent ID: ${AGENT_ID}`);
    console.log(`   • Advice pieces: ${scrollResult.points.length}`);
    console.log(`   • Vector dimensions: 1536`);
    console.log(`   • Distance metric: Cosine`);
    console.log(`   • Format: applicableWhen with RuleGroups`);
    console.log('\n✅ You can now run your app and it will use this advice!');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Tip: Make sure Qdrant is running!');
        console.log('   Docker: docker run -p 6333:6333 qdrant/qdrant');
        console.log('   Or use Qdrant Cloud: https://cloud.qdrant.io');
      } else if (error.message.includes('API key')) {
        console.log('\n💡 Tip: Check your OPENAI_KEY in .env');
      }
    }
    process.exit(1);
  }
}

main();