// scripts/setup-action-steps.ts

import { QdrantClient } from '@qdrant/js-client-rest';
import crypto from 'crypto';
import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

// Initialize Qdrant client
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

const ACTION_STEPS_COLLECTION = 'agent-action-steps'; // Separate collection name
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

type ActionStepCategory = 
  | 'preparation'
  | 'valuation'
  | 'financial'
  | 'marketing'
  | 'search'
  | 'negotiation'
  | 'legal'
  | 'moving'
  | 'education'
  | 'relationship';

interface ActionStepScenario {
  id: string;
  agentId: string;
  title: string;
  description: string;
  benefit?: string;
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;
  defaultPriority: number;
  defaultUrgency: 'immediate' | 'soon' | 'later';
  defaultTimeline: string;
  category: ActionStepCategory;
  tags: string[];
  applicableWhen: {
    flow?: ('sell' | 'buy' | 'browse')[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
  prerequisiteStepIds?: string[];
  relatedStepIds?: string[];
}

// ==================== SAMPLE ACTION STEPS ====================

const ACTION_STEPS: Omit<ActionStepScenario, 'agentId'>[] = [
  // ==================== SELLER STEPS ====================
  {
    id: 'sell-valuation-001',
    title: 'Get Professional Home Valuation',
    description: 'Schedule a comprehensive market analysis to understand your home\'s current value. We\'ll review recent comparable sales, current market conditions, and your home\'s unique features to establish an accurate baseline price.',
    benefit: 'Accurate pricing from day one means faster sale and maximum value',
    resourceLink: '/book-valuation',
    resourceText: 'Schedule Free Valuation',
    imageUrl: '/images/steps/valuation.jpg',
    defaultPriority: 1,
    defaultUrgency: 'immediate',
    defaultTimeline: 'This week',
    category: 'valuation',
    tags: ['selling', 'valuation', 'pricing', 'market-analysis'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
          ]
        }
      ],
      minMatchScore: 0.5
    },
  },

  {
    id: 'sell-prep-001',
    title: 'Prepare Your Home for Market',
    description: 'Start decluttering, deep cleaning, and making minor repairs. First impressions are critical. Remove personal items, organize spaces, and ensure your home shows at its absolute best to attract serious buyers.',
    benefit: 'Well-presented homes sell 30% faster and for higher prices',
    resourceLink: '/resources/home-prep-checklist',
    resourceText: 'Download Prep Checklist',
    imageUrl: '/images/steps/preparation.jpg',
    defaultPriority: 2,
    defaultUrgency: 'soon',
    defaultTimeline: 'Next 2 weeks',
    category: 'preparation',
    tags: ['selling', 'preparation', 'staging', 'cleaning', 'repairs'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
            { field: 'timeline', operator: 'equals', value: '6-12', weight: 7 },
          ]
        }
      ],
      minMatchScore: 0.5
    },
  },

  {
    id: 'sell-photo-001',
    title: 'Schedule Professional Photography',
    description: 'High-quality photos are essential for online listings. I\'ll arrange a professional photographer to capture your home in the best light. Photos should be taken after your home is fully prepared and staged.',
    benefit: 'Professional photos generate 118% more online views than amateur shots',
    resourceLink: '/book-photography',
    resourceText: 'Book Photo Session',
    imageUrl: '/images/steps/photography.jpg',
    defaultPriority: 3,
    defaultUrgency: 'soon',
    defaultTimeline: 'Week 3',
    category: 'marketing',
    tags: ['selling', 'photography', 'marketing', 'listing'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
          ]
        }
      ],
      minMatchScore: 0.6
    },
    prerequisiteStepIds: ['sell-valuation-001', 'sell-prep-001'],
  },

  {
    id: 'sell-listing-001',
    title: 'Launch Your Listing',
    description: 'Once photos are ready and price is confirmed, we\'ll create a compelling listing and launch across all major platforms. I\'ll handle MLS, social media promotion, and outreach to my buyer network.',
    benefit: 'Maximum exposure means more offers and better negotiating position',
    imageUrl: '/images/steps/listing.jpg',
    defaultPriority: 4,
    defaultUrgency: 'soon',
    defaultTimeline: 'Week 4',
    category: 'marketing',
    tags: ['selling', 'listing', 'marketing', 'mls', 'promotion'],
    applicableWhen: {
      flow: ['sell'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
          ]
        }
      ],
      minMatchScore: 0.7
    },
    prerequisiteStepIds: ['sell-valuation-001', 'sell-photo-001'],
  },

  // ==================== BUYER STEPS ====================
  {
    id: 'buy-preapproval-001',
    title: 'Get Mortgage Pre-Approval',
    description: 'Connect with a trusted mortgage broker to understand your buying power and get pre-approved. This shows sellers you\'re a serious buyer and helps you move quickly when you find the right home.',
    benefit: 'Pre-approved buyers win 40% more competitive bidding situations',
    resourceLink: '/resources/mortgage-partners',
    resourceText: 'View Mortgage Partners',
    imageUrl: '/images/steps/preapproval.jpg',
    defaultPriority: 1,
    defaultUrgency: 'immediate',
    defaultTimeline: 'This week',
    category: 'financial',
    tags: ['buying', 'mortgage', 'pre-approval', 'financing'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
          ]
        }
      ],
      minMatchScore: 0.5
    },
  },

  {
    id: 'buy-criteria-001',
    title: 'Define Your Home Criteria',
    description: 'Let\'s meet to clarify your must-haves, nice-to-haves, and deal-breakers. We\'ll discuss neighborhoods, property types, and lifestyle needs so I can set up a custom search that sends you only relevant listings.',
    benefit: 'Clear criteria saves time and helps you act fast on the right properties',
    resourceLink: '/book-consultation',
    resourceText: 'Schedule Planning Call',
    imageUrl: '/images/steps/criteria.jpg',
    defaultPriority: 2,
    defaultUrgency: 'immediate',
    defaultTimeline: 'This week',
    category: 'search',
    tags: ['buying', 'search', 'criteria', 'planning'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
            { field: 'timeline', operator: 'equals', value: '6-12', weight: 6 },
          ]
        }
      ],
      minMatchScore: 0.5
    },
  },

  {
    id: 'buy-viewings-001',
    title: 'Start Viewing Properties',
    description: 'I\'ll arrange viewings for homes that match your criteria. Plan to see 5-10 properties to understand the market and refine what you\'re looking for. I\'ll point out important details you might miss.',
    benefit: 'Seeing multiple properties quickly helps you recognize value and act confidently',
    imageUrl: '/images/steps/viewings.jpg',
    defaultPriority: 3,
    defaultUrgency: 'soon',
    defaultTimeline: 'Next 2 weeks',
    category: 'search',
    tags: ['buying', 'viewings', 'showings', 'tours'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
          ]
        }
      ],
      minMatchScore: 0.6
    },
    prerequisiteStepIds: ['buy-preapproval-001', 'buy-criteria-001'],
  },

  {
    id: 'buy-offer-001',
    title: 'Prepare Your Offer Strategy',
    description: 'When you find the right home, we\'ll review comparable sales, assess competition, and craft a strategic offer. I\'ll help you understand what price and terms will be competitive while protecting your interests.',
    benefit: 'Strategic offers get accepted while keeping you from overpaying',
    imageUrl: '/images/steps/offer.jpg',
    defaultPriority: 4,
    defaultUrgency: 'later',
    defaultTimeline: 'When you find the one',
    category: 'negotiation',
    tags: ['buying', 'offer', 'negotiation', 'strategy'],
    applicableWhen: {
      flow: ['buy'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
            { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
          ]
        }
      ],
      minMatchScore: 0.7
    },
    prerequisiteStepIds: ['buy-viewings-001'],
  },

  // ==================== BROWSER STEPS ====================
  {
    id: 'browse-report-001',
    title: 'Review Current Market Report',
    description: 'I\'ll send you my latest market analysis for your area of interest. This includes price trends, inventory levels, days on market, and my insights on where things are heading.',
    benefit: 'Understanding the market helps you time your move and set expectations',
    resourceLink: '/request-market-report',
    resourceText: 'Get Free Market Report',
    imageUrl: '/images/steps/market-report.jpg',
    defaultPriority: 1,
    defaultUrgency: 'soon',
    defaultTimeline: 'This week',
    category: 'education',
    tags: ['browsing', 'market', 'education', 'trends', 'research'],
    applicableWhen: {
      flow: ['browse'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'interest', operator: 'equals', value: 'market-trends', weight: 10 },
            { field: 'interest', operator: 'equals', value: 'investment', weight: 8 },
          ]
        }
      ],
      minMatchScore: 0.5
    },
  },

  {
    id: 'browse-consult-001',
    title: 'Schedule No-Pressure Consultation',
    description: 'Let\'s have a casual 15-minute call to discuss your real estate interests. No sales pitch - just a conversation about your situation, questions you have, and how I can be a resource when you\'re ready.',
    benefit: 'Getting to know each other now means smoother process later',
    resourceLink: '/book-consultation',
    resourceText: 'Book 15-Min Call',
    imageUrl: '/images/steps/consultation.jpg',
    defaultPriority: 2,
    defaultUrgency: 'later',
    defaultTimeline: 'When you\'re ready',
    category: 'relationship',
    tags: ['browsing', 'consultation', 'meeting', 'relationship'],
    applicableWhen: {
      flow: ['browse'],
      ruleGroups: [
        {
          logic: 'OR',
          rules: [
            { field: 'goal', operator: 'equals', value: 'buy-future', weight: 8 },
            { field: 'goal', operator: 'equals', value: 'sell-future', weight: 8 },
            { field: 'goal', operator: 'equals', value: 'invest', weight: 7 },
          ]
        }
      ],
      minMatchScore: 0.4
    },
  },
];

