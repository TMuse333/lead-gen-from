// lib/mongodb/models/conversation.ts

import { ObjectId } from 'mongodb';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  buttons?: Array<{ label: string; value: string }>;
  timestamp: Date;
  questionId?: string; // Link to conversation flow question
}

export interface ConversationDocument {
  _id?: ObjectId;
  
  // User/Client Identification
  userId?: string;              // For authenticated users (NextAuth session.user.id)
  clientIdentifier?: string;    // For public bots (businessName from client config)
  sessionId?: string;           // Browser session ID for anonymous tracking
  
  // Conversation Metadata
  flow: 'buy' | 'sell' | 'browse' | string;  // Flow type (flexible for future flows)
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  
  // Chat Messages
  messages: ConversationMessage[];
  
  // User Input/Answers
  userInput: Record<string, string>;  // Key-value pairs of answers
  answers: Array<{
    questionId: string;
    mappingKey: string;
    value: string;
    timestamp: Date;
    answeredVia: 'button' | 'text'; // How the answer was provided
  }>; // Detailed answer tracking with timestamps
  
  // Flow Context
  currentFlowId?: string;      // Which flow was used
  currentNodeId?: string;       // Last question node
  progress: number;             // 0-100 completion percentage
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  pageUrl?: string;
  
  // Analytics
  messageCount: number;
  duration?: number;           // Seconds from start to completion
  abandonedAt?: Date;          // If user left mid-conversation
}

