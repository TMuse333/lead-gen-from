// scripts/migrate-advice-types.ts
// Migration script to add type field and type tag to existing advice items in Qdrant

import { QdrantClient } from '@qdrant/js-client-rest';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { DEFAULT_ADVICE_TYPE, ensureTypeTag, getAdviceTypeFromTags, ADVICE_TYPES } from '../types/advice.types';

dotenv.config({ path: '../../.env' });

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const dbName = process.env.MONGODB_DB_NAME || 'agent_lead_gen';

/**
 * Migrate a single Qdrant collection
 */
async function migrateCollection(collectionName: string): Promise<number> {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  let updatedCount = 0;
  let offset: string | undefined = undefined;
  const batchSize = 100;

  do {
    // Scroll through collection in batches
    const scrollResult = await qdrant.scroll(collectionName, {
      limit: batchSize,
      offset,
      with_payload: true,
      with_vector: false,
    });

    if (scrollResult.points.length === 0) {
      break;
    }

    console.log(`   Processing batch of ${scrollResult.points.length} items...`);

    // Prepare updates for this batch
    const updates: Array<{ id: string; payload: any }> = [];

    for (const point of scrollResult.points) {
      const payload = point.payload as any;
      const tags = (payload?.tags as string[]) || [];
      
      // Check if already has type
      const existingType = payload?.type;
      const hasTypeTag = ADVICE_TYPES.some(t => tags.includes(t));
      
      // Skip if already migrated (has both type field and type tag)
      if (existingType && hasTypeTag) {
        continue;
      }

      // Determine the type to use
      const adviceType = existingType || getAdviceTypeFromTags(tags) || DEFAULT_ADVICE_TYPE;
      
      // Ensure type tag is in tags
      const updatedTags = ensureTypeTag(tags, adviceType);

      // Prepare payload update
      const updatedPayload = {
        ...payload,
        tags: updatedTags,
        type: adviceType,
        updatedAt: new Date().toISOString(),
      };

      updates.push({
        id: point.id as string,
        payload: updatedPayload,
      });
    }

    // Update batch in Qdrant
    // Note: Qdrant setPayload doesn't support different payloads per point
    // We need to update them individually
    if (updates.length > 0) {
      for (const update of updates) {
        await qdrant.setPayload(collectionName, {
          wait: true,
          points: [update.id],
          payload: update.payload,
        });
      }

      updatedCount += updates.length;
      console.log(`   ✅ Updated ${updates.length} items in this batch`);
    }

    // Get next offset
    offset = scrollResult.next_page_offset as string;
  } while (offset);

  console.log(`✅ Collection ${collectionName}: Updated ${updatedCount} items`);
  return updatedCount;
}

/**
 * Get all user collections from MongoDB
 */
async function getAllUserCollections(): Promise<string[]> {
  const client = new MongoClient(MONGODB_URI!);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const configs = await db.collection('client_configs').find({
      qdrantCollectionName: { $exists: true, $ne: null }
    }).toArray();

    const collections = configs
      .map(config => config.qdrantCollectionName)
      .filter((name): name is string => typeof name === 'string' && name.length > 0);

    return [...new Set(collections)]; // Remove duplicates
  } finally {
    await client.close();
  }
}

/**
 * Main migration function
 */
async function main() {
  try {
    console.log('🚀 Starting Advice Type Migration...\n');

    // Get collection name from command line or use all user collections
    const collectionNameArg = process.argv[2];
    
    let collectionsToMigrate: string[];

    if (collectionNameArg) {
      // Migrate specific collection
      console.log(`📋 Migrating specific collection: ${collectionNameArg}`);
      collectionsToMigrate = [collectionNameArg];
    } else {
      // Migrate all user collections from MongoDB
      console.log('📋 Fetching all user collections from MongoDB...');
      collectionsToMigrate = await getAllUserCollections();
      console.log(`✅ Found ${collectionsToMigrate.length} collection(s) to migrate`);
    }

    if (collectionsToMigrate.length === 0) {
      console.log('⚠️  No collections found to migrate');
      return;
    }

    // Verify collections exist in Qdrant
    const qdrantCollections = await qdrant.getCollections();
    const existingCollections = qdrantCollections.collections.map(c => c.name);
    
    const validCollections = collectionsToMigrate.filter(name => 
      existingCollections.includes(name)
    );

    if (validCollections.length === 0) {
      console.log('⚠️  None of the specified collections exist in Qdrant');
      return;
    }

    if (validCollections.length < collectionsToMigrate.length) {
      const missing = collectionsToMigrate.filter(name => !existingCollections.includes(name));
      console.log(`⚠️  Warning: ${missing.length} collection(s) not found in Qdrant: ${missing.join(', ')}`);
    }

    // Migrate each collection
    let totalUpdated = 0;
    for (const collectionName of validCollections) {
      try {
        const count = await migrateCollection(collectionName);
        totalUpdated += count;
      } catch (error) {
        console.error(`❌ Error migrating ${collectionName}:`, error);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Total collections migrated: ${validCollections.length}`);
    console.log(`   Total items updated: ${totalUpdated}`);
    console.log(`\n📝 All advice items now have:`);
    console.log(`   - type field: '${DEFAULT_ADVICE_TYPE}' (or existing type if found)`);
    console.log(`   - type tag in tags array`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();

