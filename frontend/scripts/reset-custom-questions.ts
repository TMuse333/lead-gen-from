// scripts/reset-custom-questions.ts
// Quick script to reset custom questions to defaults
// Run with: npx tsx scripts/reset-custom-questions.ts

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'agent-lead-gen';

async function resetCustomQuestions() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('clientConfigs');

    // Find all configs with custom questions
    const configs = await collection.find({
      customQuestions: { $exists: true }
    }).toArray();

    console.log(`Found ${configs.length} configs with custom questions`);

    for (const config of configs) {
      console.log(`\nConfig: ${config.businessName || config._id}`);

      const flows = ['buy', 'sell', 'browse'];
      for (const flow of flows) {
        const questions = config.customQuestions?.[flow];
        if (questions && questions.length > 0) {
          console.log(`  ${flow}: ${questions.length} questions`);
          questions.forEach((q: any, i: number) => {
            console.log(`    ${i+1}. ${q.id} (order: ${q.order}, type: ${q.inputType}, mappingKey: ${q.mappingKey || 'MISSING'})`);
          });
        }
      }
    }

    // Ask for confirmation
    console.log('\n--- Current custom questions shown above ---');
    console.log('To reset ALL custom questions, uncomment the reset code below and run again.');

    // UNCOMMENT TO RESET:
    // const result = await collection.updateMany(
    //   { customQuestions: { $exists: true } },
    //   { $unset: { customQuestions: '' } }
    // );
    // console.log(`Reset ${result.modifiedCount} configs`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

resetCustomQuestions();
