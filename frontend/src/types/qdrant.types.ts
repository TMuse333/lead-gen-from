// types/qdrant.types.ts
import { ApplicableWhen } from './rules.types';

export interface QdrantRetrievalItem {
  id: string;
  title: string;
  advice?: string;        // For vector advice items
  description?: string;   // For rule-based action steps
  score?: number;
  tags?: string[];
  matchedRules?: ApplicableWhen;
  reasoning?: string;
}

export interface QdrantRetrievalMetadata {
  collection: string;
  type: 'vector' | 'rule';
  count: number;
  items: QdrantRetrievalItem[];
}

export interface PersonalizedAdviceResult {
  advice: string[];
  metadata: QdrantRetrievalMetadata[];
}