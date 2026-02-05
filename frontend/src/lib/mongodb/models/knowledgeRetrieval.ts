// src/lib/mongodb/models/knowledgeRetrieval.ts
/**
 * Knowledge Retrieval Tracking
 *
 * Tracks when Qdrant knowledge is retrieved during conversations
 * for analytics on what knowledge is being used and when.
 */

import type { ObjectId } from 'mongodb';

export interface RetrievedItem {
  id: string;
  title: string;
  text: string;
  category?: string;
  kind?: 'story' | 'tip' | 'agent_knowledge';
  score: number; // Relevance score 0-1
}

export interface KnowledgeRetrievalDocument {
  _id?: ObjectId;

  // Context
  conversationId?: string;
  clientId: string;
  environment: 'test' | 'production';

  // Query Details
  userMessage: string;
  intent: string; // objection, clarification_question, chitchat, etc.
  objectionType?: string; // trust_issue, price_sensitivity, etc.
  questionContext?: string; // The question being asked when retrieval happened

  // Retrieval Results
  retrievedItems: RetrievedItem[];
  totalRetrieved: number;

  // Breakdown by source
  agentKnowledgeCount: number;
  storiesCount: number;
  tipsCount: number;

  // Performance
  retrievalTimeMs: number;

  // Timestamps
  createdAt: Date;
}

/**
 * Create a knowledge retrieval tracking record
 */
export function createKnowledgeRetrievalRecord(params: {
  conversationId?: string;
  clientId: string;
  environment: 'test' | 'production';
  userMessage: string;
  intent: string;
  objectionType?: string;
  questionContext?: string;
  retrievedItems: RetrievedItem[];
  retrievalTimeMs: number;
}): KnowledgeRetrievalDocument {
  const agentKnowledgeCount = params.retrievedItems.filter(
    (item) => item.kind === 'agent_knowledge' || (!item.kind && item.category !== 'stories' && item.category !== 'tips')
  ).length;

  const storiesCount = params.retrievedItems.filter(
    (item) => item.kind === 'story' || item.category === 'stories'
  ).length;

  const tipsCount = params.retrievedItems.filter(
    (item) => item.kind === 'tip' || item.category === 'tips'
  ).length;

  return {
    conversationId: params.conversationId,
    clientId: params.clientId,
    environment: params.environment,
    userMessage: params.userMessage,
    intent: params.intent,
    objectionType: params.objectionType,
    questionContext: params.questionContext,
    retrievedItems: params.retrievedItems,
    totalRetrieved: params.retrievedItems.length,
    agentKnowledgeCount,
    storiesCount,
    tipsCount,
    retrievalTimeMs: params.retrievalTimeMs,
    createdAt: new Date(),
  };
}
