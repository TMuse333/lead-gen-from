// lib/rules/terminology.ts
// Centralized terminology for user-facing vs technical terms

export const RULE_TERMINOLOGY = {
  // User-facing terms
  userFacing: "Client Situations",
  userFacingSingular: "Client Situation",
  userFacingPlural: "Client Situations",
  
  // Technical terms (for code/APIs)
  technical: "rules",
  technicalSingular: "rule",
  technicalPlural: "rules",
  
  // UI labels
  ruleGroup: "Rule Group",
  
  // Helper descriptions
  description: "Different situations your clients could be in",
  explanation: "Client Situations help you target specific advice to clients based on their answers in the conversation. For example, you might want to show renovation advice only to clients who aren't selling within 2 months.",
} as const;

