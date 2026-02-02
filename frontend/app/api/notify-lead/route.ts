// app/api/notify-lead/route.ts
/**
 * Lead Notification API
 * Sends email to agent/owner when a new lead submits their contact info
 * Uses nodemailer with Gmail SMTP
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

interface LeadNotificationRequest {
  clientId: string;
  lead: {
    name: string;
    email: string;
    phone?: string;
  };
  userInput: Record<string, string>;
  flow?: string;
  conversationId?: string;
  environment?: 'test' | 'production';
}

// Create reusable transporter with SMTP (uses same config as auth system)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Format user answers for email display
function formatUserAnswers(userInput: Record<string, string>): string {
  const skipKeys = ['contactName', 'contactEmail', 'contactPhone', 'email'];

  const entries = Object.entries(userInput)
    .filter(([key]) => !skipKeys.includes(key))
    .map(([key, value]) => {
      // Format key from camelCase to Title Case
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      return `<tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">${formattedKey}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${value}</td>
      </tr>`;
    });

  if (entries.length === 0) {
    return '<p style="color: #6b7280;">No additional information provided.</p>';
  }

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <tbody>
        ${entries.join('')}
      </tbody>
    </table>
  `;
}

// Get flow display name
function getFlowDisplayName(flow?: string): string {
  switch (flow) {
    case 'buy':
      return 'Buying';
    case 'sell':
      return 'Selling';
    case 'browse':
      return 'Browsing';
    default:
      return flow || 'Not specified';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('Email configuration missing: SMTP_USER or SMTP_PASSWORD not set');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body: LeadNotificationRequest = await request.json();
    const { clientId, lead, userInput, flow, conversationId, environment } = body;

    // In test mode, we'll send to admin email instead of the agent
    const isTestMode = environment === 'test';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    // Validate required fields
    if (!clientId || !lead?.name || !lead?.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: clientId, lead.name, lead.email' },
        { status: 400 }
      );
    }

    // Get client config to find notification email
    const collection = await getClientConfigsCollection();
    const clientConfig = await collection.findOne({
      $or: [
        { uniqueClientId: clientId },
        { qdrantCollectionName: clientId },
      ]
    });

    if (!clientConfig) {
      console.error('Client config not found for clientId:', clientId);
      return NextResponse.json(
        { success: false, error: 'Client configuration not found' },
        { status: 404 }
      );
    }

    // Determine notification email (priority: notificationEmail > endingCTA.email > agentProfile.email)
    const agentNotificationEmail =
      clientConfig.notificationEmail ||
      clientConfig.endingCTA?.email ||
      clientConfig.agentProfile?.email;

    // In test mode, send to admin email; in production, send to agent
    const notificationEmail = isTestMode ? adminEmail : agentNotificationEmail;

    if (!notificationEmail) {
      console.warn('No notification email configured for client:', clientId);
      // Don't fail the request - just log and return success
      // This allows the lead capture to work even if email isn't set up
      return NextResponse.json({
        success: true,
        message: 'Lead captured but no notification email configured',
        emailSent: false,
        isTestMode,
      });
    }

    const businessName = clientConfig.businessName || 'Your Business';
    const agentName = clientConfig.agentProfile?.name || clientConfig.endingCTA?.displayName || '';

    // Create email content
    const testPrefix = isTestMode ? '[TEST] ' : '';
    const subject = `${testPrefix}New Lead: ${lead.name} - ${getFlowDisplayName(flow)} Interest`;

    // Test mode banner HTML
    const testModeBanner = isTestMode ? `
        <!-- Test Mode Banner -->
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
          <strong style="color: #92400e;">TEST MODE</strong>
          <p style="color: #92400e; margin: 4px 0 0 0; font-size: 14px;">This is a test lead from a development/testing environment. Would normally be sent to: ${agentNotificationEmail || 'No agent email configured'}</p>
        </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

        ${testModeBanner}

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${testPrefix}New Lead Captured!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Someone completed your chatbot</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">

          <!-- Lead Info -->
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #0891b2; margin: 0 0 12px 0; font-size: 18px;">Contact Information</h2>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${lead.name}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #0891b2;">${lead.email}</a></p>
            ${lead.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${lead.phone}" style="color: #0891b2;">${lead.phone}</a></p>` : ''}
            <p style="margin: 4px 0;"><strong>Interest:</strong> ${getFlowDisplayName(flow)}</p>
          </div>

          <!-- User Answers -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0 0 12px 0; font-size: 18px;">Their Answers</h2>
            ${formatUserAnswers(userInput)}
          </div>

          <!-- Quick Actions -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${lead.email}?subject=Following up on your ${getFlowDisplayName(flow).toLowerCase()} timeline"
               style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">
              Reply via Email
            </a>
            ${lead.phone ? `
            <a href="tel:${lead.phone}"
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Call Now
            </a>
            ` : ''}
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            This lead was captured via your ${businessName} chatbot
            ${conversationId ? `<br>Conversation ID: ${conversationId}` : ''}
          </p>
        </div>

      </body>
      </html>
    `;

    const plainTextContent = `
New Lead Captured!

Contact Information:
- Name: ${lead.name}
- Email: ${lead.email}
${lead.phone ? `- Phone: ${lead.phone}` : ''}
- Interest: ${getFlowDisplayName(flow)}

Their Answers:
${Object.entries(userInput)
  .filter(([key]) => !['contactName', 'contactEmail', 'contactPhone', 'email'].includes(key))
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

---
This lead was captured via your ${businessName} chatbot
${conversationId ? `Conversation ID: ${conversationId}` : ''}
    `.trim();

    // Send email
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${businessName} Lead Bot" <${process.env.SMTP_USER}>`,
      to: notificationEmail,
      subject,
      text: plainTextContent,
      html: htmlContent,
    });

    console.log(`Lead notification sent to ${notificationEmail} for lead: ${lead.name}${isTestMode ? ' [TEST MODE]' : ''}`);

    return NextResponse.json({
      success: true,
      message: isTestMode
        ? 'Test lead notification sent to admin'
        : 'Lead notification sent successfully',
      emailSent: true,
      isTestMode,
      sentTo: isTestMode ? 'admin' : 'agent',
    });

  } catch (error) {
    console.error('Error sending lead notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}
