// frontend/src/lib/mongodb/models/offerCustomization.ts
/**
 * MongoDB model for offer customizations
 * Stores user-specific offer configuration overrides
 */

import type { Collection, Db } from 'mongodb';
import type {
  OfferCustomizationDocument,
  OfferCustomizations,
} from '@/types/offers/offerCustomization.types';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

const COLLECTION_NAME = 'offer_customizations';

/**
 * Get the offer customizations collection
 */
export async function getOfferCustomizationsCollection(
  db: Db
): Promise<Collection<OfferCustomizationDocument>> {
  return db.collection<OfferCustomizationDocument>(COLLECTION_NAME);
}

/**
 * Get user's customizations for a specific offer type
 */
export async function getOfferCustomization(
  db: Db,
  userId: string,
  offerType: OfferType
): Promise<OfferCustomizationDocument | null> {
  const collection = await getOfferCustomizationsCollection(db);
  return collection.findOne({ userId, offerType });
}

/**
 * Get all customizations for a user
 */
export async function getAllOfferCustomizations(
  db: Db,
  userId: string
): Promise<OfferCustomizationDocument[]> {
  const collection = await getOfferCustomizationsCollection(db);
  return collection.find({ userId }).toArray();
}

/**
 * Upsert offer customizations
 */
export async function upsertOfferCustomization(
  db: Db,
  userId: string,
  offerType: OfferType,
  customizations: OfferCustomizations
): Promise<OfferCustomizationDocument> {
  const collection = await getOfferCustomizationsCollection(db);

  const now = new Date();
  const update = {
    $set: {
      customizations,
      updatedAt: now,
    },
    $setOnInsert: {
      userId,
      offerType,
      createdAt: now,
    },
  };

  const result = await collection.findOneAndUpdate(
    { userId, offerType },
    update,
    { upsert: true, returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Failed to upsert offer customization');
  }

  return result;
}

/**
 * Delete offer customizations (reset to defaults)
 */
export async function deleteOfferCustomization(
  db: Db,
  userId: string,
  offerType: OfferType
): Promise<boolean> {
  const collection = await getOfferCustomizationsCollection(db);
  const result = await collection.deleteOne({ userId, offerType });
  return result.deletedCount > 0;
}

/**
 * Update last tested timestamp
 */
export async function updateLastTested(
  db: Db,
  userId: string,
  offerType: OfferType
): Promise<void> {
  const collection = await getOfferCustomizationsCollection(db);
  await collection.updateOne(
    { userId, offerType },
    { $set: { lastTestedAt: new Date() } }
  );
}

/**
 * Update last generated timestamp
 */
export async function updateLastGenerated(
  db: Db,
  userId: string,
  offerType: OfferType
): Promise<void> {
  const collection = await getOfferCustomizationsCollection(db);
  await collection.updateOne(
    { userId, offerType },
    { $set: { lastGeneratedAt: new Date() } }
  );
}

/**
 * Check if offer is enabled for user
 */
export async function isOfferEnabled(
  db: Db,
  userId: string,
  offerType: OfferType
): Promise<boolean> {
  const customization = await getOfferCustomization(db, userId, offerType);
  
  // If no customization exists, offer is enabled by default
  if (!customization?.customizations) {
    return true;
  }

  // Check enabled flag
  return customization.customizations.enabled !== false;
}
