# Context for Claude: Offer Analytics System

## Overview

This document explains how to add comprehensive analytics for the offer system, tracking offer generation metrics and displaying them in both **user dashboard** and **admin dashboard**.

---

## Current Analytics Pattern

### Existing Structure

The app already has analytics for:
- **Conversations**: Total, completed, abandoned, completion rate, flow distribution
- **Generations**: Total, successful, success rate, avg generation time, avg advice used

**Location**: 
- API: `app/api/user/analytics/route.ts`
- Component: `components/dashboard/user/analytics/userAnalytics.tsx`
- Data Source: MongoDB collections (`conversations`, `generations`)

**Pattern**:
```typescript
// 1. Query MongoDB collections
const conversations = await conversationsCollection.find({ userId }).toArray();
const generations = await generationsCollection.find({ userId }).toArray();

// 2. Calculate metrics
const totalConversations = conversations.length;
const completionRate = (completed / total) * 100;

// 3. Return structured data
return {
  conversations: { total, completed, completionRate, ... },
  generations: { total, successful, successRate, ... },
  timeline: [...]
};
```

---

## Offer Analytics Requirements

### What to Track

#### 1. Per-Offer Metrics
- Total generations per offer type
- Success rate per offer
- Average generation time per offer
- Average output size per offer
- Error rate per offer

#### 2. Offer Performance
- Most popular offers (by generation count)
- Most successful offers (by success rate)
- Fastest offers (by generation time)
- Most valuable offers (by output quality/completeness)

#### 3. Offer Usage Patterns
- Offer distribution (which offers are generated most)
- Offer combinations (which offers are generated together)
- Flow-to-offer mapping (which flows generate which offers)
- Time-based trends (offers over time)

#### 4. Offer Quality Metrics
- Validation failure rate
- Average component count per offer
- Average output size
- Custom config usage (how many users customize)

#### 5. User-Specific Metrics (User Dashboard)
- My offer performance
- My most used offers
- My offer success rates
- My offer customization stats

#### 6. Platform-Wide Metrics (Admin Dashboard)
- All users' offer usage
- Most popular offers across platform
- Offer adoption rates
- Offer performance comparisons

---

## Data Model Extensions

### GenerationDocument Enhancement

**Current**:
```typescript
export interface GenerationDocument {
  offerType?: string;  // Already exists but may not be populated
  // ... other fields
}
```

**Enhanced** (ensure offerType is always populated):
```typescript
export interface GenerationDocument {
  // ... existing fields
  
  // Offer-specific fields
  offerType: string;              // 'pdf', 'landingPage', 'home-estimate', etc.
  offerConfig?: {                  // Snapshot of config used
    model: string;
    temperature?: number;
    maxTokens?: number;
    customPrompt?: boolean;        // Was custom prompt used?
  };
  
  // Offer generation metrics
  offerMetrics?: {
    validationPassed: boolean;
    validationErrors?: string[];
    outputComponentCount: number;
    outputSize: number;           // bytes
    postProcessTime?: number;     // ms
  };
}
```

### New: OfferAnalyticsDocument (Optional - for caching)

```typescript
// lib/mongodb/models/offerAnalytics.ts

export interface OfferAnalyticsDocument {
  _id?: ObjectId;
  
  // Scope
  userId?: string;                 // For user-specific analytics
  clientIdentifier?: string;       // For client-specific analytics
  scope: 'user' | 'client' | 'platform'; // Analytics scope
  
  // Time period
  period: 'day' | 'week' | 'month' | 'all-time';
  periodStart: Date;
  periodEnd: Date;
  
  // Aggregated metrics
  offerStats: Record<string, {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    avgGenerationTime: number;
    avgOutputSize: number;
    avgComponentCount: number;
    validationFailureRate: number;
    customConfigUsage: number;     // How many used custom configs
  }>;
  
  // Trends
  dailyBreakdown?: Array<{
    date: string;
    offers: Record<string, number>;
  }>;
  
  // Computed at
  computedAt: Date;
}
```

---

## API Routes

### 1. User Offer Analytics

