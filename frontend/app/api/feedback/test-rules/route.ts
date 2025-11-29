// app/api/feedback/test-rules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllActionSteps } from "@/lib/qdrant/collections/rules/actionSteps/admin";
import { calculateMatchScore } from "@/lib/qdrant/engines/rules";

export async function POST(req: NextRequest) {
  console.log("\n🧪 ===== RULES ENGINE TEST =====\n");
  
  try {
    const body = await req.json();
    const { agentId, flow, userInput } = body;

    console.log("Test Parameters:");
    console.log("  Agent ID:", agentId);
    console.log("  Flow:", flow);
    console.log("  User Input:", JSON.stringify(userInput, null, 2));

    // Fetch all action steps
    console.log("\n📦 Fetching action steps...");
    const actionSteps = await getAllActionSteps(agentId);
    console.log(`✅ Retrieved ${actionSteps.length} action steps\n`);

    if (actionSteps.length === 0) {
      return NextResponse.json({
        error: "No action steps found for agent",
        agentId,
      });
    }

    // Test each action step
    const results = actionSteps.map((step, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎯 Testing Action Step ${index + 1}/${actionSteps.length}`);
      console.log(`   Title: ${step.title}`);
      console.log(`   ID: ${step.id}`);
      console.log(`   Applicable When:`, JSON.stringify(step.applicableWhen, null, 2));
      
      const score = calculateMatchScore(step, userInput, flow);
      
      console.log(`\n   📊 FINAL SCORE: ${score.toFixed(2)}`);
      console.log(`${'='.repeat(60)}\n`);

      return {
        id: step.id,
        title: step.title,
        description: step.description,
        score,
        matched: score > 0,
        applicableWhen: step.applicableWhen,
      };
    });

    // Sort by score
    const sorted = results.sort((a, b) => b.score - a.score);

    // Summary
    console.log("\n📊 ===== SUMMARY =====");
    console.log(`Total steps tested: ${results.length}`);
    console.log(`Steps that matched: ${sorted.filter(r => r.matched).length}`);
    console.log(`Top 5 scores:`);
    sorted.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}: ${r.score.toFixed(2)}`);
    });
    console.log("\n");

    return NextResponse.json({
      success: true,
      summary: {
        totalSteps: results.length,
        matchedSteps: sorted.filter(r => r.matched).length,
        topMatches: sorted.slice(0, 5),
      },
      allResults: sorted,
    });

  } catch (error) {
    console.error("❌ Error in test-rules:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing with default values
export async function GET() {
  console.log("\n🧪 Running GET test with default values\n");
  
  // Default test case from your logs
  const defaultTest = {
    agentId: "82ae0d4d-c3d7-4997-bc7b-12b2261d167e",
    flow: "buy",
    userInput: {
      propertyType: "Condo/Apartment",
      budget: "$600K - $800K",
      bedrooms: "4 bedrooms",
      timeline: "3-6 months",
      buyingReason: "Downsizing",
      email: "bobby@gmail.com"
    }
  };

  // Create a fake request
  const fakeReq = new NextRequest("http://localhost:3000/api/feedback/test-rules", {
    method: "POST",
    body: JSON.stringify(defaultTest),
  });

  return POST(fakeReq);
}