// ← This is your current qdrant.ts with everything REMOVED except client
import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

export { qdrant as qdrantClient };