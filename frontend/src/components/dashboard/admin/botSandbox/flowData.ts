import type { Node, Edge } from '@xyflow/react';

export interface FlowNodeData {
  label: string;
  role: string;
  file: string;
  line: string;
  fullPath: string;
  nodeType: 'entry' | 'bot_response' | 'llm_prompt' | 'decision' | 'intel' | 'completion' | 'error';
  promptText: string;
  summary: string;
  buttons?: string[];
  [key: string]: unknown;
}

// ————————————————————————
// Nodes (17 total)
// ————————————————————————

export const flowNodes: Node<FlowNodeData>[] = [
  // Row 0 — Entry
  {
    id: 'initial-greeting',
    type: 'flowNode',
    position: { x: 400, y: 0 },
    data: {
      label: 'Initial Greeting',
      role: 'Entry point',
      file: 'initialState.ts',
      line: '15-47',
      fullPath: 'src/stores/chatStore/initialState.ts',
      nodeType: 'entry',
      summary: 'The first message every visitor sees. Sets the tone and presents Buy/Sell buttons to immediately capture intent.',
      promptText: `Hey there! I'm [businessName]'s AI assistant, and I'm here to help make your real estate journey as smooth as possible.

**Here's what I can do for you:**
- Your Personalized Real Estate Timeline
- Real Stories & Advice from your agent

_Ready to get started? Just let me know if you're looking to buy or sell!_

**What brings you here today?**

Buttons: ["I'm looking to buy", "I'm looking to sell"]`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },

  // Row 1 — Pre-flow responses
  {
    id: 'preflow-buy',
    type: 'flowNode',
    position: { x: 50, y: 150 },
    data: {
      label: 'Buy Keywords Detected',
      role: 'Pre-flow response',
      file: 'sendMessageHandler.ts',
      line: '55-57',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'bot_response',
      summary: 'Catches visitors who type buying-related keywords before clicking a button. Validates their intent and re-shows Buy/Sell buttons.',
      promptText: `Triggered when user types buy/purchase/looking for/house/home before selecting an intent.

Response: "It sounds like you're thinking about buying - that's exciting! I'd love to help you map out your journey. I'll ask a few quick questions to create a personalized timeline, and I can even share some stories from your agent about how they've helped buyers in similar situations. Ready to get started?"

Re-shows Buy/Sell buttons.`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },
  {
    id: 'preflow-sell',
    type: 'flowNode',
    position: { x: 250, y: 150 },
    data: {
      label: 'Sell Keywords Detected',
      role: 'Pre-flow response',
      file: 'sendMessageHandler.ts',
      line: '58-60',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'bot_response',
      summary: 'Catches visitors who type selling-related keywords before clicking a button. Validates their intent and re-shows Buy/Sell buttons.',
      promptText: `Triggered when user types sell/list/move/market before selecting an intent.

Response: "Thinking about selling? I'm here to help make that process as smooth as possible! Let me create a custom timeline based on your situation. I'll also share some real stories from your agent about how they've successfully helped other sellers. Sound good?"

Re-shows Buy/Sell buttons.`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },
  {
    id: 'preflow-greeting',
    type: 'flowNode',
    position: { x: 450, y: 150 },
    data: {
      label: 'Greeting Detected',
      role: 'Pre-flow response',
      file: 'sendMessageHandler.ts',
      line: '61-63',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'bot_response',
      summary: 'Handles casual greetings (hi, hello, hey) before the user picks an intent. Warmly redirects to Buy/Sell selection.',
      promptText: `Triggered when user types hello/hi/hey/help before selecting an intent.

Response: "Hey! Great to have you here. I'm here to create a personalized real estate timeline just for you - complete with step-by-step guidance and real stories from your agent about how they handle different situations. Are you looking to buy or sell?"

Re-shows Buy/Sell buttons.`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },
  {
    id: 'preflow-question',
    type: 'flowNode',
    position: { x: 650, y: 150 },
    data: {
      label: 'Question Detected (Intel)',
      role: 'Pre-flow response + Intel',
      file: 'sendMessageHandler.ts',
      line: '64-67',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'intel',
      summary: 'Captures early questions as intel signals before the structured flow begins. Saves the question topic, then redirects to Buy/Sell selection.',
      promptText: `Triggered when user asks a question (contains ?, how, what, when, why, where, question) before selecting an intent.

Saved as intel type: "question"

Response: "Great question! [agentDisplayName] actually covers topics like this regularly. Once I know a bit more about your situation, I can point you in the right direction. Are you looking to buy or sell?"

Also fires background POST /api/intel with tags extracted from message.`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },
  {
    id: 'preflow-general',
    type: 'flowNode',
    position: { x: 850, y: 150 },
    data: {
      label: 'General Statement (Intel)',
      role: 'Pre-flow response + Intel',
      file: 'sendMessageHandler.ts',
      line: '68-71',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'intel',
      summary: 'Captures general statements as interest signals before the structured flow begins. Saves the topic, then redirects to Buy/Sell selection.',
      promptText: `Triggered when user sends a general statement that doesn't match any keyword patterns.

Saved as intel type: "topic_interest"

Response: "Thanks for sharing that! That's really helpful context. I'd love to build you a personalized timeline with real stories from [agentDisplayName]. To get started, are you looking to buy or sell?"

Also fires background POST /api/intel with tags extracted from message.`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },

  // Row 2 — Selection
  {
    id: 'offer-selection',
    type: 'flowNode',
    position: { x: 400, y: 300 },
    data: {
      label: 'Offer Selection',
      role: 'Selection handler',
      file: 'buttonClickHandler.ts',
      line: '72-77',
      fullPath: 'src/stores/chatStore/actions/buttonClickHandler.ts',
      nodeType: 'decision',
      summary: 'Routes the user into the real estate timeline offer after they click Buy or Sell. Sets up the offer context for the question flow.',
      promptText: `Handles when user clicks the Buy or Sell button from the initial greeting.

Sets selectedOffer = 'real-estate-timeline' in store.
Filters supported intents (excludes browse for MVP).
Shows intent selection message:

"Great choice! To personalize this for you, what are you looking to do?"

Buttons: ["I'm looking to buy", "I'm looking to sell"]`,
      buttons: ["I'm looking to buy", "I'm looking to sell"],
    },
  },

  // Row 3
  {
    id: 'intent-selection',
    type: 'flowNode',
    position: { x: 400, y: 420 },
    data: {
      label: 'Intent + Load Questions',
      role: 'Selection handler',
      file: 'buttonClickHandler.ts',
      line: '83-188',
      fullPath: 'src/stores/chatStore/actions/buttonClickHandler.ts',
      nodeType: 'decision',
      summary: 'The critical setup node. Sets Buy or Sell intent, creates the conversation in MongoDB, loads all questions for the flow, and kicks off the first question.',
      promptText: `Handles when user clicks Buy or Sell intent button.

1. Auto-selects 'real-estate-timeline' offer if none selected
2. Sets currentIntent = 'buy' | 'sell'
3. Calls addAnswer('intent', selectedIntent)
4. Creates conversation in MongoDB
5. Calls loadQuestionsForFlow() to fetch questions from MongoDB
6. Filters to bot-only questions via getBotQuestions()
7. Gets first question via getFirstQuestion()
8. Displays first question with buttons
9. Updates conversation with currentQuestionId`,
    },
  },

  // Row 4 — Question loop
  {
    id: 'display-question',
    type: 'flowNode',
    position: { x: 400, y: 540 },
    data: {
      label: 'Display Question N',
      role: 'Question display',
      file: 'questionProvider.ts',
      line: '',
      fullPath: 'src/lib/chat/questionProvider.ts',
      nodeType: 'bot_response',
      summary: 'The core loop node. Shows the current question with button options. Every question in the flow passes through here.',
      promptText: `Displays the current question from the MongoDB-loaded flow.

Each question has:
- question text (displayed as assistant message)
- buttons (converted via convertButtons())
- mappingKey (for saving the answer)
- inputType (text, button, etc.)

User can either:
1. Click a button → goes to Direct Answer (button) path
2. Type free text → goes to Intent Classification`,
    },
  },

  // Row 5
  {
    id: 'intent-classification',
    type: 'flowNode',
    position: { x: 200, y: 660 },
    data: {
      label: 'LLM: Intent Classification',
      role: 'LLM prompt (gpt-4o-mini)',
      file: 'classifyIntent.ts',
      line: '10-43',
      fullPath: 'src/lib/openai/classifiers/classifyIntent.ts',
      nodeType: 'llm_prompt',
      summary: 'LLM call that determines what the user meant when they typed free text instead of clicking a button. Routes to extraction or rephrase based on classified intent.',
      promptText: `System prompt sent to gpt-4o-mini (temperature: 0, max_tokens: 500, JSON mode):

"You are an expert conversation analyst for a real estate AI assistant.

Flow: [flowName]
Current question asked: "[currentQuestion]"
[Recent context if available]

User just said: "[userMessage]"

Classify the user's intent with extreme accuracy.

Return VALID JSON:
{
  "primary": "direct_answer" | "clarification_question" | "objection" | "chitchat" | "escalation_request" | "off_topic" | "attempted_answer_but_unclear",
  "clarification?": "needs_definition" | "needs_examples" | "scope_concern" | "privacy_concern" | "not_sure_how_to_answer" | "too_many_options",
  "objection?": "privacy_refusal" | "trust_issue" | "time_constraint" | "price_sensitivity" | "not_ready",
  "confidence": 0.0-1.0,
  "partialAnswer?": string,
  "suggestedTone?": "empathetic" | "firm" | "playful" | "educational"
}"`,
    },
  },
  {
    id: 'direct-answer',
    type: 'flowNode',
    position: { x: 600, y: 660 },
    data: {
      label: 'Direct Answer → Extract',
      role: 'Answer extraction',
      file: 'smart/route.ts',
      line: '362-367',
      fullPath: 'app/api/chat/smart/route.ts',
      nodeType: 'decision',
      summary: "Extracts the user's answer (from button click or classified free text) and saves it against the question's mapping key.",
      promptText: `When user clicks a button OR intent classification returns "direct_answer":

Button click (fast path):
  answerValue = buttonValue

Free text direct answer:
  answerValue = intent.partialAnswer || freeText

Extracted answer is saved as:
  { mappingKey: currentQuestion.mappingKey, value: answerValue }

Then proceeds to Reply Generation and Schema Normalization (background).`,
    },
  },

  // Row 6
  {
    id: 'rephrase-prompt',
    type: 'flowNode',
    position: { x: 100, y: 780 },
    data: {
      label: 'LLM: Rephrase Question',
      role: 'LLM prompt (gpt-4o-mini)',
      file: 'smart/route.ts',
      line: '387-403',
      fullPath: 'app/api/chat/smart/route.ts',
      nodeType: 'llm_prompt',
      summary: 'LLM call that warmly rephrases the current question when the user gave a non-answer (objection, clarification, chitchat). Never advances — re-asks the same question.',
      promptText: `Triggered when intent classification is NOT "direct_answer" (clarification, objection, chitchat, etc.)

System prompt sent to gpt-4o-mini (temperature: 0.8, max_tokens: 180):

"User said: "[freeText]"
They were asked: "[currentQuestion.text]"
But they gave a [intent.primary] response.

Rephrase the question warmly and clearly.
Tone: [intent.suggestedTone || 'empathetic']
Keep it short and kind."

Fallback: "Got it! Just to clarify: [currentQuestion.text]"

Returns the rephrased question with the SAME question's buttons (re-ask).`,
    },
  },
  {
    id: 'intel-save-flow',
    type: 'flowNode',
    position: { x: 500, y: 780 },
    data: {
      label: 'Intel Save (Background)',
      role: 'Background intel save',
      file: 'smart/route.ts',
      line: '406-441',
      fullPath: 'app/api/chat/smart/route.ts',
      nodeType: 'intel',
      summary: 'Background process that saves objections and clarification questions as intel items in MongoDB. Runs async, never blocks the conversation.',
      promptText: `Fires in background when:
- Intent is "clarification_question" or "objection"
- clientIdentifier exists
- freeText length > 15 characters

Saves to MongoDB intelItems collection:
{
  clientId,
  conversationId,
  type: objection ? "pain_point" : "question",
  content: freeText,
  summary: freeText.slice(0, 120),
  tags: [extracted from keyword list],
  environment: "test" | "production",
  createdAt: new Date()
}

Does NOT block the response — runs as fire-and-forget async.`,
    },
  },

  // Row 7
  {
    id: 'reply-generation',
    type: 'flowNode',
    position: { x: 300, y: 900 },
    data: {
      label: 'LLM: Reply Generation',
      role: 'LLM prompt (gpt-4o-mini)',
      file: 'smart/route.ts',
      line: '492-503',
      fullPath: 'app/api/chat/smart/route.ts',
      nodeType: 'llm_prompt',
      summary: "LLM call that crafts a warm, natural acknowledgment of the user's answer and transitions to the next question (or celebrates completion).",
      promptText: `System prompt sent to gpt-4o-mini (temperature: 0.75, max_tokens: 160):

"You are a friendly AI assistant for [offerLabel].

User just answered: "[answerValue]"
They were asked: "[currentQuestion.text]"
[Next question will be: "[nextQuestionText]" | This was the final question.]

Reply in 2-3 warm, natural sentences:
- Acknowledge their answer positively
- Add brief context or excitement
- [Smoothly transition to the next question | Celebrate completion and build excitement]

Be kind, human, and engaging."

Used after every successful answer extraction (both button clicks and direct text answers).`,
    },
  },
  {
    id: 'schema-normalization',
    type: 'flowNode',
    position: { x: 600, y: 900 },
    data: {
      label: 'LLM: Schema Normalization',
      role: 'Background LLM (gpt-4o-mini)',
      file: 'normalizeToRealEstateSchema.ts',
      line: '7-46',
      fullPath: 'src/lib/openai/normalizers/normalizeToRealEstateSchema.ts',
      nodeType: 'llm_prompt',
      summary: 'Background LLM call that continuously rebuilds a structured JSON lead profile from all raw Q&A pairs collected so far.',
      promptText: `Background normalization — runs after every answer extraction but does NOT block the response.

Prompt sent to gpt-4o-mini (temperature: 0, max_tokens: 500, JSON mode):

"You are an expert real estate AI assistant specialized in understanding buyer/seller intent from natural conversation.

Your task: Convert the user's raw answers into a clean, structured real estate profile.

Conversation flow: [buy|sell|browse]

Raw Q&A from user:
Q: "[question1]" A: "[answer1]"
Q: "[question2]" A: "[answer2]"
...

Extract ONLY what you are 100% confident about. Never guess or hallucinate values.

Return JSON with keys: intent, budget, timeline, bedrooms, bathrooms, propertyType, mustHaves, niceToHaves, locations, firstTimeBuyer, preapproved, financingType, email, name, phone"`,
    },
  },

  // Row 8 — Completion / Error
  {
    id: 'flow-complete',
    type: 'flowNode',
    position: { x: 300, y: 1020 },
    data: {
      label: 'Contact Modal',
      role: 'Flow completion',
      file: 'sendMessageHandler.ts',
      line: '239-241',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'completion',
      summary: 'Fires when all questions are answered. Shows the contact modal to capture name, email, and phone — the final conversion step.',
      promptText: `Triggered when isFlowComplete() returns true OR there is no next question.

Sets in store:
{
  showContactModal: true,
  isComplete: true,
  shouldCelebrate: true,
  progress: 100,
}

Final assistant message before modal:
data.reply || "Perfect! Let me get your contact info to send your personalized timeline."

The contact modal collects name, email, phone for lead capture.`,
    },
  },
  {
    id: 'error-fallback',
    type: 'flowNode',
    position: { x: 600, y: 1020 },
    data: {
      label: 'Error Fallback',
      role: 'Error handler',
      file: 'sendMessageHandler.ts',
      line: '286-290',
      fullPath: 'src/stores/chatStore/actions/sendMessageHandler.ts',
      nodeType: 'error',
      summary: 'Catch-all error handler. Shows a retry message if the API call fails. Does not advance the question so the user can try again.',
      promptText: `Catch block in sendMessageHandler — triggered when /api/chat/smart fails.

Error message shown to user:
"I'm sorry, I encountered an error. Please try again."

Sets loading: false.
Does not advance the question — user can retry.`,
    },
  },
];

// ————————————————————————
// Edge lookup: nodeId → outgoing edges
// ————————————————————————

export interface OutgoingEdge {
  targetId: string;
  targetLabel: string;
  edgeLabel: string;
}

// Built lazily on first access
let _outgoingMap: Record<string, OutgoingEdge[]> | null = null;

export function getOutgoingEdges(nodeId: string): OutgoingEdge[] {
  if (!_outgoingMap) {
    const nodeMap = new Map(flowNodes.map((n) => [n.id, n.data.label]));
    _outgoingMap = {};
    for (const edge of flowEdges) {
      const entry: OutgoingEdge = {
        targetId: edge.target,
        targetLabel: nodeMap.get(edge.target) || edge.target,
        edgeLabel: (edge.label as string) || '',
      };
      (_outgoingMap[edge.source] ??= []).push(entry);
    }
  }
  return _outgoingMap[nodeId] || [];
}

// ————————————————————————
// Edge lookup: nodeId → incoming edges
// ————————————————————————

export interface IncomingEdge {
  sourceId: string;
  sourceLabel: string;
  edgeLabel: string;
}

let _incomingMap: Record<string, IncomingEdge[]> | null = null;

export function getIncomingEdges(nodeId: string): IncomingEdge[] {
  if (!_incomingMap) {
    const nodeMap = new Map(flowNodes.map((n) => [n.id, n.data.label]));
    _incomingMap = {};
    for (const edge of flowEdges) {
      const entry: IncomingEdge = {
        sourceId: edge.source,
        sourceLabel: nodeMap.get(edge.source) || edge.source,
        edgeLabel: (edge.label as string) || '',
      };
      (_incomingMap[edge.target] ??= []).push(entry);
    }
  }
  return _incomingMap[nodeId] || [];
}

// ————————————————————————
// Edges
// ————————————————————————

export const flowEdges: Edge[] = [
  // Initial greeting → pre-flow responses (keyword detection)
  { id: 'e-ig-buy', source: 'initial-greeting', target: 'preflow-buy', label: 'types buy keyword', type: 'smoothstep', animated: true },
  { id: 'e-ig-sell', source: 'initial-greeting', target: 'preflow-sell', label: 'types sell keyword', type: 'smoothstep', animated: true },
  { id: 'e-ig-greet', source: 'initial-greeting', target: 'preflow-greeting', label: 'types greeting', type: 'smoothstep', animated: true },
  { id: 'e-ig-question', source: 'initial-greeting', target: 'preflow-question', label: 'asks question', type: 'smoothstep', animated: true },
  { id: 'e-ig-general', source: 'initial-greeting', target: 'preflow-general', label: 'general text', type: 'smoothstep', animated: true },

  // Initial greeting → offer selection (clicks button)
  { id: 'e-ig-offer', source: 'initial-greeting', target: 'offer-selection', label: 'clicks Buy or Sell button', type: 'smoothstep', style: { strokeWidth: 2 } },

  // Pre-flow → offer selection
  { id: 'e-pfbuy-offer', source: 'preflow-buy', target: 'offer-selection', label: 'clicks button', type: 'smoothstep' },
  { id: 'e-pfsell-offer', source: 'preflow-sell', target: 'offer-selection', label: 'clicks button', type: 'smoothstep' },
  { id: 'e-pfgreet-offer', source: 'preflow-greeting', target: 'offer-selection', label: 'clicks button', type: 'smoothstep' },
  { id: 'e-pfq-offer', source: 'preflow-question', target: 'offer-selection', label: 'clicks button', type: 'smoothstep' },
  { id: 'e-pfgen-offer', source: 'preflow-general', target: 'offer-selection', label: 'clicks button', type: 'smoothstep' },

  // Offer → intent
  { id: 'e-offer-intent', source: 'offer-selection', target: 'intent-selection', label: 'selects Buy or Sell', type: 'smoothstep', style: { strokeWidth: 2 } },

  // Intent → display question
  { id: 'e-intent-display', source: 'intent-selection', target: 'display-question', label: 'questions loaded', type: 'smoothstep', style: { strokeWidth: 2 } },

  // Display question → direct answer (button click)
  { id: 'e-display-direct', source: 'display-question', target: 'direct-answer', label: 'clicks button', type: 'smoothstep' },

  // Display question → intent classification (free text)
  { id: 'e-display-classify', source: 'display-question', target: 'intent-classification', label: 'types free text', type: 'smoothstep' },

  // Intent classification → direct answer
  { id: 'e-classify-direct', source: 'intent-classification', target: 'direct-answer', label: 'direct_answer', type: 'smoothstep' },

  // Intent classification → rephrase
  { id: 'e-classify-rephrase', source: 'intent-classification', target: 'rephrase-prompt', label: 'clarification / objection', type: 'smoothstep' },

  // Rephrase → intel save (dashed)
  { id: 'e-rephrase-intel', source: 'rephrase-prompt', target: 'intel-save-flow', label: 'msg > 15 chars', type: 'smoothstep', style: { strokeDasharray: '5 5' } },

  // Rephrase → re-ask question
  { id: 'e-rephrase-display', source: 'rephrase-prompt', target: 'display-question', label: 're-ask same question', type: 'smoothstep', animated: true },

  // Direct answer → reply generation
  { id: 'e-direct-reply', source: 'direct-answer', target: 'reply-generation', type: 'smoothstep', style: { strokeWidth: 2 } },

  // Direct answer → schema normalization (dashed, background)
  { id: 'e-direct-schema', source: 'direct-answer', target: 'schema-normalization', label: 'background', type: 'smoothstep', style: { strokeDasharray: '5 5' } },

  // Reply generation → display question (more questions)
  { id: 'e-reply-display', source: 'reply-generation', target: 'display-question', label: 'more questions', type: 'smoothstep', animated: true },

  // Reply generation → flow complete
  { id: 'e-reply-complete', source: 'reply-generation', target: 'flow-complete', label: 'no more questions', type: 'smoothstep', style: { strokeWidth: 2 } },

  // Display question → error fallback (dashed)
  { id: 'e-display-error', source: 'display-question', target: 'error-fallback', label: 'API error', type: 'smoothstep', style: { strokeDasharray: '5 5' } },
];
