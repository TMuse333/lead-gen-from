// app/api/agent-advice/auto-populate/route.ts
// Development-only route to auto-populate knowledge base with real estate advice

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getEmbedding } from '@/lib/openai/embedding';
import { storeUserAdvice } from '@/lib/qdrant/collections/vector/advice/upsertUser';

// Pre-defined real estate advice based on default flows
const REAL_ESTATE_ADVICE = [
  // Buy Flow Advice
  {
    title: 'First-Time Buyer Tips',
    advice: 'First-time buyers should get pre-approved for a mortgage before house hunting. This shows sellers you\'re serious and helps you understand your budget. Look for first-time buyer programs and grants in your area - many provinces offer down payment assistance. Don\'t skip the home inspection, even in competitive markets. It can save you thousands in unexpected repairs.',
    tags: ['first-time-buyer', 'mortgage', 'pre-approval', 'grants'],
    flow: ['buy'],
  },
  {
    title: 'Moving Up Strategy',
    advice: 'When moving up, timing is crucial. Consider selling your current home first to avoid carrying two mortgages. Use the equity from your current home as a down payment. Work with an agent who understands the move-up market - they can help coordinate both transactions. Price your current home competitively to ensure a quick sale.',
    tags: ['moving-up', 'equity', 'timing', 'strategy'],
    flow: ['buy'],
  },
  {
    title: 'Downsizing Benefits',
    advice: 'Downsizing can free up equity for retirement, reduce maintenance costs, and simplify your lifestyle. Look for properties with low-maintenance features like condos or newer builds. Consider single-level living for aging in place. The money saved on utilities and maintenance can significantly improve your retirement income.',
    tags: ['downsizing', 'retirement', 'equity', 'lifestyle'],
    flow: ['buy'],
  },
  {
    title: 'Investment Property Basics',
    advice: 'Investment properties should generate positive cash flow after all expenses. Calculate your ROI including mortgage, taxes, insurance, maintenance, and vacancy rates. Look for properties in areas with strong rental demand and appreciation potential. Consider properties that need cosmetic updates - you can add value through renovations. Always have a reserve fund for unexpected repairs.',
    tags: ['investment', 'cash-flow', 'roi', 'rental'],
    flow: ['buy'],
  },
  {
    title: 'Budget Planning for Buyers',
    advice: 'Your total housing costs should not exceed 30% of your gross income. This includes mortgage, property taxes, insurance, and utilities. Factor in closing costs (typically 2-5% of purchase price), moving expenses, and immediate repairs or updates. Get quotes from multiple lenders - even a 0.5% difference in interest rate can save thousands over the life of the loan.',
    tags: ['budget', 'affordability', 'mortgage', 'planning'],
    flow: ['buy'],
  },
  {
    title: 'Neighborhood Research',
    advice: 'Research neighborhoods thoroughly before buying. Check school ratings, crime statistics, and future development plans. Visit at different times of day to understand traffic patterns and noise levels. Talk to neighbors about the area. Look for neighborhoods with strong appreciation history and good resale value. Consider proximity to work, schools, and amenities.',
    tags: ['neighborhood', 'research', 'location', 'due-diligence'],
    flow: ['buy'],
  },

  // Sell Flow Advice
  {
    title: 'Pre-Listing Home Preparation',
    advice: 'Before listing, declutter and depersonalize your home. Buyers need to envision themselves living there. Make minor repairs - fix leaky faucets, replace broken tiles, touch up paint. Deep clean everything, including carpets and windows. Consider professional staging - staged homes sell faster and for higher prices. Curb appeal matters - first impressions are crucial.',
    tags: ['preparation', 'staging', 'repairs', 'curb-appeal'],
    flow: ['sell'],
  },
  {
    title: 'Pricing Strategy',
    advice: 'Price your home competitively based on recent comparable sales in your area. Overpricing can lead to your home sitting on the market, which can result in lower final sale price. Work with an agent who provides a detailed CMA (Comparative Market Analysis). Consider pricing slightly below market to generate multiple offers. Be prepared to negotiate - most buyers expect some back-and-forth.',
    tags: ['pricing', 'cma', 'market-analysis', 'strategy'],
    flow: ['sell'],
  },
  {
    title: 'Timing Your Sale',
    advice: 'Spring and early summer are typically the best times to sell - more buyers are active. However, less competition in fall and winter can work in your favor. Consider your personal timeline - if you need to sell quickly, price more aggressively. If you have flexibility, you can wait for the right offer. Avoid listing during major holidays when buyer activity is low.',
    tags: ['timing', 'season', 'market-timing', 'strategy'],
    flow: ['sell'],
  },
  {
    title: 'Home Staging Tips',
    advice: 'Remove personal items like family photos and collections. Neutral colors appeal to more buyers. Maximize natural light by opening curtains and cleaning windows. Rearrange furniture to make rooms feel larger. Remove excess furniture to create a sense of space. Add fresh flowers or plants for a welcoming feel. Make sure every room has a clear purpose.',
    tags: ['staging', 'presentation', 'home-showing', 'preparation'],
    flow: ['sell'],
  },
  {
    title: 'Handling Offers',
    advice: 'Review all offers carefully, not just the highest price. Consider financing terms, closing date, and contingencies. Cash offers are often preferred even if slightly lower. Be prepared for inspection negotiations - buyers will likely ask for repairs or credits. Work with your agent to craft counteroffers that protect your interests. Don\'t take lowball offers personally - negotiate professionally.',
    tags: ['offers', 'negotiation', 'inspection', 'closing'],
    flow: ['sell'],
  },
  {
    title: 'Selling with Urgency',
    advice: 'If you need to sell quickly, price 5-10% below market value to attract multiple offers. Consider offering incentives like covering closing costs or including appliances. Make your home move-in ready - buyers prefer homes that don\'t need immediate work. Be flexible on closing dates. Consider pre-inspecting your home to address issues upfront. Market aggressively across all channels.',
    tags: ['quick-sale', 'urgency', 'pricing', 'strategy'],
    flow: ['sell'],
  },

  // Browse Flow Advice
  {
    title: 'Understanding Market Trends',
    advice: 'Market trends are influenced by interest rates, inventory levels, and economic conditions. In a seller\'s market, inventory is low and prices rise. In a buyer\'s market, there\'s more inventory and prices stabilize or decrease. Monitor days on market - shorter times indicate strong demand. Price per square foot varies by neighborhood and property type.',
    tags: ['market-trends', 'market-analysis', 'inventory', 'pricing'],
    flow: ['browse'],
  },
  {
    title: 'Hot Neighborhood Indicators',
    advice: 'Hot neighborhoods show strong price appreciation, low days on market, and increasing buyer interest. Look for areas with new infrastructure, schools, or transit development. Neighborhoods near employment centers often appreciate faster. Check for new construction - it can drive up surrounding property values. Areas with good schools and low crime rates maintain value better.',
    tags: ['neighborhoods', 'appreciation', 'investment', 'location'],
    flow: ['browse'],
  },
  {
    title: 'Home Valuation Factors',
    advice: 'Home values are determined by location, size, condition, and comparable sales. Location is the most important factor - same house in different neighborhoods can have vastly different values. Square footage, lot size, and number of bedrooms/bathrooms matter. Condition and updates affect value - updated kitchens and bathrooms add significant value. Recent comparable sales in the area are the best indicator of current market value.',
    tags: ['valuation', 'cma', 'property-value', 'assessment'],
    flow: ['browse'],
  },
  {
    title: 'Market Report Insights',
    advice: 'Monthly market reports show inventory levels, average days on market, and price trends. Rising inventory with stable prices suggests a balanced market. Decreasing inventory with rising prices indicates a seller\'s market. Monitor absorption rate - how quickly homes are selling. Low months of inventory (under 3 months) favors sellers. High months of inventory (over 6 months) favors buyers.',
    tags: ['market-reports', 'inventory', 'trends', 'analysis'],
    flow: ['browse'],
  },
  {
    title: 'Property Type Considerations',
    advice: 'Different property types appeal to different buyers. Single-family homes offer privacy and space but require more maintenance. Condos offer low maintenance and amenities but have monthly fees. Townhouses offer a middle ground. Consider resale value - single-family homes typically appreciate more. Condos are great for first-time buyers and downsizers. Location matters more than property type for long-term value.',
    tags: ['property-types', 'condos', 'houses', 'townhouses'],
    flow: ['browse'],
  },

  // General Real Estate Advice
  {
    title: 'Working with a Real Estate Agent',
    advice: 'A good agent provides market expertise, negotiation skills, and transaction management. Look for agents with experience in your area and property type. Check their track record - how many homes they\'ve sold and average days on market. Communication is key - you want someone responsive and transparent. Ask about their marketing strategy and network. A great agent can save you time, money, and stress.',
    tags: ['agent', 'representation', 'professional', 'guidance'],
    flow: ['buy', 'sell', 'browse'],
  },
  {
    title: 'Home Inspection Importance',
    advice: 'Home inspections reveal hidden issues that could cost thousands to repair. Never skip an inspection, even in competitive markets. Inspectors check structural integrity, electrical, plumbing, HVAC, and more. Major issues can be deal-breakers or negotiation points. Minor issues are normal - every home has them. Use inspection results to negotiate repairs or price adjustments. Consider specialized inspections for older homes or specific concerns.',
    tags: ['inspection', 'due-diligence', 'repairs', 'negotiation'],
    flow: ['buy', 'sell'],
  },
  {
    title: 'Financing Options',
    advice: 'Get pre-approved before house hunting to know your budget. Compare rates from multiple lenders - even small differences add up. Consider different loan types - conventional, FHA, VA, or specialized programs. Down payment requirements vary by loan type - some programs require as little as 3-5%. Factor in closing costs (2-5% of purchase price) when budgeting. Lock in your rate when you find the right home.',
    tags: ['financing', 'mortgage', 'pre-approval', 'loans'],
    flow: ['buy'],
  },
  {
    title: 'Closing Process',
    advice: 'The closing process typically takes 30-45 days from accepted offer. You\'ll need title insurance, home insurance, and final loan approval. Review all closing documents carefully before signing. Do a final walkthrough 24-48 hours before closing to ensure the property is in agreed condition. Bring certified funds for closing costs and down payment. Keep all documents organized - you\'ll need them for taxes and future reference.',
    tags: ['closing', 'transaction', 'paperwork', 'final-steps'],
    flow: ['buy', 'sell'],
  },
];

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'This feature is only available in development mode' },
        { status: 403 }
      );
    }

    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's collection name
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId: session.user.id });

    if (!userConfig || !userConfig.qdrantCollectionName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;
    console.log(`🚀 Auto-populating knowledge base for user ${session.user.id}`);
    console.log(`📦 Using collection: ${collectionName}`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each advice item
    for (const item of REAL_ESTATE_ADVICE) {
      try {
        // Generate embedding
        const textToEmbed = `${item.title}. ${item.advice}`;
        const embedding = await getEmbedding(textToEmbed);

        // Store in Qdrant
        const adviceId = await storeUserAdvice({
          collectionName,
          title: item.title,
          advice: item.advice,
          embedding,
          metadata: {
            tags: item.tags,
            flow: item.flow,
            conditions: {},
          },
        });

        results.push({ title: item.title, success: true, id: adviceId });
        successCount++;
        console.log(`✅ Added: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to add: ${item.title}`, error);
        results.push({ title: item.title, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        errorCount++;
      }
    }

    console.log(`✅ Auto-population complete: ${successCount} successful, ${errorCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${successCount} advice items to your knowledge base`,
      results,
      summary: {
        total: REAL_ESTATE_ADVICE.length,
        successful: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error('❌ Error auto-populating knowledge base:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

