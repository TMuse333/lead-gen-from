// lib/openai/normalizers/normalizeToRealEstateSchema.ts
import { UserProfile } from '@/types';
import { callJsonLlm } from '../utils';

export async function normalizeToRealEstateSchema(
  userAnswers: Record<string, string>,
  flowType: 'buy' | 'sell' | 'browse'
) {
  const prompt = `You are an expert real estate AI that converts ANY user answers into a structured buyer/seller profile.

Flow: ${flowType}
User's answers (question → answer):
${Object.entries(userAnswers)
  .map(([q, a]) => `Q: "${q}"\nA: "${a}"`)
  .join('\n\n')}

Map this to the correct canonical fields. Only include fields you are CONFIDENT about.

Output VALID JSON ONLY:

{
  "intent": "buy" | "sell" | "browse" | "invest" | "relocate",
  "budget": 750000 | { "min": 600000, "max": 900000 },
  "timeline": "0-3 months" | "3-6 months" | "6-12 months" | "12+ months" | "asap" | "just looking",
  "bedrooms": 3,
  "propertyType": ["house", "condo"],
  "mustHaves": ["pool", "good schools"],
  "locations": ["Downtown Toronto", "Miami Beach"],
  "firstTimeBuyer": true,
  "preapproved": false,
  "email": "john@gmail.com"
}

If unknown, omit the field. Never guess.`;

  try {
    const json = await callJsonLlm(prompt);
    return json as Partial<UserProfile>;
  } catch (e) {
    console.error('Normalization failed');
    return { intent: flowType };
  }
}