// lib/openai/prompts/classifyIntent.ts
export function getClassifyIntentPrompt({
  userMessage,
  currentQuestion,
  flowName,
  previousContext,
}: {
  userMessage: string;
  currentQuestion: string;
  flowName: string;
  previousContext?: string;
}): string {
  return `You are an expert conversational intent classifier for a guided sales/buying flow.

Flow: ${flowName}
Current question: "${currentQuestion}"
User message: "${userMessage}"
${previousContext ? `Recent context:\n${previousContext}` : ''}

Analyze the user's intent and respond with valid JSON only (no markdown, no explanations):

{
  "primary": "direct_answer" | "clarification_question" | "objection" | "chitchat" | "escalation_request" | "off_topic" | "attempted_answer_but_unclear",
  "clarification"?: "needs_definition" | "needs_examples" | "scope_concern" | "privacy_concern" | "not_sure_how_to_answer" | "too_many_options",
  "objection"?: "privacy_refusal" | "trust_issue" | "time_constraint" | "price_sensitivity" | "not_ready",
  "confidence"?: number,
  "partialAnswer"?: string,
  "suggestedTone"?: "empathetic" | "firm" | "playful" | "educational"
}

Examples:
- "what do you mean by timeline?" → {"primary":"clarification_question","clarification":"needs_definition"}
- "I'm not comfortable sharing that" → {"primary":"objection","objection":"privacy_refusal","suggestedTone":"empathetic"}
- "around 6 months lol" → {"primary":"direct_answer"}
- "idk maybe 50-60k" → {"primary":"direct_answer","partialAnswer":"50-60k"}
- "not telling you my budget" → {"primary":"objection","objection":"privacy_refusal"}
`;
}