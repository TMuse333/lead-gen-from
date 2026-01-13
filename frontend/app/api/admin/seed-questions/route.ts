// app/api/admin/seed-questions/route.ts
/**
 * Admin endpoint to seed questions for any client by business name
 *
 * POST /api/admin/seed-questions
 * Body: { businessName: string, force?: boolean }
 *
 * Requires authenticated session (admin use only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import {
  generateAllDefaultQuestions,
  getDefaultQuestionsSummary,
} from '@/lib/mongodb/seedQuestions';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, force = false } = body as {
      businessName?: string;
      force?: boolean;
    };

    if (!businessName) {
      return NextResponse.json(
        { error: 'businessName is required' },
        { status: 400 }
      );
    }

    const collection = await getClientConfigsCollection();

    // Find the client (case-insensitive)
    const config = await collection.findOne({
      $or: [
        { businessName: { $regex: new RegExp(`^${businessName}$`, 'i') } },
        { businessName },
      ],
    });

    if (!config) {
      return NextResponse.json(
        { error: `Client "${businessName}" not found` },
        { status: 404 }
      );
    }

    // Check existing questions
    const existingCounts = {
      buy: config.customQuestions?.buy?.length || 0,
      sell: config.customQuestions?.sell?.length || 0,
      browse: config.customQuestions?.browse?.length || 0,
    };

    const hasExisting = existingCounts.buy > 0 || existingCounts.sell > 0 || existingCounts.browse > 0;

    if (hasExisting && !force) {
      return NextResponse.json({
        success: false,
        error: 'Client has existing questions',
        hint: 'Use force: true to overwrite',
        existing: existingCounts,
        client: config.businessName,
      });
    }

    // Generate and save default questions
    const defaultQuestions = generateAllDefaultQuestions();
    const summary = getDefaultQuestionsSummary();

    const result = await collection.updateOne(
      { _id: config._id },
      {
        $set: {
          customQuestions: defaultQuestions,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Seeded ${config.businessName} with default questions`,
        client: config.businessName,
        seeded: summary,
        previousCounts: existingCounts,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No changes made',
      client: config.businessName,
    });
  } catch (error) {
    console.error('[admin/seed-questions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed-questions?businessName=bob
 * Check what questions a client currently has
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('businessName');

    const collection = await getClientConfigsCollection();

    if (businessName) {
      // Get specific client
      const config = await collection.findOne({
        $or: [
          { businessName: { $regex: new RegExp(`^${businessName}$`, 'i') } },
          { businessName },
        ],
      });

      if (!config) {
        return NextResponse.json(
          { error: `Client "${businessName}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        client: config.businessName,
        questions: {
          buy: {
            count: config.customQuestions?.buy?.length || 0,
            questions: config.customQuestions?.buy?.map((q: any) => ({
              id: q.id,
              question: q.question?.substring(0, 50),
              inputType: q.inputType,
              mappingKey: q.mappingKey,
              order: q.order,
            })) || [],
          },
          sell: {
            count: config.customQuestions?.sell?.length || 0,
            questions: config.customQuestions?.sell?.map((q: any) => ({
              id: q.id,
              question: q.question?.substring(0, 50),
              inputType: q.inputType,
              mappingKey: q.mappingKey,
              order: q.order,
            })) || [],
          },
          browse: {
            count: config.customQuestions?.browse?.length || 0,
            questions: config.customQuestions?.browse?.map((q: any) => ({
              id: q.id,
              question: q.question?.substring(0, 50),
              inputType: q.inputType,
              mappingKey: q.mappingKey,
              order: q.order,
            })) || [],
          },
        },
        defaultPreview: getDefaultQuestionsSummary(),
      });
    }

    // List all clients
    const configs = await collection
      .find({}, { projection: { businessName: 1, customQuestions: 1 } })
      .toArray();

    return NextResponse.json({
      success: true,
      clients: configs.map((c) => ({
        businessName: c.businessName,
        hasQuestions: {
          buy: (c.customQuestions?.buy?.length || 0) > 0,
          sell: (c.customQuestions?.sell?.length || 0) > 0,
          browse: (c.customQuestions?.browse?.length || 0) > 0,
        },
        counts: {
          buy: c.customQuestions?.buy?.length || 0,
          sell: c.customQuestions?.sell?.length || 0,
          browse: c.customQuestions?.browse?.length || 0,
        },
      })),
      defaultPreview: getDefaultQuestionsSummary(),
    });
  } catch (error) {
    console.error('[admin/seed-questions] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
