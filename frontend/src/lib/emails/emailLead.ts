// ============================================
// EMAIL SERVICE - Send Analysis Reports
// ============================================
// Using Nodemailer

import nodemailer from 'nodemailer';
import { AIAnalysis, ComparableHome, LeadSubmission } from '@/types';

import dotenv from 'dotenv'


dotenv.config({
  path:'../../.env'
})

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send personalized analysis report to user
 */
export async function sendUserAnalysisEmail(
  userEmail: string,
  userName: string,
  analysis: AIAnalysis,
  comparableHomes: ComparableHome[],
  agentInfo: {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
  }
) {
  try {
    const emailHtml = generateAnalysisEmailHTML(
      userName,
      analysis,
      comparableHomes,
      agentInfo
    );

    await transporter.sendMail({
      from: `"${agentInfo.name}" <${process.env.SMTP_USER || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Your Personalized Home Value Analysis - $${analysis.estimatedValue.low.toLocaleString()} to $${analysis.estimatedValue.high.toLocaleString()}`,
      html: emailHtml,
    });

    console.log('✅ Analysis email sent to user:', userEmail);
  } catch (error) {
    console.error('Failed to send user email:', error);
    throw error;
  }
}

/**
 * Send lead notification to agent
 */
export async function sendAgentNotificationEmail(
  agentEmail: string,
  leadData: LeadSubmission,
  analysis: AIAnalysis
) {
  try {
    const emailHtml = generateAgentNotificationHTML(leadData, analysis);

    await transporter.sendMail({
      from: `"Lead Notifications" <${process.env.SMTP_FROM || process.env.GMAIL_USER}>`,
      to: agentEmail,
      subject: `🎯 New Seller Lead: ${leadData.propertyProfile.type || 'Property'} - ${leadData.propertyProfile.timeline || 'exploring'}`,
      html: emailHtml,
    });

    console.log('✅ Lead notification sent to agent:', agentEmail);
  } catch (error) {
    console.error('Failed to send agent email:', error);
    throw error;
  }
}

// Generate HTML email functions (keeping them short for brevity)
function generateAnalysisEmailHTML(userName: string, analysis: AIAnalysis, comparableHomes: ComparableHome[], agentInfo: any): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Your Personalized Home Analysis</h1>
    <p>Hi ${userName},</p>
    
    <div style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
      <h2>Estimated Value</h2>
      <div style="font-size: 36px; font-weight: bold;">
        $${analysis.estimatedValue.low.toLocaleString()} - $${analysis.estimatedValue.high.toLocaleString()}
      </div>
      <p>Confidence: ${Math.round(analysis.estimatedValue.confidence * 100)}%</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #2563eb;">Valuation Breakdown</h3>
      <p>${analysis.estimatedValue.reasoning}</p>
    </div>
    
    <h3 style="color: #2563eb;">Current Market Conditions</h3>
    <p>${analysis.marketSummary}</p>
    
    <h3 style="color: #2563eb;">Personalized Advice</h3>
    <p style="white-space: pre-wrap;">${analysis.personalizedAdvice}</p>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
      <h3 style="color: #059669;">Next Steps</h3>
      <ul>${analysis.recommendedActions.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>
    
    <h3 style="color: #2563eb;">Similar Properties</h3>
    <p>${analysis.comparablesSummary}</p>
    ${comparableHomes.slice(0, 3).map(c => `
      <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <strong>${c.address}</strong><br>
        ${c.propertyDetails.type} • ${c.propertyDetails.bedrooms}bd/${c.propertyDetails.bathrooms}ba<br>
        <strong style="color: #059669;">${c.saleInfo.soldPrice ? `Sold: $${c.saleInfo.soldPrice.toLocaleString()}` : `Listed: $${c.saleInfo.listPrice?.toLocaleString()}`}</strong>
      </div>
    `).join('')}
    
    <div style="text-align: center; background: #f8fafc; padding: 30px; border-radius: 12px; margin: 30px 0;">
      <h3>Ready to Learn More?</h3>
      ${agentInfo.phone ? `<a href="tel:${agentInfo.phone}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 5px;">Call ${agentInfo.phone}</a>` : ''}
      <a href="mailto:${agentInfo.email}" style="display: inline-block; background: white; color: #2563eb; padding: 12px 30px; text-decoration: none; border-radius: 6px; border: 2px solid #2563eb; margin: 5px;">Email Me</a>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} ${agentInfo.name}</p>
  </body></html>`;
}

function generateAgentNotificationHTML(leadData: LeadSubmission, analysis: AIAnalysis): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1>🎯 New Seller Lead</h1>
      <p>Submitted ${new Date(leadData.submittedAt).toLocaleString()}</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2>Contact</h2>
      <p><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
    </div>
    
    <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2>Property Profile</h2>
      ${Object.entries(leadData.propertyProfile).filter(([_, v]) => v).map(([k, v]) => 
        `<p><strong>${k.replace(/([A-Z])/g, ' $1')}:</strong> ${Array.isArray(v) ? v.join(', ') : v}</p>`
      ).join('')}
    </div>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
      <h3>AI Analysis</h3>
      <p><strong>Value:</strong> $${analysis.estimatedValue.low.toLocaleString()} - $${analysis.estimatedValue.high.toLocaleString()}</p>
      <p><strong>Timeline:</strong> ${leadData.propertyProfile.timeline || 'Not specified'}</p>
      <p><strong>Motivation:</strong> ${leadData.propertyProfile.sellingReason || 'Not specified'}</p>
    </div>
    
    ${leadData.propertyProfile.specificConcerns ? `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
        <h3>Concerns</h3>
        <p>${leadData.propertyProfile.specificConcerns}</p>
      </div>
    ` : ''}
  </body></html>`;
}