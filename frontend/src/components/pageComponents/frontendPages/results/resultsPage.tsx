// app/results/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { LlmProfileSummary } from "@/components/ux/resultsComponents/profileSummary";
import { PersonalMessage } from "@/components/ux/resultsComponents/personalMessage";
import { MarketInsights } from "@/components/ux/resultsComponents/marketInsights";
// import { ActionPlan } from "@/components/ux/resultsComponents/actionPlan";
// import { NextStepsCTA } from "@/components/ux/resultsComponents/cta";

import type { LlmOutput } from "@/types";

/* --------------------------------------------------------------
   MAIN PAGE
   -------------------------------------------------------------- */
export default function ResultsPage() {
  const [llmData, setLlmData] = useState<LlmOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------------------------------------
     Payload – replace with your real source (context, store, etc.)
     ----------------------------------------------------------- */
  const payload = {
    flow: "sell",
    userInput: {
      propertyType: "single-family house",
      propertyAge: "10-20",
      renovations: "kitchen",
      timeline: "0-3",
      sellingReason: "relocating",
      email: "jane@example.com",
    },
  };

  /* -----------------------------------------------------------
     API call
     ----------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.post<LlmOutput>(
          "/api/test-component",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        setLlmData(data);
        console.log('data',data)
      } catch (err: any) {
        const msg = err.response?.data?.error ?? err.message ?? "Unknown error";
        console.error("[LLM API] error:", err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* -----------------------------------------------------------
     Render – Loading with Lucide spinner
     ----------------------------------------------------------- */
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-blue-100 p-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-blue-900">
          Generating your personalized report…
        </p>
      </main>
    );
  }

  /* -----------------------------------------------------------
     Render – Error state
     ----------------------------------------------------------- */
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* -----------------------------------------------------------
     Render – Success (ActionPlan & NextStepsCTA commented out)
     ----------------------------------------------------------- */
  const data = llmData!;

  return (
    <main className="bg-blue-100">
      <LlmHerobanner data={data.hero} />
      <LlmProfileSummary data={data.profileSummary} />
      <PersonalMessage data={data.personalMessage} />
      {/* <ActionPlan data={data.actionPlan} /> */}
      <MarketInsights data={data.marketInsights} />
      {/* <NextStepsCTA data={data.nextStepsCTA} /> */}
    </main>
  );
}