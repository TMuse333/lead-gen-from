// ============================================
// MONGODB MODELS / SCHEMAS
// ============================================
// Type definitions for MongoDB documents
// We're using TypeScript interfaces instead of Mongoose schemas
// for simplicity with the native MongoDB driver

import { ObjectId } from 'mongodb';

/**
 * Lead Submission Document (stored in 'leads' collection)
 */
export interface LeadDocument {
  _id?: ObjectId;
  formId: string;
  agentId: string;
  
  // User data
  email: string;
  phoneNumber?: string;
  answers: Array<{
    questionId: string;
    question: string;
    value: string | string[] | number;
    answeredAt: Date;
  }>;
  
  // Computed property profile
  propertyProfile: {
    type?: string;
    estimatedAge?: number;
    hasRenovations?: boolean;
    renovationTypes?: string[];
    mortgageStatus?: string;
    sellingReason?: string;
    timeline?: string;
    specificConcerns?: string;
  };
  
  // AI Analysis (populated after generation)
  analysis?: {
    estimatedValue?: {
      low: number;
      high: number;
      confidence: number;
    };
    comparableHomes?: Array<{
      id: string;
      address: string;
      city: string;
      province: string;
      propertyDetails: {
        type: string;
        bedrooms: number;
        bathrooms: number;
        squareFeet?: number;
      };
      saleInfo: {
        soldPrice?: number;
        status: string;
      };
    }>;
    marketInsights?: string;
    agentAdvice?: string;
    generatedAt: Date;
  };
  
  // Metadata
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  pageUrl: string;
  
  // CRM fields
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'dead';
  agentNotes?: string[];
  lastContactedAt?: Date;
}

/**
 * Form Configuration Document (stored in 'form_configs' collection)
 */
export interface FormConfigDocument {
  _id?: ObjectId;
  agentId: string;
  
  // Form metadata
  name: string;
  targetArea: string;
  
  // Questions structure
  questions: Array<{
    id: string;
    type: string;
    question: string;
    subtext?: string;
    placeholder?: string;
    required: boolean;
    weight: number;
    aiContext: string;
    choices?: Array<{
      id: string;
      label: string;
      value: string;
      icon?: string;
      triggerFollowUp?: string;
    }>;
    showIf?: {
      questionId: string;
      hasValue: string | string[];
    };
  }>;
  
  emailCaptureAfter: number;
  
  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    agentName: string;
    agentPhoto?: string;
  };
  
  // Result configuration
  resultConfig: {
    showComparableHomes: boolean;
    showMarketTrends: boolean;
    showAgentAdvice: boolean;
    showEstimatedValue: boolean;
    emailReportSubject: string;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Agent Profile Document (stored in 'agents' collection)
 * For when you have multi-agent support
 */
export interface AgentDocument {
  _id?: ObjectId;
  
  // Auth/Identity
  userId: string; // From auth provider
  email: string;
  
  // Profile
  name: string;
  phone?: string;
  photo?: string;
  brokerage?: string;
  licenseNumber?: string;
  
  // Service areas
  primaryArea: string;
  serviceAreas: string[];
  
  // Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoResponseEnabled: boolean;
  
  // Subscription/Plan
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  planStartDate?: Date;
  planEndDate?: Date;
  
  // Stats
  totalLeads: number;
  leadsThisMonth: number;
  conversionRate?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

/**
 * Helper function to create indexes (run once during setup)
 */
 export const COLLECTION_INDEXES = {
    leads: [
      { agentId: 1, submittedAt: -1 }, // Query leads by agent
      { email: 1 }, // Find lead by email
      { status: 1 }, // Filter by status
      { 'propertyProfile.timeline': 1 }, // Filter by urgency
    ],
    form_configs: [
      { agentId: 1, isActive: 1 }, // Get active form for agent
    ],
    agents: [
      { userId: 1 }, // Unique user ID
      { email: 1 }, // Unique email
    ],
  } as const;

/**
 * Example usage in an API route:
 * 
 * import { getLeadsCollection } from '@/lib/mongodb';
 * import { LeadDocument } from '@/lib/models';
 * 
 * const collection = await getLeadsCollection();
 * const lead: LeadDocument = {
 *   formId: 'form-123',
 *   agentId: 'agent-456',
 *   email: 'user@example.com',
 *   answers: [...],
 *   propertyProfile: {...},
 *   submittedAt: new Date(),
 *   pageUrl: 'https://example.com/form',
 *   status: 'new',
 * };
 * 
 * await collection.insertOne(lead);
 */