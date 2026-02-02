// app/api/intel-messages/unread-count/route.ts
/**
 * Get count of unread developer messages for the current user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getDatabase } from '@/lib/mongodb/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getEffectiveUserId() || session.user.id;

    const db = await getDatabase();
    const collection = db.collection('intel_messages');

    // Count unread developer messages (no readAt field)
    const unreadCount = await collection.countDocuments({
      userId,
      senderType: 'developer',
      readAt: { $exists: false },
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('[intel-messages/unread-count] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
