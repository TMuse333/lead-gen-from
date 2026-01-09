// frontend/app/api/offers/[type]/route.ts
/**
 * API route for managing individual offer customizations
 * GET: Fetch merged offer definition (system + user customizations)
 * PUT: Save user customizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getDatabase } from '@/lib/mongodb/db';
import {
  getOfferCustomization,
  upsertOfferCustomization,
  deleteOfferCustomization,
} from '@/lib/mongodb/models/offerCustomization';
import { getOfferDefinition, getAvailableOfferTypes } from '@/lib/offers';
import { mergeOfferDefinition } from '@/lib/offers/utils/mergeCustomizations';
import { validateCustomizations } from '@/lib/offers/utils/validateCustomizations';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { OfferCustomizations } from '@/types/offers/offerCustomization.types';

/**
 * GET /api/offers/[type]
 * Fetch merged offer definition (system defaults + user customizations)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15+ requirement)
    const { type } = await params;

    // Normalize the offer type (handle URL encoding, case, etc.)
    let offerType = type as OfferType;
    
    // Handle potential URL encoding issues (e.g., "home-estimate" might come through differently)
    // Also handle case variations
    const normalizedType = offerType.toLowerCase().trim();
    
    // Map common variations to correct types
    const typeMap: Record<string, OfferType> = {
      'homeestimate': 'home-estimate',
      'home-estimate': 'home-estimate',
      'home_estimate': 'home-estimate',
      'landingpage': 'landingPage',
      'landing-page': 'landingPage',
      'landing_page': 'landingPage',
      'pdf': 'pdf',
      'video': 'video',
      'custom': 'custom',
    };
    
    offerType = (typeMap[normalizedType] || normalizedType) as OfferType;

    // Get available types
    const availableTypes = getAvailableOfferTypes();

    // Get system definition
    const systemDef = getOfferDefinition(offerType);
    if (!systemDef) {
      return NextResponse.json(
        { 
          error: `Offer type "${type}" not found. Available types: ${availableTypes.join(', ')}`,
          requested: type,
          normalized: offerType,
          available: availableTypes
        },
        { status: 404 }
      );
    }

    // Get user customizations
    const db = await getDatabase();
    const customization = await getOfferCustomization(
      db,
      session.user.id,
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
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15+ requirement)
    const { type } = await params;
    const offerType = type as OfferType;
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
    const db = await getDatabase();
    const result = await upsertOfferCustomization(
      db,
      session.user.id,
      offerType,
      customizations
    );

    return NextResponse.json({
      success: true,
      customization: result,
      warnings: validation.warnings,
    });
  } catch (error) {
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
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15+ requirement)
    const { type } = await params;
    const offerType = type as OfferType;

    // Delete customizations
    const db = await getDatabase();
    const deleted = await deleteOfferCustomization(
      db,
      session.user.id,
      offerType
    );

    return NextResponse.json({
      success: true,
      deleted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
