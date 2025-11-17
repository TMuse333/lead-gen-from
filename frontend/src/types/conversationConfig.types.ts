// types/conversationConfig.types.ts
import { LucideIcon } from 'lucide-react';

// types/conversationConfig.types.ts (UPDATED)

export type FlowType = 'sell' | 'buy' | 'browse' | string;

export interface VisualAttachment {
  type: 'emoji' | 'icon' | 'image' | 'lottie';
  value: string | any; // Can be LucideIcon component
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface TrackerCommentary {
  onStart?: string;
  onProgress?: string;
  onComplete?: string;
  dbActivity?: string[];
}

// NEW: Prompt configuration for LLM enhancement
export interface PromptConfig {
  userPrompt?: string;        // What to tell LLM user selected (e.g., "User selected single-family house")
  contextPrompt?: string;     // Additional context for LLM (e.g., "Focus on pricing for single-family homes")
  qdrantQuery?: string;       // Specific query for Qdrant retrieval (e.g., "single family home selling tips")
  retrievalCount?: number;    // How many Qdrant results to fetch (default: 3)
}

export interface ButtonOption {
  id: string;
  label: string;
  value: string;
  visual?: VisualAttachment;
  prompt?: PromptConfig;      // NEW: Optional prompt config for this button
}

export interface QuestionNode {
  id: string;
  question: string;
  order: number;
  mappingKey?: string;
  buttons?: ButtonOption[];
  allowFreeText?: boolean;
  visual?: VisualAttachment;
  commentary?: TrackerCommentary;
  
  // NEW: Base prompt for this question
  basePrompt?: {
    system?: string;          // System instructions for this question
    context?: string;         // Context about what this question is for
    qdrantCollection?: string; // Which Qdrant collection to query (e.g., 'advice', 'actionSteps')
  };
  
  validation?: {
    type?: 'email' | 'phone' | 'number' | 'text';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface ConversationFlow {
  id: string;
  name: string;
  type: FlowType;
  description?: string;
  visual?: VisualAttachment;
  questions: QuestionNode[];
  
  // NEW: Flow-level prompt configuration
  flowPrompt?: {
    systemBase?: string;      // Base system prompt for entire flow
    context?: string;         // Overall context for this flow
    personality?: string;     // Conversational personality
  };
  
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    author?: string;
  };
}

export interface ConversationConfig {
  flows: Record<string, ConversationFlow>;
  activeFlowId?: string;
  settings?: {
    enableTrackerAnimations: boolean;
    showProgress: boolean;
    autoSave: boolean;
  };
}