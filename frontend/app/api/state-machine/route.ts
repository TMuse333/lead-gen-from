// app/api/state-machine/route.ts
/**
 * GET /api/state-machine?flow=buy&clientId=some-client
 *
 * Returns the native StateMachineConfig for a client's flow, if one exists.
 * If the client has no state machine config, returns { config: null }.
 * The frontend will then use the questionsToStateMachine converter as fallback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flow = searchParams.get('flow');
    const clientId = searchParams.get('clientId');

    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Invalid or missing flow parameter. Must be "buy" or "sell".' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId parameter.' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();

    // Look up client config by businessName (case-insensitive)
    const clientConfig = await collection.findOne({
      businessName: { $regex: new RegExp(`^${escapeRegex(clientId)}$`, 'i') },
      isActive: true,
    }) as ClientConfigDocument | null;

    if (!clientConfig) {
      return NextResponse.json({ config: null });
    }

    // Check if client has a native state machine config for this flow
    const flowKey = flow as 'buy' | 'sell';
    const config = clientConfig.stateMachineConfigs?.[flowKey] ?? null;

    return NextResponse.json({ config });
  } catch (error) {
    console.error('[API /api/state-machine] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch state machine config' },
      { status: 500 }
    );
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
