// src/lib/openai/classifiers/classifyAndExtract.ts
/**
 * Unified Classify & Extract Prompt
 *
 * Replaces separate classify + extract with a single LLM call that:
 * - Classifies user intent (direct_answer, multi_answer, objection, etc.)
 * - Extracts data for ALL collectable fields (not just the current question)
 * - Detects corrections to previous answers
 *
 * Example: "I want to buy in Toronto for 500k" -> extracts location + budget in one shot
 */

import type { ClassifyAndExtractResult, ConversationState } from '@/types/stateMachine.types';

export interface ClassifyAndExtractParams {
  userMessage: string;
  currentState: {
    id: string;
    goal: string;
    prompt: string;
    collects: ConversationState['collects'];
  };
  allCollectableFields: Array<{
    mappingKey: string;
    label: string;
    extractionHint: string;
  }>;
  alreadyCollected: Record<string, string>;
  flowName: string;
  previousContext?: string;
}

/**
 * Build the prompt for the unified classify-and-extract LLM call.
 */
export function classifyAndExtractPrompt(params: ClassifyAndExtractParams): string {
  const {
    userMessage,
    currentState,
    allCollectableFields,
    alreadyCollected,
    flowName,
    previousContext,
  } = params;

  // Build field descriptions
  const fieldDescriptions = allCollectableFields
    .map((f) => {
      const collected = alreadyCollected[f.mappingKey];
      const status = collected ? `(already collected: "${collected}")` : '(not yet collected)';
      return `  - ${f.mappingKey}: ${f.label} — hint: ${f.extractionHint} ${status}`;
    })
    .join('\n');

  // Build current state context
  const currentFieldHints = currentState.collects
    .map((c) => `  - ${c.mappingKey}: ${c.extractionHint}`)
    .join('\n');

  return `You are a conversation analyst for a ${flowName} AI assistant.

CURRENT STATE:
  Goal: ${currentState.goal}
  Question asked: "${currentState.prompt}"
  Fields this state collects:
${currentFieldHints || '  (none)'}

ALL COLLECTABLE FIELDS:
${fieldDescriptions}

${previousContext ? `RECENT CONVERSATION:\n${previousContext}\n` : ''}

USER JUST SAID: "${userMessage}"

TASK: Classify the user's intent AND extract any data from their message.

Return VALID JSON with this exact schema:
{
  "intent": {
    "primary": "direct_answer" | "multi_answer" | "clarification_question" | "objection" | "chitchat" | "off_topic" | "change_previous_answer" | "escalation_request" | "attempted_answer_but_unclear",
    "objection": "privacy_refusal" | "trust_issue" | "time_constraint" | "price_sensitivity" | "not_ready" | null,
    "confidence": number (0.0 to 1.0),
    "suggestedTone": "empathetic" | "firm" | "playful" | "educational" | null
  },
  "extracted": [
    { "mappingKey": "fieldName", "value": "extracted value", "confidence": number (0.0 to 1.0) }
  ],
  "correction": { "mappingKey": "fieldName", "newValue": "corrected value" } or null
}

RULES:
- If the user answers the current question clearly -> "direct_answer"
- If the user provides info for MULTIPLE fields at once -> "multi_answer"
  Example: "I want to buy in Toronto for 500k" -> extract location AND budget
- If the user wants to change a previous answer -> "change_previous_answer" + set correction
- If the user asks a question back -> "clarification_question"
- If the user refuses -> "objection" with the specific objection type
- If off-topic -> "off_topic"
- Extract ALL fields you can detect, not just the current question's field
- confidence should reflect how certain you are about each extraction
- Only set correction if user explicitly wants to change a previous answer
- Output raw JSON only. No markdown. No explanations.`;
}

/**
 * Parse the LLM response into a typed ClassifyAndExtractResult.
 * Provides safe defaults for malformed responses.
 */
export function parseClassifyAndExtractResponse(raw: unknown): ClassifyAndExtractResult {
  const data = raw as Record<string, unknown>;

  const intent = (data?.intent || {}) as Record<string, unknown>;
  const extracted = Array.isArray(data?.extracted) ? data.extracted : [];
  const correction = data?.correction as { mappingKey: string; newValue: string } | null;

  return {
    intent: {
      primary: (intent.primary as ClassifyAndExtractResult['intent']['primary']) || 'clarification_question',
      objection: (intent.objection as string) || undefined,
      confidence: typeof intent.confidence === 'number' ? intent.confidence : 0.5,
      suggestedTone: (intent.suggestedTone as ClassifyAndExtractResult['intent']['suggestedTone']) || undefined,
    },
    extracted: extracted.map((item: Record<string, unknown>) => ({
      mappingKey: String(item.mappingKey || ''),
      value: String(item.value || ''),
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.7,
    })).filter((item) => item.mappingKey && item.value),
    correction: correction?.mappingKey ? correction : undefined,
  };
}
