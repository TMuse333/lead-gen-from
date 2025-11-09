// This is the ID of the node
export type ChatNodeId = string;

// Keys that correspond to LLM input properties
export type LlmMappingKey = string;

// A single chat node
export interface ChatNode {
  id: ChatNodeId;
  question: string;
  buttons?: string[];                // optional buttons
  allowFreeText?: boolean;           // allows user to type their own answer
  mappingKey?: LlmMappingKey;        // links answer to LlmInput
  next?: ChatNodeId | ((answer: string) => ChatNodeId | null); // supports branching
  subNodes?: ChatNode[];             // optional nested sub-nodes for future expansion
}

export type LlmInput = Record<LlmMappingKey, string>;

