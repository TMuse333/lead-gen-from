// scripts/analyze-chris-full.ts
// Full analysis of Chris Crowell's account including Qdrant knowledge base

import { MongoClient } from 'mongodb';
import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || '';
const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

// Default phase structure for buy flow
const DEFAULT_BUY_PHASES = [
  { id: 'financial-prep', name: 'Financial Preparation', description: 'Get your finances ready for home buying' },
  { id: 'find-agent', name: 'Find an Agent', description: 'Connect with a real estate professional' },
  { id: 'house-hunting', name: 'House Hunting', description: 'Search for your perfect home' },
  { id: 'make-offer', name: 'Make an Offer', description: 'Submit your offer on a property' },
  { id: 'under-contract', name: 'Under Contract', description: 'Navigate inspections and contingencies' },
  { id: 'closing', name: 'Closing', description: 'Finalize your home purchase' },
];

const DEFAULT_SELL_PHASES = [
  { id: 'financial-prep', name: 'Financial Preparation', description: 'Understand your selling position' },
  { id: 'find-agent', name: 'Find an Agent', description: 'Connect with a listing agent' },
  { id: 'prepare-home', name: 'Prepare Home', description: 'Get your home ready for sale' },
  { id: 'list-property', name: 'List Property', description: 'Put your home on the market' },
  { id: 'review-offers', name: 'Review Offers', description: 'Evaluate and negotiate offers' },
  { id: 'closing', name: 'Closing', description: 'Finalize the sale' },
];

// Story recommendations for each phase
const STORY_RECOMMENDATIONS: Record<string, string[]> = {
  'financial-prep': [
    '💰 Story about helping a client improve their credit score before buying',
    '💰 Experience with creative financing options for first-time buyers',
    '💰 Story about helping buyers understand true costs beyond down payment',
    '💰 Example of pre-approval success that helped win a competitive offer',
  ],
  'find-agent': [
    '🤝 Story about how your local Halifax expertise helped find a hidden gem',
    '🤝 Experience guiding an out-of-town buyer through the process',
    '🤝 Example of how your negotiation skills saved a client money',
  ],
  'house-hunting': [
    '🏠 Story about helping a client refine must-haves vs nice-to-haves',
    '🏠 Experience finding the perfect home after client was discouraged',
    '🏠 Example of identifying red flags during showings',
    '🏠 Story about helping a family find the right neighborhood/school',
  ],
  'make-offer': [
    '📝 Story about winning in a multiple-offer situation in Halifax',
    '📝 Experience with creative offer terms that made your client stand out',
    '📝 Example of knowing when to walk away from a deal',
    '📝 Story about successful negotiation below asking price',
  ],
  'under-contract': [
    '🔍 Story about navigating tricky inspection findings',
    '🔍 Experience renegotiating after appraisal came in low',
    '🔍 Example of managing contingencies and deadlines smoothly',
  ],
  'closing': [
    '🎉 Story about resolving last-minute issues before closing',
    '🎉 Experience with a smooth closing and what made it work',
    '🎉 Example of helping a nervous first-time buyer through closing day',
  ],
  'prepare-home': [
    '🛠️ Story about staging that dramatically increased sale price',
    '🛠️ Experience with cost-effective improvements that boosted value',
    '🛠️ Example of decluttering transformation',
  ],
  'list-property': [
    '📸 Story about pricing strategy that generated multiple offers',
    '📸 Experience with marketing that attracted the right buyers',
  ],
  'review-offers': [
    '📋 Story about choosing the right offer (not always the highest)',
    '📋 Experience managing multiple offers professionally',
  ],
};

