import {  ChatNodeId, LlmInput } from "@/types/chat.types";
import { ChatNode } from "@/types/conversation.types";

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
  