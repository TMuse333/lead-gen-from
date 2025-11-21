// types/realEstateSchema.ts
export type UserProfile = {
    intent: 'buy' | 'sell' | 'browse' | 'invest' | 'relocate' | 'unknown';
    
    // Buying
    budget?: number | { min: number; max: number };
    timeline?: '0-3 months' | '3-6 months' | '6-12 months' | '12+ months' | 'asap' | 'just looking';
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string[]; // "house", "condo", "townhouse", etc.
    mustHaves?: string[];   // "pool", "basement", "downtown", "good schools"
    dealBreakers?: string[];
    locations?: string[];   // "Toronto", "Miami Beach", "near subway"
  
    // Selling
    sellingTimeline?: '0-3 months' | '3-6 months' | '6-12 months' | '12+ months' | 'asap';
    currentHomeValueEstimate?: number;
    equityEstimate?: number;
  
    // General
    firstTimeBuyer?: boolean;
    hasAgent?: boolean;
    preapproved?: boolean;
    urgency?: 'low' | 'medium' | 'high';
    email?: string;
    name?: string;
  }