async function analyzeChrisFull() {
  const mongoClient = new MongoClient(MONGODB_URI);
  const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
  });

  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoClient.db('agent_lead_gen');
    const collection = db.collection('client_configs');

    // Find Chris's config
    const chris = await collection.findOne({ businessName: 'chris-crowell-real-estate' });

    if (!chris) {
      console.log('❌ Chris Crowell config not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('📊 CHRIS CROWELL - FULL ACCOUNT ANALYSIS');
    console.log('='.repeat(80));
    console.log(`\n👤 Agent: ${chris.agentFirstName} ${chris.agentLastName || ''}`);
    console.log(`📧 Email: ${chris.notificationEmail}`);
    console.log(`🏢 Business: ${chris.businessName}`);
    console.log(`📚 Qdrant Collection: ${chris.qdrantCollectionName}`);

    // Check Qdrant knowledge base
    console.log('\n' + '='.repeat(80));
    console.log('📚 CURRENT KNOWLEDGE BASE CONTENTS');
    console.log('='.repeat(80));

    let existingStories: any[] = [];
    try {
      const collectionInfo = await qdrantClient.getCollection(chris.qdrantCollectionName);
      console.log(`\n   Collection exists with ${collectionInfo.points_count} points`);

      // Fetch all points
      const scrollResult = await qdrantClient.scroll(chris.qdrantCollectionName, {
        limit: 100,
        with_payload: true,
      });

      existingStories = scrollResult.points || [];

      if (existingStories.length === 0) {
        console.log('\n   ⚠️  No stories/advice found in knowledge base');
      } else {
        console.log(`\n   Found ${existingStories.length} items:\n`);
        existingStories.forEach((point, idx) => {
          const payload = point.payload as any;
          const type = payload.type || 'unknown';
          const title = payload.title || payload.advice?.substring(0, 50) || 'Untitled';
          console.log(`   ${idx + 1}. [${type}] ${title}`);
          if (payload.tags) {
            console.log(`      Tags: ${payload.tags.join(', ')}`);
          }
        });
      }
    } catch (qdrantErr: any) {
      if (qdrantErr.message?.includes('Not found')) {
        console.log('\n   ⚠️  Qdrant collection does not exist yet');
      } else {
        console.log('\n   ⚠️  Could not fetch Qdrant data:', qdrantErr.message);
      }
    }

    // Generate recommendations
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDED STORIES FOR CHRIS TO ADD');
    console.log('='.repeat(80));

    console.log('\n📌 FOR BUYER FLOW:\n');
    DEFAULT_BUY_PHASES.forEach(phase => {
      const recs = STORY_RECOMMENDATIONS[phase.id];
      if (recs) {
        console.log(`   ${phase.name}:`);
        recs.forEach(r => console.log(`      ${r}`));
        console.log('');
      }
    });

    console.log('\n📌 FOR SELLER FLOW:\n');
    DEFAULT_SELL_PHASES.forEach(phase => {
      const recs = STORY_RECOMMENDATIONS[phase.id];
      if (recs && !['financial-prep', 'find-agent', 'closing'].includes(phase.id)) {
        console.log(`   ${phase.name}:`);
        recs.forEach(r => console.log(`      ${r}`));
        console.log('');
      }
    });

    // Generate formatted email/message for Chris
    console.log('\n' + '='.repeat(80));
    console.log('📧 MESSAGE FOR CHRIS');
    console.log('='.repeat(80));
    console.log(`
Hey Chris!

I analyzed your chatbot setup and have some recommendations to make your timeline results more personalized and engaging for your leads.

**Current Status:**
- Your knowledge base has ${existingStories.length} items
- You're using the default timeline phases (which is fine!)

**To make your chatbot stand out**, I recommend adding 2-3 personal stories for each major phase. These appear as "Pro Tips from Your Agent" in the results, showing leads you have real experience.

**High-Priority Stories to Add:**

🏠 **For Buyers:**

1. **Financial Prep Phase:**
   - A story about helping a first-time buyer get pre-approved
   - An example of creative financing that helped a client afford their home

2. **House Hunting Phase:**
   - A story about finding a hidden gem in Halifax
   - An example of helping a client narrow down their must-haves

3. **Making Offers Phase:**
   - A story about winning in a multiple-offer situation
   - Your best negotiation success story

4. **Closing Phase:**
   - A memorable closing day story
   - An example of resolving a last-minute issue

🏡 **For Sellers:**

1. **Preparing Home Phase:**
   - A staging success story with before/after results
   - An example of simple improvements that boosted sale price

2. **Listing Phase:**
   - A story about effective pricing strategy
   - A marketing win that attracted the right buyer

3. **Reviewing Offers Phase:**
   - An example of helping a seller choose the best offer
   - A multiple-offer success story

**How to Add Stories:**
1. Go to Dashboard → Knowledge Base → Stories
2. Click "Add Story"
3. Fill in:
   - Situation: What was the client's challenge?
   - What You Did: How did you help?
   - Outcome: What was the result?
4. Add relevant tags (first-time-buyer, negotiation, halifax, etc.)

Each story takes about 2-3 minutes to write. Start with your 3-4 best success stories!

Let me know if you have any questions.
`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoClient.close();
    console.log('\n✅ Connection closed');
  }
}

analyzeChrisFull();
