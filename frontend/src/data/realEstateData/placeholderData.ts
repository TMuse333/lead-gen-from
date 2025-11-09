// ============================================
// PLACEHOLDER PROPERTY DATA
// Mock property listings for MVP testing
// Nova Scotia areas: Halifax, Dartmouth, Bedford, Clayton Park
// ============================================

import { PropertyData, PropertyStatus } from "@/types/dataTypes/property.types";



/**
 * Placeholder Properties Database
 * TODO: Replace with real MLS API integration
 */
export const PLACEHOLDER_PROPERTIES: PropertyData[] = [
  // ========================================
  // HALIFAX - SOUTH END
  // ========================================
  {
    id: 'prop-001',
    mlsNumber: 'HL12345',
    address: {
      street: '1456 South Park Street',
      city: 'Halifax',
      province: 'Nova Scotia',
      postalCode: 'B3H 2X9',
      neighborhood: 'South End',
      coordinates: {
        latitude: 44.6336,
        longitude: -63.5771,
      },
    },
    propertyType: 'single_family',
    status: 'active',
    condition: 'excellent',
    specs: {
      bedrooms: 4,
      bathrooms: 3,
      halfBathrooms: 1,
      squareFeet: 2400,
      lotSize: 5500,
      yearBuilt: 2018,
      stories: 2,
      garage: {
        spaces: 2,
        type: 'attached',
      },
      basement: {
        finished: true,
        squareFeet: 800,
      },
    },
    pricing: {
      listPrice: 875000,
      pricePerSqft: 365,
      assessedValue: 820000,
      annualPropertyTax: 8200,
    },
    marketTiming: {
      listedDate: new Date('2025-10-15'),
      daysOnMarket: 24,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'heat_pump',
      cooling: 'heat_pump',
      parking: {
        total: 3,
        covered: 2,
      },
      appliances: ['Dishwasher', 'Washer/Dryer', 'Built-in Microwave', 'Gas Range'],
      flooring: ['Hardwood', 'Tile', 'Carpet'],
      specialFeatures: ['Fireplace', 'Deck', 'Smart Home', 'Energy Efficient'],
    },
    neighborhood: {
      walkScore: 88,
      transitScore: 75,
      bikeScore: 82,
      nearbyAmenities: [
        { type: 'Grocery', name: 'Atlantic Superstore', distance: 0.8 },
        { type: 'Park', name: 'Point Pleasant Park', distance: 1.2 },
        { type: 'Coffee Shop', name: 'Local Coffee', distance: 0.3 },
      ],
    },
    description: 'Stunning modern home in desirable South End. Open concept living, gourmet kitchen with quartz counters, primary suite with spa-like ensuite. Steps to Point Pleasant Park.',
    images: ['/images/prop-001-1.jpg', '/images/prop-001-2.jpg'],
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },
  
  {
    id: 'prop-002',
    mlsNumber: 'HL12346',
    address: {
      street: '892 Tower Road',
      city: 'Halifax',
      province: 'Nova Scotia',
      postalCode: 'B3H 2Y3',
      neighborhood: 'South End',
    },
    propertyType: 'condo',
    status: 'sold',
    condition: 'good',
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      yearBuilt: 2015,
      stories: 1,
    },
    pricing: {
      listPrice: 485000,
      soldPrice: 492000,
      pricePerSqft: 410,
      annualPropertyTax: 3200,
    },
    marketTiming: {
      listedDate: new Date('2025-09-20'),
      soldDate: new Date('2025-10-12'),
      daysOnMarket: 22,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'baseboard_electric',
      cooling: 'none',
      parking: {
        total: 1,
        covered: 1,
      },
      appliances: ['Dishwasher', 'In-unit Washer/Dryer'],
      flooring: ['Laminate', 'Tile'],
      specialFeatures: ['Balcony', 'Storage Locker', 'Gym Access'],
    },
    neighborhood: {
      walkScore: 92,
      transitScore: 85,
      bikeScore: 88,
    },
    description: 'Beautiful 2-bedroom condo with harbor views. Modern finishes, in-suite laundry, assigned parking. Walk to downtown.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  // ========================================
  // HALIFAX - WEST END
  // ========================================
  {
    id: 'prop-003',
    mlsNumber: 'HL12347',
    address: {
      street: '3421 Windsor Street',
      city: 'Halifax',
      province: 'Nova Scotia',
      postalCode: 'B3K 5E4',
      neighborhood: 'West End',
    },
    propertyType: 'townhouse',
    status: 'active',
    condition: 'good',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      squareFeet: 1650,
      yearBuilt: 2012,
      stories: 3,
      garage: {
        spaces: 1,
        type: 'attached',
      },
    },
    pricing: {
      listPrice: 545000,
      pricePerSqft: 330,
      annualPropertyTax: 4800,
    },
    marketTiming: {
      listedDate: new Date('2025-11-01'),
      daysOnMarket: 7,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'forced_air_gas',
      cooling: 'central_air',
      parking: {
        total: 2,
        covered: 1,
      },
      appliances: ['Dishwasher', 'Washer/Dryer'],
      flooring: ['Hardwood', 'Tile'],
      renovations: [
        {
          year: 2023,
          type: 'Kitchen',
          description: 'Full kitchen renovation with new cabinets and appliances',
        },
      ],
      specialFeatures: ['Fenced Yard', 'Patio', 'Updated Kitchen'],
    },
    neighborhood: {
      walkScore: 78,
      transitScore: 70,
      bikeScore: 75,
    },
    description: 'Spacious 3-story townhouse with renovated kitchen. Great location near schools and transit. Perfect for families.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  // ========================================
  // DARTMOUTH
  // ========================================
  {
    id: 'prop-004',
    mlsNumber: 'DT12348',
    address: {
      street: '67 Portland Street',
      city: 'Dartmouth',
      province: 'Nova Scotia',
      postalCode: 'B2Y 1H8',
      neighborhood: 'Downtown Dartmouth',
    },
    propertyType: 'single_family',
    status: 'active',
    condition: 'fair',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      lotSize: 6000,
      yearBuilt: 1985,
      stories: 2,
      garage: {
        spaces: 1,
        type: 'detached',
      },
      basement: {
        finished: false,
      },
    },
    pricing: {
      listPrice: 425000,
      pricePerSqft: 236,
      assessedValue: 390000,
      annualPropertyTax: 3900,
    },
    marketTiming: {
      listedDate: new Date('2025-10-20'),
      daysOnMarket: 19,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'oil',
      parking: {
        total: 2,
        covered: 1,
      },
      appliances: ['Dishwasher', 'Stove/Oven'],
      flooring: ['Hardwood', 'Vinyl'],
      specialFeatures: ['Large Lot', 'Quiet Street', 'Original Hardwood'],
    },
    neighborhood: {
      walkScore: 72,
      transitScore: 68,
      bikeScore: 70,
    },
    description: 'Charming older home with great bones. Needs some updates but lots of potential. Large lot, quiet neighborhood.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  {
    id: 'prop-005',
    mlsNumber: 'DT12349',
    address: {
      street: '142 Windmill Road',
      city: 'Dartmouth',
      province: 'Nova Scotia',
      postalCode: 'B2Y 3Z1',
      neighborhood: 'Woodside',
    },
    propertyType: 'condo',
    status: 'sold',
    condition: 'excellent',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
      yearBuilt: 2020,
      stories: 1,
    },
    pricing: {
      listPrice: 425000,
      soldPrice: 430000,
      pricePerSqft: 307,
      annualPropertyTax: 2800,
    },
    marketTiming: {
      listedDate: new Date('2025-09-15'),
      soldDate: new Date('2025-10-01'),
      daysOnMarket: 16,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'heat_pump',
      cooling: 'heat_pump',
      parking: {
        total: 2,
        covered: 1,
      },
      appliances: ['Dishwasher', 'Washer/Dryer', 'Microwave', 'Fridge/Stove'],
      flooring: ['Luxury Vinyl', 'Tile'],
      specialFeatures: ['Modern', 'Energy Efficient', 'Low Maintenance'],
    },
    neighborhood: {
      walkScore: 65,
      transitScore: 60,
      bikeScore: 62,
    },
    description: 'Like-new 3-bedroom condo with modern finishes. Heat pump for efficiency, 2 parking spots, great for first-time buyers.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  // ========================================
  // BEDFORD
  // ========================================
  {
    id: 'prop-006',
    mlsNumber: 'BD12350',
    address: {
      street: '45 Heritage Drive',
      city: 'Bedford',
      province: 'Nova Scotia',
      postalCode: 'B4A 0G2',
      neighborhood: 'Bedford South',
    },
    propertyType: 'single_family',
    status: 'active',
    condition: 'excellent',
    specs: {
      bedrooms: 4,
      bathrooms: 3,
      halfBathrooms: 1,
      squareFeet: 2800,
      lotSize: 8000,
      yearBuilt: 2019,
      stories: 2,
      garage: {
        spaces: 2,
        type: 'attached',
      },
      basement: {
        finished: true,
        squareFeet: 1000,
      },
    },
    pricing: {
      listPrice: 925000,
      pricePerSqft: 330,
      assessedValue: 880000,
      annualPropertyTax: 9500,
    },
    marketTiming: {
      listedDate: new Date('2025-10-25'),
      daysOnMarket: 14,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'heat_pump',
      cooling: 'heat_pump',
      parking: {
        total: 4,
        covered: 2,
      },
      appliances: ['Dishwasher', 'Washer/Dryer', 'Built-in Microwave', 'Gas Range', 'Wine Fridge'],
      flooring: ['Hardwood', 'Tile', 'Carpet'],
      specialFeatures: ['Home Office', 'Rec Room', 'Deck', 'Landscaped', 'Smart Home'],
    },
    neighborhood: {
      walkScore: 45,
      transitScore: 35,
      bikeScore: 50,
      nearbySchools: [
        { name: 'Bedford South School', type: 'elementary', distance: 0.5, rating: 8 },
        { name: 'Charles P. Allen High', type: 'high', distance: 2.0, rating: 8 },
      ],
    },
    description: 'Executive family home in sought-after Bedford South. Finished basement, home office, premium finishes throughout. Near top-rated schools.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  {
    id: 'prop-007',
    mlsNumber: 'BD12351',
    address: {
      street: '78 Larry Uteck Boulevard',
      city: 'Bedford',
      province: 'Nova Scotia',
      postalCode: 'B4A 0L1',
      neighborhood: 'Larry Uteck',
    },
    propertyType: 'townhouse',
    status: 'pending',
    condition: 'excellent',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      squareFeet: 1850,
      yearBuilt: 2021,
      stories: 3,
      garage: {
        spaces: 2,
        type: 'attached',
      },
    },
    pricing: {
      listPrice: 625000,
      pricePerSqft: 338,
      annualPropertyTax: 5200,
    },
    marketTiming: {
      listedDate: new Date('2025-10-28'),
      daysOnMarket: 11,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'heat_pump',
      cooling: 'heat_pump',
      parking: {
        total: 2,
        covered: 2,
      },
      appliances: ['Dishwasher', 'Washer/Dryer', 'Microwave', 'Stainless Appliances'],
      flooring: ['Luxury Vinyl', 'Tile'],
      specialFeatures: ['End Unit', 'Extra Windows', 'Walk to Amenities', 'Modern'],
    },
    neighborhood: {
      walkScore: 62,
      transitScore: 55,
      bikeScore: 58,
      nearbyAmenities: [
        { type: 'Grocery', name: 'Sobeys', distance: 0.4 },
        { type: 'Shopping', name: 'Larry Uteck Plaza', distance: 0.3 },
      ],
    },
    description: 'Nearly new end-unit townhouse in vibrant Larry Uteck area. Heat pump, garage, walk to shops and restaurants.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  // ========================================
  // HALIFAX - CLAYTON PARK
  // ========================================
  {
    id: 'prop-008',
    mlsNumber: 'HL12352',
    address: {
      street: '234 Kearney Lake Road',
      city: 'Halifax',
      province: 'Nova Scotia',
      postalCode: 'B3M 4J2',
      neighborhood: 'Clayton Park',
    },
    propertyType: 'single_family',
    status: 'active',
    condition: 'good',
    specs: {
      bedrooms: 4,
      bathrooms: 2,
      halfBathrooms: 1,
      squareFeet: 2200,
      lotSize: 7000,
      yearBuilt: 2005,
      stories: 2,
      garage: {
        spaces: 2,
        type: 'attached',
      },
      basement: {
        finished: true,
        squareFeet: 900,
      },
    },
    pricing: {
      listPrice: 675000,
      pricePerSqft: 307,
      assessedValue: 640000,
      annualPropertyTax: 6800,
    },
    marketTiming: {
      listedDate: new Date('2025-11-03'),
      daysOnMarket: 5,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'forced_air_gas',
      cooling: 'central_air',
      parking: {
        total: 3,
        covered: 2,
      },
      appliances: ['Dishwasher', 'Washer/Dryer', 'Microwave'],
      flooring: ['Hardwood', 'Tile', 'Carpet'],
      renovations: [
        {
          year: 2022,
          type: 'Bathroom',
          description: 'Updated main bathroom with new fixtures',
        },
      ],
      specialFeatures: ['Fenced Yard', 'Deck', 'Finished Basement', 'Family Friendly'],
    },
    neighborhood: {
      walkScore: 68,
      transitScore: 65,
      bikeScore: 60,
      nearbySchools: [
        { name: 'Sir John A. MacDonald High', type: 'high', distance: 1.5, rating: 7 },
      ],
      nearbyAmenities: [
        { type: 'Shopping', name: 'Clayton Park Shopping Centre', distance: 1.0 },
        { type: 'Recreation', name: 'Canada Games Centre', distance: 2.5 },
      ],
    },
    description: 'Well-maintained family home in established Clayton Park neighborhood. Large fenced yard, finished basement, close to schools and amenities.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  {
    id: 'prop-009',
    mlsNumber: 'HL12353',
    address: {
      street: '56 Stoneybrook Court',
      city: 'Halifax',
      province: 'Nova Scotia',
      postalCode: 'B3M 3V9',
      neighborhood: 'Clayton Park West',
    },
    propertyType: 'townhouse',
    status: 'sold',
    condition: 'good',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      squareFeet: 1600,
      yearBuilt: 2010,
      stories: 3,
      garage: {
        spaces: 1,
        type: 'attached',
      },
    },
    pricing: {
      listPrice: 495000,
      soldPrice: 505000,
      pricePerSqft: 316,
      annualPropertyTax: 4200,
    },
    marketTiming: {
      listedDate: new Date('2025-09-25'),
      soldDate: new Date('2025-10-18'),
      daysOnMarket: 23,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'forced_air_electric',
      cooling: 'none',
      parking: {
        total: 2,
        covered: 1,
      },
      appliances: ['Dishwasher', 'Washer/Dryer'],
      flooring: ['Laminate', 'Tile'],
      specialFeatures: ['Private Patio', 'Storage', 'Low Condo Fees'],
    },
    neighborhood: {
      walkScore: 65,
      transitScore: 62,
      bikeScore: 58,
    },
    description: 'Bright townhouse in family-friendly community. Private patio, attached garage, low fees. Great starter home.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },

  // ========================================
  // LOWER SAXVILLE (More Affordable)
  // ========================================
  {
    id: 'prop-010',
    mlsNumber: 'LS12354',
    address: {
      street: '89 Sackville Drive',
      city: 'Lower Sackville',
      province: 'Nova Scotia',
      postalCode: 'B4C 2R4',
      neighborhood: 'Lower Sackville',
    },
    propertyType: 'single_family',
    status: 'active',
    condition: 'fair',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      lotSize: 8500,
      yearBuilt: 1992,
      stories: 1,
      basement: {
        finished: false,
      },
    },
    pricing: {
      listPrice: 365000,
      pricePerSqft: 243,
      assessedValue: 340000,
      annualPropertyTax: 3200,
    },
    marketTiming: {
      listedDate: new Date('2025-10-15'),
      daysOnMarket: 24,
      lastUpdated: new Date(),
    },
    features: {
      heating: 'oil',
      parking: {
        total: 2,
        covered: 0,
      },
      appliances: ['Stove/Oven', 'Fridge'],
      flooring: ['Carpet', 'Vinyl'],
      specialFeatures: ['Large Lot', 'Quiet Area', 'Potential'],
    },
    neighborhood: {
      walkScore: 42,
      transitScore: 45,
      bikeScore: 38,
    },
    description: 'Affordable bungalow on large lot. Perfect for first-time buyers or investors. Needs some updates but priced accordingly.',
    dataSource: 'placeholder',
    lastVerified: new Date(),
  },
];

