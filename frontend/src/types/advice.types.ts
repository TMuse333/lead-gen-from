export interface AgentAdviceScenario {
    id: string;
    agentId: string;
    scenario: string;
    tags: string[];
    advice: string;
    applicableWhen: {
      propertyType?: string[];
      sellingReason?: string[];
      timeline?: string[];
      concerns?: string[];
    };
    createdAt: Date;
    embedding?: number[];
  }
  