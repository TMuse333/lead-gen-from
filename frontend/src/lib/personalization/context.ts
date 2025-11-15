// lib/personalization/context.ts

import { PersonalizationContext, RetrievedData } from '@/types/personalization.types';
import { queryRelevantAdvice } from '@/lib/qdrant/collections/vector/advice/advice.queries';
import { queryActionSteps } from '@/lib/qdrant/collections/rule-based/actionSteps/actionSteps.queries';
import { openai } from '@/lib/openai';

async function generateEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return resp.data[0].embedding;
}

export async function getPersonalizedContext(
  flow: 'sell' | 'buy' | 'browse',
  userInput: Record<string, string>,
  collections: ('advice' | 'actionSteps')[]
): Promise<PersonalizationContext> {
  const retrieved: RetrievedData = {};

  // Parallel retrieval
  const tasks = [];

  if (collections.includes('advice')) {
    tasks.push(
      (async () => {
        const embedding = await generateEmbedding(
          `${flow} ${Object.values(userInput).join(' ')}`
        );
        retrieved.advice = await queryRelevantAdvice(
          'chris-crowell', // or dynamic agentId
          embedding,
          flow,
          userInput,
          6
        );
      })()
    );
  }

  if (collections.includes('actionSteps')) {
    tasks.push(
      queryActionSteps('chris-crowell', flow, userInput, 8).then((steps) => {
        retrieved.actionSteps = steps;
      })
    );
  }

  await Promise.all(tasks);

  return { flow, userInput, retrieved };
}