// app/api/intel-messages/route.ts
/**
 * API for Intel/Feedback messaging between developers and users
 * Allows bi-directional communication for insights and feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getDatabase } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';
import { sendIntelNotification } from '@/lib/email/sendIntelNotification';

export interface IntelMessage {
  _id?: ObjectId;
  userId: string;
  senderType: 'developer' | 'user';
  senderName?: string;
  message: string;
  category?: 'insight' | 'recommendation' | 'question' | 'feedback' | 'general';
  readAt?: Date;
  createdAt: Date;
}

// GET - Fetch messages for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getEffectiveUserId() || session.user.id;

    const db = await getDatabase();
    const collection = db.collection<IntelMessage>('intel_messages');

    const messages = await collection
      .find({ userId })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark unread messages as read
    await collection.updateMany(
      { userId, senderType: 'developer', readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );

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
    console.error('[intel-messages] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getEffectiveUserId() || session.user.id;
    const body = await request.json();
    const { message, category } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<IntelMessage>('intel_messages');

    // Users always send as 'user' type
    const newMessage: IntelMessage = {
      userId,
      senderType: 'user',
      senderName: session.user.name || session.user.email || 'User',
      message: message.trim(),
      category: category || 'feedback',
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newMessage);

    // Send email notification to admin
    sendIntelNotification({
      recipientType: 'admin',
      userId,
      senderName: newMessage.senderName || 'Agent',
      message: newMessage.message,
      category: newMessage.category,
    }).catch(err => {
      // Log but don't fail the request if email fails
      console.error('[intel-messages] Email notification failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertedId.toString(),
        ...newMessage,
      },
    });
  } catch (error) {
    console.error('[intel-messages] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