```typescript
// app/api/user/offers/analytics/route.ts

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const generationsCollection = await getGenerationsCollection();
  
  // Get all generations for this user
  const generations = await generationsCollection
    .find({ userId: session.user.id })
    .toArray();

  // Group by offer type
  const offerGroups = generations.reduce((acc, gen) => {
    const offerType = gen.offerType || 'unknown';
    if (!acc[offerType]) {
      acc[offerType] = [];
    }
    acc[offerType].push(gen);
    return acc;
  }, {} as Record<string, GenerationDocument[]>);

  // Calculate per-offer metrics
  const offerStats = Object.entries(offerGroups).map(([offerType, gens]) => {
    const successful = gens.filter(g => g.status === 'success').length;
    const total = gens.length;
    const avgTime = gens.reduce((sum, g) => sum + (g.generationTime || 0), 0) / total;
    const avgSize = gens.reduce((sum, g) => sum + (g.outputSize || 0), 0) / total;
    const avgComponents = gens.reduce((sum, g) => sum + (g.componentCount || 0), 0) / total;
    
    return {
      offerType,
      total,
      successful,
      successRate: (successful / total) * 100,
      avgGenerationTime: avgTime,
      avgOutputSize: avgSize,
      avgComponentCount: avgComponents,
    };
  });

  // Timeline data (last 7 days)
  const timeline = generateTimeline(generations, 7);

  // Most popular offers
  const popularOffers = offerStats
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    success: true,
    analytics: {
      overview: {
        totalOffersGenerated: generations.length,
        uniqueOfferTypes: Object.keys(offerGroups).length,
        avgOffersPerGeneration: 1, // For now, 1 offer per generation
      },
      perOffer: offerStats,
      popularOffers,
      timeline,
    },
  });
}
```

### 2. Admin Offer Analytics

```typescript
// app/api/admin/offers/analytics/route.ts

export async function GET(req: NextRequest) {
  const session = await auth();
  
  // Check if admin (you'll need to implement admin check)
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const generationsCollection = await getGenerationsCollection();
  const clientConfigsCollection = await getClientConfigsCollection();
  
  // Get ALL generations (platform-wide)
  const allGenerations = await generationsCollection.find({}).toArray();
  
  // Get all client configs to see offer selections
  const allConfigs = await clientConfigsCollection.find({}).toArray();
  
  // Calculate platform-wide metrics
  const platformStats = calculatePlatformStats(allGenerations, allConfigs);
  
  // Per-user breakdown
  const userBreakdown = calculateUserBreakdown(allGenerations);
  
  // Offer adoption (how many users use each offer)
  const adoptionStats = calculateAdoptionStats(allConfigs, allGenerations);
  
  return NextResponse.json({
    success: true,
    analytics: {
      platform: platformStats,
      users: userBreakdown,
      adoption: adoptionStats,
      trends: generateTrends(allGenerations),
    },
  });
}
```

---

## Frontend Components

### User Dashboard: Offer Analytics Tab

```typescript
// components/dashboard/user/offers/OfferAnalytics.tsx

export default function OfferAnalytics() {
  const [analytics, setAnalytics] = useState<OfferAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/offers/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.analytics);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;
  if (!analytics) return <ErrorState />;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Offers Generated"
          value={analytics.overview.totalOffersGenerated}
          icon={Zap}
        />
        <StatCard
          label="Offer Types Used"
          value={analytics.overview.uniqueOfferTypes}
          icon={FileText}
        />
        <StatCard
          label="Avg Success Rate"
          value={`${calculateAvgSuccessRate(analytics.perOffer)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Per-Offer Performance */}
      <OfferPerformanceTable offers={analytics.perOffer} />

      {/* Popular Offers */}
      <PopularOffersChart offers={analytics.popularOffers} />

      {/* Timeline */}
      <OfferTimelineChart timeline={analytics.timeline} />
    </div>
  );
}
```

### Admin Dashboard: Platform Offer Analytics

```typescript
// components/dashboard/admin/offers/PlatformOfferAnalytics.tsx

export default function PlatformOfferAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformOfferAnalytics | null>(null);

  useEffect(() => {
    fetch('/api/admin/offers/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data.analytics));
  }, []);

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <PlatformOverviewCards analytics={analytics.platform} />

      {/* Offer Adoption */}
      <OfferAdoptionChart adoption={analytics.adoption} />

      {/* Per-User Breakdown */}
      <UserOfferBreakdownTable users={analytics.users} />

      {/* Trends */}
      <OfferTrendsChart trends={analytics.trends} />
    </div>
  );
}
```

---

## Integration Points

### 1. Generation API - Track Offer Metrics

```typescript
// app/api/generation/generate-offer/route.ts

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { offerType, userInput, ... } = await req.json();
  
  // ... generation logic ...
  
  const generationTime = Date.now() - startTime;
  
  // Save generation with offer metrics
  const generationDoc: GenerationDocument = {
    conversationId: new ObjectId(conversationId),
    userId: session.user.id,
    offerType, // ✅ Always populate
    generatedAt: new Date(),
    generationTime,
    llmOutput: validatedOutput,
    status: 'success',
    offerConfig: {
      model: effectiveConfig.model,
      temperature: effectiveConfig.temperature,
      maxTokens: effectiveConfig.maxTokens,
      customPrompt: !!userConfig?.overrides?.prompt,
    },
    offerMetrics: {
      validationPassed: validation.valid,
      validationErrors: validation.errors,
      outputComponentCount: Object.keys(validatedOutput).length,
      outputSize: JSON.stringify(validatedOutput).length,
      postProcessTime: postProcessTime,
    },
    // ... other fields
  };
  
  await generationsCollection.insertOne(generationDoc);
  
  return NextResponse.json({ success: true, output: validatedOutput });
}
```

### 2. Add to User Dashboard

```typescript
// components/dashboard/user/userDashboard/userDashboard.tsx

