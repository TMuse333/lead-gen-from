#!/usr/bin/env npx tsx
// scripts/seed-client-questions.ts
/**
 * Seeds a client's config with default questions
 *
 * Usage:
 *   npx tsx scripts/seed-client-questions.ts "bob real estate"
 *   npx tsx scripts/seed-client-questions.ts "bob real estate" --force
 *   npx tsx scripts/seed-client-questions.ts --all
 */

import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'agent-lead-gen';

// Import after env is loaded
async function getDefaultQuestions() {
  // Dynamic import to ensure env is loaded first
  const { generateAllDefaultQuestions, getDefaultQuestionsSummary } = await import('../src/lib/mongodb/seedQuestions');
  return { generateAllDefaultQuestions, getDefaultQuestionsSummary };
}

async function seedClient(
  db: Db,
  businessName: string,
  force: boolean = false
): Promise<{ success: boolean; message: string }> {
  const collection = db.collection('clientConfigs');

  // Find the client
  const config = await collection.findOne({
    $or: [
      { businessName: { $regex: new RegExp(`^${businessName}$`, 'i') } },
      { businessName },
    ],
  });

  if (!config) {
    return { success: false, message: `Client "${businessName}" not found` };
  }

  console.log(`Found client: ${config.businessName} (${config._id})`);

  // Check existing questions
  const hasExisting = {
    buy: config.customQuestions?.buy?.length > 0,
    sell: config.customQuestions?.sell?.length > 0,
    browse: config.customQuestions?.browse?.length > 0,
  };

  if ((hasExisting.buy || hasExisting.sell || hasExisting.browse) && !force) {
    console.log('Existing questions:');
    console.log(`  buy: ${config.customQuestions?.buy?.length || 0} questions`);
    console.log(`  sell: ${config.customQuestions?.sell?.length || 0} questions`);
    console.log(`  browse: ${config.customQuestions?.browse?.length || 0} questions`);
    return {
      success: false,
      message: 'Client has existing questions. Use --force to overwrite.',
    };
  }

  // Generate default questions
  const { generateAllDefaultQuestions, getDefaultQuestionsSummary } = await getDefaultQuestions();
  const defaultQuestions = generateAllDefaultQuestions();
  const summary = getDefaultQuestionsSummary();

  console.log('\nDefault questions to seed:');
  for (const [flow, info] of Object.entries(summary)) {
    console.log(`  ${flow}: ${info.count} questions`);
    info.questions.forEach((q: string) => console.log(`    - ${q}`));
  }

  // Update MongoDB
  const result = await collection.updateOne(
    { _id: config._id },
    {
      $set: {
        customQuestions: defaultQuestions,
        updatedAt: new Date(),
      },
    }
  );

  if (result.modifiedCount > 0) {
    return {
      success: true,
      message: `Seeded ${config.businessName} with default questions for all flows`,
    };
  }

  return { success: false, message: 'No changes made' };
}

async function seedAllClients(db: Db, force: boolean = false): Promise<void> {
  const collection = db.collection('clientConfigs');
  const configs = await collection.find({ isActive: true }).toArray();

  console.log(`Found ${configs.length} active client configs\n`);

  for (const config of configs) {
    console.log(`\n--- ${config.businessName} ---`);
    const result = await seedClient(db, config.businessName, force);
    console.log(result.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const seedAll = args.includes('--all');
  const businessName = args.find(a => !a.startsWith('--'));

  if (!businessName && !seedAll) {
    console.log('Usage:');
    console.log('  npx tsx scripts/seed-client-questions.ts "business name"');
    console.log('  npx tsx scripts/seed-client-questions.ts "business name" --force');
    console.log('  npx tsx scripts/seed-client-questions.ts --all');
    console.log('  npx tsx scripts/seed-client-questions.ts --all --force');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  console.log(`  URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`  DB: ${DB_NAME}`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    if (seedAll) {
      await seedAllClients(db, force);
    } else if (businessName) {
      const result = await seedClient(db, businessName, force);
      console.log(`\n${result.success ? '✅' : '❌'} ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