async function main() {
  try {
    console.log('🚀 Starting Action Steps setup...\n');

    // Step 1: Test connection
    console.log('📡 Testing Qdrant connection...');
    await qdrant.getCollections();
    console.log('✅ Connected to Qdrant');

    // Step 2: Check for existing collection
    console.log('\n📦 Checking for existing action steps collection...');
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(col => col.name === ACTION_STEPS_COLLECTION);

    if (exists) {
      console.log(`⚠️  Collection "${ACTION_STEPS_COLLECTION}" already exists`);
      const answer = 'yes'; // Change to prompt in production
      if (answer === 'yes') {
        console.log('🗑️  Deleting existing collection...');
        await qdrant.deleteCollection(ACTION_STEPS_COLLECTION);
        console.log('✅ Collection deleted');
      } else {
        console.log('❌ Aborted - collection already exists');
        return;
      }
    }

    // Step 3: Create collection (NO VECTORS - rule-based only)
    console.log('\n🏗️  Creating action steps collection...');
    console.log('   Note: This collection does NOT use vector embeddings');
    console.log('   Action steps are retrieved via rule matching only');
    
    // Create a minimal collection structure
    await qdrant.createCollection(ACTION_STEPS_COLLECTION, {
      vectors: {
        size: 4, // Minimal vector size (we won't use it)
        distance: 'Cosine',
      },
    });
    console.log('✅ Collection created');

    // Step 4: Upload action steps
    console.log('\n💾 Uploading action steps...');
    
    const points = ACTION_STEPS.map(step => ({
      id: crypto.randomUUID(), // Use UUID for Qdrant's point ID
      vector: [0, 0, 0, 0], // Dummy vector (not used for matching)
      payload: {
        ...step,
        stepId: step.id, // Store our custom ID in the payload
        agentId: AGENT_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      }
    }));

    await qdrant.upsert(ACTION_STEPS_COLLECTION, {
      wait: true,
      points: points,
    });

    console.log(`✅ Uploaded ${points.length} action steps`);

    // Step 5: Verify
    console.log('\n🔍 Verifying stored data...');
    const scrollResult = await qdrant.scroll(ACTION_STEPS_COLLECTION, {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });
    
    console.log(`✅ Found ${scrollResult.points.length} action steps in collection`);
    
    // Show breakdown by flow
    const byFlow = {
      sell: scrollResult.points.filter(p => {
        const payload = p.payload as unknown as ActionStepScenario;
        return payload?.applicableWhen?.flow?.includes('sell');
      }).length,
      buy: scrollResult.points.filter(p => {
        const payload = p.payload as unknown as ActionStepScenario;
        return payload?.applicableWhen?.flow?.includes('buy');
      }).length,
      browse: scrollResult.points.filter(p => {
        const payload = p.payload as unknown as ActionStepScenario;
        return payload?.applicableWhen?.flow?.includes('browse');
      }).length,
    };
    
    console.log('\n📊 Breakdown by flow:');
    console.log(`   • Sell: ${byFlow.sell} steps`);
    console.log(`   • Buy: ${byFlow.buy} steps`);
    console.log(`   • Browse: ${byFlow.browse} steps`);

    // Step 6: Show sample steps
    console.log('\n📋 Sample action steps:');
    scrollResult.points.slice(0, 3).forEach((point, idx) => {



     const payload = point.payload as unknown as ActionStepScenario;

  console.log(`\n ${idx + 1}. ${payload.title}`);
  console.log(` Category: ${payload.category}`);
  console.log(` Priority: ${payload.defaultPriority}`);
  console.log(` Urgency: ${payload.defaultUrgency}`);
  console.log(` Flow: ${payload.applicableWhen?.flow?.join(', ') ?? 'none'}`);
    });

    console.log('\n\n🎉 Action Steps setup complete!');
    console.log('\n📊 Summary:');
    console.log(`   • Collection: ${ACTION_STEPS_COLLECTION}`);
    console.log(`   • Agent ID: ${AGENT_ID}`);
    console.log(`   • Total steps: ${scrollResult.points.length}`);
    console.log(`   • Matching method: Rule-based (no vector search)`);
    console.log('\n✅ You can now query action steps using rule matching!');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Tip: Make sure Qdrant is running!');
        console.log('   Docker: docker run -p 6333:6333 qdrant/qdrant');
        console.log('   Or use Qdrant Cloud: https://cloud.qdrant.io');
      }
    }
    process.exit(1);
  }
}

main();