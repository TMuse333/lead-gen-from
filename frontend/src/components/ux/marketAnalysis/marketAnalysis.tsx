"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Home, 
  Clock, 
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

// Types (minimal for MVP)
interface BaseMarketAnalysis {
  condition: 'sellers_market' | 'balanced' | 'buyers_market';
  trendDirection: 'rising' | 'stable' | 'declining';
  inventoryLevel: 'low' | 'moderate' | 'high';
  marketVelocity: 'very_fast' | 'fast' | 'normal' | 'slow' | 'very_slow';
  metrics: {
    averageSalePrice: number;
    medianSalePrice: number;
    averageDaysOnMarket: number;
    activeListings: number;
    soldLast30Days: number;
    absorptionRate: number;
    pricePerSqft?: number;
    competitionScore: number;
  };
  trends: {
    priceChange: {
      percentage: number;
      direction: 'rising' | 'stable' | 'declining';
      significance: 'minor' | 'moderate' | 'significant';
    };
  };
  timing: {
    buyerOpportunity: 'excellent' | 'good' | 'fair' | 'poor';
    sellerOpportunity: 'excellent' | 'good' | 'fair' | 'poor';
    urgencyLevel: 'high' | 'moderate' | 'low';
    seasonalFactor: string;
  };
  summary: string;
}

interface AnalysisConfidence {
  overall: number;
  factors: {
    dataRecency: number;
    sampleSize: number;
    marketStability: number;
  };
  caveats?: string[];
}

export default function MarketAnalysisDisplay({ area = 'Halifax' }: { area?: string }) {
  const [analysis, setAnalysis] = useState<BaseMarketAnalysis | null>(null);
  const [confidence, setConfidence] = useState<AnalysisConfidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchMarketAnalysis();
  }, [area]);

  const fetchMarketAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/market-analysis?area=${encodeURIComponent(area)}`);
      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data.analysis);
        setConfidence(result.data.confidence);
        setIsMockData(result.data.metadata?.isMockData || false);
      } else {
        setError(result.error || 'Failed to load analysis');
      }
    } catch (err) {
      console.error('Error fetching market analysis:', err);
      setError('Failed to load market analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-4 text-lg text-gray-600">Analyzing market data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Analysis</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* MVP Data Warning */}
      {isMockData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-sm text-amber-800">
              <strong>MVP Mode:</strong> Currently showing placeholder data. 
              Real market data integration coming soon.
            </p>
          </div>
        </motion.div>
      )}

      {/* Market Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {area} Market Analysis
        </h2>
        <p className="text-gray-700 mb-4">{analysis.summary}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBadge
            label="Market Type"
            value={formatMarketCondition(analysis.condition)}
            color={getConditionColor(analysis.condition)}
          />
          <StatBadge
            label="Price Trend"
            value={formatTrend(analysis.trendDirection)}
            color={getTrendColor(analysis.trendDirection)}
            icon={getTrendIcon(analysis.trendDirection)}
          />
          <StatBadge
            label="Inventory"
            value={analysis.inventoryLevel}
            color={getInventoryColor(analysis.inventoryLevel)}
          />
          <StatBadge
            label="Market Speed"
            value={formatVelocity(analysis.marketVelocity)}
            color={getVelocityColor(analysis.marketVelocity)}
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Home />}
          label="Average Sale Price"
          value={`$${analysis.metrics.averageSalePrice.toLocaleString()}`}
          subtext={`Median: $${analysis.metrics.medianSalePrice.toLocaleString()}`}
        />
        
        <MetricCard
          icon={<Clock />}
          label="Days on Market"
          value={`${analysis.metrics.averageDaysOnMarket} days`}
          subtext={`${analysis.marketVelocity} market`}
        />
        
        <MetricCard
          icon={<BarChart3 />}
          label="Competition Score"
          value={`${analysis.metrics.competitionScore}/100`}
          subtext={getCompetitionLabel(analysis.metrics.competitionScore)}
        />
        
        <MetricCard
          icon={<Home />}
          label="Active Listings"
          value={analysis.metrics.activeListings.toLocaleString()}
          subtext={`${analysis.inventoryLevel} inventory`}
        />
        
        <MetricCard
          icon={<TrendingUp />}
          label="Recent Sales"
          value={`${analysis.metrics.soldLast30Days} homes`}
          subtext="Last 30 days"
        />
        
        <MetricCard
          icon={<BarChart3 />}
          label="Supply Level"
          value={`${analysis.metrics.absorptionRate.toFixed(1)} months`}
          subtext="Months of inventory"
        />
      </div>

      {/* Price Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
        <div className="flex items-center gap-4">
          {getTrendIcon(analysis.trends.priceChange.direction, 32)}
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {analysis.trends.priceChange.percentage > 0 ? '+' : ''}
              {analysis.trends.priceChange.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {analysis.trends.priceChange.significance} change - 
              {analysis.trends.priceChange.direction} trend
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timing Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OpportunityCard
          title="Buyer Opportunity"
          level={analysis.timing.buyerOpportunity}
          urgency={analysis.timing.urgencyLevel}
        />
        <OpportunityCard
          title="Seller Opportunity"
          level={analysis.timing.sellerOpportunity}
          urgency={analysis.timing.urgencyLevel}
        />
      </div>

      {/* Seasonal Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Seasonal Context</h3>
        <p className="text-gray-700">{analysis.timing.seasonalFactor}</p>
      </motion.div>

      {/* Confidence Indicator */}
      {confidence && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analysis Confidence</h3>
            <div className="flex items-center gap-2">
              {confidence.overall >= 70 ? (
                <CheckCircle2 className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-amber-600" size={20} />
              )}
              <span className="font-bold text-xl">{confidence.overall.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <ConfidenceFactor 
              label="Data Recency" 
              value={confidence.factors.dataRecency} 
            />
            <ConfidenceFactor 
              label="Sample Size" 
              value={confidence.factors.sampleSize} 
            />
            <ConfidenceFactor 
              label="Market Stability" 
              value={confidence.factors.marketStability} 
            />
          </div>
          
          {confidence.caveats && confidence.caveats.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Considerations:</p>
              <ul className="space-y-1">
                {confidence.caveats.map((caveat, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {caveat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatBadge({ 
  label, 
  value, 
  color, 
  icon 
}: { 
  label: string; 
  value: string; 
  color: string; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`flex items-center justify-center gap-2 font-semibold ${color}`}>
        {icon}
        <span className="capitalize">{value}</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-600">{icon}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 capitalize">{subtext}</div>
    </motion.div>
  );
}

function OpportunityCard({
  title,
  level,
  urgency,
}: {
  title: string;
  level: string;
  urgency: string;
}) {
  const colors = {
    excellent: 'bg-green-50 border-green-200 text-green-900',
    good: 'bg-blue-50 border-blue-200 text-blue-900',
    fair: 'bg-amber-50 border-amber-200 text-amber-900',
    poor: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl p-6 border ${colors[level as keyof typeof colors]}`}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="text-2xl font-bold capitalize mb-1">{level}</div>
      <div className="text-sm capitalize">Urgency: {urgency}</div>
    </motion.div>
  );
}

