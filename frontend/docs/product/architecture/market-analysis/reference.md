# Market Analysis System - Quick Reference

## 🚀 Fastest Start

```typescript
import { quickAnalysis } from './market-analysis-system';

const analysis = quickAnalysis({
  area: 'Halifax',
  averageSalePrice: 525000,
  medianSalePrice: 485000,
  averageDaysOnMarket: 28,
  totalActiveListings: 450,
  totalSoldLast30Days: 85,
}, 'sell');

console.log(analysis.sellerInsights.pricingRecommendation);
```

## 📊 Common Use Cases

### Get Market Condition
```typescript
const base = analyzeMarket(marketData);
console.log(base.condition); // 'sellers_market' | 'balanced' | 'buyers_market'
```

### Get Pricing Strategy (Seller)
```typescript
const seller = analyzeForSeller(base, marketData, lead);
console.log(seller.sellerInsights.pricingRecommendation.strategy);
// 'aggressive' | 'competitive' | 'conservative'
```

### Get Negotiation Advice (Buyer)
```typescript
const buyer = analyzeForBuyer(base, marketData, lead);
console.log(buyer.buyerInsights.negotiation.strategicAdvice);
// Array of actionable tips
```

### Get Neighborhood Recommendations (Browser)
```typescript
const browser = analyzeForBrowser(base, marketData, lead);
console.log(browser.browserInsights.exploration.recommendedNeighborhoods);
// Detailed neighborhood list with pricing and characteristics
```

## 🔧 API Endpoint Example

```typescript
// /api/market-analysis/route.ts
import { generateMarketAnalysis } from '@/lib/market-analysis-system';

export async function POST(req: NextRequest) {
  const { flowType, leadData } = await req.json();
  
  // Fetch market data from your source
  const marketData = await getMarketData();
  
  // Generate analysis
  const analysis = generateMarketAnalysis(marketData, flowType, leadData);
  
  return NextResponse.json(analysis);
}
```

## 🎯 Key Functions

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `analyzeMarket()` | MarketData | BaseMarketAnalysis | Core market intelligence |
| `analyzeForSeller()` | Base + Data + Lead | SellerMarketAnalysis | Seller insights |
| `analyzeForBuyer()` | Base + Data + Lead | BuyerMarketAnalysis | Buyer insights |
| `analyzeForBrowser()` | Base + Data + Lead | BrowserMarketAnalysis | Browser insights |
| `generateMarketAnalysis()` | Data + Flow + Lead | FlowAnalysis | One-stop function |
| `quickAnalysis()` | Minimal Data + Flow | FlowAnalysis | Quick start |
| `calculateConfidence()` | MarketData | AnalysisConfidence | Quality check |

## 📈 Key Metrics Access

### Base Analysis
```typescript
base.condition                    // Market type
base.trendDirection              // Price trend
base.inventoryLevel              // Supply level
base.marketVelocity              // Sales speed
base.metrics.competitionScore    // 0-100 score
base.timing.buyerOpportunity     // Opportunity level
base.timing.sellerOpportunity    // Opportunity level
base.summary                     // Natural language
```

### Seller Insights
```typescript
seller.sellerInsights.pricingRecommendation.strategy
seller.sellerInsights.pricingRecommendation.expectedTimeToSell
seller.sellerInsights.competition.similarListings
seller.sellerInsights.competition.competitionLevel
seller.sellerInsights.timing.currentMarketScore
seller.sellerInsights.timing.bestTimeToList
seller.sellerInsights.valueOptimization.quickWins
seller.sellerInsights.risks.level
seller.sellerSummary
```

### Buyer Insights
```typescript
buyer.buyerInsights.opportunity.buyerAdvantage
buyer.buyerInsights.opportunity.currentMarketScore
buyer.buyerInsights.negotiation.leverageLevel
buyer.buyerInsights.negotiation.biddingWarProbability
buyer.buyerInsights.negotiation.strategicAdvice
buyer.buyerInsights.valueOpportunities.bestValueNeighborhoods
buyer.buyerInsights.financing.affordabilityIndex
buyer.buyerInsights.actionPlan.immediate
buyer.buyerSummary
```

### Browser Insights
```typescript
browser.browserInsights.overview.marketHealthScore
browser.browserInsights.overview.accessibility
browser.browserInsights.exploration.recommendedNeighborhoods
browser.browserInsights.exploration.propertyTypeDistribution
browser.browserInsights.education.keyTerms
browser.browserInsights.patterns.priceTrends
browser.browserInsights.comparison.neighborhoodComparisons
browser.browserInsights.nextSteps
browser.browserSummary
```

## 🎨 Display Examples

