// src/lib/auth/impersonation.ts
// Helper utilities for admin impersonation

import { cookies } from 'next/headers';
import { auth } from './authConfig';

export interface ImpersonationData {
  adminId: string;
  adminEmail: string | null | undefined;
  targetUserId: string;
  targetBusinessName: string;
  timestamp: string;
}

/**
 * Get current impersonation data if admin is impersonating
 */
export async function getImpersonationData(): Promise<ImpersonationData | null> {
  try {
    const cookieStore = await cookies();
    const impersonationCookie = cookieStore.get('admin_impersonation');

    if (!impersonationCookie) {
      return null;
    }

    return JSON.parse(impersonationCookie.value) as ImpersonationData;
  } catch (error) {
    return null;
  }
}

/**
 * Get the effective user ID - returns impersonated userId if admin is impersonating,
 * otherwise returns the actual logged-in userId
 */
export async function getEffectiveUserId(): Promise<string | null> {
  const impersonation = await getImpersonationData();

  if (impersonation) {
    return impersonation.targetUserId;
  }

  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Check if current user is admin impersonating another user
 */
export async function isImpersonating(): Promise<boolean> {
  const impersonation = await getImpersonationData();
  return impersonation !== null;
}
