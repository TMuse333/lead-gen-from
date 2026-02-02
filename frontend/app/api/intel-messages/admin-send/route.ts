// app/api/intel-messages/admin-send/route.ts
/**
 * Admin API for sending developer messages while impersonating a user
 * This allows admins to send insights directly from the user's Feedback & Intel page
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
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
const getAdminEmails = (): string[] => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return [];
  return adminEmail.split(',').map(email => email.trim().toLowerCase());
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the impersonated user's ID
    const targetUserId = await getEffectiveUserId();
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Must be impersonating a user to send messages from here' },
        { status: 400 }
      );
    }

    // Don't allow sending to yourself
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send messages to yourself' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message, category } = body;

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
      console.error('[intel-messages/admin-send] Email notification failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertedId.toString(),
        senderType: newMessage.senderType,
        senderName: newMessage.senderName,
        message: newMessage.message,
        category: newMessage.category,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('[intel-messages/admin-send] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
