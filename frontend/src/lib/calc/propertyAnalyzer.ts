// ============================================
// PROPERTY ANALYZER
// Analyzes individual properties and generates insights
// ============================================

import { PropertyData, PropertyComparison, PropertySummary } from '@/types/dataTypes/property.types';

/**
 * Property Analysis Result
 */
export interface PropertyAnalysis {
  property: PropertyData;
  
  // Value Assessment
  valueMetrics: {
    priceRating: 'excellent_value' | 'good_value' | 'fair' | 'overpriced';
    pricePerSqftComparison: 'below_market' | 'at_market' | 'above_market';
    valueScore: number; // 0-100
    estimatedMarketValue?: {
      low: number;
      mid: number;
      high: number;
      confidence: 'high' | 'medium' | 'low';
    };
  };
  
  // Condition Assessment
  conditionMetrics: {
    overallCondition: 'excellent' | 'good' | 'fair' | 'needs_work';
    ageImpact: 'minimal' | 'moderate' | 'significant';
    renovationValue: number; // Estimated value added by renovations
    maintenancePriorities: string[];
  };
  
  // Market Position
  marketPosition: {
    daysOnMarketAssessment: 'selling_fast' | 'normal_pace' | 'slow_moving' | 'stale';
    competitiveness: 'high_demand' | 'moderate' | 'low_demand';
    pricingStrategy: 'aggressive' | 'competitive' | 'conservative';
    likelyTimeToSell: number; // days
  };
  
  // Location Insights
  locationInsights: {
    neighborhoodRating: 'premium' | 'desirable' | 'average' | 'developing';
    walkabilityScore: number; // 0-100
    transitAccess: 'excellent' | 'good' | 'fair' | 'limited';
    nearbyAmenities: {
      score: number; // 0-100
      highlights: string[];
    };
  };
  
  // Buyer/Seller Insights
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    targetBuyer: string;
  };
  
  // Summary
  summary: string;
  generatedAt: Date;
}

/**
 * Analyze a single property
 */
export function analyzeProperty(
  property: PropertyData,
  comparables?: PropertyData[]
): PropertyAnalysis {
  const valueMetrics = calculateValueMetrics(property, comparables);
  const conditionMetrics = assessCondition(property);
  const marketPosition = analyzeMarketPosition(property);
  const locationInsights = analyzeLocation(property);
  const insights = generateInsights(property, valueMetrics, conditionMetrics, marketPosition);
  const summary = generatePropertySummary(property, valueMetrics, marketPosition);
  
  return {
    property,
    valueMetrics,
    conditionMetrics,
    marketPosition,
    locationInsights,
    insights,
    summary,
    generatedAt: new Date(),
  };
}

/**
 * Calculate value metrics
 */
function calculateValueMetrics(
  property: PropertyData,
  comparables?: PropertyData[]
): PropertyAnalysis['valueMetrics'] {
  const price = property.pricing.listPrice || property.pricing.soldPrice || 0;
  const pricePerSqft = property.pricing.pricePerSqft || 
    (property.specs.squareFeet ? price / property.specs.squareFeet : 0);
  
  // Calculate average market price if comparables provided
  let marketAvgPricePerSqft = 300; // Default for Halifax area
  if (comparables && comparables.length > 0) {
    const validComps = comparables.filter(c => c.pricing.pricePerSqft);
    if (validComps.length > 0) {
      marketAvgPricePerSqft = validComps.reduce((sum, c) => 
        sum + (c.pricing.pricePerSqft || 0), 0) / validComps.length;
    }
  }
  
  // Price per sqft comparison
  let pricePerSqftComparison: 'below_market' | 'at_market' | 'above_market' = 'at_market';
  if (pricePerSqft < marketAvgPricePerSqft * 0.95) {
    pricePerSqftComparison = 'below_market';
  } else if (pricePerSqft > marketAvgPricePerSqft * 1.05) {
    pricePerSqftComparison = 'above_market';
  }
  
  // Price rating
  let priceRating: 'excellent_value' | 'good_value' | 'fair' | 'overpriced' = 'fair';
  if (pricePerSqft < marketAvgPricePerSqft * 0.90) {
    priceRating = 'excellent_value';
  } else if (pricePerSqft < marketAvgPricePerSqft * 0.98) {
    priceRating = 'good_value';
  } else if (pricePerSqft > marketAvgPricePerSqft * 1.10) {
    priceRating = 'overpriced';
  }
  
  // Value score (0-100)
  const valueScore = Math.min(100, Math.max(0, 
    100 - ((pricePerSqft - marketAvgPricePerSqft) / marketAvgPricePerSqft * 100)
  ));
  
  // Estimated market value
  const estimatedMarketValue = property.specs.squareFeet ? {
    low: Math.round(property.specs.squareFeet * marketAvgPricePerSqft * 0.95),
    mid: Math.round(property.specs.squareFeet * marketAvgPricePerSqft),
    high: Math.round(property.specs.squareFeet * marketAvgPricePerSqft * 1.05),
    confidence: comparables && comparables.length >= 3 ? 'high' as const : 'medium' as const,
  } : undefined;
  
  return {
    priceRating,
    pricePerSqftComparison,
    valueScore,
    estimatedMarketValue,
  };
}

