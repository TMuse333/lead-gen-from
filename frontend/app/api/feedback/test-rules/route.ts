// app/api/feedback/test-rules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllActionSteps } from "@/lib/qdrant/collections/rules/actionSteps/admin";
import { calculateMatchScore } from "@/lib/qdrant/engines/rules";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, flow, userInput } = body;

    // Fetch all action steps
    const actionSteps = await getAllActionSteps(agentId);

    if (actionSteps.length === 0) {
      return NextResponse.json({
        error: "No action steps found for agent",
        agentId,
      });
    }

    // Test each action step
    const results = actionSteps.map((step) => {
      const score = calculateMatchScore(step, userInput, flow);

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
  // Default test case
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
