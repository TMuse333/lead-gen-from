// app/api/admin/impersonate/route.ts
// Allows admin to impersonate a user and access their dashboard

import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/adminCheck';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 1. Check if user is admin
    const session = await checkIsAdmin();
    if (!session) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 2. Get target userId from request
    const { userId, businessName } = await request.json();

    if (!userId && !businessName) {
      return NextResponse.json(
        { error: 'userId or businessName is required' },
        { status: 400 }
      );
    }

    // 3. Verify the target user exists
    const collection = await getClientConfigsCollection();
    const targetConfig = businessName
      ? await collection.findOne({ businessName })
      : await collection.findOne({ userId });

    if (!targetConfig) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Store impersonation data in cookie
    const cookieStore = await cookies();

    // Store original admin userId and target userId in secure httpOnly cookie
    cookieStore.set('admin_impersonation', JSON.stringify({
      adminId: session.user?.id || '',
      adminEmail: session.user?.email || '',
      targetUserId: targetConfig.userId,
      targetBusinessName: targetConfig.businessName,
      timestamp: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: `Impersonating ${targetConfig.businessName}`,
      redirectTo: '/dashboard',
      targetUser: {
        userId: targetConfig.userId,
        businessName: targetConfig.businessName,
        email: targetConfig.notificationEmail,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to start impersonation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // End impersonation - clear cookie and redirect back to admin
    const cookieStore = await cookies();
    cookieStore.delete('admin_impersonation');

    return NextResponse.json({
      success: true,
      message: 'Impersonation ended',
      redirectTo: '/admin/dashboard',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to end impersonation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
