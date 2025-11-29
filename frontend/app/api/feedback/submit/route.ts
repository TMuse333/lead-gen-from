// app/api/feedback/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) console.error('SMTP Connection Error:', error);
  else console.log('SMTP Ready – Emails will send');
});

interface FeedbackData {
  name: string;
  services: string[];
  otherServices: string;
  resultsPage: string[];
  otherResults: string;
  leadData: string[];
  otherLeadData: string;
  contentAssets: string[];
  otherAssets: string;
  comments: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackData = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No data submitted' }, { status: 400 });
    }

    const formatList = (items: string[], other: string) => {
      const list = items.filter(Boolean);
      if (list.length === 0 && !other.trim()) return '<em>None specified</em>';
      const bullets = list.map(i => `• ${i}`).join('<br>');
      const otherText = other.trim() ? `<br><strong>Other:</strong> ${other.trim()}` : '';
      return bullets + otherText || '<em>None</em>';
    };

    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const commentsHtml = body.comments.trim()
      ? `<p style="margin: 16px 0; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 4px solid #22d3ee;">${escapeHtml(body.comments).replace(/\n/g, '<br>')}</p>`
      : '<em>No additional comments</em>';

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 680px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="font-size: 32px; font-weight: bold; background: linear-gradient(to right, #06b6d4, #3b82f6); -webkit-background-clip: text; - webinar-text-fill-color: transparent; margin-bottom: 8px;">
          New Neural Engine Request
        </h1>
        <p style="font-size: 20px; color: #22d3ee; margin-bottom: 32px;">
          <strong>${escapeHtml(body.name || 'No name provided')}</strong> just submitted their blueprint!
        </p>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #22d3ee; margin: 0 0 12px 0; font-size: 18px;">Client Outcomes Delivered</h2>
          <div style="color: #cbd5e1;">${formatList(body.services, body.otherServices)}</div>
        </div>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #a78bfa; margin: 0 0 12px 0; font-size: 18px;">Desired Results Page Elements</h2>
          <div style="color: #e9d5ff;">${formatList(body.resultsPage, body.otherResults)}</div>
        </div>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #f472b6; margin: 0 0 12px 0; font-size: 18px;">Additional Lead Data Needed</h2>
          <div style="color: #fbd8e8;">${formatList(body.leadData, body.otherLeadData)}</div>
        </div>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #c084fc; margin: 0 0 12px 0; font-size: 18px;">Content & Branding Assets Available</h2>
          <div style="color: #5eead4;">${formatList(body.contentAssets, body.otherAssets)}</div>
        </div>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #f0abfc; margin: 0 0 12px 0; font-size: 18px;">Additional Comments / Requests</h2>
          <div style="color: #e9d5ff;">${commentsHtml}</div>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px dashed #334155; text-align: center; color: #94a3b8; font-size: 14px;">
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</p>
          <p>Time to build their Neural Engine</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Neural Engine Feedback" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: process.env.SMTP_USER,
      subject: `Neural Engine Request – ${body.name || 'New Agent'} is Ready!`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Feedback sent!' });

  } catch (error: any) {
    console.error('Email send failed:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback', details: error.message },
      { status: 500 }
    );
  }
}