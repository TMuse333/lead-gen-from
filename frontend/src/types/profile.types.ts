// Extracted for reuse in AI logic
export interface PropertyProfile {
    type?: string;
    estimatedAge?: number;
    hasRenovations?: boolean;
    renovationTypes?: string[];
    mortgageStatus?: string;
    sellingReason?: string;
    timeline?: string;
    specificConcerns?: string;
  }

  export interface UserProfile {
    propertyType?: string;      // "house", "condo", etc.
    sellingReason?: string;     // "upsizing", "downsizing", etc.
    timeline?: string;          // "0-3", "3-6", "6-12", "exploring"
    concerns?: string;          // User's specific concerns
  }