// app/api/generate-landing-page/route.ts

import { generateLandingPagePrompt } from "@/lib/openai/prompts";
import { LANDING_PAGE_SCHEMAS, LlmOutput } from "@/types/resultsPageComponents/components";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  try {
    const { flow, userInput } = await req.json();
    
    // TODO: Replace with real Qdrant query
    const agentKnowledge = [
      "Chris specializes in Halifax real estate with 10+ years experience",
      "Current market favors sellers with low inventory and high demand",
      "Properties with recent kitchen renovations typically sell 15% faster"
    ];
    
    // TODO: Replace with real market data query
    const marketData = {
      averageDaysOnMarket: 28,
      marketTemperature: 'hot',
      priceGrowthYoY: '8.2%',
      activeListings: 145
    };
    
    // Build the prompt using ALL schemas in the registry
    const prompt = generateLandingPagePrompt(
      flow,
      userInput,
      marketData,
      agentKnowledge,
      LANDING_PAGE_SCHEMAS  // Uses the central registry
    );
    
    console.log('Generated prompt:', prompt);
    
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY!
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,  // Increased for multiple components
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse LLM response
    let responseText = data.content[0].text;
    
    // Strip potential markdown formatting
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const llmOutput: LlmOutput = JSON.parse(responseText);
    
    // Optional: Validate output against schemas
    // validateOutput(llmOutput, LANDING_PAGE_SCHEMAS);
    
    return NextResponse.json(llmOutput);
    
  } catch (error) {
    console.error('Error generating landing page:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate landing page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}