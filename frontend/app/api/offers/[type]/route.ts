// frontend/app/api/offers/[type]/route.ts
/**
 * API route for managing individual offer customizations
 * GET: Fetch merged offer definition (system + user customizations)
 * PUT: Save user customizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb/db';
import {
  getOfferCustomization,
  upsertOfferCustomization,
  deleteOfferCustomization,
} from '@/lib/mongodb/models/offerCustomization';
import { getOfferDefinition } from '@/lib/offers';
import { mergeOfferDefinition } from '@/lib/offers/utils/mergeCustomizations';
import { validateCustomizations } from '@/lib/offers/utils/validateCustomizations';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferCustomizations } from '@/types/offerCustomization.types';

/**
 * GET /api/offers/[type]
 * Fetch merged offer definition (system defaults + user customizations)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerType = params.type as OfferType;

    // Get system definition
    const systemDef = getOfferDefinition(offerType);
    if (!systemDef) {
      return NextResponse.json(
        { error: 'Offer type not found' },
        { status: 404 }
      );
    }

    // Get user customizations
    const { db } = await connectToDatabase();
    const customization = await getOfferCustomization(
      db,
      session.user.email,
      offerType
    );

    // Merge system definition with user customizations
    const mergedDef = mergeOfferDefinition(systemDef, customization);

    return NextResponse.json({
      definition: mergedDef,
      customization: customization?.customizations || null,
      hasCustomizations: !!customization?.customizations,
      metadata: {
        lastTestedAt: customization?.lastTestedAt,
        lastGeneratedAt: customization?.lastGeneratedAt,
      },
    });
  } catch (error) {
    console.error('[GET /api/offers/[type]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/offers/[type]
 * Save user customizations
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerType = params.type as OfferType;
    const body = await req.json();
    const customizations: OfferCustomizations = body.customizations;

    // Validate offer type exists
    const systemDef = getOfferDefinition(offerType);
    if (!systemDef) {
      return NextResponse.json(
        { error: 'Offer type not found' },
        { status: 404 }
      );
    }

    // Validate customizations
    const validation = validateCustomizations(customizations);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid customizations',
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Save to database
    const { db } = await connectToDatabase();
    const result = await upsertOfferCustomization(
      db,
      session.user.email,
      offerType,
      customizations
    );

    return NextResponse.json({
      success: true,
      customization: result,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('[PUT /api/offers/[type]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/offers/[type]
 * Reset to system defaults (remove customizations)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerType = params.type as OfferType;

    // Delete customizations
    const { db } = await connectToDatabase();
    const deleted = await deleteOfferCustomization(
      db,
      session.user.email,
      offerType
    );

    return NextResponse.json({
      success: true,
      deleted,
    });
  } catch (error) {
    console.error('[DELETE /api/offers/[type]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
