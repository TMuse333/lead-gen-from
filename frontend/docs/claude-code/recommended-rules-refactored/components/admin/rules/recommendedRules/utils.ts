// components/admin/rules/recommendedRules/utils.ts

import type { AdviceItem } from './types';

/**
 * Filter advice items based on search query
 * Returns only items that match the search term
 */
export function filterAdviceItems(items: AdviceItem[], searchQuery: string): AdviceItem[] {
  if (!searchQuery || !searchQuery.trim()) {
    return items;
  }

  const query = searchQuery.toLowerCase().trim();

  return items.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(query);
    const adviceMatch = item.advice?.toLowerCase().includes(query);
    const tagsMatch = item.tags?.some((tag: string) => tag.toLowerCase().includes(query));
    const flowMatch = item.applicableWhen?.flow?.some((f: string) => f.toLowerCase().includes(query));
    
    return titleMatch || adviceMatch || tagsMatch || flowMatch;
  });
}

/**
 * Check if a text contains the search query
 */
export function containsSearchQuery(text: string, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim() || !text) {
    return false;
  }
  return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
}

/**
 * Get search match count in a text
 */
export function getSearchMatchCount(text: string, searchQuery: string): number {
  if (!searchQuery || !searchQuery.trim() || !text) {
    return 0;
  }

  const query = searchQuery.trim();
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