/**
 * Helper function to get properties by area
 */
export function getPropertiesByArea(area: string): PropertyData[] {
  const normalizedArea = area.toLowerCase();
  return PLACEHOLDER_PROPERTIES.filter(
    (prop) => prop.address.city.toLowerCase().includes(normalizedArea) ||
              prop.address.neighborhood.toLowerCase().includes(normalizedArea)
  );
}

/**
 * Helper function to get properties by status
 */
export function getPropertiesByStatus(status: PropertyStatus): PropertyData[] {
  return PLACEHOLDER_PROPERTIES.filter((prop) => prop.status === status);
}

/**
 * Helper function to search properties
 */
export function searchProperties(criteria: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  propertyType?: string;
}): PropertyData[] {
  return PLACEHOLDER_PROPERTIES.filter((prop) => {
    if (criteria.city && !prop.address.city.toLowerCase().includes(criteria.city.toLowerCase())) {
      return false;
    }
    
    const price = prop.pricing.listPrice || prop.pricing.soldPrice || 0;
    if (criteria.minPrice && price < criteria.minPrice) return false;
    if (criteria.maxPrice && price > criteria.maxPrice) return false;
    if (criteria.minBedrooms && prop.specs.bedrooms < criteria.minBedrooms) return false;
    if (criteria.propertyType && prop.propertyType !== criteria.propertyType) return false;
    
    return true;
  });
}

/**
 * Get property by ID
 */
export function getPropertyById(id: string): PropertyData | undefined {
  return PLACEHOLDER_PROPERTIES.find((prop) => prop.id === id);
}