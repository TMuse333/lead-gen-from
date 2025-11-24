// lib/openai/prompts/classifyIntentPrompt.ts

export interface ClassifyIntentParams {
    userMessage: string;
    currentQuestion: string;
    flowName: string;
    previousContext?: string;
  }
  
  export function classifyIntentPrompt({
    userMessage,
    currentQuestion,
    flowName,
    previousContext = '',
  }: ClassifyIntentParams): string {
    return `You are an expert conversation analyst for a real estate AI assistant.
  
  Flow: ${flowName}
  Current question asked: "${currentQuestion}"
  
  ${previousContext ? `Recent context:\n${previousContext}\n` : ''}
  
  User just said: "${userMessage}"
  
  Classify the user's intent with extreme accuracy.
  
  Return VALID JSON with this exact schema:
  {
    "primary": "direct_answer" | "clarification_question" | "objection" | "chitchat" | "escalation_request" | "off_topic" | "attempted_answer_but_unclear",
    "clarification"?: "needs_definition" | "needs_examples" | "scope_concern" | "privacy_concern" | "not_sure_how_to_answer" | "too_many_options",
    "objection"?: "privacy_refusal" | "trust_issue" | "time_constraint" | "price_sensitivity" | "not_ready",
    "confidence": number,                    // 0.0 to 1.0
    "partialAnswer"?: string,                // if they tried to answer but were unclear
    "suggestedTone"?: "empathetic" | "firm" | "playful" | "educational"
  }
  
  Rules:
  - If user clearly answers → primary = "direct_answer", partialAnswer = their answer if extractable
  - If user asks a question back → "clarification_question"
  - If user says "I don't want to share" → "objection" + "privacy_refusal"
  - If user says "not yet", "later", "busy" → "objection" + "time_constraint"
  - Never guess. If unsure → primary = "clarification_question"
  - Output raw JSON only. No markdown. No explanations.`;
  }