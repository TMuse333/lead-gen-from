// types/chat.types.ts

import { FlowAnalysis } from "./analysis.types";
import { ComparableHome } from "./comparable.types";

export interface ChatButton {
    id: string;
    label: string;
    value: string;
    icon?: string;
  }
  
  export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    buttons?: ChatButton[];
    celebration?: boolean;
    timestamp?: Date;
  }
  
  export interface ExtractedAnswer {
    questionId: string;
    question: string;
    value: string;
    answeredAt: Date;
  }
  
  export interface ChatStateData {
    messages: ChatMessage[];
    extractedAnswers: ExtractedAnswer[];
    loading: boolean;
    showTracker: boolean;
    currentFlow: 'sell' | 'buy' | 'browse' | null;
    progress: number;
    shouldCelebrate: boolean;
    isComplete: boolean;
  
    // New fields
    analysis?: FlowAnalysis; // your AI result
    comparableHomes?: ComparableHome[];
    userEmail?: string;
  }
  
  export interface ChatStateActions {
    addMessage: (message: ChatMessage) => void;
    addExtractedAnswer: (answer: ExtractedAnswer) => void;
    setLoading: (loading: boolean) => void;
    setShowTracker: (show: boolean) => void;
    setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => void;
    setProgress: (progress: number) => void;
    sendMessage: (message: string, displayText?: string) => Promise<void>;
    handleButtonClick: (button: ChatButton) => Promise<void>;
    reset: () => void;
    clearCelebration: () => void;
  
    // New actions
    setAnalysisData: (data: { analysis: FlowAnalysis; comparableHomes: ComparableHome[]; userEmail: string }) => void;
  }
  
  
  export type ChatState = ChatStateData & ChatStateActions;
  
  
  export interface ConversationFlow {
    [key: string]: {
      question: string;
      buttons: ChatButton[];
    };
  }
  
  export interface ConversationFlows {
    sell?: ConversationFlow;
    buy?: ConversationFlow;
    browse?: ConversationFlow;
  }