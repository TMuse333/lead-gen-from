// types/conversation.types.ts (NEW SINGLE FILE)

import { LucideIcon } from "lucide-react";



export type FlowType = 'sell' | 'buy' | 'browse' | string;

export interface TrackerCommentary {
  onStart?: string;
  onProgress?: string;
  onComplete?: string;
  dbActivity?: string[];
}

// BASE TYPES
export interface VisualAttachment {
  type: 'emoji' | 'icon' | 'image' | 'lottie';
  value: string | LucideIcon;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface PromptConfig {
  userPrompt?: string;
  contextPrompt?: string;
  qdrantQuery?: string;
  retrievalCount?: number;
}

export interface ButtonTracker {
    insight?: string;           // shown when this question is answered
    dbMessage?: string;         // random DB activity when answered
    celebrationStep?: string;   // shown in final modal (optional)
  }

  // THE BUTTON OPTION IS WHERE LOTS OF SAUCE CAN HAPPEN


export interface ButtonOption {
  id: string;
  label: string;
  value: string;
  visual?: VisualAttachment;
  prompt?: PromptConfig;
  tracker?:ButtonTracker
}


// MAIN QUESTION TYPE (replaces both ChatNode and QuestionNode)
export interface ConversationQuestion {
  // Core identity
  id: string;
  question: string;
  order: number;
  
  // Answer collection
  mappingKey?: string;
  buttons?: ButtonOption[];
  allowFreeText?: boolean;
  
  // Navigation
  next?: string | ((answer: string) => string | null);
  
  // UI Enhancement
  visual?: VisualAttachment;
  commentary?: TrackerCommentary;
  
  // LLM Enhancement
  basePrompt?: {
    system?: string;
    context?: string;
    qdrantCollection?: string;
  };
  
  // Validation
  validation?: {
    type?: 'email' | 'phone' | 'number' | 'text';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };


}

// Type aliases for backward compatibility
export type QuestionNode = ConversationQuestion;
export type ChatNode = ConversationQuestion; // Deprecated