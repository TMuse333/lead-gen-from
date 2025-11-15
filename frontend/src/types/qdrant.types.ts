// types/qdrant.types.ts

import { ApplicableWhen } from "./rules.types";

export interface QdrantRetrievalItem {
    id: string;
    title: string;
    score?: number;
    tags?: string[];
    matchedRules?: ApplicableWhen
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