// app/api/token-usage/track/route.ts
// API route to track token usage (called from API routes after LLM calls)

import { NextRequest, NextResponse } from 'next/server';
import { trackUsage } from '@/lib/tokenUsage/trackUsage';
import type { LLMUsageTracking } from '@/types/tokenUsage.types';

export async function POST(request: NextRequest) {
  try {
    const usage = await request.json() as LLMUsageTracking;
    
    // Convert timestamp string back to Date if needed
    if (typeof usage.timestamp === 'string') {
      usage.timestamp = new Date(usage.timestamp);
    }
    
    await trackUsage(usage);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}

