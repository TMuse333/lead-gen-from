// lib/offers/offerRequirements.ts
// Defines what data fields each offer type requires from conversation flows

export type OfferType = 'pdf' | 'landingPage' | 'video' | 'home-estimate' | 'custom';

export interface OfferRequirement {
  offerType: OfferType;
  label: string;
  description: string;
  requiredFields: string[]; // mappingKeys that must be collected
  requiredQuestionThemes?: string[]; // Optional: semantic themes
  applicableFlows?: FlowIntention[]; // Which flows this offer applies to (undefined = all flows)
  icon?: string;
}

export type FlowIntention = 'buy' | 'sell' | 'browse';

export const OFFER_REQUIREMENTS: Record<OfferType, OfferRequirement> = {
  'home-estimate': {
    offerType: 'home-estimate',
    label: 'Home Estimate',
    description: 'Property valuation estimate',
    requiredFields: ['propertyAddress', 'propertyType', 'propertyAge', 'renovations', 'timeline'],
    requiredQuestionThemes: ['property-details', 'location', 'condition', 'timeline'],
    applicableFlows: ['sell'], // Only applicable to sellers
    icon: '🏠',
  },
  'pdf': {
    offerType: 'pdf',
    label: 'PDF Guide',
    description: 'Downloadable resource',
    requiredFields: ['email'], // Just need email to send PDF
    icon: '📄',
  },
  'landingPage': {
    offerType: 'landingPage',
    label: 'Landing Page',
    description: 'Personalized results page',
    requiredFields: [], // Landing page can work with any data
    icon: '🌐',
  },
  'video': {
    offerType: 'video',
    label: 'Video',
    description: 'Video content or tutorial',
    requiredFields: ['email'], // Need email to send video link
    icon: '🎥',
  },
  'custom': {
    offerType: 'custom',
    label: 'Custom Offer',
    description: 'User-defined offer',
    requiredFields: [], // Custom offers have flexible requirements
    icon: '✨',
  },
};

/**
 * Get human-readable field names for display
 */
export const FIELD_LABELS: Record<string, string> = {
  propertyAddress: 'Property Address',
  propertyType: 'Property Type',
  propertyAge: 'Property Age',
  renovations: 'Renovations',
  timeline: 'Timeline',
  email: 'Email Address',
  phone: 'Phone Number',
  sellingReason: 'Selling Reason',
  buyingReason: 'Buying Reason',
  budget: 'Budget',
  location: 'Location',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
};

/**
 * Get requirements for a specific offer type
 */
export function getOfferRequirements(offerType: OfferType): OfferRequirement {
  return OFFER_REQUIREMENTS[offerType] || OFFER_REQUIREMENTS.custom;
}

/**
 * Get all required fields for multiple offers
 */
export function getRequiredFieldsForOffers(offerTypes: OfferType[]): string[] {
  const allFields = new Set<string>();
  offerTypes.forEach((offerType) => {
    const requirements = getOfferRequirements(offerType);
    requirements.requiredFields.forEach((field) => allFields.add(field));
  });
  return Array.from(allFields);
}

