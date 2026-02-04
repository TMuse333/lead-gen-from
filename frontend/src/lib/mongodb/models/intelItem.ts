// lib/mongodb/models/intelItem.ts
/**
 * Intel Item document type
 * Stores intel gathered from chatbot conversations - questions, interests,
 * pain points, and content requests from visitors before/during flows.
 */
import { ObjectId } from 'mongodb';

export interface IntelItemDocument {
  _id?: ObjectId;
  /** Which agent's bot captured this (businessName/clientId) */
  clientId: string;
  /** Link to conversation if available */
  conversationId?: string;
  /** Type of intel captured */
  type: 'question' | 'topic_interest' | 'pain_point' | 'content_request';
  /** Raw user message */
  content: string;
  /** Short summary extracted from the message */
  summary: string;
  /** Topic tags e.g. ["mortgage", "first-time-buyer"] */
  tags: string[];
  /** Lead info if available */
  lead?: { name?: string; email?: string; phone?: string };
  /** Whether captured in test or production */
  environment?: 'test' | 'production';
  /** When captured */
  createdAt: Date;
}
