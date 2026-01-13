// app/api/fix-config-link/route.ts
// One-time fix to link userId to businessName config
// DELETE THIS FILE after running!

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const { businessName } = await request.json();
    if (!businessName) {
      return NextResponse.json({ error: 'businessName required' }, { status: 400 });
    }

    const collection = await getClientConfigsCollection();
    const userId = session.user.id;

    console.log('\n🔧 FIX CONFIG LINK');
    console.log('User ID:', userId);
    console.log('Business Name:', businessName);

    // Find both records
    const businessRecord = await collection.findOne({ businessName, isActive: true });
    const userRecord = await collection.findOne({ userId });

    console.log('\nBusiness record exists:', !!businessRecord);
    console.log('User record exists:', !!userRecord);

    if (!businessRecord) {
      return NextResponse.json({ error: `No record found for businessName: ${businessName}` }, { status: 404 });
    }

    // Check if user record has customPhases to copy
    if (userRecord?.customPhases) {
      console.log('\n✅ User record has customPhases - copying to business record');
      console.log('Flows with phases:', Object.keys(userRecord.customPhases));

      // Copy customPhases from user record to business record
      await collection.updateOne(
        { businessName, isActive: true },
        {
          $set: {
            userId: userId,
            customPhases: userRecord.customPhases,
            customQuestions: userRecord.customQuestions,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Copied customPhases from user record to business record',
        action: 'copied',
        customPhasesFlows: Object.keys(userRecord.customPhases),
      });
    } else {
      console.log('\n⚠️ No customPhases in user record - just linking userId');

      // Just link the userId
      await collection.updateOne(
        { businessName, isActive: true },
        {
          $set: {
            userId: userId,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Linked userId to business record (no customPhases to copy)',
        action: 'linked',
      });
    }
  } catch (error) {
    console.error('Fix config link error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('businessName');

    const collection = await getClientConfigsCollection();
    const userId = session.user.id;

    const businessRecord = businessName
      ? await collection.findOne({ businessName, isActive: true })
      : null;
    const userRecord = await collection.findOne({ userId });

    return NextResponse.json({
      userId,
      businessRecord: businessRecord ? {
        businessName: businessRecord.businessName,
        hasUserId: !!businessRecord.userId,
        linkedUserId: businessRecord.userId,
        hasCustomPhases: !!businessRecord.customPhases,
        customPhasesFlows: businessRecord.customPhases ? Object.keys(businessRecord.customPhases) : [],
      } : null,
      userRecord: userRecord ? {
        businessName: userRecord.businessName,
        hasCustomPhases: !!userRecord.customPhases,
        customPhasesFlows: userRecord.customPhases ? Object.keys(userRecord.customPhases) : [],
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
