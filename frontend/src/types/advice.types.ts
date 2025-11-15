// src/types/advice.types.ts
import { ApplicableWhen } from './rules.types';

export interface AgentAdviceScenario {
  id: string;
  agentId: string;
  title: string;
  tags: string[];
  advice: string;

  applicableWhen: ApplicableWhen;

  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;
  embedding?: number[];       // Only used by vector collection
}