### For UI Cards
```typescript
// Market Overview Card
<Card>
  <h3>Market Condition</h3>
  <Badge>{base.condition.replace('_', ' ')}</Badge>
  <p>{base.summary}</p>
  <Metric label="Competition" value={base.metrics.competitionScore} />
</Card>

// Seller Pricing Card
<Card>
  <h3>Pricing Recommendation</h3>
  <Badge>{seller.sellerInsights.pricingRecommendation.strategy}</Badge>
  <p>Expected time to sell: {seller.sellerInsights.pricingRecommendation.expectedTimeToSell} days</p>
  <p>{seller.sellerInsights.pricingRecommendation.reasoning}</p>
</Card>

// Buyer Negotiation Card
<Card>
  <h3>Negotiation Landscape</h3>
  <p>Your leverage: {buyer.buyerInsights.negotiation.leverageLevel}</p>
  <p>Bidding war risk: {buyer.buyerInsights.negotiation.biddingWarProbability}%</p>
  <ul>
    {buyer.buyerInsights.negotiation.strategicAdvice.map(tip => (
      <li key={tip}>{tip}</li>
    ))}
  </ul>
</Card>
```

### For LLM Prompts
```typescript
const prompt = `
Based on this market analysis:

Market: ${analysis.condition}
Trend: ${analysis.trendDirection}
Competition: ${analysis.metrics.competitionScore}/100

${flowType === 'sell' ? `
Pricing Strategy: ${analysis.sellerInsights.pricingRecommendation.strategy}
Expected Days to Sell: ${analysis.sellerInsights.pricingRecommendation.expectedTimeToSell}
` : ''}

Provide personalized advice for this user...
`;
```

## ⚡ Performance Tips

### Cache Base Analysis
```typescript
// Base is flow-agnostic - cache it!
const cacheKey = `market-${area}-${date}`;
let base = cache.get(cacheKey);

if (!base) {
  base = analyzeMarket(marketData);
  cache.set(cacheKey, base, ONE_DAY);
}

// Generate flow-specific on-demand
const seller = analyzeForSeller(base, marketData, lead);
```

### Lazy Load Flow Analysis
```typescript
// Only compute when needed
const base = analyzeMarket(marketData); // Always fast

// User clicks "Get Seller Insights"
if (userWantsSellerInsights) {
  const seller = analyzeForSeller(base, marketData, lead);
}
```

## 🔍 Troubleshooting

### "Missing required field"
```typescript
// Ensure minimum required fields
const data: MarketData = {
  area: 'Halifax',                    // ✅ Required
  lastUpdated: new Date(),            // ✅ Required
  averageSalePrice: 525000,           // ✅ Required
  medianSalePrice: 485000,            // ✅ Required
  averageDaysOnMarket: 28,            // ✅ Required
  totalActiveListings: 450,           // ✅ Required
  totalSoldLast30Days: 85,            // ✅ Required
  // Optional fields can be undefined
};
```

### "Low confidence warning"
```typescript
const confidence = calculateConfidence(marketData);

if (confidence.overall < 60) {
  // Data is stale, sample size too small, or market is volatile
  console.log(confidence.caveats);
  // Consider refetching data or showing warning to user
}
```

### "Type errors"
```typescript
// Make sure you're importing from the right place
import { analyzeMarket } from './marketAnalyzer';           // ✅
import { analyzeForSeller } from './flowMarketAnalyzers';   // ✅
import { generateMarketAnalysis } from './index';            // ✅

// Or use index for everything
import { 
  analyzeMarket,
  analyzeForSeller,
  generateMarketAnalysis 
} from './index';  // ✅ Preferred
```

## 📝 TypeScript Tips

### Type Narrowing
```typescript
if (analysis.condition === 'sellers_market') {
  // TypeScript knows specific properties available
}

// Use discriminated unions
type Analysis = SellerMarketAnalysis | BuyerMarketAnalysis | BrowserMarketAnalysis;

function handleAnalysis(analysis: Analysis) {
  if ('sellerInsights' in analysis) {
    // TypeScript knows this is SellerMarketAnalysis
    console.log(analysis.sellerInsights.pricingRecommendation);
  }
}
```

### Type Guards
```typescript
function isSellerAnalysis(analysis: any): analysis is SellerMarketAnalysis {
  return 'sellerInsights' in analysis;
}

if (isSellerAnalysis(analysis)) {
  // Safe to access seller-specific properties
  console.log(analysis.sellerInsights);
}
```

## 🌟 Pro Tips

1. **Always use base analysis first** - It's the foundation for flow-specific insights
2. **Cache aggressively** - Base analysis rarely changes within a day
3. **Check confidence** - Low confidence = show warnings to users
4. **Personalize with lead data** - Insights are better with user context
5. **Use summaries for LLMs** - Pre-generated narratives save tokens
6. **Test with examples** - `usageExamples.ts` has everything you need
7. **Start minimal** - Works great with just 7 required fields
8. **Scale gradually** - Add optional fields as you get better data sources

## 📚 Full Documentation

- `README.md` - Complete usage guide
- `ARCHITECTURE.md` - System design & diagrams  
- `IMPLEMENTATION_SUMMARY.md` - What was built & why
- `usageExamples.ts` - Working code examples

---

**Quick Question?** Check the README first, then the examples! 🎯