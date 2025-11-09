// src/data/sampleOutput.ts
import { MarketTrend } from '@/types';
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
        soldDate: new Date('2024-10-15T00:00:00.000Z'),
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

  leadId: '690e4cd2b0871272ef178618',
  generatedAt: new Date('2025-11-07T19:47:38.023Z'),
};



const marketSummary: MarketTrend = {
    averageSalePrice: 492000,
    medianSalePrice: 475000,
    averageDaysOnMarket: 15,
    marketTrend: 'up (+3.2%)',           // matches frontend display
    inventoryLevel: 'balanced',
  };
  
  export const sampleBuyOutput: FlowAnalysisOutput = {
    flowType: 'buy',
    analysis: {
      // === BUYER_ANALYSIS ===
      marketSummary,
      personalizedAdvice: [
        'Given your budget of $400K - $600K, you are well-positioned in the current Halifax market where the average sale price is $492,000.',
        'Focus on neighborhoods like Downtown Halifax and Clayton Park where you can find 4-bedroom condos within your budget.',
        'With a timeline of 3-6 months, start your search early to evaluate options and be prepared to make a quick decision as properties are moving fast.',
      ],
      recommendedActions: [
        'Begin your search immediately to allow time for property viewings and evaluations.',
        'Engage with a real estate agent familiar with the condo market to guide you in negotiations and contract terms.',
        'Consider properties that may need minor cosmetic updates as they could be priced lower and offer better value.',
      ],
      financingTips: [
        'Consider getting pre-approved for a mortgage to strengthen your buying position.',
        'Explore different mortgage products, particularly those offering competitive rates for condos.',
        'Ensure you have a clear understanding of condo fees and how they impact your overall budget.',
      ],
      recommendedNeighborhoods: [
        'Downtown Halifax',
        'Clayton Park',
        'Bedford',
        'Fairview',
      ],
      tokensUsed: 941,
      generatedAt: '2025-11-07T21:55:04.584Z',
    },
    comparableHomes: [
      {
        id: '1',
        address: '123 Spring Garden Rd',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3H 1X8',
        propertyDetails: {
          type: 'Condo',
          bedrooms: 4,
          bathrooms: 2,
          squareFeet: 1850,
          yearBuilt: 2018,
        },
        saleInfo: {
          soldPrice: 510000,
          soldDate: new Date('2025-09-15T00:00:00.000Z'),
          daysOnMarket: 12,
          status: 'sold',
        },
        similarityScore: 0.94,
        matchReason: 'Matches budget, size, and condo type',
      },
      {
        id: '2',
        address: '456 Quinpool Rd',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3K 2T9',
        propertyDetails: {
          type: 'Condo',
          bedrooms: 4,
          bathrooms: 2,
          squareFeet: 1780,
          yearBuilt: 2020,
        },
        saleInfo: {
          soldPrice: 495000,
          soldDate: new Date('2025-09-15T00:00:00.000Z'),
          daysOnMarket: 18,
          status: 'sold',
        },
        similarityScore: 0.91,
        matchReason: 'Similar layout and recent build',
      },
      {
        id: '3',
        address: '789 South St',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3H 2X6',
        propertyDetails: {
          type: 'Condo',
          bedrooms: 4,
          bathrooms: 2.5,
          squareFeet: 1950,
          yearBuilt: 2016,
        },
        saleInfo: {
          soldPrice: 520000,
          soldDate: new Date('2025-10-20T00:00:00.000Z'),
          daysOnMarket: 8,
          status: 'sold',
        },
        similarityScore: 0.89,
        matchReason: 'Larger unit, premium location',
      },
    ],
    marketTrends: marketSummary,
    agentAdvice: [],
    leadId: '690e6ab1b0871272ef178619',
    generatedAt: new Date('2025-11-07T21:55:04.584Z'),
  };


  export const sampleBrowseOutput:FlowAnalysisOutput = {
    flowType: 'browse',
    analysis: {
      highlights: [
        'The current average sale price in Halifax is $492,000, with a median sale price of $475,000.',
        'The market trend is currently upward, with a 3.2% increase.',
        'Inventory levels are balanced, indicating a stable market environment.',
      ],
      suggestedFilters: {
        priceRange: '$400K - $600K',
        propertyTypes: ['Condo', 'Townhouse', 'Single Family'],
        bedrooms: '3+',
        neighborhoods: ['Downtown Halifax', 'Clayton Park', 'Bedford'],
      },
      neighborhoodInsights: {
        'Downtown Halifax': 'High demand, modern condos, walkable, premium pricing.',
        'Clayton Park': 'Family-friendly, good schools, growing inventory.',
        'Bedford': 'Suburban feel, newer builds, strong value retention.',
      },
      marketSummary: {
        currentCondition:
          'The real estate market in Halifax, including Dartmouth and Bedford, remains active with balanced inventory and steady demand. It is an opportune time for both buyers and sellers.',
        buyerActivity:
          'Buyer interest remains strong, particularly in the $400K–$600K range, driven by competitive pricing and desirable community features.',
      },
      personalizedAdvice: {
        sellingConsideration:
          'If your plan is to sell within 1-2 years, monitoring market shifts and consulting a real estate professional can help in timing your sale effectively.',
        investmentOpportunity:
          'Given the upward market trend, consider holding onto investment properties to potentially capitalize on increased property values.',
      },
      recommendedActions: [
        'Use the suggested filters to refine your property search on MLS or real estate portals.',
        'Schedule viewings in high-interest neighborhoods like Downtown Halifax and Clayton Park.',
        'Consult with a local agent to receive real-time updates on new listings matching your criteria.',
      ],
      generatedAt: '2025-11-07T22:20:48.809Z',
      tokensUsed: 1067,
    },
    comparableHomes: [
      {
        id: '1',
        address: '123 Spring Garden Rd',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3H 1X8',
        propertyDetails: {
          type: 'Condo',
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1650,
          yearBuilt: 2019,
        },
        saleInfo: {
          soldPrice: 495000,
          soldDate:new Date('2025-10-05T00:00:00.000Z'),
          daysOnMarket: 14,
          status: 'sold',
        },
        similarityScore: 0.93,
        matchReason: 'Matches price range and condo preference',
      },
      {
        id: '2',
        address: '456 Quinpool Rd',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3K 2T9',
        propertyDetails: {
          type: 'Townhouse',
          bedrooms: 3,
          bathrooms: 2.5,
          squareFeet: 1800,
          yearBuilt: 2021,
        },
        saleInfo: {
          soldPrice: 510000,
          soldDate:new Date('2025-10-05T00:00:00.000Z'),
          daysOnMarket: 10,
          status: 'sold',
        },
        similarityScore: 0.90,
        matchReason: 'Modern build, family-sized',
      },
      {
        id: '3',
        address: '789 South St',
        city: 'Halifax',
        province: 'NS',
        postalCode: 'B3H 2X6',
        propertyDetails: {
          type: 'Single Family',
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2200,
          yearBuilt: 2015,
        },
        saleInfo: {
          soldPrice: 585000,
          soldDate:new Date('2025-10-05T00:00:00.000Z'),
          daysOnMarket: 7,
          status: 'sold',
        },
        similarityScore: 0.87,
        matchReason: 'Slightly above budget but strong value',
      },
    ],
    marketSummary: {
      averageSalePrice: 492000,
      medianSalePrice: 475000,
      averageDaysOnMarket: 15,
      marketTrend: 'up (+3.2%)',
      inventoryLevel: 'balanced',
    },
    agentAdvice: [],
    leadId: '690e70b3b0871272ef17861a',
    generatedAt: new Date('2025-11-07T22:20:48.809Z'),
  };