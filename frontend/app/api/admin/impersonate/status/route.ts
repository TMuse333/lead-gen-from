// app/api/admin/impersonate/status/route.ts
// Returns current impersonation status

import { NextResponse } from 'next/server';
import { getImpersonationData } from '@/lib/auth/impersonation';

export async function GET() {
  try {
    const impersonation = await getImpersonationData();

    if (!impersonation) {
      return NextResponse.json({
        isImpersonating: false,
      });
    }

    return NextResponse.json({
      isImpersonating: true,
      targetUserId: impersonation.targetUserId,
      targetBusinessName: impersonation.targetBusinessName,
      adminId: impersonation.adminId,
      adminEmail: impersonation.adminEmail,
      timestamp: impersonation.timestamp,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get impersonation status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
