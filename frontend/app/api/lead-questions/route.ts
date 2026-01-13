// app/api/lead-questions/route.ts
/**
 * API endpoint for leads to submit questions from the results page
 * Stores questions in the database and can optionally notify the agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLeadQuestionsCollection, getGenerationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

interface LeadQuestionSubmission {
  name: string;
  email: string;
  question: string;
  conversationId?: string;
  agentEmail?: string;
  agentName?: string;
}

/**
 * POST /api/lead-questions
 * Submit a question from a lead on the results page
 */
export async function POST(req: NextRequest) {
  try {
    const body: LeadQuestionSubmission = await req.json();
    const { name, email, question, conversationId, agentEmail, agentName } = body;

    // Validate required fields
    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get the lead questions collection
    const questionsCollection = await getLeadQuestionsCollection();

    // Find the userId from the generation if conversationId is provided
    let userId: string | undefined;
    if (conversationId) {
      try {
        const generationsCollection = await getGenerationsCollection();
        const generation = await generationsCollection.findOne({
          conversationId: new ObjectId(conversationId),
        });
        userId = generation?.userId;
      } catch (e) {
        // Couldn't find generation, continue without userId
      }
    }

    // Create the question document
    const questionDoc = {
      name: name || 'Anonymous',
      email: email || '',
      question: question.trim(),
      conversationId: conversationId || null,
      userId: userId || null,
      agentEmail: agentEmail || null,
      agentName: agentName || null,
      status: 'new' as const,
      submittedAt: new Date(),
      respondedAt: null,
      response: null,
    };

    // Insert into database
    const result = await questionsCollection.insertOne(questionDoc);

    // TODO: Optionally send email notification to agent
    // This could be implemented with a service like SendGrid, Resend, etc.
    // if (agentEmail) {
    //   await sendEmailNotification(agentEmail, {
    //     leadName: name,
    //     leadEmail: email,
    //     question,
    //   });
    // }

    return NextResponse.json({
      success: true,
      questionId: result.insertedId.toString(),
      message: 'Question submitted successfully',
    });
  } catch (error) {
    console.error('[lead-questions] Error submitting question:', error);
    return NextResponse.json(
      { error: 'Failed to submit question', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lead-questions
 * Get all questions for the authenticated user (agent dashboard)
 */
export async function GET(req: NextRequest) {
  try {
    // For now, return all questions (in production, this should be authenticated)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const questionsCollection = await getLeadQuestionsCollection();

    // Build query
    const query: Record<string, any> = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const questions = await questionsCollection
      .find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('[lead-questions] Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
