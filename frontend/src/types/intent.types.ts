// types/intent.types.ts  (create this file)
export type PrimaryIntent =
  | 'direct_answer'
  | 'clarification_question'
  | 'objection'
  | 'chitchat'
  | 'escalation_request'   // "talk to human", "call me"
  | 'off_topic'
  | 'attempted_answer_but_unclear';

export type ClarificationSubIntent =
  | 'needs_definition'          // "what do you mean by X?"
  | 'needs_examples'            // "like what kind?"
  | 'scope_concern'             // "is this for personal or business?"
  | 'privacy_concern'           // "why do you need this?"
  | 'not_sure_how_to_answer'    // "idk", "not sure"
  | 'too_many_options';         // overwhelmed by buttons

export type ObjectionSubIntent =
  | 'privacy_refusal'           // "I'm not comfortable sharing"
  | 'trust_issue'               // "how do I know you're legit?"
  | 'time_constraint'           // "I don't have time for this"
  | 'price_sensitivity'         // "this seems expensive"
  | 'not_ready';                // "I'm just browsing"

export interface IntentAnalysis {
  primary: PrimaryIntent;
  
  // Only populated when relevant
  clarification?: ClarificationSubIntent;
  objection?: ObjectionSubIntent;
  
  // Confidence 0-1 (optional, for logging/debugging)
  confidence?: number;
  
  // Extracted answer if partially present (e.g. "I don't want to say but it's under 100k")
  partialAnswer?: string;
  
  // Suggested reply tone
  suggestedTone?: 'empathetic' | 'firm' | 'playful' | 'educational';
}