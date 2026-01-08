// app/api/knowledge/coverage/route.ts
/**
 * Knowledge Coverage API
 *
 * Returns coverage statistics for an offer's knowledge requirements.
 * Shows which phases have sufficient knowledge and which need more content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import {
  getOffer,
  type OfferType,
  type Intent,
  type KnowledgeRequirements,
  type PhaseKnowledgeRequirement,
} from '@/lib/offers/unified';

export const runtime = 'nodejs';

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

// ==================== TYPES ====================

interface AdviceItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  kind?: 'tip' | 'story';
  placements?: Record<string, string[]>;
}

interface PhaseCoverage {
  phaseId: string;
  phaseName: string;
  description: string;
  priority: PhaseKnowledgeRequirement['priority'];
  required: number;
  current: number;
  coverage: number;
  searchTags: string[];
  exampleContent?: string;
  items: AdviceItem[];
}

interface CoverageResponse {
  offerType: OfferType;
  intent: Intent;
  overallCoverage: number;
  totalRequired: number;
  totalCurrent: number;
  phases: PhaseCoverage[];
  missingCritical: string[];
}

// ==================== HELPERS ====================

async function getUserCollectionName(userId: string): Promise<string | null> {
  try {
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId });
    return userConfig?.qdrantCollectionName || null;
  } catch (error) {
    console.error('Error fetching user collection:', error);
    return null;
  }
}

/**
 * Get all advice items from Qdrant for the user
 */
