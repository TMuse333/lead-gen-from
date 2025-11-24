// lib/openai/prompts/normalizeToRealEstateSchemaPrompt.ts

export function normalizeToRealEstateSchemaPrompt(
    userAnswers: Record<string, string>,
    flowType: 'buy' | 'sell' | 'browse'
  ): string {
    return `You are an expert real estate AI assistant specialized in understanding buyer/seller intent from natural conversation.
  
  Your task: Convert the user's raw answers into a clean, structured real estate profile.
  
  Conversation flow: ${flowType}
  
  Raw Q&A from user:
  ${Object.entries(userAnswers)
    .map(([question, answer]) => `Q: "${question}"\nA: "${answer}"`)
    .join('\n\n')}
  
  Extract ONLY what you are 100% confident about. Never guess or hallucinate values.
  
  Return a valid JSON object using ONLY these keys (omit any you can't confidently fill):
  
  {
    "intent": "buy"|"sell"|"browse"|"invest"|"relocate",
    "budget": number | { "min": number, "max": number },
    "timeline": "0-3 months"|"3-6 months"|"6-12 months"|"12+ months"|"asap"|"just looking",
    "bedrooms": number,
    "bathrooms": number,
    "propertyType": string[],
    "mustHaves": string[],
    "niceToHaves": string[],
    "locations": string[],
    "firstTimeBuyer": boolean,
    "preapproved": boolean,
    "financingType": "cash"|"mortgage"|"fha"|"va"|null,
    "email": string,
    "name": string,
    "phone": string
  }
  
  Rules:
  - If budget is a range → use { "min": X, "max": Y }
  - If only one number mentioned → use number
  - locations[] should be specific (e.g. "Miami Beach", "Austin", "90210")
  - Do NOT include any explanations or markdown
  - Output raw JSON only
  - If unsure about a field → omit it completely`;
  }