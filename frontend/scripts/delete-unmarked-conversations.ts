// scripts/delete-unmarked-conversations.ts
// Run with: npx tsx scripts/delete-unmarked-conversations.ts

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function deleteUnmarkedConversations() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    console.error('Make sure .env.local or .env has MONGODB_URI set');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('conversations');

    // Find conversations without environment field OR with null environment
    const unmarkedCount = await collection.countDocuments({
      $or: [
        { environment: { $exists: false } },
        { environment: null }
      ]
    });

    console.log(`Found ${unmarkedCount} conversations without valid environment field`);

    // Also show breakdown
    const allConvos = await collection.find({}).project({ environment: 1 }).toArray();
    const breakdown: Record<string, number> = {};
    for (const c of allConvos) {
      const env = c.environment ?? 'undefined/null';
      breakdown[env] = (breakdown[env] || 0) + 1;
    }
    console.log('Environment breakdown:', breakdown);

    if (unmarkedCount > 0) {
      const result = await collection.deleteMany({
        $or: [
          { environment: { $exists: false } },
          { environment: null }
        ]
      });
      console.log(`Deleted ${result.deletedCount} unmarked conversations`);
    } else {
      console.log('No unmarked conversations to delete');
    }

  } finally {
    await client.close();
    console.log('Done');
  }
}

deleteUnmarkedConversations().catch(console.error);
