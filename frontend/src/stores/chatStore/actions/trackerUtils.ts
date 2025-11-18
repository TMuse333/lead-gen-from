// stores/chatStore/trackerUtils.ts
import { useConversationStore } from '@/stores/conversationConfig/conversation.store'

export function applyButtonTracker(
  currentFlow: string,
  currentNodeId: string,
  mappingKey: string,
  answerValue: string,
  setState: (updates: { currentInsight?: string; dbActivity?: string }) => void
): void {
  const flow = useConversationStore.getState().getFlow(currentFlow);
  const question = flow?.questions.find(q => q.mappingKey === mappingKey);
  const clickedButton = question?.buttons?.find(b => b.value === answerValue);

  if (!clickedButton?.tracker) {
    console.log('⚠️ No tracker found for button:', answerValue);
    return;
  }

  const updates: { currentInsight?: string; dbActivity?: string } = {};

  if (clickedButton.tracker.insight) {
    updates.currentInsight = clickedButton.tracker.insight;
    console.log('✅ Setting insight:', clickedButton.tracker.insight);
  }

  if (clickedButton.tracker.dbMessage) {
    updates.dbActivity = clickedButton.tracker.dbMessage;
    console.log('✅ Setting dbActivity:', clickedButton.tracker.dbMessage);
  }

  setState(updates);
}