# Market Analysis System Architecture

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      MARKET DATA SOURCE                         │
│  (MLS API / Database / External API / Manual Updates)          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MarketData Object                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Core Metrics:                                            │  │
│  │  • averageSalePrice, medianSalePrice                    │  │
│  │  • averageDaysOnMarket                                   │  │
│  │  • totalActiveListings, totalSoldLast30Days             │  │
│  │  • absorptionRate, pricePerSqft                         │  │
│  │                                                           │  │
│  │ Optional Enhancement:                                    │  │
│  │  • newListingsLast7Days, priceReductionsLast7Days       │  │
│  │  • hotNeighborhoods, yearOverYearChange                 │  │
│  │  • previousPeriod (historical comparison)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│              analyzeMarket(marketData)                          │
│                                                                  │
│  Algorithms:                                                    │
│  • determineMarketCondition()                                   │
│  • determineTrendDirection()                                    │
│  • determineInventoryLevel()                                    │
│  • determineMarketVelocity()                                    │
│  • calculateCompetitionScore()                                  │
│  • calculatePriceChange()                                       │
│  • calculateVelocityChange()                                    │
│  • calculateTimingIndicators()                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BaseMarketAnalysis                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Universal Insights (Flow-Agnostic):                      │  │
│  │  • condition: 'sellers_market' | 'balanced' | etc.       │  │
│  │  • trendDirection: 'rising' | 'stable' | 'declining'    │  │
│  │  • inventoryLevel: 'low' | 'moderate' | 'high'          │  │
│  │  • marketVelocity: 'very_fast' → 'very_slow'           │  │
│  │  • competitionScore: 0-100                               │  │
│  │  • trends: priceChange, velocityChange, inventoryChange │  │
│  │  • timing: buyer/seller opportunity, urgency            │  │
│  │  • neighborhoods: hottest, emerging, stable             │  │
│  │  • summary: Natural language overview                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
┌─────────────┐ ┌───────────┐ ┌─────────────┐
│   SELLER    │ │   BUYER   │ │   BROWSER   │
│    FLOW     │ │   FLOW    │ │    FLOW     │
└─────┬───────┘ └─────┬─────┘ └──────┬──────┘
      │               │               │
      ↓               ↓               ↓
┌──────────────────────────────────────────────────────────────┐
│ analyzeForSeller() │ analyzeForBuyer() │ analyzeForBrowser()│
└─────┬──────────────┴─────┬──────────────┴──────┬────────────┘
      │                    │                      │
      ↓                    ↓                      ↓

┌─────────────────────┐  ┌────────────────────┐  ┌──────────────────┐
│ SellerMarketAnalysis│  │BuyerMarketAnalysis │  │BrowserMarketAnalysis│
├─────────────────────┤  ├────────────────────┤  ├──────────────────┤
│ BaseMarketAnalysis  │  │ BaseMarketAnalysis │  │BaseMarketAnalysis│
│        +            │  │        +           │  │       +          │
│ sellerInsights:     │  │ buyerInsights:     │  │browserInsights:  │
│  • pricingRec       │  │  • opportunity     │  │  • overview      │
│  • competition      │  │  • negotiation     │  │  • exploration   │
│  • timing           │  │  • valueOpp        │  │  • education     │
│  • valueOptim       │  │  • financing       │  │  • patterns      │
│  • risks            │  │  • inventory       │  │  • comparison    │
│  • positioning      │  │  • risks           │  │  • nextSteps     │
│                     │  │  • actionPlan      │  │                  │
│ sellerSummary       │  │ buyerSummary       │  │ browserSummary   │
└─────────────────────┘  └────────────────────┘  └──────────────────┘
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        TYPES LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  market.types.ts                                                │
│  ├─ MarketData (input)                                          │
│  ├─ MarketCondition, TrendDirection, etc. (enums)              │
│  └─ Classification types                                        │
│                                                                  │
│  baseMarketAnalysis.types.ts                                    │
│  ├─ BaseMarketAnalysis (core output)                           │
│  └─ AnalysisConfidence                                          │
│                                                                  │
│  flowMarketAnalysis.types.ts                                    │
│  ├─ SellerMarketAnalysis extends BaseMarketAnalysis            │
│  ├─ BuyerMarketAnalysis extends BaseMarketAnalysis             │
│  └─ BrowserMarketAnalysis extends BaseMarketAnalysis           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ALGORITHM LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  marketAnalyzer.ts                                              │
│  ├─ analyzeMarket(MarketData) → BaseMarketAnalysis             │
│  ├─ calculateConfidence(MarketData) → AnalysisConfidence       │
│  └─ 15+ helper algorithms for market classification            │
│                                                                  │
│  flowMarketAnalyzers.ts                                         │
│  ├─ analyzeForSeller() → SellerMarketAnalysis                  │
│  ├─ analyzeForBuyer() → BuyerMarketAnalysis                    │
│  ├─ analyzeForBrowser() → BrowserMarketAnalysis                │
│  └─ 30+ specialized algorithms for flow-specific insights      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PUBLIC API LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  index.ts                                                       │
│  ├─ generateMarketAnalysis() - One-stop function               │
│  ├─ quickAnalysis() - Minimal config version                   │
│  └─ All type & function exports                                │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Patterns

