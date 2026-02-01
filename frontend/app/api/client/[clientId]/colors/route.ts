// app/api/client/[clientId]/colors/route.ts
// API endpoint to update chatbot colors from external apps (e.g., next-js-template)

import { NextRequest, NextResponse } from 'next/server';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

// Simple API key auth for external apps
const PROVISION_API_KEY = process.env.PROVISION_API_KEY || 'dev-provision-key';

interface ColorUpdateRequest {
  primary: string;
  secondary?: string;
  background: string;
  surface?: string;
  text: string;
  textSecondary?: string;
  accent?: string;
  border?: string;
  success?: string;
  error?: string;
  warning?: string;
  buttonHover?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // 1. Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== PROVISION_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Unwrap params (Next.js 15+)
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // 3. Parse request body
    const colorUpdate: ColorUpdateRequest = await request.json();

    // 4. Validate required fields
    if (!colorUpdate.primary || !colorUpdate.background || !colorUpdate.text) {
      return NextResponse.json(
        { error: 'Missing required fields: primary, background, and text are required' },
        { status: 400 }
      );
    }

    // 5. Build complete ColorTheme object with defaults
    const colorConfig: ColorTheme = {
      name: 'Custom (External)',
      primary: colorUpdate.primary,
      secondary: colorUpdate.secondary || colorUpdate.primary,
      background: colorUpdate.background,
      surface: colorUpdate.surface || colorUpdate.background,
      text: colorUpdate.text,
      textSecondary: colorUpdate.textSecondary || colorUpdate.text,
      accent: colorUpdate.accent || colorUpdate.primary,
      border: colorUpdate.border || colorUpdate.text,
      success: colorUpdate.success || '#10b981',
      error: colorUpdate.error || '#ef4444',
      warning: colorUpdate.warning || '#f59e0b',
      buttonHover: colorUpdate.buttonHover || colorUpdate.primary,
      gradientFrom: colorUpdate.gradientFrom || colorUpdate.primary,
      gradientTo: colorUpdate.gradientTo || colorUpdate.secondary || colorUpdate.primary,
    };

    // 6. Update color config in MongoDB
    const collection = await getClientConfigsCollection();
    const result = await collection.updateOne(
      {
        businessName: clientId,
        isActive: true
      },
      {
        $set: {
          colorConfig,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Configuration not found',
          message: `No active bot configuration found for "${clientId}"`,
        },
        { status: 404 }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: 'Color configuration updated successfully',
      data: {
        clientId,
        colorsUpdated: {
          primary: colorConfig.primary,
          background: colorConfig.background,
          text: colorConfig.text,
        },
      },
    });
  } catch (error) {
    console.error('Color update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update color configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
