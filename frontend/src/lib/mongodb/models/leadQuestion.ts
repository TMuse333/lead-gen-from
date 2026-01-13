// lib/mongodb/models/leadQuestion.ts
/**
 * Lead Question document type
 * Stores questions submitted by leads from the results page
 */
import { ObjectId } from 'mongodb';

export interface LeadQuestionDocument {
  _id?: ObjectId;
  /** Lead's name */
  name: string;
  /** Lead's email */
  email: string;
  /** The question or message */
  question: string;
  /** Associated conversation ID (if available) */
  conversationId: string | null;
  /** Agent's user ID (owner of the lead) */
  userId: string | null;
  /** Agent's email for notifications */
  agentEmail: string | null;
  /** Agent's name */
  agentName: string | null;
  /** Status of the question */
  status: 'new' | 'read' | 'responded';
  /** When the question was submitted */
  submittedAt: Date;
  /** When the agent responded (if applicable) */
  respondedAt: Date | null;
  /** Agent's response (if applicable) */
  response: string | null;
}
