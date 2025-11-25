// app/api/test-component/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildMultiComponentPromptWithMetadata } from "@/lib/openai/prompts";
import { ComponentSchema } from "@/types";
import { LlmOutput } from "@/types/componentSchema";
import { ACTION_PLAN_SCHEMA } from "@/components/ux/resultsComponents/actionPlan/schema";
import {
  HERO_BANNER_SCHEMA,
  PROFILE_SUMMARY_SCHEMA,
  PERSONAL_MESSAGE_SCHEMA,
  MARKET_INSIGHTS_SCHEMA,
  NEXT_STEPS_CTA_SCHEMA,
} from "@/components/ux/resultsComponents";

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

function isValidLlmOutput(obj: unknown): obj is LlmOutput {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  
  // More flexible validation - just check that it's an object with at least one component
  // Exclude _debug from component count
  const componentKeys = Object.keys(o).filter(key => 
    key !== '_debug' && 
    o[key] !== null && 
    o[key] !== undefined && 
    typeof o[key] === 'object'
  );
  
  // Valid if we have at least one component
  return componentKeys.length > 0;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now(); // Track start time
  console.log("POST /api/test-component – Request received");

  try {
    // 1. Parse request body
    let body: unknown;
    try {
      body = await req.json();
      console.log("Parsed request body:", body);
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // 2. Validate input shape
    if (!body || typeof body !== "object") {
      console.error("Request body is not an object");
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { flow, userInput } = body as {
      flow?: unknown;
      userInput?: unknown;
    };

    if (typeof flow !== "string" || !flow) {
      console.error("Invalid 'flow':", flow);
      return NextResponse.json(
        { error: "'flow' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!userInput || typeof userInput !== "object" || userInput === null) {
      console.error("Invalid 'userInput':", userInput);
      return NextResponse.json(
        { error: "'userInput' is required and must be a non-null object" },
        { status: 400 }
      );
    }

    const typedUserInput = userInput as Record<string, string>;
    console.log(`Valid input → flow: "${flow}"`);
    console.log(`userInput keys: [${Object.keys(typedUserInput).join(", ")}]`);

    // 3. Build prompt with metadata
    console.log("Building multi-component prompt...");
    const { prompt, metadata } = await buildMultiComponentPromptWithMetadata(
      DEFAULT_SCHEMAS,
      flow,
      typedUserInput,
      process.env.AGENT_ID!
    );

    console.log(`\n📊 Qdrant Retrieval Summary:`);
    metadata.forEach((meta) => {
      console.log(`   📦 ${meta.collection} (${meta.type}): ${meta.count} items`);
      meta.items.forEach((item, i) => {
        if (meta.type === "rule") {
          console.log(`      ${i + 1}. ${item.title} (score: ${item.score?.toFixed(2)})`);
        } else {
          console.log(`      ${i + 1}. ${item.title}`);
        }
      });
    });

    console.log(`Prompt built. Length: ${prompt.length} characters`);

    // 4. Call OpenAI
    console.log("Calling OpenAI (gpt-4o-mini)...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content?.trim() ?? "";
    console.log(`Raw LLM response received. Length: ${raw.length}`);

    if (!raw) {
      console.error("LLM returned empty response");
      return NextResponse.json(
        { error: "LLM returned an empty response" },
        { status: 500 }
      );
    }

    // 5. Parse JSON
    let parsed: LlmOutput;
    try {
      parsed = JSON.parse(raw);
      console.log("JSON parsed successfully");
    } catch (parseErr) {
      console.error("Failed to parse LLM JSON:", parseErr);
      return NextResponse.json(
        {
          error: "LLM did not return valid JSON",
          raw,
        },
        { status: 500 }
      );
    }

    // 6. Validate output shape
    if (!isValidLlmOutput(parsed)) {
      console.error("LLM output does not match LlmOutput schema");
      return NextResponse.json(
        {
          error: "LLM output does not match expected schema",
          received: parsed,
        },
        { status: 500 }
      );
    }

    // 7. Calculate generation time
    const generationTime = (Date.now() - startTime) / 1000;

    console.log("LLM output validated. Returning result with debug info.");
    console.log(`Total generation time: ${generationTime.toFixed(2)}s`);

    // 8. Return with debug info
    return NextResponse.json({
      ...parsed,
      _debug: {
        qdrantRetrieval: metadata,
        promptLength: prompt.length,
        adviceUsed: metadata.reduce((sum, m) => sum + m.count, 0),
        generationTime,
        userInput: typedUserInput,  // ADD THIS
        flow: flow,     
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Unexpected error in /api/test-component:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}