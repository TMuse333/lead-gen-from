// lib/offers/core/versionControl.ts
/**
 * Version control for offer definitions
 * Manages versioning, deprecation, and migrations
 */

import type { OfferVersion } from './types';

// ==================== VERSION PARSING ====================

/**
 * Parse semantic version string
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  
  if (!match) {
    return null;
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  if (!parsed1 || !parsed2) {
    throw new Error(`Invalid version format: ${!parsed1 ? v1 : v2}`);
  }
  
  // Compare major
  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 1 : -1;
  }
  
  // Compare minor
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 1 : -1;
  }
  
  // Compare patch
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 1 : -1;
  }
  
  return 0;
}

// ==================== VERSION VALIDATION ====================

/**
 * Validate version format
 */
export function isValidVersion(version: string): boolean {
  return parseVersion(version) !== null;
}

/**
 * Check if version is deprecated
 */
export function isVersionDeprecated(offerVersion: OfferVersion): boolean {
  if (!offerVersion.deprecated) {
    return false;
  }
  
  // If deprecation date is set, check if we're past it
  if (offerVersion.deprecationDate) {
    const deprecationDate = new Date(offerVersion.deprecationDate);
    const now = new Date();
    return now >= deprecationDate;
  }
  
  // If no date set but marked deprecated, it's deprecated
  return true;
}

/**
 * Check if version should show deprecation warning
 */
export function shouldShowDeprecationWarning(
  offerVersion: OfferVersion
): boolean {
  if (!offerVersion.deprecated || !offerVersion.deprecationDate) {
    return false;
  }
  
  const deprecationDate = new Date(offerVersion.deprecationDate);
  const now = new Date();
  const thirtyDaysBeforeDeprecation = new Date(deprecationDate);
  thirtyDaysBeforeDeprecation.setDate(thirtyDaysBeforeDeprecation.getDate() - 30);
  
  // Show warning in the 30 days before deprecation
  return now >= thirtyDaysBeforeDeprecation && now < deprecationDate;
}

// ==================== VERSION HELPERS ====================

/**
 * Increment version
 */
export function incrementVersion(
  currentVersion: string,
  type: 'major' | 'minor' | 'patch'
): string {
  const parsed = parseVersion(currentVersion);
  
  if (!parsed) {
    throw new Error(`Invalid version format: ${currentVersion}`);
  }
  
  switch (type) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      throw new Error(`Invalid version increment type: ${type}`);
  }
}

/**
 * Get latest version from array of versions
 */
export function getLatestVersion(versions: OfferVersion[]): OfferVersion | null {
  if (versions.length === 0) {
    return null;
  }
  
  return versions.reduce((latest, current) => {
    const comparison = compareVersions(current.version, latest.version);
    return comparison > 0 ? current : latest;
  });
}

/**
 * Get latest non-deprecated version
 */
export function getLatestStableVersion(
  versions: OfferVersion[]
): OfferVersion | null {
  const stableVersions = versions.filter((v) => !isVersionDeprecated(v));
  return getLatestVersion(stableVersions);
}

// ==================== VERSION HISTORY ====================

/**
 * Create a new version entry
 */
export function createVersion(
  version: string,
  changelog: string,
  deprecated: boolean = false,
  deprecationDate?: string,
  migrationGuide?: string
): OfferVersion {
  if (!isValidVersion(version)) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    version,
    releaseDate: new Date().toISOString(),
    changelog,
    deprecated,
    deprecationDate,
    migrationGuide,
  };
}

/**
 * Mark version as deprecated
 */
export function deprecateVersion(
  offerVersion: OfferVersion,
  deprecationDate: string,
  migrationGuide?: string
): OfferVersion {
  return {
    ...offerVersion,
    deprecated: true,
    deprecationDate,
    migrationGuide: migrationGuide || offerVersion.migrationGuide,
  };
}

// ==================== VERSION MESSAGES ====================

/**
 * Get deprecation warning message
 */
export function getDeprecationWarning(offerVersion: OfferVersion): string {
  if (!offerVersion.deprecated) {
    return '';
  }
  
  if (!offerVersion.deprecationDate) {
    return `Version ${offerVersion.version} is deprecated.`;
  }
  
  const deprecationDate = new Date(offerVersion.deprecationDate);
  const daysUntilDeprecation = Math.ceil(
    (deprecationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDeprecation <= 0) {
    return `Version ${offerVersion.version} was deprecated on ${deprecationDate.toLocaleDateString()}.`;
  }
  
  return (
    `Version ${offerVersion.version} will be deprecated in ${daysUntilDeprecation} days ` +
    `(${deprecationDate.toLocaleDateString()}).`
  );
}

/**
 * Get migration guide message
 */
export function getMigrationGuide(offerVersion: OfferVersion): string | null {
  if (!offerVersion.migrationGuide) {
    return null;
  }
  
  return offerVersion.migrationGuide;
}

// ==================== VERSION COMPARISON ====================

/**
 * Check if version is compatible with another version
 * (same major version = compatible)
 */
export function isCompatible(v1: string, v2: string): boolean {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  if (!parsed1 || !parsed2) {
    return false;
  }
  
  return parsed1.major === parsed2.major;
}

/**
 * Check if upgrade is a breaking change
 */
export function isBreakingChange(oldVersion: string, newVersion: string): boolean {
  const oldParsed = parseVersion(oldVersion);
  const newParsed = parseVersion(newVersion);
  
  if (!oldParsed || !newParsed) {
    return false;
  }
  
  return newParsed.major > oldParsed.major;
}

// ==================== VERSION REGISTRY ====================

/**
 * Version registry for tracking all versions of an offer
 */
export class VersionRegistry {
  private versions: Map<string, OfferVersion[]> = new Map();
  
  /**
   * Register a version for an offer type
   */
  register(offerType: string, version: OfferVersion): void {
    const existing = this.versions.get(offerType) || [];
    
    // Check if version already exists
    const versionExists = existing.some((v) => v.version === version.version);
    if (versionExists) {
      throw new Error(
        `Version ${version.version} already registered for ${offerType}`
      );
    }
    
    this.versions.set(offerType, [...existing, version]);
  }
  
  /**
   * Get all versions for an offer type
   */
  getVersions(offerType: string): OfferVersion[] {
    return this.versions.get(offerType) || [];
  }
  
  /**
   * Get latest version for an offer type
   */
  getLatest(offerType: string): OfferVersion | null {
    const versions = this.getVersions(offerType);
    return getLatestVersion(versions);
  }
  
  /**
   * Get latest stable version for an offer type
   */
  getLatestStable(offerType: string): OfferVersion | null {
    const versions = this.getVersions(offerType);
    return getLatestStableVersion(versions);
  }
}

// ==================== SINGLETON REGISTRY ====================

export const versionRegistry = new VersionRegistry();