const USER_SECTIONS = [
  // ... existing sections
  {
    id: 'offers',
    label: 'Offers',
    icon: Gift,
    component: OffersDashboard,
    description: 'Configure and manage your offer generation settings'
  },
  {
    id: 'offer-analytics',  // NEW
    label: 'Offer Analytics',
    icon: BarChart3,
    component: OfferAnalytics,
    description: 'Track your offer generation performance and metrics'
  },
];
```

### 3. Add to Admin Dashboard

```typescript
// components/dashboard/admin/adminDashboard.tsx

const ADMIN_SECTIONS = [
  // ... existing sections
  {
    id: 'platform-offer-analytics',  // NEW
    label: 'Platform Offer Analytics',
    icon: TrendingUp,
    component: PlatformOfferAnalytics,
    description: 'View offer usage and performance across all users'
  },
];
```

---

## Metrics Calculation Examples

### Per-Offer Success Rate

```typescript
function calculateOfferSuccessRate(
  generations: GenerationDocument[],
  offerType: string
): number {
  const offerGens = generations.filter(g => g.offerType === offerType);
  if (offerGens.length === 0) return 0;
  
  const successful = offerGens.filter(g => g.status === 'success').length;
  return (successful / offerGens.length) * 100;
}
```

### Offer Adoption Rate

```typescript
function calculateOfferAdoption(
  allConfigs: ClientConfigDocument[],
  offerType: string
): {
  totalUsers: number;
  usersWithOffer: number;
  adoptionRate: number;
} {
  const totalUsers = allConfigs.length;
  const usersWithOffer = allConfigs.filter(
    config => config.selectedOffers?.includes(offerType)
  ).length;
  
  return {
    totalUsers,
    usersWithOffer,
    adoptionRate: (usersWithOffer / totalUsers) * 100,
  };
}
```

### Offer Performance Comparison

```typescript
function compareOfferPerformance(
  generations: GenerationDocument[]
): Array<{
  offerType: string;
  avgGenerationTime: number;
  avgSuccessRate: number;
  totalGenerations: number;
  rank: number;
}> {
  const offerGroups = groupBy(generations, 'offerType');
  
  return Object.entries(offerGroups)
    .map(([offerType, gens]) => ({
      offerType,
      avgGenerationTime: calculateAvg(gens, 'generationTime'),
      avgSuccessRate: calculateSuccessRate(gens),
      totalGenerations: gens.length,
    }))
    .sort((a, b) => b.avgSuccessRate - a.avgSuccessRate)
    .map((offer, index) => ({ ...offer, rank: index + 1 }));
}
```

---

## Visualization Components

### 1. Offer Performance Table

```typescript
// components/dashboard/user/offers/OfferPerformanceTable.tsx

