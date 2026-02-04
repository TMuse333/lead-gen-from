// scripts/list-users.ts
// List all users to find the right one

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri';

async function listUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('agent_lead_gen');
    const collection = db.collection('client_configs');

    const users = await collection.find({}).toArray();

    console.log(`\n📋 Found ${users.length} user config(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. UserId: ${user.userId}`);
      console.log(`   Email: ${user.notificationEmail || 'N/A'}`);
      console.log(`   Business: ${user.businessName}`);
      console.log(`   Qdrant Collection: ${user.qdrantCollectionName}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

listUsers();
