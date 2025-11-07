// src/data/sampleOutput.ts
import type { FlowAnalysisOutput } from '@/types/analysis.types';

export const sampleSellOutput: FlowAnalysisOutput = {
  flowType: 'sell',
  analysis: {
    estimatedValue: 492000,
    marketSummary: {
      averageSalePrice: 492000,
      medianSalePrice: 475000,
      averageDaysOnMarket: 15,
      marketTrend: 'up (+3.2%)',
      inventoryLevel: 'balanced',
    },
    personalizedAdvice:
      "As you're considering downsizing, it's important to approach this transition with care and at your own pace. Selling your family home can be emotional, so take the time you need.",
    recommendedActions: [
      'Start decluttering at a comfortable pace, focusing on one room at a time.',
      'Consider minor updates for a high ROI, such as fresh paint and minor kitchen improvements.',
      'Prepare the property for listing with professional photos and staging within the next 1-2 months.',
      'Plan a marketing strategy that includes MLS listing, social media, and open houses to generate interest.',
      'Price the property strategically, potentially 3-5% below market value, to encourage multiple offers and a quicker sale.',
    ],
    comparablesSummary: [
      {
        address: '123 Spring Garden Rd',
        details: 'Single Family, 3bd/2ba, 1,800 sqft',
        soldPrice: 485000,
      },
      {
        address: '456 Quinpool Rd',
        details: 'Single Family, 3bd/2ba, 1,750 sqft',
        soldPrice: 475000,
      },
      {
        address: '789 South St',
        details: 'Single Family, 4bd/2.5ba, 2,000 sqft',
        soldPrice: 510000,
      },
    ],
    tokensUsed: 1107,
    generatedAt: '2025-11-07T19:47:38.023Z',
  },
  comparableHomes: [
    {
      id: '1',
      address: '123 Spring Garden Rd',
      city: 'Halifax',
      province: 'NS',
      postalCode: 'B3H 1X8',
      propertyDetails: {
        type: 'Single Family',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1800,
        lotSize: 5000,
        yearBuilt: 2005,
      },
      saleInfo: {
        soldPrice: 485000,
        soldDate: '2024-10-15T00:00:00.000Z',
        daysOnMarket: 12,
        status: 'sold',
      },
      similarityScore: 0.95,
      matchReason: 'Similar size, age, and location',
    },
    // ... other two homes
  ],
  marketTrends: {
    averageSalePrice: 492000,
    medianSalePrice: 475000,
    averageDaysOnMarket: 15,
    marketTrend: 'up (+3.2%)',
    inventoryLevel: 'balanced',
  },
  agentAdvice: [],
  formConfig: 'sell',
  leadId: '690e4cd2b0871272ef178618',
  generatedAt: new Date('2025-11-07T19:47:38.023Z'),
};