export function OfferPerformanceTable({ offers }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Offer Performance</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th>Offer Type</th>
            <th>Total</th>
            <th>Success Rate</th>
            <th>Avg Time</th>
            <th>Avg Size</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(offer => (
            <tr key={offer.offerType}>
              <td>{offer.offerType}</td>
              <td>{offer.total}</td>
              <td>
                <ProgressBar value={offer.successRate} />
                {offer.successRate.toFixed(1)}%
              </td>
              <td>{(offer.avgGenerationTime / 1000).toFixed(1)}s</td>
              <td>{(offer.avgOutputSize / 1024).toFixed(1)} KB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2. Popular Offers Chart

```typescript
// components/dashboard/user/offers/PopularOffersChart.tsx

export function PopularOffersChart({ offers }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Most Popular Offers</h3>
      <BarChart
        data={offers}
        xKey="offerType"
        yKey="total"
        color="cyan"
      />
    </div>
  );
}
```

### 3. Offer Timeline

```typescript
// components/dashboard/user/offers/OfferTimelineChart.tsx

export function OfferTimelineChart({ timeline }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Offer Generation Over Time</h3>
      <LineChart
        data={timeline}
        xKey="date"
        yKey="count"
        color="blue"
      />
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Data Collection
- [ ] Ensure `offerType` is always populated in `GenerationDocument`
- [ ] Add `offerConfig` field to track config used
- [ ] Add `offerMetrics` field to track generation metrics
- [ ] Update generation API to populate these fields

### Phase 2: User Analytics
- [ ] Create `GET /api/user/offers/analytics` route
- [ ] Calculate per-offer metrics
- [ ] Create `OfferAnalytics` component
- [ ] Add to user dashboard sections
- [ ] Create visualization components

### Phase 3: Admin Analytics
- [ ] Create `GET /api/admin/offers/analytics` route
- [ ] Calculate platform-wide metrics
- [ ] Calculate adoption rates
- [ ] Create `PlatformOfferAnalytics` component
- [ ] Add to admin dashboard sections

### Phase 4: Advanced Features
- [ ] Add offer comparison views
- [ ] Add filtering (by date, flow, etc.)
- [ ] Add export functionality
- [ ] Add caching for performance
- [ ] Add real-time updates (optional)

---

## Key Design Principles

### 1. Consistent with Existing Pattern
- Follow same structure as conversation/generation analytics
- Use same MongoDB collections
- Use same component patterns

### 2. Performance
- Aggregate data in API, not frontend
- Cache expensive calculations
- Use indexes on `offerType` field

### 3. Scalability
- Design for large datasets
- Use pagination for large lists
- Consider materialized views for complex aggregations

### 4. User Experience
- Clear visualizations
- Actionable insights
- Easy to understand metrics

### 5. Privacy
- User dashboard: only their data
- Admin dashboard: aggregated, anonymized where appropriate

---

## Example API Response

### User Offer Analytics

```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalOffersGenerated": 142,
      "uniqueOfferTypes": 3,
      "avgOffersPerGeneration": 1
    },
    "perOffer": [
      {
        "offerType": "pdf",
        "total": 89,
        "successful": 87,
        "successRate": 97.75,
        "avgGenerationTime": 2340,
        "avgOutputSize": 15420,
        "avgComponentCount": 4.2
      },
      {
        "offerType": "landingPage",
        "total": 38,
        "successful": 36,
        "successRate": 94.74,
        "avgGenerationTime": 3120,
        "avgOutputSize": 28450,
        "avgComponentCount": 6.1
      },
      {
        "offerType": "home-estimate",
        "total": 15,
        "successful": 14,
        "successRate": 93.33,
        "avgGenerationTime": 4560,
        "avgOutputSize": 18920,
        "avgComponentCount": 5.8
      }
    ],
    "popularOffers": [
      { "offerType": "pdf", "total": 89 },
      { "offerType": "landingPage", "total": 38 },
      { "offerType": "home-estimate", "total": 15 }
    ],
    "timeline": [
      { "date": "2024-01-15", "count": 12 },
      { "date": "2024-01-16", "count": 18 },
      // ... last 7 days
    ]
  }
}
```

### Admin Platform Analytics

```json
{
  "success": true,
  "analytics": {
    "platform": {
      "totalOffersGenerated": 15420,
      "totalUsers": 234,
      "avgOffersPerUser": 65.9,
      "mostPopularOffer": "pdf",
      "avgSuccessRate": 96.2
    },
    "adoption": [
      {
        "offerType": "pdf",
        "totalUsers": 198,
        "usersWithOffer": 198,
        "adoptionRate": 84.6
      },
      {
        "offerType": "landingPage",
        "totalUsers": 198,
        "usersWithOffer": 145,
        "adoptionRate": 61.9
      }
    ],
    "users": [
      {
        "userId": "user123",
        "totalOffers": 142,
        "offerTypes": ["pdf", "landingPage"],
        "avgSuccessRate": 97.2
      }
      // ... top users
    ],
    "trends": {
      "last7Days": [...],
      "last30Days": [...],
      "growthRate": 12.5
    }
  }
}
```

---

## Summary

- **Data Collection**: Enhance `GenerationDocument` to track offer-specific metrics
- **User Analytics**: Per-user offer performance, success rates, trends
- **Admin Analytics**: Platform-wide metrics, adoption rates, comparisons
- **Visualization**: Tables, charts, timelines for both dashboards
- **Integration**: Follow existing analytics pattern for consistency
- **Performance**: Aggregate in API, cache where needed
- **Scalability**: Design for growth, use proper indexes

