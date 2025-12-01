import clientPromise from './clientPromise';
import { Db } from 'mongodb';
import { ClientConfigDocument } from './models/clientConfig';
import { ConversationDocument } from './models/conversation';
import { GenerationDocument } from './models/generation';
import { RuleRecommendationDocument } from './models/ruleRecommendation';
import { TokenUsageDocument } from './models/tokenUsage';
import { RateLimitConfigDocument } from './models/rateLimitConfig';

const dbName = process.env.MONGODB_DB_NAME || 'agent_lead_gen';

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getClientConfigsCollection() {
  const db = await getDatabase();
  return db.collection<ClientConfigDocument>('client_configs');
}

export async function getConversationsCollection() {
  const db = await getDatabase();
  return db.collection<ConversationDocument>('conversations');
}

export async function getGenerationsCollection() {
  const db = await getDatabase();
  return db.collection<GenerationDocument>('generations');
}

export async function getRuleRecommendationsCollection() {
  const db = await getDatabase();
  return db.collection<RuleRecommendationDocument>('rule_recommendations');
}

export async function getTokenUsageCollection() {
  const db = await getDatabase();
  return db.collection<TokenUsageDocument>('token_usage');
}

export async function getRateLimitConfigsCollection() {
  const db = await getDatabase();
  return db.collection<RateLimitConfigDocument>('rate_limit_configs');
}
