// scripts/fix-collection-name.ts
// Quick fix: Point Thomas's config to Bob's Qdrant collection

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri';

async function fixCollectionName() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('agent_lead_gen');
    const collection = db.collection('client_configs');

    // Update Thomas's config to use Bob's collection
    const result = await collection.updateOne(
      { userId: '68698347bb2081f4e00e6a82' }, // Thomas's userId
      {
        $set: {
          qdrantCollectionName: 'user-bob-real-estate-advice',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User config not found');
      return;
    }

    console.log('✅ Updated qdrantCollectionName to: user-bob-real-estate-advice');
    console.log(`   Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const updated = await collection.findOne({ userId: '68698347bb2081f4e00e6a82' });
    console.log('\n📋 Current config:');
    console.log(`   businessName: ${updated?.businessName}`);
    console.log(`   qdrantCollectionName: ${updated?.qdrantCollectionName}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixCollectionName();
