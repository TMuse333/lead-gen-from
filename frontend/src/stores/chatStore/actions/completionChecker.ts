// stores/chatStore/completionChecker.ts
import { useConversationStore } from '@/stores/conversationConfig/conversation.store'

/**
 * Checks if all questions in the current flow have been answered
 */
export function checkFlowCompletion(
  currentFlow: string | null,
  userInput: Record<string, string>
): boolean {
  if (!currentFlow) return false;
  
  const flow = useConversationStore.getState().getFlow(currentFlow);
  if (!flow) return false;
  
  const totalQuestions = flow.questions.length;
  const answeredCount = Object.keys(userInput).length;
  
  const isComplete = answeredCount >= totalQuestions;
  
  console.log(`📊 Completion check: ${answeredCount}/${totalQuestions} = ${isComplete ? '✅ COMPLETE' : '❌ incomplete'}`);
  
  return isComplete;
}