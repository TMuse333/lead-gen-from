import { LeadSubmission } from '@/types';
import { ComparableHome } from '@/types';
import { MarketTrend } from '@/types';
import { AgentAdviceScenario } from '@/types';
import { FormConfig } from '@/types';
import { SellerAnalysis, BuyerAnalysis, BrowseAnalysis } from '@/types';

export function generateSellerPrompt(
  leadData: LeadSubmission,
  comparableHomes: ComparableHome[],
  marketTrends: MarketTrend,
  agentAdvice: AgentAdviceScenario[],
  formConfig: FormConfig
): string {
  const userContext = leadData.answers
    .map(a => `${a.question}: ${Array.isArray(a.value) ? a.value.join(', ') : a.value}`)
    .join('\n');

  const compsContext = comparableHomes
    .map((comp, i) =>
      `${i + 1}. ${comp.address} - ${comp.propertyDetails.type}, ${comp.propertyDetails.bedrooms}bd/${comp.propertyDetails.bathrooms}ba${
        comp.propertyDetails.squareFeet ? `, ${comp.propertyDetails.squareFeet.toLocaleString()} sqft` : ''
      }, ${comp.saleInfo.soldPrice ? `Sold: $${comp.saleInfo.soldPrice.toLocaleString()}` : `Listed: $${comp.saleInfo.listPrice?.toLocaleString()}`}`
    )
    .join('\n');

  const adviceContext = agentAdvice
    .map(advice => `Scenario: ${advice.scenario}\nAdvice: ${advice.advice}`)
    .join('\n\n');

  return `
You are an expert real estate analyst helping a homeowner in ${formConfig.targetArea}.

USER CONTEXT:
${userContext}

COMPARABLE PROPERTIES:
${compsContext || 'No comparable properties provided'}

MARKET TRENDS:
- Area: ${marketTrends.area}
- Average Sale Price: $${marketTrends.metrics.averageSalePrice.toLocaleString()}
- Median Sale Price: $${marketTrends.metrics.medianSalePrice.toLocaleString()}
- Average Days on Market: ${marketTrends.metrics.averageDaysOnMarket}
- Market Trend: ${marketTrends.trend.direction} (${marketTrends.trend.percentageChange > 0 ? '+' : ''}${marketTrends.trend.percentageChange}%)
- Inventory Level: ${marketTrends.metrics.inventoryLevel}

AGENT'S EXPERTISE:
${adviceContext}

TASK:
Generate a comprehensive SELLER_ANALYSIS JSON with the following fields:
- estimatedValue
- marketSummary
- personalizedAdvice
- recommendedActions
- comparablesSummary

Reference user's timeline and selling reason. Be professional, data-driven, and personalized.
`;
}

export function generateBuyerPrompt(
  leadData: LeadSubmission,
  comparableHomes: ComparableHome[],
  marketTrends: MarketTrend,
  agentAdvice: AgentAdviceScenario[],
  formConfig: FormConfig
): string {
  const userContext = leadData.answers
    .map(a => `${a.question}: ${Array.isArray(a.value) ? a.value.join(', ') : a.value}`)
    .join('\n');

  const adviceContext = agentAdvice
    .map(advice => `Scenario: ${advice.scenario}\nAdvice: ${advice.advice}`)
    .join('\n\n');

  return `
You are an expert real estate analyst helping a buyer in ${formConfig.targetArea}.

USER CONTEXT:
${userContext}

MARKET TRENDS:
- Area: ${marketTrends.area}
- Average Sale Price: $${marketTrends.metrics.averageSalePrice.toLocaleString()}
- Median Sale Price: $${marketTrends.metrics.medianSalePrice.toLocaleString()}
- Average Days on Market: ${marketTrends.metrics.averageDaysOnMarket}
- Market Trend: ${marketTrends.trend.direction} (${marketTrends.trend.percentageChange > 0 ? '+' : ''}${marketTrends.trend.percentageChange}%)
- Inventory Level: ${marketTrends.metrics.inventoryLevel}

AGENT'S EXPERTISE:
${adviceContext}

TASK:
Generate a comprehensive BUYER_ANALYSIS JSON with the following fields:
- recommendedNeighborhoods
- financingTips
- marketSummary
- personalizedAdvice
- recommendedActions

Reference user's budget, timeline, and property preferences. Be professional and actionable.
`;
}

export function generateBrowsePrompt(
  leadData: LeadSubmission,
  comparableHomes: ComparableHome[],
  marketTrends: MarketTrend,
  agentAdvice: AgentAdviceScenario[],
  formConfig: FormConfig
): string {
  const userContext = leadData.answers
    .map(a => `${a.question}: ${Array.isArray(a.value) ? a.value.join(', ') : a.value}`)
    .join('\n');

  const adviceContext = agentAdvice
    .map(advice => `Scenario: ${advice.scenario}\nAdvice: ${advice.advice}`)
    .join('\n\n');

  return `
You are an expert real estate analyst helping a browser in ${formConfig.targetArea}.

USER CONTEXT:
${userContext}

MARKET TRENDS:
- Area: ${marketTrends.area}
- Average Sale Price: $${marketTrends.metrics.averageSalePrice.toLocaleString()}
- Median Sale Price: $${marketTrends.metrics.medianSalePrice.toLocaleString()}
- Market Trend: ${marketTrends.trend.direction} (${marketTrends.trend.percentageChange > 0 ? '+' : ''}${marketTrends.trend.percentageChange}%)
- Inventory Level: ${marketTrends.metrics.inventoryLevel}

AGENT'S EXPERTISE:
${adviceContext}

TASK:
Generate a comprehensive BROWSE_ANALYSIS JSON with the following fields:
- highlights
- suggestedFilters
- neighborhoodInsights
- marketSummary
- personalizedAdvice
- recommendedActions

Reference user's exploration goals and interests. Be professional, actionable, and engaging.
`;
}
