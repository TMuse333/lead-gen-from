import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ConversationFlow } from "@/stores/conversationConfig/conversation.store";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface GenerateFlowRequest {
  flowType: 'buy' | 'sell' | 'browse';
  businessName: string;
  industry: string;
  customPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateFlowRequest = await req.json();
    const { flowType, businessName, industry, customPrompt } = body;

    if (!['buy', 'sell', 'browse'].includes(flowType)) {
      return NextResponse.json(
        { error: "flowType must be 'buy', 'sell', or 'browse'" },
        { status: 400 }
      );
    }

    // Build prompt for LLM to generate conversation flow
    const systemPrompt = `You are an expert at designing conversational flows for lead generation chatbots. Generate a complete conversation flow in JSON format that matches the structure of real estate chatbot flows.

The flow should:
1. Have 4-6 questions that naturally collect information
2. Use button options for most questions (3-4 options per question)
3. Include tracker messages (insight and dbMessage) for each button
4. Have at least one free-text question (usually email at the end)
5. Be engaging, conversational, and professional
6. Match the flow type: ${flowType}

Flow Type Context:
- "buy": For visitors looking to purchase (focus on budget, needs, timeline, dream home)
- "sell": For homeowners looking to sell (focus on property details, timeline, selling reason)
- "browse": For market researchers (focus on market insights, trends, curiosity)

Business Context:
- Business Name: ${businessName}
- Industry: ${industry}
${customPrompt ? `\nCustom Requirements: ${customPrompt}` : ''}

Return a JSON object matching this exact structure:
{
  "id": "${flowType}",
  "name": "Flow Name",
  "type": "${flowType}",
  "description": "Brief description",
  "flowPrompt": {
    "systemBase": "You are [business name]'s AI assistant...",
    "context": "Context about this flow type",
    "personality": "Personality traits"
  },
  "questions": [
    {
      "id": "questionId1",
      "question": "Question text?",
      "order": 1,
      "mappingKey": "mappingKey1",
      "buttons": [
        {
          "id": "buttonId1",
          "label": "Button Label",
          "value": "button-value",
          "tracker": {
            "insight": "Engaging insight message",
            "dbMessage": "Database activity message"
          }
        }
      ],
      "validation": { "required": true }
    }
  ]
}

Make sure:
- Each question has a unique id (use descriptive names like "propertyType", "timeline", etc.)
- mappingKey should match the question id or be descriptive
- tracker.insight should be engaging and personalized
- tracker.dbMessage should sound like database/analysis activity
- Include at least one question with allowFreeText: true (usually email)
- Questions should flow naturally from one to the next`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a ${flowType} conversation flow for ${businessName} in the ${industry} industry.` },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from LLM" },
        { status: 500 }
      );
    }

    let parsed: ConversationFlow;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      return NextResponse.json(
        { error: "LLM did not return valid JSON", raw },
        { status: 500 }
      );
    }

    // Validate and add metadata
    parsed.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      author: 'llm-generated',
    };

    // Ensure questions have proper structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "Generated flow missing questions array" },
        { status: 500 }
      );
    }

    // Ensure each question has required fields
    parsed.questions = parsed.questions.map((q, index) => ({
      ...q,
      order: q.order || index + 1,
      id: q.id || `question_${index + 1}`,
      mappingKey: q.mappingKey || q.id,
    }));

    return NextResponse.json({ flow: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate flow" },
      { status: 500 }
    );
  }
}

