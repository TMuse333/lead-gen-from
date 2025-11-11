// ============================================
// QDRANT COLLECTION WIPE SCRIPT
// Deletes all items but keeps the collection
// ============================================

import { QdrantClient } from '@qdrant/js-client-rest';

// Load env vars (optional — if you use .env)
import 'dotenv/config';

// Setup client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';

async function wipeCollection() {
  try {
    console.log(`⚠️  Wiping all points from Qdrant collection: ${COLLECTION_NAME}...`);

    // Delete all points (does NOT delete collection)
    await qdrantClient.delete(COLLECTION_NAME, {
      filter: {},   // Empty filter = all points
      wait: true,
    });

    console.log(`✅ Successfully deleted all points from "${COLLECTION_NAME}".`);
  } catch (error) {
    console.error('❌ Error wiping collection:', error);
  }
}

wipeCollection();
