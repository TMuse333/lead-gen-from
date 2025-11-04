// types/chat.types.ts

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
  
  export interface ChatState {
    // State
    messages: ChatMessage[];
    extractedAnswers: ExtractedAnswer[];
    loading: boolean;
    showTracker: boolean;
    currentFlow: 'sell' | 'buy' | 'value' | null;
    progress: number;
    shouldCelebrate: boolean;
    
    // Actions
    addMessage: (message: ChatMessage) => void;
    addExtractedAnswer: (answer: ExtractedAnswer) => void;
    setLoading: (loading: boolean) => void;
    setShowTracker: (show: boolean) => void;
    setCurrentFlow: (flow: 'sell' | 'buy' | 'value' | null) => void;
    setProgress: (progress: number) => void;
    sendMessage: (message: string, displayText?: string) => Promise<void>;
    handleButtonClick: (button: ChatButton) => Promise<void>;
    reset: () => void;
    clearCelebration: () => void;
  }
  
  export interface ConversationFlow {
    [key: string]: {
      question: string;
      buttons: ChatButton[];
    };
  }
  
  export interface ConversationFlows {
    sell: ConversationFlow;
    buy?: ConversationFlow;
    value?: ConversationFlow;
  }