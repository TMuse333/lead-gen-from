// lib/chatPromptBuilder.ts
import { QuestionNode, ButtonOption, ConversationFlow } from '@/types/conversationConfig.types';

/**
 * Builds the system prompt for chat-smart route
 */
export function buildSystemPrompt(
  flow: ConversationFlow,
  currentQuestion: QuestionNode,
  userInput: Record<string, string>,
  nextQuestion?: QuestionNode // NEW: Optional next question for transitions
): string {
  const flowName = flow.name;
  const flowContext = flow.flowPrompt?.context || '';
  const personality = flow.flowPrompt?.personality || 'friendly, professional real estate assistant';
  
  const questionContext = currentQuestion.basePrompt?.context || '';
  const questionSystem = currentQuestion.basePrompt?.system || '';

  return `You are Chris's AI assistant - a ${personality}.

CURRENT CONTEXT:
- Flow: ${flowName} (${flow.type})
- Current Question: ${currentQuestion.question}
- User has answered: ${Object.keys(userInput).length} questions
${flowContext ? `\n${flowContext}` : ''}
${questionContext ? `\n${questionContext}` : ''}
${questionSystem ? `\n${questionSystem}` : ''}

${nextQuestion ? `NEXT QUESTION: "${nextQuestion.question}"
⚠️ IMPORTANT: End your response by naturally transitioning to this question. Don't repeat it verbatim - lead into it conversationally.
Example: "Great choice! Now, ${nextQuestion.question.toLowerCase()}"
` : ''}

YOUR ROLE:
1. Provide a natural, conversational response based on user's selection
2. Acknowledge their choice warmly and professionally
3. Add relevant insights or context from retrieved knowledge
${nextQuestion ? `4. SMOOTHLY transition to the next question at the end` : '4. Conclude warmly if this is the final question'}
5. Keep responses concise (2-3 sentences max)

USER'S CURRENT ANSWERS:
${Object.entries(userInput).map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'None yet'}

INSTRUCTIONS:
- Be warm and encouraging
- Use their selections to personalize your response
- Don't repeat the question they just answered
${nextQuestion ? `- End by leading into: "${nextQuestion.question}"` : '- This may be the final question - wrap up warmly'}
- If you have retrieved knowledge, weave it naturally into response`;
}

/**
 * Builds the user message for button clicks
 */
export function buildUserMessage(
  button: ButtonOption,
  question: QuestionNode
): string {
  const baseMessage = button.label;
  const context = button.prompt?.userPrompt || '';
  
  if (context) {
    return `${baseMessage}\n\nContext: ${context}`;
  }
  
  return baseMessage;
}

/**
 * Builds the Qdrant query for knowledge retrieval
 */
export function buildQdrantQuery(
  button: ButtonOption,
  question: QuestionNode,
  flow: ConversationFlow,
  userInput: Record<string, string>
): string {
  // Priority 1: Button-specific query
  if (button.prompt?.qdrantQuery) {
    return button.prompt.qdrantQuery;
  }

  // Priority 2: Build from user context
  const parts: string[] = [];
  
  // Add flow context
  if (flow.type === 'sell') {
    parts.push('selling home');
  } else if (flow.type === 'buy') {
    parts.push('buying home');
  } else {
    parts.push('real estate market');
  }

  // Add the current selection
  parts.push(button.value);

  // Add existing context from userInput
  if (userInput.propertyType) {
    parts.push(userInput.propertyType);
  }
  if (userInput.timeline) {
    parts.push(`timeline ${userInput.timeline}`);
  }

  return parts.join(' ');
}

/**
 * Builds context summary for LLM from retrieved knowledge
 */
export function buildRetrievalContext(
  retrievedDocs: Array<{ content: string; score: number }>
): string {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return '';
  }

  const context = retrievedDocs
    .slice(0, 3) // Top 3 results
    .map((doc, i) => `[${i + 1}] ${doc.content}`)
    .join('\n\n');

  return `\n\nRETRIEVED KNOWLEDGE (use this to enhance your response):\n${context}`;
}

/**
 * Main prompt builder - assembles everything
 */
export function buildChatPrompt(params: {
  flow: ConversationFlow;
  currentQuestion: QuestionNode;
  selectedButton: ButtonOption;
  userInput: Record<string, string>;
  retrievedKnowledge?: Array<{ content: string; score: number }>;
  nextQuestion?: QuestionNode; // NEW: Optional next question
}): {
  systemPrompt: string;
  userMessage: string;
  qdrantQuery: string;
  retrievalCount: number;
} {
  const { flow, currentQuestion, selectedButton, userInput, retrievedKnowledge, nextQuestion } = params;

  // Build system prompt (now with nextQuestion)
  let systemPrompt = buildSystemPrompt(flow, currentQuestion, userInput, nextQuestion);

  // Add retrieved knowledge to system prompt
  if (retrievedKnowledge && retrievedKnowledge.length > 0) {
    systemPrompt += buildRetrievalContext(retrievedKnowledge);
  }

  // Build user message
  const userMessage = buildUserMessage(selectedButton, currentQuestion);

  // Build Qdrant query
  const qdrantQuery = buildQdrantQuery(selectedButton, currentQuestion, flow, userInput);

  // Get retrieval count
  const retrievalCount = selectedButton.prompt?.retrievalCount || 3;

  return {
    systemPrompt,
    userMessage,
    qdrantQuery,
    retrievalCount,
  };
}

/**
 * Example usage:
 * 
 * const prompt = buildChatPrompt({
 *   flow: sellerFlow,
 *   currentQuestion: propertyTypeQuestion,
 *   selectedButton: singleFamilyButton,
 *   userInput: { timeline: '0-3' },
 *   retrievedKnowledge: qdrantResults
 * });
 * 
 * // Send to OpenAI
 * const completion = await openai.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages: [
 *     { role: 'system', content: prompt.systemPrompt },
 *     { role: 'user', content: prompt.userMessage }
 *   ]
 * });
 */