function ConfidenceFactor({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatMarketCondition(condition: string): string {
  return condition.replace('_', ' ');
}

function formatTrend(trend: string): string {
  return trend;
}

function formatVelocity(velocity: string): string {
  return velocity.replace('_', ' ');
}

function getConditionColor(condition: string): string {
  if (condition === 'sellers_market') return 'text-green-700';
  if (condition === 'buyers_market') return 'text-blue-700';
  return 'text-gray-700';
}

function getTrendColor(trend: string): string {
  if (trend === 'rising') return 'text-green-700';
  if (trend === 'declining') return 'text-red-700';
  return 'text-gray-700';
}

function getTrendIcon(trend: string, size: number = 16) {
  if (trend === 'rising') return <TrendingUp size={size} className="text-green-600" />;
  if (trend === 'declining') return <TrendingDown size={size} className="text-red-600" />;
  return <Minus size={size} className="text-gray-600" />;
}

function getInventoryColor(level: string): string {
  if (level === 'low') return 'text-red-700';
  if (level === 'high') return 'text-green-700';
  return 'text-gray-700';
}

function getVelocityColor(velocity: string): string {
  if (velocity.includes('fast')) return 'text-green-700';
  if (velocity.includes('slow')) return 'text-red-700';
  return 'text-gray-700';
}

function getCompetitionLabel(score: number): string {
  if (score >= 80) return 'Very competitive';
  if (score >= 60) return 'Competitive';
  if (score >= 40) return 'Moderate';
  return 'Low competition';
}