async function getAllAdviceItems(collectionName: string): Promise<AdviceItem[]> {
  try {
    const response = await client.scroll(collectionName, {
      limit: 500,
      with_payload: true,
      with_vector: false,
    });

    return response.points.map((point) => {
      const payload = point.payload as Record<string, unknown>;
      return {
        id: point.id as string,
        title: (payload?.title as string) || '',
        advice: (payload?.advice as string) || '',
        tags: (payload?.tags as string[]) || [],
        kind: (payload?.kind as 'tip' | 'story') || 'tip',
        placements: payload?.placements as Record<string, string[]> | undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching advice items:', error);
    return [];
  }
}

/**
 * Match advice items to a phase based on placements and tags
 */
function matchItemsToPhase(
  items: AdviceItem[],
  offerType: OfferType,
  phaseId: string,
  searchTags: string[]
): AdviceItem[] {
  return items.filter((item) => {
    // Priority 1: Check explicit placements
    if (item.placements) {
      const offerPlacements = item.placements[offerType];
      if (offerPlacements && offerPlacements.includes(phaseId)) {
        return true;
      }
    }

    // Priority 2: Check tag overlap (fallback)
    // Item must have at least one matching tag
    const itemTagsLower = item.tags.map((t) => t.toLowerCase());
    const hasMatchingTag = searchTags.some((searchTag) =>
      itemTagsLower.some(
        (itemTag) =>
          itemTag.includes(searchTag.toLowerCase()) ||
          searchTag.toLowerCase().includes(itemTag)
      )
    );

    return hasMatchingTag;
  });
}

/**
 * Get phase display name from template
 */
function getPhaseDisplayName(phaseId: string): string {
  const names: Record<string, string> = {
    // Buy phases
    'financial-prep': 'Financial Preparation',
    'find-agent': 'Find Your Agent',
    'house-hunting': 'House Hunting',
    'make-offer': 'Make an Offer',
    'under-contract': 'Under Contract',
    'closing': 'Closing Day',
    'post-closing': 'Post-Closing',
    // Sell phases
    'home-prep': 'Prepare Your Home',
    'choose-agent-price': 'Choose Agent & Price',
    'list-property': 'List Property',
    'marketing-showings': 'Marketing & Showings',
    'review-offers': 'Review Offers',
    'under-contract-sell': 'Under Contract',
    'closing-sell': 'Closing',
    // Browse phases
    'understand-options': 'Understand Options',
    'financial-education': 'Financial Education',
    'market-research': 'Market Research',
    'decision-time': 'Decision Time',
    'next-steps': 'Next Steps',
  };
  return names[phaseId] || phaseId;
}

// ==================== API HANDLER ====================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const offerType = searchParams.get('offerType') as OfferType | null;
    const intent = searchParams.get('intent') as Intent | null;

    if (!offerType) {
      return NextResponse.json(
        { error: 'offerType query parameter is required' },
        { status: 400 }
      );
    }

    if (!intent) {
      return NextResponse.json(
        { error: 'intent query parameter is required' },
        { status: 400 }
      );
    }

    // 3. Get offer and its knowledge requirements
    const offer = getOffer(offerType);
    if (!offer) {
      return NextResponse.json(
        { error: `Offer type not found: ${offerType}` },
        { status: 404 }
      );
    }

    const knowledgeRequirements = offer.knowledgeRequirements;
    if (!knowledgeRequirements) {
      return NextResponse.json(
        { error: `Offer ${offerType} has no knowledge requirements defined` },
        { status: 404 }
      );
    }

    const phaseRequirements = knowledgeRequirements[intent];
    if (!phaseRequirements) {
      return NextResponse.json(
        { error: `No knowledge requirements for intent: ${intent}` },
        { status: 404 }
      );
    }

    // 4. Get user's collection name
    const collectionName = await getUserCollectionName(session.user.id);
    if (!collectionName) {
      // Return empty coverage if no collection
      const emptyPhases: PhaseCoverage[] = Object.entries(phaseRequirements).map(
        ([phaseId, req]) => ({
          phaseId,
          phaseName: getPhaseDisplayName(phaseId),
          description: req.description,
          priority: req.priority,
          required: req.minItems || 2,
          current: 0,
          coverage: 0,
          searchTags: req.searchTags,
          exampleContent: req.exampleContent,
          items: [],
        })
      );

      const totalRequired = emptyPhases.reduce((sum, p) => sum + p.required, 0);

      return NextResponse.json({
        offerType,
        intent,
        overallCoverage: 0,
        totalRequired,
        totalCurrent: 0,
        phases: emptyPhases,
        missingCritical: emptyPhases
          .filter((p) => p.priority === 'critical')
          .map((p) => p.phaseId),
      });
    }

    // 5. Get all advice items
    const allItems = await getAllAdviceItems(collectionName);
    console.log(`[Coverage] Found ${allItems.length} total advice items`);

    // 6. Calculate coverage for each phase
    const phases: PhaseCoverage[] = [];
    const missingCritical: string[] = [];
    let totalRequired = 0;
    let totalCurrent = 0;

    for (const [phaseId, requirement] of Object.entries(phaseRequirements)) {
      const matchedItems = matchItemsToPhase(
        allItems,
        offerType,
        phaseId,
        requirement.searchTags
      );

      const required = requirement.minItems || 2;
      const current = matchedItems.length;
      const coverage = Math.min(current / required, 1);

      totalRequired += required;
      totalCurrent += Math.min(current, required);

      if (requirement.priority === 'critical' && current < required) {
        missingCritical.push(phaseId);
      }

      phases.push({
        phaseId,
        phaseName: getPhaseDisplayName(phaseId),
        description: requirement.description,
        priority: requirement.priority,
        required,
        current,
        coverage,
        searchTags: requirement.searchTags,
        exampleContent: requirement.exampleContent,
        items: matchedItems.slice(0, 10), // Limit items returned
      });
    }

    // Sort by priority (critical first) then by coverage (lowest first)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    phases.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.coverage - b.coverage;
    });

    const overallCoverage = totalRequired > 0 ? totalCurrent / totalRequired : 0;

    const response: CoverageResponse = {
      offerType,
      intent,
      overallCoverage,
      totalRequired,
      totalCurrent,
      phases,
      missingCritical,
    };

    console.log(
      `[Coverage] ${offerType}/${intent}: ${Math.round(overallCoverage * 100)}% coverage`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Coverage] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
