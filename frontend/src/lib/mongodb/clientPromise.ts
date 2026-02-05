// MongoDB client promise for NextAuth adapter
import { MongoClient } from 'mongodb';
import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' });

if (!process.env.MONGODB_URI!) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  // Connection reliability settings
  connectTimeoutMS: 10000,      // 10s to establish connection
  socketTimeoutMS: 45000,       // 45s for operations
  serverSelectionTimeoutMS: 10000, // 10s to find a server
  maxPoolSize: 10,              // Connection pool
  minPoolSize: 1,               // Keep at least 1 connection ready
  retryWrites: true,            // Auto-retry failed writes
  retryReads: true,             // Auto-retry failed reads
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use global caching in development to prevent hot reload issues
if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;


