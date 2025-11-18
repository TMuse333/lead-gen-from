// stores/chatStore/flowHelpers.ts
import { QuestionNode } from '@/types/conversation.types';
import { useConversationStore } from '../conversationConfig/conversation.store';



/**
 * Get the next question in a flow
 * @param flowId - The flow identifier ('sell', 'buy', 'browse')
 * @param currentQuestionId - Current question ID (optional - if not provided, returns first question)
 * @returns The next question or null if flow is complete
 */
export function getNextQuestion(
  flowId: string,
  currentQuestionId?: string
): QuestionNode | null {
  const flow = useConversationStore.getState().getFlow(flowId);
  
  if (!flow) {
    console.warn(`[flowHelpers] Flow not found: ${flowId}`);
    return null;
  }

  const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);

  // If no current question, return the first one
  if (!currentQuestionId) {
    return sortedQuestions[0] || null;
  }

  // Find the current question index
  const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestionId);
  
  if (currentIndex === -1) {
    console.warn(`[flowHelpers] Question not found: ${currentQuestionId}`);
    return null;
  }

  // Return the next question, or null if we're at the end
  const nextQuestion = sortedQuestions[currentIndex + 1];
  return nextQuestion || null;
}

/**
 * Get the total number of questions in a flow
 * @param flowId - The flow identifier
 * @returns Total question count
 */
export function getTotalQuestions(flowId: string): number {
  const flow = useConversationStore.getState().getFlow(flowId);
  return flow?.questions.length || 0;
}

/**
 * Check if a flow is complete
 * @param flowId - The flow identifier
 * @param userAnswers - The user's answers so far
 * @returns True if all required questions are answered
 */
export function isFlowComplete(
  flowId: string,
  userAnswers: Record<string, string>
): boolean {
  const flow = useConversationStore.getState().getFlow(flowId);
  
  if (!flow) return false;

  // Get all required questions
  const requiredQuestions = flow.questions.filter(
    q => q.validation?.required !== false && q.mappingKey
  );

  // Check if all required questions have answers
  return requiredQuestions.every(q => 
    q.mappingKey && userAnswers[q.mappingKey]
  );
}

/**
 * Get the progress percentage for a flow
 * @param flowId - The flow identifier
 * @param userAnswers - The user's answers so far
 * @returns Progress percentage (0-100)
 */
export function getFlowProgress(
  flowId: string,
  userAnswers: Record<string, string>
): number {
  const totalQuestions = getTotalQuestions(flowId);
  
  if (totalQuestions === 0) return 0;

  const answeredCount = Object.keys(userAnswers).length;
  return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Get the first question in a flow
 * @param flowId - The flow identifier
 * @returns The first question or null
 */
export function getFirstQuestion(flowId: string): QuestionNode | null {
  const flow = useConversationStore.getState().getFlow(flowId);
  
  if (!flow || flow.questions.length === 0) return null;

  const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);
  return sortedQuestions[0];
}

/**
 * Get the previous question in a flow (for back navigation)
 * @param flowId - The flow identifier
 * @param currentQuestionId - Current question ID
 * @returns The previous question or null
 */
export function getPreviousQuestion(
  flowId: string,
  currentQuestionId: string
): QuestionNode | null {
  const flow = useConversationStore.getState().getFlow(flowId);
  
  if (!flow) return null;

  const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);
  const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestionId);
  
  if (currentIndex <= 0) return null;

  return sortedQuestions[currentIndex - 1];
}