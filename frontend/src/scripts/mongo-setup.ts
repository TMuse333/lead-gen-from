// ============================================
// MONGODB SETUP SCRIPT
// ============================================
// Run this once to set up collections and indexes
// Usage: npx tsx scripts/setup-mongodb.ts

import { getDatabase } from '../lib/mongodb/mongodb';
import { COLLECTION_INDEXES } from '../lib/mongodb/models';
import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' });

async function setupMongoDB() {
  try {
    console.log('🚀 Starting MongoDB setup...\n');

    const db = await getDatabase();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${db.databaseName}\n`);

    // Create collections if they don't exist
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map((c) => c.name);

    const collections = ['leads', 'form_configs', 'agents'];

    for (const collectionName of collections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`⏭️  Collection already exists: ${collectionName}`);
      }
    }

    console.log('\n📊 Creating indexes...\n');

    // Create indexes for leads collection
    const leadsCollection = db.collection('leads');
    for (const indexSpec of COLLECTION_INDEXES.leads) {
      try {
        await leadsCollection.createIndex(indexSpec); // ✅ Changed: removed .key
        console.log(`✅ Created index on leads:`, JSON.stringify(indexSpec));
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          console.log(`⏭️  Index already exists on leads:`, JSON.stringify(indexSpec));
        } else {
          throw error;
        }
      }
    }

    // Create indexes for form_configs collection
    const formConfigsCollection = db.collection('form_configs');
    for (const indexSpec of COLLECTION_INDEXES.form_configs) {
      try {
        await formConfigsCollection.createIndex(indexSpec); // ✅ Changed: removed .key
        console.log(`✅ Created index on form_configs:`, JSON.stringify(indexSpec));
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          console.log(`⏭️  Index already exists on form_configs:`, JSON.stringify(indexSpec));
        } else {
          throw error;
        }
      }
    }

    // Create indexes for agents collection (with unique constraints)
    const agentsCollection = db.collection('agents');
    
    // Create unique index on userId
    try {
      await agentsCollection.createIndex({ userId: 1 }, { unique: true });
      console.log(`✅ Created unique index on agents: {"userId":1}`);
    } catch (error: any) {
      if (error.code === 85 || error.code === 86) {
        console.log(`⏭️  Index already exists on agents: {"userId":1}`);
      } else {
        throw error;
      }
    }

    // Create unique index on email
    try {
      await agentsCollection.createIndex({ email: 1 }, { unique: true });
      console.log(`✅ Created unique index on agents: {"email":1}`);
    } catch (error: any) {
      if (error.code === 85 || error.code === 86) {
        console.log(`⏭️  Index already exists on agents: {"email":1}`);
      } else {
        throw error;
      }
    }

    console.log('\n🎉 MongoDB setup complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Database: ${db.databaseName}`);
    console.log(`   • Collections: ${collections.join(', ')}`);
    console.log(`   • Indexes created for optimal querying`);
    console.log('\n✅ You can now start using the database!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up MongoDB:', error);
    process.exit(1);
  }
}

setupMongoDB();