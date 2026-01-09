// app/api/user/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getGenerationsCollection, getConversationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

/**
 * GET /api/user/leads
 * Get all leads (generations with contact info) for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const generationsCollection = await getGenerationsCollection();
    const conversationsCollection = await getConversationsCollection();

    // Get all generations for this user
    const generations = await generationsCollection
      .find({ userId })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Get corresponding conversations to get full user input
    const conversationIds = generations
      .map(g => g.conversationId)
      .filter(Boolean) as ObjectId[];

    const conversations = await conversationsCollection
      .find({ 
        _id: { $in: conversationIds },
        userId 
      })
      .toArray();

    // Create a map of conversationId -> conversation for quick lookup
    const conversationMap = new Map(
      conversations.map(c => [c._id?.toString(), c])
    );

    // Combine generation and conversation data
    const leads = generations.map(generation => {
      const conversation = conversationMap.get(generation.conversationId?.toString() || '');
      
      // Extract contact info from userInput
      const userInput = generation.userInput || conversation?.userInput || {};
      const email = userInput.email || userInput.Email || '';
      const phone = userInput.phone || userInput.Phone || userInput.phoneNumber || '';
      const propertyAddress = userInput.propertyAddress || userInput.PropertyAddress || userInput.address || '';
      const name = userInput.name || userInput.Name || email?.split('@')[0] || 'Unknown';

      return {
        id: generation._id?.toString(),
        conversationId: generation.conversationId?.toString(),
        name,
        email,
        phone,
        propertyAddress,
        flow: generation.flow,
        offerType: generation.offerType,
        userInput: userInput,
        generation: {
          id: generation._id?.toString(),
          generatedAt: generation.generatedAt,
          generationTime: generation.generationTime,
          componentCount: generation.componentCount,
          status: generation.status,
          // Include a preview of the generation (first component)
          preview: generation.llmOutput ? Object.keys(generation.llmOutput).filter(k => k !== '_debug')[0] : null,
        },
        conversation: conversation ? {
          id: conversation._id?.toString(),
          startedAt: conversation.startedAt,
          completedAt: conversation.completedAt,
          status: conversation.status,
          messageCount: conversation.messageCount || conversation.messages?.length || 0,
        } : null,
      };
    });

    const total = await generationsCollection.countDocuments({ userId });

    return NextResponse.json({
      success: true,
      leads,
      total,
      limit,
      skip,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

