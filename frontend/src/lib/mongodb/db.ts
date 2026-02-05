import clientPromise from './clientPromise';
import { Db } from 'mongodb';
import { ClientConfigDocument } from './models/clientConfig';
import { ConversationDocument } from './models/conversation';
import { GenerationDocument } from './models/generation';
import { RuleRecommendationDocument } from './models/ruleRecommendation';
import { TokenUsageDocument } from './models/tokenUsage';
import { RateLimitConfigDocument } from './models/rateLimitConfig';
import { LeadQuestionDocument } from './models/leadQuestion';
import { IntelItemDocument } from './models/intelItem';
import { KnowledgeRetrievalDocument } from './models/knowledgeRetrieval';

const dbName = process.env.MONGODB_DB_NAME || process.env.DB_NAME || 'agent_lead_gen';

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

export async function getLeadQuestionsCollection() {
  const db = await getDatabase();
  return db.collection<LeadQuestionDocument>('lead_questions');
}

export async function getIntelItemsCollection() {
  const db = await getDatabase();
  return db.collection<IntelItemDocument>('intel_items');
}

export async function getKnowledgeRetrievalsCollection() {
  const db = await getDatabase();
  return db.collection<KnowledgeRetrievalDocument>('knowledge_retrievals');
}
