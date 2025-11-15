// app/api/test-component/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {  buildMultiComponentPromptWithMetadata } from "@/lib/openai/prompts";
import {

  ComponentSchema,
} from "@/types";



import { LlmOutput } from "@/types/componentSchema";
import { ACTION_PLAN_SCHEMA } from "@/components/ux/resultsComponents/actionPlan/schema";
import { HERO_BANNER_SCHEMA, PROFILE_SUMMARY_SCHEMA,
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

console.log('all schemas',DEFAULT_SCHEMAS)

/* --------------------------------------------------------------
   Type guard: Validate LlmOutput shape
   -------------------------------------------------------------- */
function isValidLlmOutput(obj: unknown): obj is LlmOutput {
  if (!obj || typeof obj !== "object") return false;

  const o = obj as Record<string, unknown>;

  return (
    typeof o.hero === "object" &&
    o.hero !== null &&
    typeof o.profileSummary === "object" &&
    o.profileSummary !== null &&
    typeof o.personalMessage === "object" &&
    o.personalMessage !== null &&
    typeof o.marketInsights === "object" &&
    o.marketInsights !== null &&
    typeof o.actionPlan === "object" &&
    o.actionPlan !== null &&
    typeof o.nextStepsCTA === "object" &&
    o.nextStepsCTA !== null
  );
}

/* --------------------------------------------------------------
   POST handler – fully logged, typed, and validated
   -------------------------------------------------------------- */
export async function POST(req: NextRequest) {
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

    // 3. Build prompt
    console.log("Building multi-component prompt...");
    const { prompt, metadata } = await buildMultiComponentPromptWithMetadata(
      DEFAULT_SCHEMAS,
      flow,
      typedUserInput,
      process.env.AGENT_ID!
    );



    console.log(`\n📊 Qdrant Retrieval Summary:`);
    metadata.forEach(meta => {
      console.log(`   📦 ${meta.collection} (${meta.type}): ${meta.count} items`);
      meta.items.forEach((item, i) => {
        if (meta.type === 'rule') {
          console.log(`      ${i + 1}. ${item.title} (score: ${item.score?.toFixed(2)})`);
        } else {
          console.log(`      ${i + 1}. ${item.title}`);
        }
      });
    }); 


    console.log(`Prompt built. Length: ${prompt.length} characters`);
    console.log("Prompt preview:", prompt.slice(0, 500) + "...");

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
    console.log("Raw response preview:", raw.slice(0, 500));

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
      console.error("Raw LLM output:", raw);
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
      console.error("Received structure:", Object.keys(parsed as object));
      return NextResponse.json(
        {
          error: "LLM output does not match expected schema",
          received: parsed,
        },
        { status: 500 }
      );
    }

    console.log("LLM output validated. Returning result.");
    console.log("Final output keys:", Object.keys(parsed));

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Unexpected error in /api/test-component:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}