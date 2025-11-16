// scripts/migrate-to-includes.ts

import { QdrantClient } from "@qdrant/js-client-rest";

// import { qdrant } from "@/lib/qdrant";

import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });


const ACTION_STEPS_COLLECTION = 'agent-action-steps';

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
  });

async function migrateToIncludes() {


  // Get all points
  const result = await qdrant.scroll(ACTION_STEPS_COLLECTION, {
    limit: 100,
    with_payload: true,
  });

  // Update each point
  for (const point of result.points) {
    const payload = point.payload as any;
    
    // Update operator in ruleGroups
    if (payload.applicableWhen?.ruleGroups) {
      payload.applicableWhen.ruleGroups.forEach((group: any) => {
        group.rules.forEach((rule: any) => {
          if (rule.operator === 'equals') {
            rule.operator = 'includes';
          }
        });
      });
    }

    // Update the point
    await qdrant.setPayload(ACTION_STEPS_COLLECTION, {
      points: [point.id],
      payload: payload,
    });
  }

  console.log(`✅ Updated ${result.points.length} points`);
}

migrateToIncludes();