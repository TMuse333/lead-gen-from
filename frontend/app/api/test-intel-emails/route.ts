// app/api/test-intel-emails/route.ts
/**
 * DEV ONLY: Test endpoint to send Agent Intel emails
 * Sends both email types to thomaslmusial@gmail.com with the actual message content
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendIntelNotification } from '@/lib/email/sendIntelNotification';

const DEV_TEST_EMAIL = 'thomaslmusial@gmail.com';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test emails only available in development' },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { message, category } = body;

  // Use provided message or a default
  const testMessage = message || 'This is a test message. You can type your own message in the textarea and click "Test Email" to preview what the email will look like.';
  const testCategory = category || 'insight';

  // Send test email showing what AGENT sees (when developer sends them a message)
  const agentEmail = await sendIntelNotification({
    recipientType: 'user',
    userId: 'test-user-123',
    senderName: 'LeadGen Team',
    message: testMessage,
    category: testCategory,
    userEmail: DEV_TEST_EMAIL,
  });

  // Send test email showing what DEVELOPER sees (when agent sends feedback)
  const developerEmail = await sendIntelNotification({
    recipientType: 'admin',
    userId: 'test-user-123',
    senderName: 'Test Agent',
    message: testMessage,
    category: testCategory,
  });

  return NextResponse.json({
    success: agentEmail.success || developerEmail.success,
    results: { agentEmail, developerEmail },
    message: 'Check thomaslmusial@gmail.com for test emails',
  });
}

export async function GET() {
  return NextResponse.json({
    info: 'POST to this endpoint with { message, category } to send test emails (dev only)',
    isDev: process.env.NODE_ENV === 'development',
  });
}
