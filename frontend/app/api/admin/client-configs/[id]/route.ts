// app/api/admin/client-configs/[id]/route.ts
// API route to get or delete a specific client configuration by ID

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { ObjectId } from 'mongodb';
import { qdrant } from '@/lib/qdrant/client';
import { deleteUserCollection } from '@/lib/qdrant/userCollections';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin check here

    // 2. Await params (Next.js 15+)
    const { id } = await params;

    // 3. Get client configuration by ID
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // 3. Return full configuration
    return NextResponse.json({
      success: true,
      config: {
        ...config,
        id: config._id?.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching client config:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch client configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin check here
    // const isAdmin = await checkAdminStatus(session.user.id);
    // if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Await params (Next.js 15+)
    const { id } = await params;

    // 3. Get client configuration by ID
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Deleting configuration: ${config.businessName} (ID: ${id})`);

    // 3. Delete Qdrant collection if it exists
    if (config.qdrantCollectionName) {
      try {
        // Check if collection exists before trying to delete
        const { collections } = await qdrant.getCollections();
        const collectionExists = collections.some(
          (col) => col.name === config.qdrantCollectionName
        );

        if (collectionExists) {
          await qdrant.deleteCollection(config.qdrantCollectionName);
          console.log(`✅ Deleted Qdrant collection: ${config.qdrantCollectionName}`);
        } else {
          console.log(`⚠️ Qdrant collection not found: ${config.qdrantCollectionName}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting Qdrant collection:`, error);
        // Continue with MongoDB deletion even if Qdrant deletion fails
      }
    }

    // 4. Delete from MongoDB
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found or already deleted' },
        { status: 404 }
      );
    }

    console.log(`✅ Deleted configuration: ${config.businessName}`);

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
      deletedConfig: {
        id: id,
        businessName: config.businessName,
        qdrantCollectionName: config.qdrantCollectionName,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting client config:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete client configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
