// app/api/generate-landing-page/route.ts

import { buildActionPlanPrompt } from "@/lib/openai/actionPlan";
import { generateUserEmbedding } from "@/lib/openai/userEmbedding";
import { queryActionSteps } from "@/lib/qdrant/actionSteps";
import { queryRelevantAdvice } from "@/lib/qdrant/qdrant";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import { readFile } from "fs/promises";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SAMPLES_DIR = path.join(process.cwd(), "samples");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let data: any = body;

    // --------------------------
    // Load from sample file if provided
    // --------------------------
    if (body.sample) {
      const filePath = path.join(SAMPLES_DIR, body.sample);
      console.log("📁 Loading sample file:", filePath);

      try {
        const content = await readFile(filePath, "utf-8");
        data = JSON.parse(content);
      } catch (err: any) {
        console.error("Error loading sample file:", err);
        return NextResponse.json(
          { error: `Failed to read or parse sample file: ${body.sample}` },
          { status: 400 }
        );
      }
    }

    const { flow, userInput, agentId } = data;

    if (!flow || !userInput || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields: flow, userInput, or agentId" },
        { status: 400 }
      );
    }

    // ==================== STEP 1: Query Qdrant ====================
    const embedding = await generateUserEmbedding(flow, userInput);

    const agentAdvice = await queryRelevantAdvice(agentId, embedding, flow, userInput, 5);
    const actionStepMatches = await queryActionSteps(agentId, flow, userInput, 5);

    // ==================== STEP 2: Build Prompt ====================
    const actionPlanPrompt = buildActionPlanPrompt(flow, userInput, actionStepMatches, agentAdvice);

    // ==================== STEP 3: OpenAI API ====================
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: actionPlanPrompt }],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const rawText = response.choices[0].message?.content?.trim() ?? "{}";

    // ==================== STEP 4: Parse & Return ====================
    const llmOutput = JSON.parse(rawText);

    return NextResponse.json({ success: true, data: llmOutput });
  } catch (error) {
    console.error("❌ Error generating landing page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate landing page" },
      { status: 500 }
    );
  }
}