/**
 * Assess property condition
 */
function assessCondition(property: PropertyData): PropertyAnalysis['conditionMetrics'] {
  const age = new Date().getFullYear() - property.specs.yearBuilt;
  
  // Age impact
  let ageImpact: 'minimal' | 'moderate' | 'significant' = 'minimal';
  if (age > 30) {
    ageImpact = 'significant';
  } else if (age > 15) {
    ageImpact = 'moderate';
  }
  
  // Renovation value
  let renovationValue = 0;
  if (property.features.renovations && property.features.renovations.length > 0) {
    property.features.renovations.forEach(reno => {
      const renoAge = new Date().getFullYear() - reno.year;
      if (renoAge < 5) {
        if (reno.type.toLowerCase().includes('kitchen')) renovationValue += 30000;
        else if (reno.type.toLowerCase().includes('bathroom')) renovationValue += 15000;
        else renovationValue += 10000;
      }
    });
  }
  
  // Maintenance priorities based on age and condition
  const maintenancePriorities: string[] = [];
  
  if (property.condition === 'needs_work' || property.condition === 'fixer_upper') {
    maintenancePriorities.push('Significant updates required throughout');
  }
  
  if (age > 20 && property.features.heating === 'oil') {
    maintenancePriorities.push('Consider upgrading to heat pump for efficiency');
  }
  
  if (age > 25 && !property.features.renovations?.some(r => 
    r.type.toLowerCase().includes('roof') && new Date().getFullYear() - r.year < 10
  )) {
    maintenancePriorities.push('Roof may need inspection/replacement soon');
  }
  
  if (property.condition === 'fair') {
    maintenancePriorities.push('Cosmetic updates would add value');
  }
  
  if (maintenancePriorities.length === 0) {
    maintenancePriorities.push('Well-maintained, no major concerns');
  }
  
  return {
    overallCondition: property.condition || 'excellent',
    ageImpact,
    renovationValue,
    maintenancePriorities,
  };
}

/**
 * Analyze market position
 */
function analyzeMarketPosition(property: PropertyData): PropertyAnalysis['marketPosition'] {
  const dom = property.marketTiming.daysOnMarket || 0;
  
  // Days on market assessment
  let daysOnMarketAssessment: 'selling_fast' | 'normal_pace' | 'slow_moving' | 'stale';
  if (dom < 15) {
    daysOnMarketAssessment = 'selling_fast';
  } else if (dom < 45) {
    daysOnMarketAssessment = 'normal_pace';
  } else if (dom < 90) {
    daysOnMarketAssessment = 'slow_moving';
  } else {
    daysOnMarketAssessment = 'stale';
  }
  
  // Competitiveness
  let competitiveness: 'high_demand' | 'moderate' | 'low_demand';
  if (property.status === 'sold' && dom < 20) {
    competitiveness = 'high_demand';
  } else if (property.status === 'pending' && dom < 30) {
    competitiveness = 'high_demand';
  } else if (dom > 60) {
    competitiveness = 'low_demand';
  } else {
    competitiveness = 'moderate';
  }
  
  // Pricing strategy
  let pricingStrategy: 'aggressive' | 'competitive' | 'conservative';
  if (property.pricing.listPrice && property.pricing.pricePerSqft) {
    if (property.pricing.pricePerSqft > 350) {
      pricingStrategy = 'aggressive';
    } else if (property.pricing.pricePerSqft < 250) {
      pricingStrategy = 'conservative';
    } else {
      pricingStrategy = 'competitive';
    }
  } else {
    pricingStrategy = 'competitive';
  }
  
  // Likely time to sell
  let likelyTimeToSell = 30; // Default
  if (competitiveness === 'high_demand') {
    likelyTimeToSell = 15;
  } else if (competitiveness === 'low_demand') {
    likelyTimeToSell = 60;
  }
  
  return {
    daysOnMarketAssessment,
    competitiveness,
    pricingStrategy,
    likelyTimeToSell,
  };
}

/**
 * Analyze location
 */
