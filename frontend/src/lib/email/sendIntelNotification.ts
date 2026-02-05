// src/lib/email/sendIntelNotification.ts
/**
 * Email notification utility for Agent Intel messaging system
 * Sends notifications when messages are exchanged between admin and agents
 *
 * Uses Resend with onboarding@focusflowsoftware.com
 */

import { Resend } from 'resend';
import { getClientConfigsCollection, getDatabase } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

// Dev test email - in development, all emails go here
const DEV_TEST_EMAIL = 'thomaslmusial@gmail.com';

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Resend config - matches orchestrator pattern
const FROM_EMAIL = process.env.FROM_EMAIL || 'FocusFlow LeadGen <onboarding@focusflowsoftware.com>';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'thomaslmusial@gmail.com';

// Lazy-init Resend to avoid build-time errors when API key isn't available
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Get admin emails from environment
const getAdminEmails = (): string[] => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return [];
  return adminEmail.split(',').map(email => email.trim());
};

// Get user email by userId - checks client_configs first, then falls back to users collection
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    // First try client_configs
    const configCollection = await getClientConfigsCollection();
    const config = await configCollection.findOne({ userId });

    if (config) {
      // Check multiple possible email fields in config
      const configEmail = config.notificationEmail
        || config.endingCTA?.email
        || config.agentProfile?.email;

      if (configEmail) {
        return configEmail;
      }
    }

    // Fallback: look up email from users collection (NextAuth)
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Try to find by ObjectId first, then by string
    let user = null;
    try {
      user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    } catch {
      // userId might not be a valid ObjectId, try string match
      user = await usersCollection.findOne({ id: userId });
    }

    if (user?.email) {
      console.log('[sendIntelNotification] Found email from users collection for:', userId);
      return user.email;
    }

    console.warn('[sendIntelNotification] No email found for userId:', userId);
    return null;
  } catch (error) {
    console.error('[sendIntelNotification] Error getting user email:', error);
    return null;
  }
}

// Get user display name by userId
async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId });
    return config?.agentProfile?.name || config?.endingCTA?.displayName || config?.businessName || 'Agent';
  } catch (error) {
    return 'Agent';
  }
}

// Get user business name by userId
async function getUserBusinessName(userId: string): Promise<string> {
  try {
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId });
    return config?.businessName || 'their chatbot';
  } catch (error) {
    return 'their chatbot';
  }
}

// Format category for display
function formatCategory(category?: string): string {
  switch (category) {
    case 'insight': return 'Insight';
    case 'recommendation': return 'Recommendation';
    case 'question': return 'Question';
    case 'feedback': return 'Feedback';
    default: return 'Message';
  }
}

// Get category emoji
function getCategoryEmoji(category?: string): string {
  switch (category) {
    case 'insight': return '💡';
    case 'recommendation': return '🎯';
    case 'question': return '❓';
    case 'feedback': return '💬';
    default: return '📨';
  }
}

interface NotificationParams {
  recipientType: 'admin' | 'user';
  userId: string;
  senderName: string;
  message: string;
  category?: string;
  userEmail?: string; // Optional - if known, avoids DB lookup
}

/**
 * Build email HTML for AGENT receiving message from developer
 * Simple notification - just tells them there's a message waiting
 */
function buildAgentEmailHtml(params: {
  agentName: string;
  message: string;
  category: string;
  categoryEmoji: string;
  dashboardUrl: string;
}): string {
  const { agentName, dashboardUrl } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 24px; border-radius: 16px 16px 0 0; text-align: center;">
              <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 14px; letter-spacing: 0.5px;">AGENT INTEL</p>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">You have a new message</h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background: #ffffff; padding: 32px 24px;">

              <!-- Greeting -->
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hi ${agentName},
              </p>

              <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0; line-height: 1.7;">
                The developer has some new feedback/message for you. It's waiting in the Feedback and Intel dashboard.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                      View Message
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 13px; margin: 32px 0 0 0; text-align: center;">
                <a href="${dashboardUrl}" style="color: #7c3aed; text-decoration: underline;">${dashboardUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                Powered by FocusFlow LeadGen
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Build email HTML for DEVELOPER receiving feedback from agent
 */
function buildDeveloperEmailHtml(params: {
  agentName: string;
  businessName: string;
  message: string;
  category: string;
  categoryEmoji: string;
  dashboardUrl: string;
  userId: string;
}): string {
  const { agentName, businessName, message, category, categoryEmoji, dashboardUrl, userId } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 24px; border-radius: 16px 16px 0 0; text-align: center; border: 1px solid #334155; border-bottom: none;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px; letter-spacing: 0.5px;">AGENT INTEL</p>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Agent Feedback</h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background: #1e293b; padding: 32px 24px; border: 1px solid #334155; border-top: none; border-bottom: none;">

              <!-- Agent info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                    <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600;">${agentName}</p>
                    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">${businessName}</p>
                  </td>
                </tr>
              </table>

              <!-- Message box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: #0f172a; border: 1px solid #334155; border-left: 4px solid #a855f7; border-radius: 8px; padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; background: #7c3aed; color: white; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;">
                            ${categoryEmoji} ${category}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px;">
                          <p style="color: #e2e8f0; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                      View in Admin Panel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
                User ID: ${userId}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0f172a; padding: 20px 24px; border-radius: 0 0 16px 16px; border: 1px solid #334155; border-top: none;">
              <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                Agent Intel Notification System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send email using Resend
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text } = params;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendIntelNotification] RESEND_API_KEY not configured');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  // In dev mode, override recipient to test email
  const actualRecipient = isDev ? DEV_TEST_EMAIL : to;
  const actualSubject = isDev ? `[DEV TEST - would go to: ${to}] ${subject}` : subject;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: actualRecipient,
      subject: actualSubject,
      html,
      text,
    });

    if (error) {
      console.error('[sendIntelNotification] Resend error:', error);
      return { success: false, error: String(error) };
    }

    console.log(`[sendIntelNotification] Email sent via Resend to: ${actualRecipient}`);
    return { success: true };
  } catch (err) {
    console.error('[sendIntelNotification] Resend exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Email send failed' };
  }
}

