// scripts/add-conversation-indexes.ts
// Script to add database indexes for conversation and generation tracking

import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' });

import { getDatabase } from '@/lib/mongodb/db';

async function addIndexes() {
  try {
    const db = await getDatabase();

    // Conversations collection indexes
    const conversationsCollection = db.collection('conversations');
    
    console.log('📊 Adding indexes to conversations collection...');
    
    await conversationsCollection.createIndex({ userId: 1 });
    console.log('✅ Index created: userId');
    
    await conversationsCollection.createIndex({ clientIdentifier: 1 });
    console.log('✅ Index created: clientIdentifier');
    
    await conversationsCollection.createIndex({ status: 1 });
    console.log('✅ Index created: status');
    
    await conversationsCollection.createIndex({ flow: 1 });
    console.log('✅ Index created: flow');
    
    await conversationsCollection.createIndex({ startedAt: -1 });
    console.log('✅ Index created: startedAt (descending)');
    
    await conversationsCollection.createIndex({ userId: 1, startedAt: -1 });
    console.log('✅ Index created: userId + startedAt (compound)');
    
    await conversationsCollection.createIndex({ clientIdentifier: 1, startedAt: -1 });
    console.log('✅ Index created: clientIdentifier + startedAt (compound)');
    
    // Generations collection indexes
    const generationsCollection = db.collection('generations');
    
    console.log('\n📊 Adding indexes to generations collection...');
    
    await generationsCollection.createIndex({ conversationId: 1 });
    console.log('✅ Index created: conversationId');
    
    await generationsCollection.createIndex({ userId: 1 });
    console.log('✅ Index created: userId');
    
    await generationsCollection.createIndex({ clientIdentifier: 1 });
    console.log('✅ Index created: clientIdentifier');
    
    await generationsCollection.createIndex({ generatedAt: -1 });
    console.log('✅ Index created: generatedAt (descending)');
    
    await generationsCollection.createIndex({ conversationId: 1, generatedAt: -1 });
    console.log('✅ Index created: conversationId + generatedAt (compound)');
    
    await generationsCollection.createIndex({ userId: 1, generatedAt: -1 });
    console.log('✅ Index created: userId + generatedAt (compound)');
    
    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addIndexes();
}

export { addIndexes };

