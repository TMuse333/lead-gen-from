// lib/openai/normalizers/normalizeToRealEstateSchema.ts
import { callJsonLlm } from '../utils';
import type { UserProfile } from '@/types';

export async function normalizeToRealEstateSchema(
  userAnswers: Record<string, string>,
  flowType: 'buy' | 'sell' | 'browse'
): Promise<Partial<UserProfile>> {
  const prompt = `You are an expert real estate AI assistant.

Convert the user's answers into a structured profile.
Flow: ${flowType}

Answers:
${Object.entries(userAnswers)
  .map(([q, a]) => `Q: "${q}"\nA: "${a}"`)
  .join('\n\n')}

Return VALID JSON with these fields (only if confident):
{
  "intent": "buy"|"sell"|"browse"|"invest"|"relocate",
  "budget": number | { "min": number, "max": number },
  "timeline": "0-3 months"|"3-6 months"|"6-12 months"|"12+ months"|"asap"|"just looking",
  "bedrooms": number,
  "propertyType": string[],
  "mustHaves": string[],
  "locations": string[],
  "firstTimeBuyer": boolean,
  "preapproved": boolean,
  "email": string,
  "name": string
}

Omit unknown fields. Never guess.`;

  try {
    const json = await callJsonLlm(prompt, 'gpt-4o-mini');
    
    // Basic validation
    if (typeof json !== 'object' || json === null) {
      console.warn('LLM returned invalid JSON, using fallback');
      return {};
    }

    return json as Partial<UserProfile>;
  } catch (error) {
    console.error('Normalization failed:', error);
    return {}; // Don't break the flow
  }
}