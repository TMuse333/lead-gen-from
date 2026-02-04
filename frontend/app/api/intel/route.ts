// app/api/intel/route.ts
/**
 * Intel API - Save and retrieve intel gathered from chatbot conversations.
 * POST: Save a new intel item (called from frontend chat store)
 * GET: List intel items for the authenticated user's clientId
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getIntelItemsCollection, getClientConfigsCollection } from '@/lib/mongodb/db';
import type { IntelItemDocument } from '@/lib/mongodb/models/intelItem';

// GET - Fetch intel items for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getEffectiveUserId() || session.user.id;

    // Look up the user's clientId (businessName) from their config
    const configCollection = await getClientConfigsCollection();
    const config = await configCollection.findOne({ userId });
    if (!config) {
      return NextResponse.json({ success: true, items: [] });
    }

    const clientId = config.businessName;
    const collection = await getIntelItemsCollection();

    // Optional environment filter from query params
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');

    const filter: Record<string, unknown> = { clientId };
    if (environment && environment !== 'all') {
      filter.environment = environment;
    }

    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      success: true,
      items: items.map(item => ({
        id: item._id?.toString(),
        clientId: item.clientId,
        conversationId: item.conversationId,
        type: item.type,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        lead: item.lead,
        environment: item.environment,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('[intel] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intel items' },
      { status: 500 }
    );
  }
}

// POST - Save a new intel item (called from chat frontend)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, conversationId, content, summary, type, tags, lead, environment } = body;

    if (!clientId || !content) {
      return NextResponse.json(
        { error: 'clientId and content are required' },
        { status: 400 }
      );
    }

    const collection = await getIntelItemsCollection();

    const intelItem: IntelItemDocument = {
      clientId,
      conversationId: conversationId || undefined,
      type: type || 'question',
      content: content.trim(),
      summary: summary || content.trim().slice(0, 120),
      tags: tags || [],
      lead: lead || undefined,
      environment: environment || 'production',
      createdAt: new Date(),
    };

    const result = await collection.insertOne(intelItem);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('[intel] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save intel item' },
      { status: 500 }
    );
  }
}
