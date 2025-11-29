// lib/mongodb/models/generation.ts

import { ObjectId } from 'mongodb';
import type { LlmOutput } from '@/types/componentSchema';
import type { QdrantRetrievalMetadata } from '@/types/qdrant.types';

export interface GenerationDebugInfo {
  qdrantRetrieval: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime: number;
  userInput: Record<string, string>;
  flow: string;
}

export interface GenerationDocument {
  _id?: ObjectId;
  
  // Link to Conversation
  conversationId: ObjectId;     // References conversations._id
  
  // User/Client Identification (denormalized for easier queries)
  userId?: string;
  clientIdentifier?: string;
  
  // Generation Metadata
  flow: string;                // Flow type used
  offerType?: string;           // Future: 'pdf', 'landingPage', 'video', 'homeEvaluation', etc.
  generatedAt: Date;
  generationTime: number;      // Milliseconds
  
  // LLM Output
  llmOutput: LlmOutput;        // The actual generated content (flexible structure)
  
  // Debug/Technical Info
  debugInfo: GenerationDebugInfo;
  
  // User Input (snapshot at generation time)
  userInput: Record<string, string>;
  
  // Status
  status: 'success' | 'error' | 'partial';
  errorMessage?: string;
  
  // Analytics
  outputSize: number;          // Size of llmOutput in bytes
  componentCount: number;      // Number of components in output
}

