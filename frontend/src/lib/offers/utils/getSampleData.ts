// frontend/src/lib/offers/utils/getSampleData.ts
/**
 * Generate sample data for testing offer generation
 */

import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

export interface SampleData {
  userInput: Record<string, string>;
  context: {
    flow: string;
    businessName: string;
    qdrantAdvice: string[];
  };
}

/**
 * Get sample data for testing an offer type
 */
export function getSampleDataForOffer(offerType: OfferType): SampleData {
  const baseSample = {
    email: 'test.user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const baseContext = {
    flow: 'buy',
    businessName: 'Premier Real Estate',
    qdrantAdvice: [
      'First-time buyers should get pre-approved before house hunting',
      'The local market is competitive with homes selling quickly',
      'Consider getting a home inspection before making an offer',
    ],
  };

  switch (offerType) {
    case 'pdf':
      return {
        userInput: {
          ...baseSample,
          propertyAddress: '123 Main Street, Anytown, CA 90210',
          timeline: '3-6 months',
          budget: '$500,000 - $600,000',
        },
        context: baseContext,
      };

    case 'landingPage':
      return {
        userInput: {
          ...baseSample,
          propertyAddress: '456 Oak Avenue, Riverside, CA 92501',
          propertyType: 'Single Family Home',
          timeline: '1-2 months',
        },
        context: baseContext,
      };

    case 'home-estimate':
      return {
        userInput: {
          ...baseSample,
          propertyAddress: '789 Pine Street, Mountain View, CA 94040',
          propertyType: '3-bedroom house',
          bedrooms: '3',
          bathrooms: '2',
          squareFeet: '1,800',
          yearBuilt: '1985',
        },
        context: {
          ...baseContext,
          flow: 'sell',
        },
      };

    case 'video':
      return {
        userInput: {
          ...baseSample,
          timeline: 'ASAP',
          budget: '$400,000',
        },
        context: baseContext,
      };

    case 'custom':
      return {
        userInput: {
          ...baseSample,
          customField1: 'Looking for investment properties',
          customField2: 'Interested in multi-family units',
        },
        context: baseContext,
      };

    default:
      return {
        userInput: baseSample,
        context: baseContext,
      };
  }
}

/**
 * Get field labels for display
 */
export function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    email: 'Email Address',
    firstName: 'First Name',
    lastName: 'Last Name',
    propertyAddress: 'Property Address',
    propertyType: 'Property Type',
    timeline: 'Timeline',
    budget: 'Budget',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    squareFeet: 'Square Feet',
    yearBuilt: 'Year Built',
    lotSize: 'Lot Size',
    customField1: 'Custom Field 1',
    customField2: 'Custom Field 2',
    customField3: 'Custom Field 3',
  };

  return labels[fieldName] || fieldName;
}

/**
 * Validate sample data against offer requirements
 */
export function validateSampleData(
  sampleData: Record<string, string>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => !sampleData[field] || sampleData[field].trim() === ''
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
