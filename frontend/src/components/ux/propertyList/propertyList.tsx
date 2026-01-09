'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Bed,
  Bath,
  Square,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
} from 'lucide-react';

// ============================================
// TYPES (No 'any' allowed!)
// ============================================

interface PropertySummary {
  id: string;
  address: string;
  neighborhood: string;
  propertyType: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  price: number;
  pricePerSqft?: number;
  daysOnMarket?: number;
  imageUrl?: string;
}

interface PropertyAnalysis {
  valueMetrics: {
    priceRating: 'excellent_value' | 'good_value' | 'fair' | 'overpriced';
    pricePerSqftComparison: 'below_market' | 'at_market' | 'above_market';
    valueScore: number;
    estimatedMarketValue?: {
      low: number;
      mid: number;
      high: number;
      confidence: 'high' | 'medium' | 'low';
    };
  };
  conditionMetrics: {
    overallCondition: 'excellent' | 'good' | 'fair' | 'needs_work';
    ageImpact: 'minimal' | 'moderate' | 'significant';
    renovationValue: number;
    maintenancePriorities: string[];
  };
  marketPosition: {
    daysOnMarketAssessment: 'selling_fast' | 'normal_pace' | 'slow_moving' | 'stale';
    competitiveness: 'high_demand' | 'moderate' | 'low_demand';
    pricingStrategy: 'aggressive' | 'competitive' | 'conservative';
    likelyTimeToSell: number;
  };
  locationInsights: {
    neighborhoodRating: 'premium' | 'desirable' | 'average' | 'developing';
    walkabilityScore: number;
    transitAccess: 'excellent' | 'good' | 'fair' | 'limited';
    nearbyAmenities: {
      score: number;
      highlights: string[];
    };
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    targetBuyer: string;
  };
  summary: string;
}

interface PropertyWithAnalysis {
  property: {
    id: string;
    address: {
      street: string;
      city: string;
      neighborhood: string;
    };
    propertyType: string;
    status: string;
    specs: {
      bedrooms: number;
      bathrooms: number;
      squareFeet?: number;
      yearBuilt: number;
    };
    pricing: {
      listPrice?: number;
      soldPrice?: number;
      pricePerSqft?: number;
    };
    marketTiming: {
      daysOnMarket?: number;
    };
  };
  analysis: PropertyAnalysis;
  summary: PropertySummary;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: PropertyWithAnalysis[] | PropertySummary[];
  filters: {
    area?: string | null;
    status?: string | null;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    propertyType?: string;
  };
  metadata: {
    dataSource: string;
    generatedAt?: string;
    analyzedAt?: string;
    hasAnalysis: boolean;
  };
}

