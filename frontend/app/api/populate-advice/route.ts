// app/api/populate-advice/route.ts
// Dev-only endpoint to auto-populate phases with advice from knowledge base
// Matches stories to phases by keywords, falls back to generated advice

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { CustomPhaseConfig, TimelineFlow } from '@/types/timelineBuilder.types';

export const runtime = 'nodejs';

// Phase keywords for matching stories
const PHASE_KEYWORDS: Record<string, string[]> = {
  'financial-prep': ['pre-approval', 'mortgage', 'financing', 'budget', 'credit', 'down payment', 'lender'],
  'agent-selection': ['agent', 'realtor', 'choosing', 'interview', 'hire'],
  'house-hunting': ['search', 'hunting', 'showing', 'viewing', 'neighborhood', 'location', 'tour'],
  'make-offer': ['offer', 'negotiate', 'bid', 'contract', 'terms', 'compete'],
  'under-contract': ['inspection', 'appraisal', 'escrow', 'contingency', 'due diligence'],
  'closing': ['closing', 'settlement', 'keys', 'final', 'move-in', 'sign'],
  'home-prep': ['staging', 'repairs', 'declutter', 'prepare', 'curb appeal', 'photography'],
  'set-price': ['pricing', 'CMA', 'comparable', 'market value', 'list price'],
  'list-property': ['listing', 'MLS', 'marketing', 'photos', 'description'],
  'marketing-showings': ['showing', 'open house', 'marketing', 'feedback', 'exposure'],
  'review-offers': ['offers', 'multiple offers', 'counter', 'negotiate', 'accept'],
  'market-research': ['market', 'research', 'trends', 'prices', 'inventory'],
};

