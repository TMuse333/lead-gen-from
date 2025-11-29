// lib/utils/sanitizeBusinessName.ts

/**
 * Sanitizes a business name to be URL-friendly and safe for use in:
 * - Qdrant collection names
 * - URL paths
 * - Database identifiers
 * 
 * Converts: "Bob Real Estate" → "bob-real-estate"
 * 
 * This matches the logic in getUserCollectionName() for consistency
 */
export function sanitizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters, keep only alphanumeric and hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length (matching getUserCollectionName)
}

/**
 * Formats a business name for display (keeps original capitalization)
 * This is just a pass-through for now, but could be used for display purposes
 */
export function formatBusinessNameForDisplay(name: string): string {
  return name.trim();
}