### Pattern 1: Basic Analysis
```typescript
import { analyzeMarket } from './marketAnalyzer';

const base = analyzeMarket(marketData);
// Use base.condition, base.trends, base.timing
```

### Pattern 2: Flow-Specific Analysis
```typescript
import { generateMarketAnalysis } from './index';

const analysis = generateMarketAnalysis(marketData, 'sell', leadData);
// Access analysis.sellerInsights.pricingRecommendation
```

### Pattern 3: Quick Start
```typescript
import { quickAnalysis } from './index';

const result = quickAnalysis(minimalData, 'buy');
// Automatic defaults, immediate results
```

### Pattern 4: Caching Strategy
```typescript
// Cache base analysis (flow-agnostic)
const cacheKey = `${area}-${date}`;
const base = cache.get(cacheKey) || analyzeMarket(marketData);
cache.set(cacheKey, base);

// Generate flow-specific on-demand
const seller = analyzeForSeller(base, marketData, leadData);
const buyer = analyzeForBuyer(base, marketData, leadData);
```

## Key Algorithms

### Market Classification
```
determineMarketCondition()
├─ absorptionRate < 4 months + DOM < 30 days → sellers_market
├─ absorptionRate > 6 months + DOM > 60 days → buyers_market
└─ else → balanced

determineTrendDirection()
├─ priceChange > +2% → rising
├─ priceChange < -2% → declining
└─ else → stable

determineInventoryLevel()
├─ absorptionRate < 4 → low
├─ absorptionRate > 6 → high
└─ else → moderate
```

### Competition Scoring (0-100)
```
competitionScore = average of:
├─ inventoryFactor (100 - absorptionRate * 10)
├─ velocityFactor (100 - daysOnMarket)
└─ priceFactor (50 + yearOverYearChange * 5)
```

### Timing Indicators
```
buyerOpportunity
├─ excellent: buyers_market + declining prices
├─ good: balanced market
├─ fair: sellers_market
└─ poor: sellers_market + rising prices

sellerOpportunity (inverse of buyer)
```

## Data Requirements

### Minimum Viable Data
```typescript
{
  area: string,
  lastUpdated: Date,
  averageSalePrice: number,
  medianSalePrice: number,
  averageDaysOnMarket: number,
  totalActiveListings: number,
  totalSoldLast30Days: number,
}
```

### Optimal Data (adds)
```typescript
{
  absorptionRate: number,
  pricePerSqft: number,
  newListingsLast7Days: number,
  priceReductionsLast7Days: number,
  hotNeighborhoods: string[],
  yearOverYearChange: number,
  previousPeriod: { /* historical */ },
}
```

## Integration Points

### With Next.js API Routes
```typescript
// /api/market-analysis/route.ts
export async function POST(req: NextRequest) {
  const { flowType, leadData } = await req.json();
  const marketData = await fetchMarketData();
  const analysis = generateMarketAnalysis(marketData, flowType, leadData);
  return NextResponse.json(analysis);
}
```

### With LLM Prompts
```typescript
const prompt = `
Market Analysis:
${JSON.stringify(analysis.sellerInsights, null, 2)}

Based on this data, provide personalized advice...
`;
```

### With Database
```typescript
// Cache and retrieve
await db.marketAnalysis.upsert({
  where: { area_date: { area, date } },
  create: { ...baseAnalysis },
  update: { ...baseAnalysis },
});
```