function analyzeLocation(property: PropertyData): PropertyAnalysis['locationInsights'] {
  const walkScore = property.neighborhood.walkScore || 50;
  const transitScore = property.neighborhood.transitScore || 40;
  
  // Neighborhood rating based on area
  let neighborhoodRating: 'premium' | 'desirable' | 'average' | 'developing' = 'average';
  const hood = property.address.neighborhood.toLowerCase();
  
  if (hood.includes('south end') || hood.includes('larry uteck')) {
    neighborhoodRating = 'premium';
  } else if (hood.includes('west end') || hood.includes('bedford') || hood.includes('clayton park')) {
    neighborhoodRating = 'desirable';
  } else if (hood.includes('sackville') || hood.includes('woodside')) {
    neighborhoodRating = 'developing';
  }
  
  // Transit access
  let transitAccess: 'excellent' | 'good' | 'fair' | 'limited';
  if (transitScore >= 75) {
    transitAccess = 'excellent';
  } else if (transitScore >= 60) {
    transitAccess = 'good';
  } else if (transitScore >= 45) {
    transitAccess = 'fair';
  } else {
    transitAccess = 'limited';
  }
  
  // Nearby amenities
  const amenitiesCount = property.neighborhood.nearbyAmenities?.length || 0;
  const amenitiesScore = Math.min(100, amenitiesCount * 20);
  
  const highlights: string[] = [];
  if (walkScore >= 80) highlights.push('Highly walkable area');
  if (transitScore >= 70) highlights.push('Excellent public transit');
  if (property.neighborhood.nearbySchools && property.neighborhood.nearbySchools.length > 0) {
    highlights.push('Close to schools');
  }
  if (amenitiesCount >= 3) highlights.push('Great amenities nearby');
  
  return {
    neighborhoodRating,
    walkabilityScore: walkScore,
    transitAccess,
    nearbyAmenities: {
      score: amenitiesScore,
      highlights,
    },
  };
}

/**
 * Generate SWOT-style insights
 */
function generateInsights(
  property: PropertyData,
  valueMetrics: PropertyAnalysis['valueMetrics'],
  conditionMetrics: PropertyAnalysis['conditionMetrics'],
  marketPosition: PropertyAnalysis['marketPosition']
): PropertyAnalysis['insights'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  
  // Strengths
  if (valueMetrics.priceRating === 'excellent_value' || valueMetrics.priceRating === 'good_value') {
    strengths.push('Competitively priced for the market');
  }
  
  if (conditionMetrics.overallCondition === 'excellent' || conditionMetrics.overallCondition === 'good') {
    strengths.push('Well-maintained property');
  }
  
  if (property.features.renovations && property.features.renovations.length > 0) {
    strengths.push('Recent renovations add value');
  }
  
  if (property.specs.garage && property.specs.garage.spaces >= 2) {
    strengths.push('Ample parking with garage');
  }
  
  if (property.features.heating === 'heat_pump') {
    strengths.push('Energy-efficient heat pump');
  }
  
  // Weaknesses
  if (valueMetrics.priceRating === 'overpriced') {
    weaknesses.push('Priced above market average');
  }
  
  if (conditionMetrics.ageImpact === 'significant') {
    weaknesses.push('Property age may require updates');
  }
  
  if (marketPosition.daysOnMarketAssessment === 'slow_moving' || 
      marketPosition.daysOnMarketAssessment === 'stale') {
    weaknesses.push('Extended time on market');
  }
  
  if (property.features.heating === 'oil') {
    weaknesses.push('Oil heating less desirable than heat pump');
  }
  
  // Opportunities
  if (conditionMetrics.overallCondition === 'fair' || conditionMetrics.overallCondition === 'needs_work') {
    opportunities.push('Value-add potential through updates');
  }
  
  if (property.specs.basement && !property.specs.basement.finished) {
    opportunities.push('Unfinished basement offers expansion potential');
  }
  
  if (property.specs.lotSize && property.specs.lotSize > 6000) {
    opportunities.push('Large lot provides flexibility');
  }
  
  // Target buyer
  let targetBuyer = 'General homebuyers';
  if (property.specs.bedrooms >= 4 && property.neighborhood.nearbySchools) {
    targetBuyer = 'Growing families';
  } else if (property.specs.bedrooms <= 2 && property.propertyType === 'condo') {
    targetBuyer = 'First-time buyers, downsizers, or investors';
  } else if (property.specs.bedrooms === 3 && property.propertyType === 'townhouse') {
    targetBuyer = 'Young families or professionals';
  } else if (valueMetrics.priceRating === 'excellent_value') {
    targetBuyer = 'Value-conscious buyers and investors';
  } else if (conditionMetrics.overallCondition === 'excellent' && property.pricing.listPrice && property.pricing.listPrice > 700000) {
    targetBuyer = 'Move-up buyers seeking premium homes';
  }
  
  return {
    strengths,
    weaknesses,
    opportunities,
    targetBuyer,
  };
}

