// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { 

PLACEHOLDER_PROPERTIES, 

getPropertiesByArea, 

getPropertiesByStatus,

searchProperties 

} from '@/data/realEstateData/placeholderData';

import { 

PropertyData, 

PropertySearchFilters,

PropertyStatus 

} from '@/types/dataTypes/property.types';

import { analyzeProperty, toPropertySummary } from '@/lib/calc/propertyAnalyzer';

/**
 * GET /api/properties
 * 
 * Query params:
 * - area: string (e.g., "Halifax", "Dartmouth", "Bedford")
 * - status: PropertyStatus (e.g., "active", "sold", "pending")
 * - minPrice: number
 * - maxPrice: number
 * - minBedrooms: number
 * - propertyType: string
 * - analyze: boolean (default: false) - whether to include full analysis
 * 
 * Returns: Array of properties with optional analysis
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const area = searchParams.get('area');
    const status = searchParams.get('status') as PropertyStatus | null;
    const minPrice = searchParams.get('minPrice') 
      ? Number(searchParams.get('minPrice')) 
      : undefined;
    const maxPrice = searchParams.get('maxPrice') 
      ? Number(searchParams.get('maxPrice')) 
      : undefined;
    const minBedrooms = searchParams.get('minBedrooms') 
      ? Number(searchParams.get('minBedrooms')) 
      : undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const shouldAnalyze = searchParams.get('analyze') === 'true';
    
    // Fetch properties based on filters
    let properties: PropertyData[] = [];
    
    if (area) {
      // Filter by area
      properties = getPropertiesByArea(area);
    } else if (status) {
      // Filter by status
      properties = getPropertiesByStatus(status);
    } else {
      // No specific filter, return all
      properties = [...PLACEHOLDER_PROPERTIES];
    }
    
    // Apply additional search filters
    if (minPrice || maxPrice || minBedrooms || propertyType) {
      properties = searchProperties({
        city: area || undefined,
        minPrice,
        maxPrice,
        minBedrooms,
        propertyType: propertyType as PropertyData['propertyType'] | undefined,
      });
    }
    
    // Generate response based on whether analysis is requested
    if (shouldAnalyze) {
      // Full analysis for each property
      const analyzed = properties.map(property => {
        // Get comparables for this property (same area, similar type)
        const comparables = PLACEHOLDER_PROPERTIES.filter(p => 
          p.id !== property.id &&
          p.address.neighborhood === property.address.neighborhood &&
          p.propertyType === property.propertyType &&
          (p.status === 'sold' || p.status === 'active')
        ).slice(0, 5);
        
        const analysis = analyzeProperty(property, comparables);
        
        return {
          property,
          analysis,
          summary: toPropertySummary(property),
        };
      });
      
      return NextResponse.json({
        success: true,
        count: analyzed.length,
        data: analyzed,
        filters: {
          area,
          status,
          minPrice,
          maxPrice,
          minBedrooms,
          propertyType,
        },
        metadata: {
          dataSource: 'placeholder',
          analyzedAt: new Date().toISOString(),
          hasAnalysis: true,
        },
      });
    } else {
      // Lightweight summaries only
      const summaries = properties.map(property => toPropertySummary(property));
      
      return NextResponse.json({
        success: true,
        count: summaries.length,
        data: summaries,
        filters: {
          area,
          status,
          minPrice,
          maxPrice,
          minBedrooms,
          propertyType,
        },
        metadata: {
          dataSource: 'placeholder',
          generatedAt: new Date().toISOString(),
          hasAnalysis: false,
        },
      });
    }
    
  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch properties',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/search
 * 
 * Body: PropertySearchFilters
 * 
 * Returns: Filtered and analyzed properties
 */
export async function POST(req: NextRequest) {
  try {
    const filters: PropertySearchFilters = await req.json();
    
    // Search with provided filters (using simple search function)
    const cityFilter = Array.isArray(filters.city) ? filters.city[0] : filters.city;
    const propertyTypeFilter = filters.propertyTypes?.[0];
    
    let properties = searchProperties({
      city: cityFilter,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBedrooms: filters.minBedrooms,
      propertyType: propertyTypeFilter,
    });
    
    // Apply additional filters manually
    if (filters.statuses && filters.statuses.length > 0) {
      properties = properties.filter(p => filters.statuses!.includes(p.status));
    }
    if (filters.maxBedrooms) {
      properties = properties.filter(p => p.specs.bedrooms <= filters.maxBedrooms!);
    }
    if (filters.minBathrooms) {
      properties = properties.filter(p => p.specs.bathrooms >= filters.minBathrooms!);
    }
    if (filters.maxDaysOnMarket) {
      properties = properties.filter(p => (p.marketTiming.daysOnMarket || 0) <= filters.maxDaysOnMarket!);
    }
    
    // Apply sorting
    let sorted = [...properties];
    switch (filters.sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => {
          const priceA = a.pricing.listPrice || a.pricing.soldPrice || 0;
          const priceB = b.pricing.listPrice || b.pricing.soldPrice || 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        sorted.sort((a, b) => {
          const priceA = a.pricing.listPrice || a.pricing.soldPrice || 0;
          const priceB = b.pricing.listPrice || b.pricing.soldPrice || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.marketTiming.listedDate?.getTime() || 0;
          const dateB = b.marketTiming.listedDate?.getTime() || 0;
          return dateB - dateA;
        });
        break;
      case 'size_desc':
        sorted.sort((a, b) => {
          const sizeA = a.specs.squareFeet || 0;
          const sizeB = b.specs.squareFeet || 0;
          return sizeB - sizeA;
        });
        break;
      case 'dom_asc':
        sorted.sort((a, b) => {
          const domA = a.marketTiming.daysOnMarket || 0;
          const domB = b.marketTiming.daysOnMarket || 0;
          return domA - domB;
        });
        break;
    }
    
    // Apply limit
    const limited = filters.limit ? sorted.slice(0, filters.limit) : sorted;
    
    // Analyze each property
    const analyzed = limited.map(property => {
      const comparables = PLACEHOLDER_PROPERTIES.filter(p => 
        p.id !== property.id &&
        p.address.city === property.address.city &&
        p.propertyType === property.propertyType &&
        (p.status === 'sold' || p.status === 'active')
      ).slice(0, 5);
      
      const analysis = analyzeProperty(property, comparables);
      
      return {
        property,
        analysis,
        summary: toPropertySummary(property),
      };
    });
    
    return NextResponse.json({
      success: true,
      count: analyzed.length,
      total: properties.length,
      data: analyzed,
      filters,
      metadata: {
        dataSource: 'placeholder',
        searchedAt: new Date().toISOString(),
        hasAnalysis: true,
      },
    });
    
  } catch (error) {
    console.error('Properties search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search properties',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}