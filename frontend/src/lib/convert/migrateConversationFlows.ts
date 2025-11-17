// lib/migrateConversationFlows.ts

import { ConversationFlow, QuestionNode } from '@/types/conversationConfig.types';
import { useConversationConfigStore } from '@/stores/conversationConfigStore';
import {
  SELLER_FLOW,
  BUYER_FLOW,
  BROWSER_FLOW,
} from '@/data/conversationFlows/conversationFlows';

export function migrateExistingFlows() {
  const store = useConversationConfigStore.getState();

  // === SELLER FLOW ===
  const sellerQuestions: QuestionNode[] = Object.values(SELLER_FLOW).map((node, index) => ({
    id: node.id,
    question: node.question,
    order: index + 1,
    mappingKey: node.mappingKey,
    buttons: node.buttons,
    allowFreeText: node.allowFreeText || false,
    visual: getVisualForQuestion(node.id),
    commentary: getCommentaryForQuestion(node.id, 'sell'),
  }));
  store.updateFlow('sell', { questions: sellerQuestions });

  // === BUYER FLOW ===
  const buyerQuestions: QuestionNode[] = Object.values(BUYER_FLOW).map((node, index) => ({
    id: node.id,
    question: node.question,
    order: index + 1,
    mappingKey: node.mappingKey,
    buttons: node.buttons,
    allowFreeText: node.allowFreeText || false,
    visual: getVisualForQuestion(node.id),
    commentary: getCommentaryForQuestion(node.id, 'buy'),
  }));
  store.updateFlow('buy', { questions: buyerQuestions });

  // === BROWSER FLOW ===
  const browserQuestions: QuestionNode[] = Object.values(BROWSER_FLOW).map((node, index) => ({
    id: node.id,
    question: node.question,
    order: index + 1,
    mappingKey: node.mappingKey,
    buttons: node.buttons,
    allowFreeText: node.allowFreeText || false,
    visual: getVisualForQuestion(node.id),
    commentary: getCommentaryForQuestion(node.id, 'browse'),
  }));
  store.updateFlow('browse', { questions: browserQuestions });
}

// Visuals per question type (shared across flows)
function getVisualForQuestion(questionId: string) {
  const visuals: Record<string, { type: 'emoji'; value: string }> = {
    propertyType: { type: 'emoji', value: 'house' },
    propertyAge: { type: 'emoji', value: 'calendar' },
    renovations: { type: 'emoji', value: 'hammer' },
    timeline: { type: 'emoji', value: 'stopwatch' },
    budget: { type: 'emoji', value: 'moneybag' },
    bedrooms: { type: 'emoji', value: 'bed' },
    buyingReason: { type: 'emoji', value: 'key' },
    sellingReason: { type: 'emoji', value: 'door' },
    interest: { type: 'emoji', value: 'magnifying-glass-tilted-left' },
    location: { type: 'emoji', value: 'pin' },
    priceRange: { type: 'emoji', value: 'chart-increasing' },
    goal: { type: 'emoji', value: 'bullseye' },
    email: { type: 'emoji', value: 'envelope' },
  };
  return visuals[questionId] || { type: 'emoji', value: 'question' };
}

// Flow-specific commentary shown in the mobile tracker bar
function getCommentaryForQuestion(
    questionId: string,
    flow: 'sell' | 'buy' | 'browse'
  ) {
    const commentary: Record<
      string,
      Partial<Record<'sell' | 'buy' | 'browse', string>>
    > = {
      // Shared across flows
      email: {
        sell: 'Finalizing your seller profile...',
        buy: 'Preparing your personalized search plan...',
        browse: 'Ready to send market updates...',
      },
  
      timeline: {
        sell: 'Analyzing your selling timeline...',
        buy: 'Prioritizing based on your move-in date...',
        browse: 'Gauging your future plans...',
      },
  
      // Sell-only
      propertyType: { sell: 'Evaluating your property type...' },
      propertyAge: { sell: 'Checking home age & condition...' },
      renovations: { sell: 'Noting renovation history...' },
      sellingReason: { sell: 'Understanding your motivation...' },
  
      // Buy-only
      budget: { buy: 'Scanning listings in your price range...' },
      bedrooms: { buy: 'Finding homes with right bedroom count...' },
      buyingReason: { buy: 'Tailoring advice to your buying goal...' },
  
      // Browse-only
      interest: { browse: 'Detecting your real estate interests...' },
      location: { browse: 'Exploring your preferred neighborhoods...' },
      priceRange: { browse: 'Filtering market data by price...' },
      goal: { browse: 'Curating insights for your goals...' },
    };
  
    return {
      onStart:
        commentary[questionId]?.[flow] ||
        `Analyzing your ${formatQuestionId(questionId)}...`,
      onComplete: 'captured!',
    };
  }
  
  // Optional: make it look nice in the bar
  function formatQuestionId(id: string): string {
    return id
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }