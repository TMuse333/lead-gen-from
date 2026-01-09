// app/api/user/color-config/route.ts
// API route to update user's color configuration

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Get color config from request body
    const { colorConfig } = await request.json();

    if (!colorConfig) {
      return NextResponse.json(
        { error: 'Color configuration is required' },
        { status: 400 }
      );
    }

    // 3. Validate color config structure (basic validation)
    const requiredFields = ['name', 'primary', 'secondary', 'background', 'surface', 'text', 'textSecondary'];
    for (const field of requiredFields) {
      if (!colorConfig[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 4. Update color config in MongoDB
    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      { userId },
      {
        $set: {
          colorConfig: colorConfig as ColorTheme,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { 
          error: 'Configuration not found',
          message: 'Please complete onboarding first',
        },
        { status: 404 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: 'Color configuration updated successfully',
      data: {
        colorConfig: colorConfig.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update color configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

