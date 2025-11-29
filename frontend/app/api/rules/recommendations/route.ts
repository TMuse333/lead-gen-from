// app/api/rules/recommendations/route.ts
// Get, update, or delete saved rule recommendations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getRuleRecommendationsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';

// GET - Fetch saved recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow') || null;

    const collection = await getRuleRecommendationsCollection();
    const saved = await collection.findOne({
      userId: session.user.id,
      flow: flow,
    });

    if (!saved) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        hasRecommendations: false,
      });
    }

    return NextResponse.json({
      success: true,
      recommendations: saved.recommendations || [],
      hasRecommendations: (saved.recommendations?.length || 0) > 0,
      generatedAt: saved.generatedAt,
      updatedAt: saved.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update a specific recommendation
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, updates, flow } = await request.json();

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'recommendationId is required' },
        { status: 400 }
      );
    }

    const collection = await getRuleRecommendationsCollection();
    const saved = await collection.findOne({
      userId: session.user.id,
      flow: flow || null,
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Recommendations not found' },
        { status: 404 }
      );
    }

    // Update the specific recommendation
    const updatedRecommendations = saved.recommendations.map((rec: any) => {
      if (rec.id === recommendationId) {
        return {
          ...rec,
          ...updates,
          updatedAt: new Date(),
        };
      }
      return rec;
    });

    await collection.updateOne(
      { userId: session.user.id, flow: flow || null },
      {
        $set: {
          recommendations: updatedRecommendations,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Recommendation updated',
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      {
        error: 'Failed to update recommendation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific recommendation or all recommendations
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('recommendationId');
    const flow = searchParams.get('flow') || null;
    const deleteAll = searchParams.get('deleteAll') === 'true';

    const collection = await getRuleRecommendationsCollection();

    if (deleteAll) {
      // Delete entire document
      await collection.deleteOne({
        userId: session.user.id,
        flow: flow,
      });
      return NextResponse.json({
        success: true,
        message: 'All recommendations deleted',
      });
    } else if (recommendationId) {
      // Delete specific recommendation
      const saved = await collection.findOne({
        userId: session.user.id,
        flow: flow,
      });

      if (!saved) {
        return NextResponse.json(
          { error: 'Recommendations not found' },
          { status: 404 }
        );
      }

      const filteredRecommendations = saved.recommendations.filter(
        (rec: any) => rec.id !== recommendationId
      );

      await collection.updateOne(
        { userId: session.user.id, flow: flow },
        {
          $set: {
            recommendations: filteredRecommendations,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Recommendation deleted',
      });
    } else {
      return NextResponse.json(
        { error: 'recommendationId or deleteAll is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete recommendation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Add a manual recommendation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendation, flow } = await request.json();

    if (!recommendation || !recommendation.ruleGroup || !recommendation.title) {
      return NextResponse.json(
        { error: 'Invalid recommendation structure' },
        { status: 400 }
      );
    }

    const collection = await getRuleRecommendationsCollection();
    const now = new Date();

    const newRecommendation = {
      id: recommendation.id || `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: recommendation.title,
      description: recommendation.description || '',
      ruleGroup: recommendation.ruleGroup,
      reasoning: recommendation.reasoning || 'Manually created rule',
      confidence: recommendation.confidence || 1.0,
      isManual: true,
      createdAt: now,
    };

    // Check if document exists
    const existing = await collection.findOne({
      userId: session.user.id,
      flow: flow || null,
    });

    if (existing) {
      // Add to existing recommendations
      await collection.updateOne(
        { userId: session.user.id, flow: flow || null },
        {
          $push: { recommendations: newRecommendation },
          $set: { updatedAt: now },
        }
      );
    } else {
      // Create new document
      await collection.insertOne({
        userId: session.user.id,
        flow: flow || null,
        recommendations: [newRecommendation],
        generatedAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      recommendation: newRecommendation,
      message: 'Recommendation added',
    });
  } catch (error) {
    console.error('Error adding recommendation:', error);
    return NextResponse.json(
      {
        error: 'Failed to add recommendation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

