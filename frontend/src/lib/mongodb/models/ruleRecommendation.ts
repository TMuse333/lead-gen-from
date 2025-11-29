// lib/mongodb/models/ruleRecommendation.ts
// MongoDB schema for saved rule recommendations

import { ObjectId } from 'mongodb';
import type { SmartRuleGroup } from '@/lib/rules/ruleTypes';

export interface RuleRecommendationDocument {
  _id?: ObjectId;
  userId: string;
  flow?: string; // Optional: specific flow these rules are for
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    ruleGroup: SmartRuleGroup;
    reasoning: string;
    confidence: number;
    isManual?: boolean; // true if user created manually
    createdAt: Date;
    updatedAt?: Date;
  }>;
  generatedAt: Date;
  updatedAt?: Date;
}

export const RULE_RECOMMENDATION_INDEXES = [
  { userId: 1 },
  { userId: 1, flow: 1 },
] as const;

