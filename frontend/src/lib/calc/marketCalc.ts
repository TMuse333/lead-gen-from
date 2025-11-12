// lib/market/getPropertiesForArea.ts
import { PLACEHOLDER_PROPERTIES } from '@/data/realEstateData/placeholderData';
import { MarketData } from '@/types';
import type { PropertyData } from '@/types/dataTypes/property.types';

export function getPropertiesForArea(area: string): PropertyData[] {
  const lower = area.toLowerCase();
  return PLACEHOLDER_PROPERTIES.filter(
    (p) =>
      p.address.city.toLowerCase().includes(lower) ||
      p.address.neighborhood.toLowerCase().includes(lower)
  );
}


export function computeMarketData(props: PropertyData[], area: string): MarketData {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
    const active = props.filter((p) => p.status === 'active');
    const soldLast30 = props.filter(
      (p) =>
        p.status === 'sold' &&
        p.marketTiming.soldDate &&
        p.marketTiming.soldDate > last30Days
    );
  
    const prices = [
      ...active.map((p) => p.pricing.listPrice),
      ...soldLast30.map((p) => p.pricing.soldPrice!),
    ].filter(Boolean);
  
    const sqfts = props.map((p) => p.specs.squareFeet).filter(Boolean);
    const doms = props
      .filter((p) => p.marketTiming.daysOnMarket)
      .map((p) => p.marketTiming.daysOnMarket);
  
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  
    const median = (arr: number[]) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    };
  
    const avgPrice = avg(prices as number[]);
    const medianPrice = median(prices as number[]);
    const avgDom = avg(doms as number[]);
    const avgSqft = avg(sqfts as number[]);
    const pricePerSqft = avgSqft ? Math.round(avgPrice / avgSqft) : 0;
  
    return {
      area,
      lastUpdated: now,
      averageSalePrice: Math.round(avgPrice),
      medianSalePrice: Math.round(medianPrice),
      averageDaysOnMarket: Math.round(avgDom),
      totalActiveListings: active.length,
      totalSoldLast30Days: soldLast30.length,
      absorptionRate: active.length ? soldLast30.length / active.length : 0,
      pricePerSqft,
      newListingsLast7Days: 0, // placeholder
      priceReductionsLast7Days: 0,
      hotNeighborhoods: [...new Set(props.map((p) => p.address.neighborhood))].slice(0, 5),
      yearOverYearChange: 8.5, // placeholder
      previousPeriod: {
        averageSalePrice: Math.round(avgPrice * 0.915),
        medianSalePrice: Math.round(medianPrice * 0.92),
        averageDaysOnMarket: Math.round(avgDom + 4),
        totalSoldLast30Days: Math.max(1, soldLast30.length - 7),
      },
    };
  }