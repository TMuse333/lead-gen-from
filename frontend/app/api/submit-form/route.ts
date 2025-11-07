// ============================================
// API ROUTE: /api/submit-form
// Main endpoint for processing form submissions
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { FlowType, FormAnswer, LeadSubmission, PropertyProfile, UserProfile } from '@/types';
import { saveLeadSubmission, updateLeadAnalysis } from '@/lib/mongodb/mongodb';
import { queryRelevantAdvice } from '@/lib/qdrant/qdrant';
import { fetchComparableHomes, fetchMarketTrends } from '@/data/realEstateData/realEstateData';
import { buildUserProfileText, generateEmbedding, generateFlowAnalysis } from '@/lib/openai/openai';
import { sendAgentNotificationEmail, sendUserAnalysisEmail } from '@/lib/emails/emailLead';
import { flowConfigs } from '@/lib/config/flowConfig';
import { buildUserProfile } from '@/lib/openai/buildUserProfile';
import { mapFlowConfigToFormConfig } from '@/lib/config/formFactory';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
   
    const { answers,pageUrl, flow } = await request.json();



    console.log('Received data:', { answers, pageUrl, flow });

    if (!flow ) {
      return NextResponse.json({ success: false, error: 'Invalid flow type' }, { status: 400 });
    }

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // console.log('📝 Processing form submission with', answers.length, 'answers');

    // ============================================
    // STEP 1: Extract property profile from answers
    // ============================================
    const propertyProfile = extractPropertyProfile(answers);

    const userEmail = answers.find((a) => a.questionId === 'email')?.value as string;
    const userPhone = answers.find((a) => a.questionId === 'phoneNumber')?.value as number;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 2: Save initial lead to MongoDB
    // ============================================
    const agentId = process.env.AGENT_ID!
    
    const leadData: Omit<LeadSubmission, '_id'> = {
      formId: 'default-form',
      agentId,
      email: userEmail,
      phoneNumber: userPhone, 
      answers,
      propertyProfile,
      submittedAt: new Date(),
      pageUrl: pageUrl || 'unknown',
      status: 'new',
    };

    const leadId = await saveLeadSubmission(leadData);
    // console.log('✅ Lead saved with ID:', leadId);

    // ============================================
    // STEP 3: Fetch comparable properties
    // ============================================
    const comparableHomes = await fetchComparableHomes(
      propertyProfile,
      'Halifax',
      5
    );
    // console.log('✅ Found', comparableHomes.length, 'comparable homes');

    // ============================================
    // STEP 4: Fetch market trends
    // ============================================
    const marketTrends = await fetchMarketTrends('Halifax');
    // console.log('✅ Fetched market trends');

    // ============================================
    // STEP 5: Query Qdrant for relevant agent advice
    // ============================================
    const userProfileText = buildUserProfileText(answers);
    const userProfileEmbedding = await generateEmbedding(userProfileText);
    
   

    const userProfile =  buildUserProfile(propertyProfile,flow)
    

    const agentAdvice = await queryRelevantAdvice(
      agentId, // ✅ FIXED: Pass agentId, not collection name
      userProfile,
      userProfileEmbedding,
      3
    );
    // console.log('✅ Found', agentAdvice.length, 'relevant advice pieces from Qdrant');

    // ============================================
    // STEP 6: Generate AI analysis using OpenAI
    // ============================================
  
    const flowType: FlowType = flow; // from frontend, e.g., body.flow

    // lookup the relevant config
    const formConfig = mapFlowConfigToFormConfig(flowConfigs[flowType], agentId, 'halifax')
    
    if (!formConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid flow type' },
        { status: 400 }
      );
    }
    
    // then call your analysis function
    const analysis = await generateFlowAnalysis(flowType, {
      leadData: { ...leadData, _id: leadId } as LeadSubmission,
      comparableHomes,
      marketTrends,
      agentAdvice,
      formConfig,
    });
     
    
    // console.log('✅ AI analysis generated');

    // ============================================
    // STEP 7: Update lead with analysis in MongoDB
    // ============================================
    // await updateLeadAnalysis(leadId, {
    //   estimatedValue: analysis.estimatedValue,
    //   comparableHomes,
    //   marketInsights: analysis.marketSummary,
    //   agentAdvice: analysis.personalizedAdvice,
    //   generatedAt: new Date(),
    // });
    // console.log('✅ Lead updated with analysis');

    // ============================================
    // STEP 8: Send emails (async, don't wait)
    // ============================================
    const agentInfo = {
      name: 'Chris Crowell',
      email: process.env.AGENT_EMAIL || 'agent@example.com',
      phone: '(902) 555-0123',
      photo: undefined,
    };

    // Send emails in background (don't block response)
    // Promise.all([
    //   sendUserAnalysisEmail(
    //     userEmail,
    //     'there',
    //     analysis,
    //     comparableHomes,
    //     agentInfo
    //   ).catch((err: Error) => console.error('Failed to send user email:', err)),
      
    //   sendAgentNotificationEmail(
    //     agentInfo.email,
    //     { ...leadData, _id: leadId } as LeadSubmission,
    //     analysis
    //   ).catch((err: Error) => console.error('Failed to send agent email:', err)),
    // ]);

    // ============================================
    // STEP 9: Return analysis to frontend
    // ============================================
    console.log('the final analysis',analysis)
    return NextResponse.json({
      success: true,
      leadId,
      message: 'Analysis generated successfully',
      analysis,
      comparableHomes,
    });

  } catch (error) {
    console.error('❌ Error processing form submission:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process submission',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Extract structured property profile from form answers
 */
function extractPropertyProfile(answers: FormAnswer[]): PropertyProfile {
  const profile: PropertyProfile = {};

  answers.forEach((answer) => {
    const value = answer.value;

    switch (answer.questionId) {
      case 'property_type':
        profile.type = value as string;
        break;
      case 'property_age':
        profile.estimatedAge = parsePropertyAge(value as string);
        break;
      case 'renovations':
        profile.hasRenovations = value === 'yes' || value === 'minor';
        break;
      case 'renovation_types':
        profile.renovationTypes = Array.isArray(value) ? value as string[] : [value as string];
        break;
      case 'mortgage_status':
        profile.mortgageStatus = value as string;
        break;
      case 'selling_reason':
        profile.sellingReason = value as string;
        break;
      case 'timeline':
        profile.timeline = value as string;
        break;
      case 'concerns':
        profile.specificConcerns = value as string;
        break;
    }
  });

  return profile;
}

/**
 * Convert property age range to estimated age
 */
function parsePropertyAge(ageRange: string): number {
  const ageMap: Record<string, number> = {
    '0-5': 3,
    '5-15': 10,
    '15-30': 22,
    '30+': 40,
  };

  return ageMap[ageRange] || 20;
}