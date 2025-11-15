// types/personalization.types.ts


import { ActionStepScenario } from '@/components/ux/resultsComponents/actionPlan/types';
import { AgentAdviceScenario } from '@/types';
import {  } from '@/types';

// Add more as you create more collections
export type RetrievedData = {
  advice?: AgentAdviceScenario[];
  actionSteps?: ActionStepScenario[];
  // objectionHandlers?: ObjectionHandlerScenario[];
  // pricingScripts?: PricingScriptScenario[];
  // ...future collections here
};

export interface PersonalizationContext {
  flow: 'sell' | 'buy' | 'browse';
  userInput: Record<string, string>;
  retrieved: RetrievedData;
}