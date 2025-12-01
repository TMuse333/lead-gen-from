// src/scripts/seed-rate-limits.ts
// Seed default rate limit configurations to MongoDB

import { getRateLimitConfigsCollection } from '@/lib/mongodb/db';
import { DEFAULT_RATE_LIMITS } from '@/lib/mongodb/models/rateLimitConfig';
import type { FeatureType } from '@/types/tokenUsage.types';

async function seedRateLimits() {
  try {
    console.log('🌱 Seeding rate limit configurations...');

    const collection = await getRateLimitConfigsCollection();

    // Create indexes for performance
    await collection.createIndex({ feature: 1 }, { unique: true });
    await collection.createIndex({ enabled: 1 });

    // Insert or update all default limits
    const operations = Object.entries(DEFAULT_RATE_LIMITS).map(
      ([feature, config]) => ({
        updateOne: {
          filter: { feature },
          update: {
            $set: {
              ...config,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      })
    );

    const result = await collection.bulkWrite(operations);

    console.log('✅ Rate limits seeded successfully!');
    console.log(`   - Upserted: ${result.upsertedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
    console.log(`   - Matched: ${result.matchedCount}`);

    // List all configured features
    const allConfigs = await collection.find({}).toArray();
    console.log(`\n📋 Configured features (${allConfigs.length}):`);
    allConfigs.forEach((config) => {
      console.log(
        `   - ${config.feature}: ${config.enabled ? '✅ Enabled' : '❌ Disabled'} ` +
        `(Auth: ${config.authenticated.requests}/${config.authenticated.window}, ` +
        `Unauth: ${config.unauthenticated.requests}/${config.unauthenticated.window})`
      );
    });
  } catch (error) {
    console.error('❌ Error seeding rate limits:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedRateLimits()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedRateLimits };

