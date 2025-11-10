// This is the ID of the node
export type ChatNodeId = string;

// Keys that correspond to LLM input properties
export type LlmMappingKey = string;

export interface ChatButton {
    id: string;        // unique button identifier
    label: string;     // what is displayed to the user
    value: string;     // the value that gets stored/submitted
  }

// A single chat node
export interface ChatNode {
  id: ChatNodeId;
  question: string;
  buttons?: ChatButton[];                 // optional buttons
  allowFreeText?: boolean;           // allows user to type their own answer
  mappingKey?: LlmMappingKey;        // links answer to LlmInput
  next?: ChatNodeId | ((answer: string) => ChatNodeId | null); // supports branching
  subNodes?: ChatNode[];             // optional nested sub-nodes for future expansion
}

export type LlmInput = Record<LlmMappingKey, string>;

