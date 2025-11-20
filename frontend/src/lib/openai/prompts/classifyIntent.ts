import { IntentAnalysis } from "@/types";
import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// In your route.ts or better: lib/intentClassifier.ts
export async function classifyUserIntent(
    userMessage: string,
    currentQuestion: string,
    flowName: string,
    previousContext?: string // optional: last 1-2 messages
  ): Promise<IntentAnalysis> {
    const prompt = `You are an expert conversational intent classifier for a guided sales/buying flow.
  
  Flow: ${flowName}
  Current question: "${currentQuestion}"
  User message: "${userMessage}"
  ${previousContext ? `Recent context: ${previousContext}` : ''}
  
  Analyze the user's intent and respond with valid JSON only (no markdown):
  
  {
    "primary": "direct_answer" | "clarification_question" | "objection" | "chitchat" | "escalation_request" | "off_topic" | "attempted_answer_but_unclear",
    "clarification"?: "needs_definition" | "needs_examples" | "scope_concern" | "privacy_concern" | "not_sure_how_to_answer" | "too_many_options",
    "objection"?: "privacy_refusal" | "trust_issue" | "time_constraint" | "price_sensitivity" | "not_ready",
    "confidence"?: number,
    "partialAnswer"?: string,
    "suggestedTone"?: "empathetic" | "firm" | "playful" | "educational"
  }
  
  Examples:
  - "what do you mean by timeline?" → { primary: "clarification_question", clarification: "needs_definition" }
  - "I'm not telling you that" → { primary: "objection", objection: "privacy_refusal", suggestedTone: "empathetic" }
  - "around 6 months lol" → { primary: "direct_answer" }
  - "idk probably 50k but don't quote me" → { primary: "direct_answer", partialAnswer: "50k", confidence: 0.85 }
  `;
  
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // perfect for structured JSON
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" }, // enforces valid JSON
    });
  
    try {
      const json = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        primary: json.primary || 'clarification_question',
        clarification: json.clarification,
        objection: json.objection,
        confidence: json.confidence ?? 0.9,
        partialAnswer: json.partialAnswer,
        suggestedTone: json.suggestedTone,
      };
    } catch (e) {
      return { primary: 'clarification_question' }; // safe fallback
    }
  }