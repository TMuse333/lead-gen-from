import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface GenerateQuestionsRequest {
  businessName: string;
  industry: string;
  flows: string[]; // ['buy', 'sell', 'browse']
  customPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await req.json();
    const { businessName, industry, flows, customPrompt } = body;

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "businessName and industry are required" },
        { status: 400 }
      );
    }

    const validFlows = flows.filter((f) => ['buy', 'sell', 'browse'].includes(f));
    if (validFlows.length === 0) {
      return NextResponse.json(
        { error: "At least one valid flow (buy/sell/browse) is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert at creating knowledge base questions for ${industry} businesses.

Business Context:
- Business Name: ${businessName}
- Industry: ${industry}
- Flows: ${validFlows.join(', ')}

Generate 8-12 questions that will help ${businessName} create personalized advice content for their chatbot. These questions should:
1. Help extract their expertise and knowledge
2. Cover different scenarios their customers might face
3. Be specific to ${industry}
4. Relate to the flows: ${validFlows.join(', ')}
${customPrompt ? `\n5. ${customPrompt}` : ''}

Return a JSON object with a "questions" array. Each question should:
- Be clear and specific
- Help extract actionable advice
- Be answerable in 2-4 sentences
- Not end with a question mark (they're prompts, not questions)

Example format:
{
  "questions": [
    "What are the most common mistakes first-time buyers make",
    "How do you help sellers prepare their home for listing",
    ...
  ]
}

Return ONLY the JSON object, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates knowledge extraction questions. Return a JSON object with a 'questions' array." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const raw = completion.choices[0].message.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from LLM" },
        { status: 500 }
      );
    }

    let parsed: { questions?: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      return NextResponse.json(
        { error: "LLM did not return valid JSON", raw },
        { status: 500 }
      );
    }

    const questions = parsed.questions || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions generated" },
        { status: 500 }
      );
    }

    // Clean and validate questions
    const cleanedQuestions = questions
      .filter((q) => typeof q === 'string' && q.trim().length > 10)
      .map((q) => q.trim())
      .slice(0, 12); // Limit to 12 questions

    return NextResponse.json({ questions: cleanedQuestions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}