/**
 * Generate property summary
 */
function generatePropertySummary(
  property: PropertyData,
  valueMetrics: PropertyAnalysis['valueMetrics'],
  marketPosition: PropertyAnalysis['marketPosition']
): string {
  const price = property.pricing.listPrice || property.pricing.soldPrice || 0;
  const priceStr = `$${(price / 1000).toFixed(0)}K`;
  
  let summary = `${property.specs.bedrooms}bd/${property.specs.bathrooms}ba ${property.propertyType.replace('_', ' ')} `;
  summary += `in ${property.address.neighborhood}, listed at ${priceStr}. `;
  
  if (valueMetrics.priceRating === 'excellent_value') {
    summary += 'Excellent value for the area. ';
  } else if (valueMetrics.priceRating === 'good_value') {
    summary += 'Good value compared to similar properties. ';
  }
  
  if (marketPosition.competitiveness === 'high_demand') {
    summary += 'High demand - act quickly. ';
  } else if (marketPosition.daysOnMarketAssessment === 'slow_moving') {
    summary += 'Opportunity for negotiation. ';
  }
  
  return summary.trim();
}

/**
 * Convert PropertyData to summary format
 */
export function toPropertySummary(property: PropertyData): PropertySummary {
  const price = property.pricing.listPrice || property.pricing.soldPrice || 0;
  
  return {
    id: property.id,
    address: `${property.address.street}, ${property.address.city}`,
    neighborhood: property.address.neighborhood,
    propertyType: property.propertyType,
    status: property.status,
    bedrooms: property.specs.bedrooms,
    bathrooms: property.specs.bathrooms,
    squareFeet: property.specs.squareFeet,
    price,
    pricePerSqft: property.pricing.pricePerSqft,
    daysOnMarket: property.marketTiming.daysOnMarket,
    imageUrl: property.images?.[0],
  };
}

/**
 * Compare properties
 */
export function compareProperties(
  subject: PropertyData,
  comparables: PropertyData[]
): PropertyComparison {
  const prices = comparables
    .map(c => c.pricing.soldPrice || c.pricing.listPrice || 0)
    .filter(p => p > 0);
  
  const pricesPerSqft = comparables
    .map(c => c.pricing.pricePerSqft || 0)
    .filter(p => p > 0);
  
  const daysOnMarket = comparables
    .map(c => c.marketTiming.daysOnMarket || 0)
    .filter(d => d > 0);
  
  const averagePrice = prices.length > 0 
    ? prices.reduce((a, b) => a + b, 0) / prices.length 
    : 0;
  
  const medianPrice = prices.length > 0
    ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
    : 0;
  
  const averagePricePerSqft = pricesPerSqft.length > 0
    ? pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length
    : 0;
  
  const averageDaysOnMarket = daysOnMarket.length > 0
    ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length)
    : 0;
  
  const subjectPrice = subject.pricing.listPrice || subject.pricing.soldPrice || 0;
  const priceDifference = subjectPrice - averagePrice;
  const priceDifferencePercent = averagePrice > 0 
    ? (priceDifference / averagePrice) * 100 
    : 0;
  
  // Size comparison
  let sizeComparison: 'larger' | 'similar' | 'smaller' = 'similar';
  if (subject.specs.squareFeet) {
    const avgSize = comparables
      .map(c => c.specs.squareFeet || 0)
      .filter(s => s > 0)
      .reduce((a, b) => a + b, 0) / comparables.length;
    
    if (subject.specs.squareFeet > avgSize * 1.1) {
      sizeComparison = 'larger';
    } else if (subject.specs.squareFeet < avgSize * 0.9) {
      sizeComparison = 'smaller';
    }
  }
  
  // Age comparison
  let ageComparison: 'newer' | 'similar' | 'older' = 'similar';
  const avgAge = comparables
    .map(c => new Date().getFullYear() - c.specs.yearBuilt)
    .reduce((a, b) => a + b, 0) / comparables.length;
  const subjectAge = new Date().getFullYear() - subject.specs.yearBuilt;
  
  if (subjectAge < avgAge - 5) {
    ageComparison = 'newer';
  } else if (subjectAge > avgAge + 5) {
    ageComparison = 'older';
  }
  
  return {
    subject,
    comparables,
    analysis: {
      averagePrice,
      medianPrice,
      priceRange: {
        low: Math.min(...prices),
        high: Math.max(...prices),
      },
      averagePricePerSqft,
      averageDaysOnMarket,
      subjectVsAverage: {
        priceDifference,
        priceDifferencePercent,
        sizeComparison,
        ageComparison,
      },
    },
  };
}