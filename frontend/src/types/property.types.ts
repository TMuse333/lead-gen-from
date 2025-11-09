// ============================================
// PROPERTY DATA TYPES
// Base structure for individual home/property data
// ============================================

/**
 * Property Status
 */
 export type PropertyStatus = 
 | 'active'           // Currently listed
 | 'pending'          // Offer accepted, awaiting close
 | 'sold'             // Recently sold
 | 'off_market'       // Not currently listed
 | 'coming_soon';     // Pre-listing

/**
* Property Type Classification
*/
export type PropertyType = 
 | 'single_family'
 | 'condo'
 | 'townhouse'
 | 'multi_family'
 | 'land'
 | 'commercial';

/**
* Property Condition
*/
export type PropertyCondition = 
 | 'excellent'        // Move-in ready, pristine
 | 'good'            // Well-maintained, minor updates
 | 'fair'            // Some updates needed
 | 'needs_work'      // Significant renovation required
 | 'fixer_upper';    // Major renovation needed

/**
* Heating/Cooling Systems
*/
export type HeatingType = 
 | 'forced_air_gas'
 | 'forced_air_electric'
 | 'baseboard_electric'
 | 'heat_pump'
 | 'radiant'
 | 'oil'
 | 'other';

/**
* Core Property Data
* This is the base property object used throughout the app
*/
export interface PropertyData {
 // Identification
 id: string;
 mlsNumber?: string;                    // MLS listing number (if available)
 
 // Location
 address: {
   street: string;                      // e.g., "123 Main Street"
   unit?: string;                       // e.g., "Unit 4B"
   city: string;                        // e.g., "Halifax"
   province: string;                    // e.g., "Nova Scotia"
   postalCode: string;                  // e.g., "B3H 1A1"
   neighborhood: string;                // e.g., "South End"
   coordinates?: {
     latitude: number;
     longitude: number;
   };
 };
 
 // Property Details
 propertyType: PropertyType;
 status: PropertyStatus;
 condition: PropertyCondition;
 
 // Physical Characteristics
 specs: {
   bedrooms: number;
   bathrooms: number;                   // Full baths
   halfBathrooms?: number;              // Half baths
   squareFeet?: number;                 // Interior square footage
   lotSize?: number;                    // Lot size in square feet
   lotSizeAcres?: number;              // Lot size in acres
   yearBuilt: number;
   stories?: number;                    // Number of floors
   garage?: {
     spaces: number;
     type: 'attached' | 'detached' | 'carport' | 'none';
   };
   basement?: {
     finished: boolean;
     squareFeet?: number;
   };
 };
 
 // Pricing
 pricing: {
   listPrice?: number;                  // Current or last list price
   soldPrice?: number;                  // Actual sold price
   pricePerSqft?: number;              // Price per square foot
   assessedValue?: number;             // Municipal assessment
   annualPropertyTax?: number;         // Yearly property tax
 };
 
 // Market Timing
 marketTiming: {
   listedDate?: Date;                   // When listed
   soldDate?: Date;                     // When sold
   daysOnMarket?: number;              // How long it was listed
   lastUpdated: Date;                   // Last data update
 };
 
 // Features & Amenities
 features: {
   heating: HeatingType;
   cooling?: 'central_air' | 'heat_pump' | 'window_units' | 'none';
   parking?: {
     total: number;
     covered: number;
   };
   appliances?: string[];              // e.g., ["Dishwasher", "Washer/Dryer"]
   flooring?: string[];                // e.g., ["Hardwood", "Tile"]
   renovations?: {
     year: number;
     type: string;                     // e.g., "Kitchen", "Bathroom"
     description?: string;
   }[];
   specialFeatures?: string[];         // e.g., ["Pool", "Fireplace", "Deck"]
 };
 
 // School & Neighborhood
 neighborhood: {
   walkScore?: number;                 // 0-100
   transitScore?: number;              // 0-100
   bikeScore?: number;                 // 0-100
   nearbySchools?: {
     name: string;
     type: 'elementary' | 'middle' | 'high';
     distance: number;                 // km
     rating?: number;                  // out of 10
   }[];
   nearbyAmenities?: {
     type: string;                     // e.g., "Grocery", "Park"
     name: string;
     distance: number;                 // km
   }[];
 };
 
 // Additional Info
 description?: string;                 // Property description
 images?: string[];                    // Image URLs
 virtualTourUrl?: string;             // 3D tour link
 
 // Agent/Listing Info
 listingAgent?: {
   name: string;
   phone?: string;
   email?: string;
   brokerage?: string;
 };
 
 // Metadata
 dataSource: 'mls' | 'manual' | 'placeholder' | 'external_api';
 lastVerified?: Date;
}

/**
* Simplified Property Summary (for lists/cards)
*/
export interface PropertySummary {
 id: string;
 address: string;                      // Full formatted address
 neighborhood: string;
 propertyType: PropertyType;
 status: PropertyStatus;
 bedrooms: number;
 bathrooms: number;
 squareFeet?: number;
 price: number;                        // List or sold price
 pricePerSqft?: number;
 daysOnMarket?: number;
 imageUrl?: string;                    // Primary image
}

/**
* Property Search Filters
*/
export interface PropertySearchFilters {
 // Location
 city?: string | string[];
 neighborhood?: string | string[];
 postalCode?: string;
 radiusKm?: number;                    // Search radius
 
 // Property Type
 propertyTypes?: PropertyType[];
 
 // Status
 statuses?: PropertyStatus[];
 
 // Price Range
 minPrice?: number;
 maxPrice?: number;
 
 // Physical
 minBedrooms?: number;
 maxBedrooms?: number;
 minBathrooms?: number;
 minSquareFeet?: number;
 maxSquareFeet?: number;
 
 // Age
 minYearBuilt?: number;
 maxYearBuilt?: number;
 
 // Features
 hasGarage?: boolean;
 hasBasement?: boolean;
 hasPool?: boolean;
 
 // Market
 maxDaysOnMarket?: number;
 
 // Sorting
 sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'size_desc' | 'dom_asc';
 limit?: number;
}

/**
* Property Search Result
*/
export interface PropertySearchResult {
 properties: PropertyData[];
 total: number;
 filters: PropertySearchFilters;
 searchedAt: Date;
}

/**
* Property Comparison Data
*/
export interface PropertyComparison {
 subject: PropertyData;                // The property being compared
 comparables: PropertyData[];          // Similar properties
 analysis: {
   averagePrice: number;
   medianPrice: number;
   priceRange: {
     low: number;
     high: number;
   };
   averagePricePerSqft: number;
   averageDaysOnMarket: number;
   subjectVsAverage: {
     priceDifference: number;          // Dollar difference
     priceDifferencePercent: number;   // Percentage
     sizeComparison: 'larger' | 'similar' | 'smaller';
     ageComparison: 'newer' | 'similar' | 'older';
   };
 };
}