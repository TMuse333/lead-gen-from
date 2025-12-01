// src/lib/utils/formatFeatureName.ts
// Utility to format feature names for display

export function formatFeatureName(feature: string): string {
  return feature
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