// Fallback advice templates per phase
const FALLBACK_ADVICE: Record<string, string[]> = {
  // Buyer phases
  'financial-prep': [
    "From my experience helping first-time buyers, getting pre-approved early gives you a huge advantage. I had a client who found their dream home but lost it because they weren't pre-approved. Now I always recommend starting here.",
    "Pro tip: Don't just go with the first lender. I help my clients compare at least 3 options - the rate differences can save thousands over the life of the loan.",
  ],
  'house-hunting': [
    "I always tell my clients: don't fall in love with just the house - fall in love with the neighborhood too. I've seen buyers regret not spending more time exploring the area at different times of day.",
    "When touring homes, I recommend taking videos and notes. After seeing 10+ houses, they all start to blur together. My most organized buyers make the best decisions.",
  ],
  'make-offer': [
    "In competitive markets, it's not always about the highest price. I've helped clients win with strong terms - flexible closing dates, fewer contingencies, or personal letters to sellers.",
    "I always prepare my buyers for the emotional rollercoaster of offers. Rejection happens, but the right house is out there.",
  ],
  'under-contract': [
    "The inspection is your chance to really understand what you're buying. I always recommend being present - inspectors share so much valuable information about maintaining your new home.",
    "This phase requires patience. There are a lot of moving pieces, but I coordinate everything so you can focus on planning your move.",
  ],
  'closing': [
    "Closing day is exciting! I do a final walkthrough with all my buyers to make sure everything is as expected. It's your last chance to catch any issues.",
    "I prepare my clients for the mountain of paperwork at closing. Take your time reading everything - this is a big commitment and you should understand every document.",
  ],
  // Seller phases
  'home-prep': [
    "I've seen staging transform how buyers perceive a home. Even small changes - decluttering, fresh paint, updated fixtures - can significantly impact your sale price.",
    "Professional photos are non-negotiable in today's market. Most buyers start their search online, and great photos get more showings.",
    "First impressions matter! I always recommend a deep clean and declutter before photos. Buyers need to envision themselves in the space.",
  ],
  'set-price': [
    "Pricing right from the start is crucial. Overpriced homes sit on the market and eventually sell for less than if they'd been priced correctly initially.",
    "I do a comprehensive market analysis for all my sellers. We look at comparable sales, current competition, and market trends to find your optimal price.",
    "The first two weeks on market are critical. That's when you get the most attention, so pricing correctly from day one is essential.",
  ],
  'list-property': [
    "Your listing description is your home's first impression online. I craft compelling narratives that highlight what makes your home special.",
    "Professional photography is an investment that pays off. Listings with pro photos sell faster and often for more money.",
    "I leverage multiple channels - MLS, social media, my network - to ensure maximum exposure for your listing.",
  ],
  'marketing-showings': [
    "I coordinate all showings to minimize disruption to your life while maximizing exposure. Flexibility with showing times often leads to more offers.",
    "After each showing, I gather feedback from buyer agents. This insight helps us adjust our strategy if needed.",
    "Open houses can be powerful tools. I host them strategically to create buzz and urgency around your listing.",
  ],
  'review-offers': [
    "When reviewing offers, I help my sellers look beyond just the price. Financing strength, contingencies, and closing timeline all matter.",
    "Multiple offers are exciting but can be overwhelming. I present each offer clearly and help you understand the full picture before deciding.",
    "I negotiate on your behalf to get the best terms possible. Sometimes a slightly lower offer with better terms is the smarter choice.",
  ],
  'seller-closing': [
    "As we approach closing, I coordinate with all parties to ensure a smooth transaction. No surprises is my goal.",
    "The final walkthrough is standard - I prepare my sellers for what to expect and ensure the home is in the agreed-upon condition.",
    "Closing day for sellers is bittersweet. I make sure all paperwork is in order so you can focus on your next chapter.",
  ],
  // Browse phases
  'market-research': [
    "Understanding the market before you commit is smart. I help browsers get a realistic picture of what's available in their price range.",
    "I provide market reports and trend analysis so you can make informed decisions when you're ready to move forward.",
  ],
  'agent-selection': [
    "Finding the right agent is crucial. I encourage you to interview multiple agents and find someone whose communication style matches yours.",
    "The best agent relationships are built on trust and communication. I'm always available to answer questions, no matter how small.",
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Dev-only check
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'This endpoint is dev-only' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flow } = await request.json() as { flow: TimelineFlow };
    if (!flow || !['buy', 'sell', 'browse'].includes(flow)) {
      return NextResponse.json({ error: 'Valid flow required' }, { status: 400 });
    }

    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    let phases = config.customPhases?.[flow] as CustomPhaseConfig[] | undefined;

    // Auto-create default phases if none exist
    if (!phases || phases.length === 0) {
      console.log('   No phases for flow, creating defaults...');
      const { getFlowTemplate } = await import('@/lib/offers/definitions/timeline/timeline-templates');
      const template = getFlowTemplate(flow);

      phases = template.phases.map((phase, phaseIndex) => ({
        id: phase.id,
        name: phase.name,
        timeline: phase.baseTimeline,
        description: phase.description,
        order: phase.order,
        isOptional: phase.isOptional || false,
        actionableSteps: phase.suggestedActionItems.map((item, stepIndex) => ({
          id: `${phase.id}-step-${stepIndex + 1}`,
          title: item,
          priority: stepIndex === 0 ? 'high' as const : stepIndex < 3 ? 'medium' as const : 'low' as const,
          order: stepIndex + 1,
        })),
      }));

      console.log(`   Created ${phases.length} default phases for ${flow}`);
    }

    console.log('\n🎯 [Populate Advice] Starting for flow:', flow);
    console.log('   Phases to populate:', phases.length);

    // Try to get stories from Qdrant
    let stories: { content: string; metadata: any }[] = [];
    if (config.qdrantCollectionName) {
      try {
        const qdrant = new QdrantClient({
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          apiKey: process.env.QDRANT_API_KEY,
        });

        const result = await qdrant.scroll(config.qdrantCollectionName, {
          limit: 100,
          with_payload: true,
        });

        stories = (result.points || []).map((p: any) => ({
          content: p.payload?.content || p.payload?.advice || '',
          metadata: p.payload,
        }));

        console.log('   Stories from Qdrant:', stories.length);
      } catch (e) {
        console.log('   Qdrant fetch failed, using fallbacks');
      }
    }

    // Function to find matching story
    const findMatchingStory = (phaseId: string, stepTitle: string): string | null => {
      const keywords = PHASE_KEYWORDS[phaseId] || [];
      const searchTerms = [...keywords, ...stepTitle.toLowerCase().split(' ')];

      for (const story of stories) {
        const content = story.content.toLowerCase();
        const matchCount = searchTerms.filter(term => content.includes(term)).length;
        if (matchCount >= 2) {
          // Remove this story so it's not reused
          stories = stories.filter(s => s !== story);
          return story.content;
        }
      }
      return null;
    };

    // Populate each phase's steps with advice
    let populatedCount = 0;
    let fallbackCount = 0;

    const updatedPhases = phases.map(phase => ({
      ...phase,
      actionableSteps: phase.actionableSteps.map((step, stepIndex) => {
        // Skip if already has advice
        if (step.inlineExperience) {
          return step;
        }

        // Try to find matching story
        let advice = findMatchingStory(phase.id, step.title);

        // Fallback to template advice
        if (!advice) {
          const fallbacks = FALLBACK_ADVICE[phase.id] || [
            `As your agent, I'll guide you through "${step.title}" with personalized support based on your specific situation.`,
          ];
          advice = fallbacks[stepIndex % fallbacks.length];
          fallbackCount++;
        } else {
          populatedCount++;
        }

        return {
          ...step,
          inlineExperience: advice,
        };
      }),
    }));

    // Save updated phases to user record
    await collection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          [`customPhases.${flow}`]: updatedPhases,
          updatedAt: new Date(),
        },
      }
    );

    // Also sync to businessName record if it exists (for public bot)
    if (config.businessName) {
      const businessRecord = await collection.findOne({
        businessName: config.businessName,
        isActive: true,
        _id: { $ne: config._id } // Different record
      });

      if (businessRecord) {
        await collection.updateOne(
          { businessName: config.businessName, isActive: true },
          {
            $set: {
              [`customPhases.${flow}`]: updatedPhases,
              updatedAt: new Date(),
            },
          }
        );
        console.log('   Also synced to business record:', config.businessName);
      }
    }

    console.log('✅ [Populate Advice] Complete');
    console.log(`   From stories: ${populatedCount}, From fallbacks: ${fallbackCount}`);

    return NextResponse.json({
      success: true,
      message: `Populated advice for ${flow} flow`,
      stats: {
        phasesUpdated: updatedPhases.length,
        fromStories: populatedCount,
        fromFallbacks: fallbackCount,
      },
    });
  } catch (error) {
    console.error('[Populate Advice] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
