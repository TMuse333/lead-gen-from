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

  // Environment tracking (to separate test data from production)
  environment?: 'test' | 'production';
  
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

  // Visitor Tracking Data (from cookies)
  visitorTracking?: {
    visitorId?: string;           // Unique visitor ID from cookie
    isReturningVisitor?: boolean; // Whether this is a repeat visit
    lastVisit?: string;           // ISO timestamp of last visit
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    referralSource?: {
      source?: string | null;
      medium?: string | null;
      campaign?: string | null;
      ref?: string | null;
      landingPage?: string;
      timestamp?: string;
    } | null;
    pagesViewed?: string[];       // Pages viewed before chat
    previousIntent?: string;      // Previous buy/sell/browse preference
    sessionStart?: string;        // Session start timestamp
    messagesSent?: number;        // Message count in this session
    timeToFirstMessage?: number;  // Seconds to first message
    sessionDuration?: number;     // Session duration in seconds
  };

  // Analytics
  messageCount: number;
  duration?: number;           // Seconds from start to completion
  abandonedAt?: Date;          // If user left mid-conversation

  // Contact Modal Tracking
  contactModal?: {
    shown: boolean;            // Whether modal was displayed
    shownAt?: Date;            // When modal was shown
    completed: boolean;        // Whether user submitted contact info
    completedAt?: Date;        // When user submitted
    skipped: boolean;          // Whether user skipped/dismissed
    skippedAt?: Date;          // When user skipped
    skippedCount?: number;     // How many times skipped before completing (if ever)
  };
}