interface FilterState {
  area: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  analyze: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PropertiesDisplay() {
  const [properties, setProperties] = useState<PropertyWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    area: 'Halifax',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    analyze: true,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.area && filters.area !== 'all') params.append('area', filters.area);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms);
      params.append('analyze', filters.analyze.toString());

      const response = await fetch(`/api/properties?${params.toString()}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        // Type guard to check if data has analysis
        if (result.metadata.hasAnalysis) {
          setProperties(result.data as PropertyWithAnalysis[]);
        } else {
          // Convert summaries to partial properties (for display only)
          const summariesAsProperties: PropertyWithAnalysis[] = (result.data as PropertySummary[]).map(summary => ({
            property: {
              id: summary.id,
              address: {
                street: summary.address.split(',')[0] || summary.address,
                city: summary.address.split(',')[1]?.trim() || 'Unknown',
                neighborhood: summary.neighborhood,
              },
              propertyType: summary.propertyType,
              status: summary.status,
              specs: {
                bedrooms: summary.bedrooms,
                bathrooms: summary.bathrooms,
                squareFeet: summary.squareFeet,
                yearBuilt: 2000, // Default
              },
              pricing: {
                listPrice: summary.price,
                pricePerSqft: summary.pricePerSqft,
              },
              marketTiming: {
                daysOnMarket: summary.daysOnMarket,
              },
            },
            analysis: createDefaultAnalysis(),
            summary,
          }));
          setProperties(summariesAsProperties);
        }
        setMetadata(result.metadata);
      } else {
        setError('error' );
      }
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchProperties();
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      area: 'Halifax',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      analyze: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-4 text-lg text-gray-600">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Properties</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Properties
            </h2>
            <p className="text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              {metadata?.dataSource === 'placeholder' && (
                <span className="ml-2 text-sm text-amber-600">
                  (MVP placeholder data)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <select
                    value={filters.area}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Areas</option>
                    <option value="Halifax">Halifax</option>
                    <option value="Dartmouth">Dartmouth</option>
                    <option value="Bedford">Bedford</option>
                    <option value="Lower Sackville">Lower Sackville</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Bedrooms
                  </label>
                  <input
                    type="number"
                    value={filters.minBedrooms}
                    onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                    placeholder="Any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="No max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.analyze}
                      onChange={(e) => handleFilterChange('analyze', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Analysis</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Home className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more results
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((item, index) => (
            <PropertyCard
              key={item.property.id}
              item={item}
              index={index}
              hasAnalysis={metadata?.hasAnalysis || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// PROPERTY CARD COMPONENT
// ============================================

interface PropertyCardProps {
  item: PropertyWithAnalysis;
  index: number;
  hasAnalysis: boolean;
}

function PropertyCard({ item, index, hasAnalysis }: PropertyCardProps) {
  const { property, analysis, summary } = item;
  const [showDetails, setShowDetails] = useState(false);

  const price = property.pricing.listPrice || property.pricing.soldPrice || 0;
  const pricePerSqft = property.pricing.pricePerSqft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
    >
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
        <Home size={48} className="text-blue-300" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status} />
        </div>
        
        {/* Value Badge */}
        {hasAnalysis && (
          <div className="absolute top-3 right-3">
            <ValueBadge rating={analysis.valueMetrics.priceRating} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Address & Neighborhood */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {property.address.street}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{property.address.neighborhood}, {property.address.city}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">
            ${(price / 1000).toFixed(0)}K
          </div>
          {pricePerSqft && (
            <div className="text-sm text-gray-600">
              ${pricePerSqft}/sqft
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Bed size={16} className="text-gray-400" />
            <span>{property.specs.bedrooms} bd</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Bath size={16} className="text-gray-400" />
            <span>{property.specs.bathrooms} ba</span>
          </div>
          {property.specs.squareFeet && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Square size={16} className="text-gray-400" />
              <span>{property.specs.squareFeet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Market Metrics */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
          {property.marketTiming.daysOnMarket !== undefined && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{property.marketTiming.daysOnMarket} DOM</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{property.specs.yearBuilt}</span>
          </div>
          <div className="capitalize text-gray-500">
            {property.propertyType.replace('_', ' ')}
          </div>
        </div>

        {/* Analysis Preview (if available) */}
        {hasAnalysis && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Market Position:</span>
              <span className="font-medium capitalize text-gray-900">
                {analysis.marketPosition.competitiveness.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Likely Time to Sell:</span>
              <span className="font-medium text-gray-900">
                {analysis.marketPosition.likelyTimeToSell} days
              </span>
            </div>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>

        {/* Detailed Analysis */}
        <AnimatePresence>
          {showDetails && hasAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100 space-y-3"
            >
              {/* Value Score */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Value Score</span>
                  <span className="font-medium">{analysis.valueMetrics.valueScore.toFixed(0)}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analysis.valueMetrics.valueScore}%` }}
                  />
                </div>
              </div>

              {/* Strengths */}
              {analysis.insights.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    Strengths
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analysis.insights.strengths.slice(0, 3).map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Buyer */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  Target Buyer
                </div>
                <div className="text-sm text-blue-900">
                  {analysis.insights.targetBuyer}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
    off_market: 'bg-red-100 text-red-800',
    coming_soon: 'bg-blue-100 text-blue-800',
  };

  const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function ValueBadge({ rating }: { rating: string }) {
  const config = {
    excellent_value: { 
      icon: <Flame size={14} />, 
      color: 'bg-orange-100 text-orange-800',
      label: 'Great Value'
    },
    good_value: { 
      icon: <TrendingUp size={14} />, 
      color: 'bg-green-100 text-green-800',
      label: 'Good Value'
    },
    fair: { 
      icon: <DollarSign size={14} />, 
      color: 'bg-blue-100 text-blue-800',
      label: 'Fair Price'
    },
    overpriced: { 
      icon: <TrendingDown size={14} />, 
      color: 'bg-red-100 text-red-800',
      label: 'Above Market'
    },
  };

  const badge = config[rating as keyof typeof config] || config.fair;

  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
      {badge.icon}
      {badge.label}
    </span>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function createDefaultAnalysis(): PropertyAnalysis {
  return {
    valueMetrics: {
      priceRating: 'fair',
      pricePerSqftComparison: 'at_market',
      valueScore: 50,
    },
    conditionMetrics: {
      overallCondition: 'good',
      ageImpact: 'moderate',
      renovationValue: 0,
      maintenancePriorities: [],
    },
    marketPosition: {
      daysOnMarketAssessment: 'normal_pace',
      competitiveness: 'moderate',
      pricingStrategy: 'competitive',
      likelyTimeToSell: 30,
    },
    locationInsights: {
      neighborhoodRating: 'average',
      walkabilityScore: 50,
      transitAccess: 'fair',
      nearbyAmenities: {
        score: 50,
        highlights: [],
      },
    },
    insights: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      targetBuyer: 'General homebuyers',
    },
    summary: '',
  };
}