// stores/chatStore/types.ts

import { LlmOutput } from '@/types/componentSchema';
import { ButtonOption } from '@/types/conversation.types';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  buttons?: ButtonOption[];
  timestamp: Date;
  visual?: { type: string; value: string };
}

export interface GenerationDebugInfo {
  qdrantRetrieval: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
  userInput: Record<string, string>;
  flow: string;
}

export interface LlmResultState {
  llmOutput: LlmOutput | null;
  debugInfo: GenerationDebugInfo | null;
  setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => void;
  setDebugInfo: (info: GenerationDebugInfo) => void;
  clearLlmOutput: () => void;
}

export interface ChatStateData {
  messages: ChatMessage[];
  userInput: Record<string, string>;
  loading: boolean;
  showTracker: boolean;
  currentFlow: 'sell' | 'buy' | 'browse' | null;
  currentNodeId: string;
  progress: number;
  shouldCelebrate: boolean;
  isComplete: boolean;

  currentInsight: string;
  dbActivity: string;

  // Conversation tracking
  conversationId: string | null;
}

export interface ChatStateActions {
  addMessage: (message: ChatMessage) => void;
  addAnswer: (key: string, value: string) => void;
  setLoading: (loading: boolean) => void;
  setShowTracker: (show: boolean) => void;
  setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => void;
  setCurrentNode: (nodeId: string) => void;
  setProgress: (progress: number) => void;
  clearCelebration: () => void;
  reset: () => void;
  setComplete: (complete: boolean) => void;
  sendMessage: (message: string, displayText?: string) => Promise<void>;
  handleButtonClick: (button: ButtonOption) => Promise<void>;

  setCurrentInsight: (text: string) => void;
  setDbActivity: (text: string) => void;
  
  // Conversation tracking
  setConversationId: (id: string | null) => void;
  createConversation: () => Promise<string | null>;
  updateConversation: (updates: { 
    messages?: ChatMessage[]; 
    userInput?: Record<string, string>; 
    status?: 'in-progress' | 'completed' | 'abandoned'; 
    progress?: number; 
    currentNodeId?: string;
    answer?: { questionId: string; mappingKey: string; value: string; answeredVia: 'button' | 'text' };
  }) => Promise<void>;
}

export type ChatState = ChatStateData & ChatStateActions & LlmResultState;