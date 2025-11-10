import { ChatNode, ChatNodeId, LlmInput } from "@/types/chat.types";

export interface ChatAnswer {
    id: ChatNodeId;
    answer: string;
  }
  
  export function chatHistoryToLlmInput(
    chatHistory: ChatAnswer[],
    nodes: Record<ChatNodeId, ChatNode>
  ): LlmInput {
    const llmInput: LlmInput = {};
  
    chatHistory.forEach(({ id, answer }) => {
      const node = nodes[id];
      if (node?.mappingKey) {
        llmInput[node.mappingKey] = answer;
      }
    });
  
    return llmInput;
  }
  