// stores/conversation/defaults/defaults.main.ts
import { sellFlow } from './flow.sell';
import { buyFlow } from './flow.buy';
import { browseFlow } from './flow.browse';
import type { ConversationFlow } from '../conversation.store';

export const createDefaultFlows = (): Record<string, ConversationFlow> => ({
  sell: sellFlow,
  buy: buyFlow,
  browse: browseFlow,
});