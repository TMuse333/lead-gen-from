// app/api/upload-headshot/route.ts
/**
 * API endpoint for uploading agent headshots to Vercel Blob
 */
import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export const runtime = 'nodejs';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Get existing headshot URL to delete it if it exists
    const configsCollection = await getClientConfigsCollection();
    const existingConfig = await configsCollection.findOne({ userId });
    const existingHeadshotUrl = existingConfig?.endingCTA?.headshot;

    // Upload to Vercel Blob
    // Store in agent-headshots folder with userId prefix
    const blob = await put(
      `agent-headshots/${userId}/${file.name}`,
      file,
      {
        access: 'public',
        addRandomSuffix: true,
      }
    );

    // Delete old headshot if it exists
    if (existingHeadshotUrl) {
      try {
        await del(existingHeadshotUrl);
        console.log(`[upload-headshot] Deleted old headshot: ${existingHeadshotUrl}`);
      } catch (deleteError) {
        // Non-critical error, log and continue
        console.warn(`[upload-headshot] Could not delete old headshot:`, deleteError);
      }
    }

    // Update the client config with the new headshot URL
    await configsCollection.updateOne(
      { userId },
      {
        $set: {
          'endingCTA.headshot': blob.url,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
    });
  } catch (error) {
    console.error('[upload-headshot] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload headshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove headshot
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get existing headshot URL
    const configsCollection = await getClientConfigsCollection();
    const existingConfig = await configsCollection.findOne({ userId });
    const existingHeadshotUrl = existingConfig?.endingCTA?.headshot;

    if (!existingHeadshotUrl) {
      return NextResponse.json(
        { error: 'No headshot to delete' },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    await del(existingHeadshotUrl);

    // Remove from config
    await configsCollection.updateOne(
      { userId },
      {
        $unset: { 'endingCTA.headshot': '' },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Headshot deleted',
    });
  } catch (error) {
    console.error('[upload-headshot] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete headshot' },
      { status: 500 }
    );
  }
}
