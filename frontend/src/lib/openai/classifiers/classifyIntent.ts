// lib/openai/classifiers/classifyIntent.ts
import { callJsonLlm } from '../utils';
import { getClassifyIntentPrompt } from '../prompts/classifyIntent';

export interface IntentAnalysis {
  primary:
    | 'direct_answer'
    | 'clarification_question'
    | 'objection'
    | 'chitchat'
    | 'escalation_request'
    | 'off_topic'
    | 'attempted_answer_but_unclear';
  clarification?:
    | 'needs_definition'
    | 'needs_examples'
    | 'scope_concern'
    | 'privacy_concern'
    | 'not_sure_how_to_answer'
    | 'too_many_options';
  objection?:
    | 'privacy_refusal'
    | 'trust_issue'
    | 'time_constraint'
    | 'price_sensitivity'
    | 'not_ready';
  confidence?: number;
  partialAnswer?: string;
  suggestedTone?: 'empathetic' | 'firm' | 'playful' | 'educational';
}

export async function classifyUserIntent({
  userMessage,
  currentQuestion,
  flowName,
  previousContext,
}: {
  userMessage: string;
  currentQuestion: string;
  flowName: string;
  previousContext?: string;
}): Promise<IntentAnalysis> {
  const prompt = getClassifyIntentPrompt({
    userMessage,
    currentQuestion,
    flowName,
    previousContext,
  });

  try {
    const json = await callJsonLlm(prompt);

    return {
      primary: json.primary || 'clarification_question',
      clarification: json.clarification,
      objection: json.objection,
      confidence: json.confidence ?? 0.9,
      partialAnswer: json.partialAnswer,
      suggestedTone: json.suggestedTone,
    };
  } catch (error) {
    console.error('classifyUserIntent failed:', error);
    return { primary: 'clarification_question' };
  }
}