// src/types/tokenUsage.types.ts
// Token usage tracking types with base object and feature-specific extensions

/**
 * Base tracking object - shared by ALL LLM API calls
 */
export interface BaseLLMUsage {
  // ===== IDENTIFICATION =====
  id: string; // Unique tracking ID
  timestamp: Date;
  userId?: string; // If authenticated
  sessionId?: string; // Onboarding session, conversation session, etc.
  
  // ===== MODEL INFO =====
  provider: 'openai' | 'anthropic' | 'other';
  model: string; // 'gpt-4o-mini', 'gpt-4o', 'text-embedding-3-small', etc.
  apiType: 'chat' | 'embedding' | 'function-calling' | 'other';
  
  // ===== TOKEN USAGE =====
  tokens: {
    input: number;
    output: number;
    embedding?: number; // For embedding models, this is the total
    total: number; // Sum of all
  };
  
  // ===== COST CALCULATION =====
  cost: {
    input: number; // USD
    output: number; // USD
    embedding?: number; // USD (if applicable)
    total: number; // USD
  };
  
  // ===== PERFORMANCE =====
  performance: {
    latency: number; // milliseconds
    retries: number; // How many retries were needed
    success: boolean;
    error?: string; // If failed
  };
  
  // ===== REQUEST METADATA =====
  request: {
    promptLength?: number; // Characters in prompt
    maxTokens?: number; // Requested max tokens
    temperature?: number;
    responseFormat?: 'json_object' | 'text' | 'other';
  };
  
  // ===== RESPONSE METADATA =====
  response: {
    contentLength?: number; // Characters in response
    finishReason?: 'stop' | 'length' | 'function_call' | 'other';
    hasFunctionCall?: boolean;
  };
}

// ===== FEATURE-SPECIFIC EXTENSIONS =====

export interface EmbeddingUsage extends BaseLLMUsage {
  feature: 'embeddings.adviceUpload';
  apiType: 'embedding';
  model: 'text-embedding-3-small' | 'text-embedding-ada-002';
  featureData: {
    adviceId?: string;
    adviceTitle?: string;
    textLength: number;
    collectionName?: string;
  };
}

export interface UserQueryEmbeddingUsage extends BaseLLMUsage {
  feature: 'embeddings.userQuery';
  apiType: 'embedding';
  model: 'text-embedding-ada-002';
  featureData: {
    flow: string;
    userInputKeys: string[];
    queryPurpose: 'qdrantSearch' | 'semanticSearch' | 'other';
    collectionName?: string;
  };
}

export interface ChatIntentClassificationUsage extends BaseLLMUsage {
  feature: 'chat.intentClassification';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    conversationId?: string;
    currentQuestion: string;
    userMessage: string;
    flow: string;
    intentResult: {
      primary: string;
      confidence?: number;
    };
  };
}

export interface ChatReplyGenerationUsage extends BaseLLMUsage {
  feature: 'chat.replyGeneration';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    conversationId?: string;
    answerValue: string;
    currentQuestion: string;
    nextQuestion?: string;
    isLastQuestion: boolean;
    replyLength: number;
  };
}

export interface ChatAnswerExtractionUsage extends BaseLLMUsage {
  feature: 'chat.answerExtraction';
  apiType: 'function-calling';
  model: 'gpt-4o';
  featureData: {
    conversationId?: string;
    questionId: string;
    extractedValue?: string;
    confidence?: number;
    functionCalled: boolean;
    currentAnswersCount: number;
  };
}

export interface OfferGenerationUsage extends BaseLLMUsage {
  feature: 'offerGeneration';
  apiType: 'chat';
  model: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet';
  featureData: {
    generationId?: string;
    conversationId?: string;
    flow: string;
    clientIdentifier?: string;
    qdrantRetrieval: {
      collectionsQueried: string[];
      itemsRetrieved: number;
      adviceUsed: number;
    };
    outputComponents: string[];
    componentCount: number;
  };
}

export interface RulesGenerationUsage extends BaseLLMUsage {
  feature: 'rulesGeneration';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    flow?: string;
    userFieldsCount: number;
    conceptsCount: number;
    recommendationsGenerated: number;
    savedToMongoDB: boolean;
    forceRegenerate: boolean;
  };
}

export interface RulesTranslationUsage extends BaseLLMUsage {
  feature: 'rulesTranslation';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    naturalLanguage: string;
    flow?: string;
    ruleGroupGenerated: boolean;
    fieldMappings: number;
  };
}

export interface VoiceScriptGenerationUsage extends BaseLLMUsage {
  feature: 'voiceScriptGeneration';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    flows: string[];
    customPrompt?: string;
    agentName?: string;
    questionsGenerated: number;
    questionsValidated: number;
  };
}

export interface OnboardingQuestionsGenerationUsage extends BaseLLMUsage {
  feature: 'onboarding.generateQuestions';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    businessName: string;
    industry: string;
    flows: string[];
    customPrompt?: string;
    questionsGenerated: number;
    questionsValidated: number;
  };
}

export interface OnboardingFlowGenerationUsage extends BaseLLMUsage {
  feature: 'onboarding.generateFlow';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    flowType: 'buy' | 'sell' | 'browse';
    businessName: string;
    industry: string;
    customPrompt?: string;
    questionsGenerated: number;
    flowValidated: boolean;
  };
}

export interface InstantReactionUsage extends BaseLLMUsage {
  feature: 'chat.instantReaction';
  apiType: 'chat';
  model: 'gpt-4o-mini';
  featureData: {
    questionId: string;
    answer: string;
    questionText: string;
    qdrantAdviceFound: boolean;
    adviceUsed?: string;
    reactionLength: number;
    usedGenericFallback: boolean;
  };
}

export interface DocumentExtractionUsage extends BaseLLMUsage {
  feature: 'documentExtraction';
  apiType: 'chat';
  model: 'gpt-4o-mini' | 'claude-3-5-sonnet';
  featureData: {
    documentType: 'pdf' | 'docx' | 'txt' | 'other';
    documentSize: number; // bytes
    extractedTextLength: number; // characters
    contextPrompt?: string; // User's custom prompt
    itemsExtracted: number; // How many advice items extracted
    itemsValidated: number; // How many user confirmed
    itemsWithRules: number; // How many have rules attached
    processingMethod: 'chunked' | 'full'; // If document was chunked
    chunksProcessed?: number;
  };
}

// Union type for all features
export type LLMUsageTracking =
  | EmbeddingUsage
  | UserQueryEmbeddingUsage
  | ChatIntentClassificationUsage
  | ChatReplyGenerationUsage
  | ChatAnswerExtractionUsage
  | OfferGenerationUsage
  | RulesGenerationUsage
  | RulesTranslationUsage
  | VoiceScriptGenerationUsage
  | OnboardingQuestionsGenerationUsage
  | OnboardingFlowGenerationUsage
  | InstantReactionUsage
  | DocumentExtractionUsage;

// Feature type helper
export type FeatureType = LLMUsageTracking['feature'];