/**
 * Send email notification for new Agent Intel message
 */
export async function sendIntelNotification(params: NotificationParams): Promise<{ success: boolean; error?: string }> {
  const { recipientType, userId, senderName, message, category, userEmail } = params;

  const categoryDisplay = formatCategory(category);
  const categoryEmoji = getCategoryEmoji(category);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://chatbot.focusflowsoftware.com';

  if (recipientType === 'admin') {
    // Message going to admin (developer) - agent sent feedback
    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0 && !isDev) {
      console.warn('[sendIntelNotification] No admin email configured');
      return { success: false, error: 'No admin email configured' };
    }

    const recipientEmail = adminEmails[0] || DEV_TEST_EMAIL;
    const agentName = senderName;
    const businessName = await getUserBusinessName(userId);
    const dashboardUrl = `${baseUrl}/dashboard/admin`;

    const html = buildDeveloperEmailHtml({
      agentName,
      businessName,
      message,
      category: categoryDisplay,
      categoryEmoji,
      dashboardUrl,
      userId,
    });

    const text = `
New Agent Feedback

From: ${agentName} (${businessName})
Category: ${categoryDisplay}

${message}

View in Admin Panel: ${dashboardUrl}
User ID: ${userId}
    `.trim();

    return sendEmail({
      to: recipientEmail,
      subject: `${categoryEmoji} Agent Feedback from ${agentName}: ${categoryDisplay}`,
      html,
      text,
    });

  } else {
    // Message going to user (agent) - developer sent insight
    const recipientEmail = userEmail || await getUserEmail(userId);
    if (!recipientEmail && !isDev) {
      console.warn('[sendIntelNotification] Could not find email for user:', userId);
      return { success: false, error: 'User email not found' };
    }

    const agentName = await getUserDisplayName(userId);
    const dashboardUrl = `${baseUrl}/dashboard/feedback`;

    const html = buildAgentEmailHtml({
      agentName,
      message,
      category: categoryDisplay,
      categoryEmoji,
      dashboardUrl,
    });

    const text = `
Hi ${agentName},

The developer has some new feedback/message for you. It's waiting in the Feedback and Intel dashboard.

View it here: ${dashboardUrl}

---
Powered by FocusFlow LeadGen
    `.trim();

    return sendEmail({
      to: recipientEmail || DEV_TEST_EMAIL,
      subject: `${categoryEmoji} New message waiting for you`,
      html,
      text,
    });
  }
}

/**
 * Test function to send sample emails (dev only)
 */
export async function sendTestIntelEmails(): Promise<{
  agentEmail: { success: boolean; error?: string };
  developerEmail: { success: boolean; error?: string };
}> {
  if (!isDev) {
    return {
      agentEmail: { success: false, error: 'Test emails only available in development' },
      developerEmail: { success: false, error: 'Test emails only available in development' },
    };
  }

  // Test email to agent (what they see when developer sends them a message)
  const agentEmail = await sendIntelNotification({
    recipientType: 'user',
    userId: 'test-user-123',
    senderName: 'LeadGen Team',
    message: 'Hi there! I noticed your chatbot is performing really well. I have a few recommendations to help you capture even more leads:\n\n1. Consider adding more specific questions about budget range\n2. Your timeline advice is great - maybe add a few more tips about the closing process\n3. The greeting message could be more personalized\n\nLet me know if you have any questions!',
    category: 'recommendation',
    userEmail: DEV_TEST_EMAIL,
  });

  // Test email to developer (what you see when agent sends feedback)
  const developerEmail = await sendIntelNotification({
    recipientType: 'admin',
    userId: 'test-user-123',
    senderName: 'John Smith',
    message: 'Thanks for the setup help! I have a question about the timeline builder - how do I add custom phases for new construction homes? Also, is there a way to change the color scheme to match my brokerage branding?',
    category: 'question',
  });

  return { agentEmail, developerEmail };
}
