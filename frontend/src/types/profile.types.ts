// ============================================
// PROFILE TYPES
// ============================================

// Base property profile (shared across flows)
export interface PropertyProfile {
  type?: string;                // "house", "condo", etc.
  estimatedAge?: number;        // in years
  hasRenovations?: boolean;
  renovationTypes?: string[];   // e.g., ["kitchen", "bathroom"]
  mortgageStatus?: string;      // e.g., "paid-off", "mortgaged"
  sellingReason?: string;       // only relevant for sell flow
  budget?: string | number;     // only relevant for buy flow
  desiredFeatures?: string[];   // only relevant for buy flow
  timeline?: string;            // e.g., "0-3", "3-6", "6-12", "exploring"
  specificConcerns?: string;    // general concerns or preferences
}

// ============================================
// BASE USER PROFILE (shared across flows)
// ============================================
export interface BaseUserProfile {
  propertyType?: string;
  timeline?: string;
  concerns?: string;
}

// ============================================
// SELL FLOW USER PROFILE
// ============================================
export interface SellUserProfile extends BaseUserProfile {
  sellingReason?: string;
}

// ============================================
// BUY FLOW USER PROFILE
// ============================================
export interface BuyUserProfile extends BaseUserProfile {
  budget?: string | number;
  desiredFeatures?: string[];
  neighborhood?:string
}

// ============================================
// BROWSE FLOW USER PROFILE
// ============================================
export interface BrowseUserProfile extends BaseUserProfile {
  // minimal info, no extra fields required
}

// ============================================
// UNION TYPE FOR CONSUMER LOGIC
// ============================================
export type UserProfile = SellUserProfile | BuyUserProfile | BrowseUserProfile;
