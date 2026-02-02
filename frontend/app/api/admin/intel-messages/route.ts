// app/api/admin/intel-messages/route.ts
/**
 * Admin API for sending intel/insight messages to users
 * Only accessible by admin users
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';
import { sendIntelNotification } from '@/lib/email/sendIntelNotification';

interface IntelMessage {
  _id?: ObjectId;
  userId: string;
  senderType: 'developer' | 'user';
  senderName?: string;
  message: string;
  category?: 'insight' | 'recommendation' | 'question' | 'feedback' | 'general';
  readAt?: Date;
  createdAt: Date;
}

// Admin emails that can send developer messages
const ADMIN_EMAILS = [
  'thomasamusial@gmail.com',
  'admin@example.com', // Add more admin emails as needed
];

// POST - Send a developer message to a user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, message, category } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<IntelMessage>('intel_messages');

    const newMessage: IntelMessage = {
      userId: targetUserId,
      senderType: 'developer',
      senderName: 'LeadGen Team',
      message: message.trim(),
      category: category || 'insight',
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newMessage);

    // Send email notification to user (agent)
    sendIntelNotification({
      recipientType: 'user',
      userId: targetUserId,
      senderName: newMessage.senderName || 'LeadGen Team',
      message: newMessage.message,
      category: newMessage.category,
    }).catch(err => {
      // Log but don't fail the request if email fails
      console.error('[admin/intel-messages] Email notification failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertedId.toString(),
        ...newMessage,
      },
    });
  } catch (error) {
    console.error('[admin/intel-messages] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Get all messages for a specific user (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<IntelMessage>('intel_messages');

    const messages = await collection
      .find({ userId: targetUserId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      messages: messages.map(m => ({
        id: m._id?.toString(),
        senderType: m.senderType,
        senderName: m.senderName,
        message: m.message,
        category: m.category,
        readAt: m.readAt,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('[admin/intel-messages] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
