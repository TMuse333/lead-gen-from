// app/api/test-component/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildMultiComponentPrompt } from "@/lib/openai/prompts";
import {
  HERO_BANNER_SCHEMA,
  PROFILE_SUMMARY_SCHEMA,
  PERSONAL_MESSAGE_SCHEMA,
  MARKET_INSIGHTS_SCHEMA,
  ACTION_PLAN_SCHEMA,
  NEXT_STEPS_CTA_SCHEMA,
  ComponentSchema,
} from "@/types";

import path from "path";
import { readFile } from "fs/promises";

import type { LlmOutput } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const DEFAULT_SCHEMAS: ComponentSchema[] = [
  HERO_BANNER_SCHEMA,
  PROFILE_SUMMARY_SCHEMA,
  PERSONAL_MESSAGE_SCHEMA,
  MARKET_INSIGHTS_SCHEMA,
  ACTION_PLAN_SCHEMA,
  NEXT_STEPS_CTA_SCHEMA,
];

const SAMPLES_DIR = path.join(process.cwd(), "samples");

/* --------------------------------------------------------------
   POST handler – fully typed
   -------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const {flow, userInput} = await req.json();

    /* -----------------------------------------------------------
       1. Optional sample file
       ----------------------------------------------------------- */
    // let payload: {
    //   flow: string;
    //   userInput: Record<string, string>;
    //   agentKnowledge?: string[];
    //   sample?: string;
    // } = body;

    // if (payload.sample) {
    //   const filePath = path.join(SAMPLES_DIR, payload.sample);
    //   const fileContent = await readFile(filePath, "utf-8");
    //   payload = JSON.parse(fileContent);
    // }

    // const { flow, userInput, agentKnowledge = [] } = payload;

    // if (!flow || !userInput) {
    //   return NextResponse.json(
    //     { error: "Missing flow or userInput" },
    //     { status: 400 }
    //   );
    // }

    /* -----------------------------------------------------------
       2. Build prompt & call OpenAI
       ----------------------------------------------------------- */
    const prompt = buildMultiComponentPrompt(
      DEFAULT_SCHEMAS,
      flow,
      userInput,
      // agentKnowledge
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const raw = completion.choices[0].message.content?.trim() ?? "";

    /* -----------------------------------------------------------
       3. Parse JSON – we trust the LLM, so cast directly
       ----------------------------------------------------------- */
    const json: LlmOutput = JSON.parse(raw);

    /* -----------------------------------------------------------
       4. Return typed LlmOutput
       ----------------------------------------------------------- */
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}