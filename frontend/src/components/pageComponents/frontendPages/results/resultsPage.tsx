// app/results/page.tsx (or wherever your ResultsPage lives)
"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { LlmProfileSummary } from "@/components/ux/resultsComponents/profileSummary";
import { PersonalMessage } from "@/components/ux/resultsComponents/personalMessage";
import { MarketInsights } from "@/components/ux/resultsComponents/marketInsights";
import { ActionPlan } from "@/components/ux/resultsComponents/actionPlan";
import { NextStepsCTA } from "@/components/ux/resultsComponents/cta";

import type { LlmOutput } from "@/types";
import { useChatStore, selectLlmOutput, selectIsComplete } from "@/stores/chatStore";

const STORAGE_KEY = "llmResultsCache";

export default function ResultsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const llmOutput = useChatStore(selectLlmOutput);
  const isComplete = useChatStore(selectIsComplete);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput); // for clearing

  // Load from cache on mount
  useEffect(() => {
    const loadFromCache = (): LlmOutput | null => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.hero === "object" && typeof parsed.profileSummary === "object") {
          console.log("Cache hit: Loaded LLM result from localStorage");
          return parsed as LlmOutput;
        }
      } catch (err) {
        console.warn("Failed to parse cached LLM data:", err);
      }
      return null;
    };

    const cached = loadFromCache();
    if (cached) {
      setLlmOutput(cached); // sync to Zustand
      setLoading(false);
    }
  }, [setLlmOutput]);

  // Detect when Zustand has fresh output
  useEffect(() => {
    if (llmOutput) {
      console.log("Zustand llmOutput ready:", llmOutput);
      setLoading(false);
    } else if (isComplete) {
      console.log("Chat complete, awaiting results...");
    }
  }, [llmOutput, isComplete]);

  // CLEAR CACHE + ZUSTAND WHEN LEAVING PAGE
  useEffect(() => {
    return () => {
      console.log("Leaving /results → clearing cache and LLM output");
      localStorage.removeItem(STORAGE_KEY);
      // setLlmOutput(null); // clear Zustand store
    };
  }, [setLlmOutput]);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-100 p-6">
        <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
        <div className="text-center max-w-md">
          <p className="text-lg font-medium text-blue-900">
            {llmOutput
              ? "Loading your report…"
              : isComplete
              ? "Finalizing your personalized results…"
              : "Complete the chat to see your results"}
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
          <h2 className="text-xl font-bold">Error</h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Safe render
  const data = llmOutput!;

  return (
    <main className="bg-blue-100">
      <LlmHerobanner data={data.hero} />
      <LlmProfileSummary data={data.profileSummary} />
      <PersonalMessage data={data.personalMessage} />
      <MarketInsights data={data.marketInsights} />
      <ActionPlan data={data.actionPlan} />
      <NextStepsCTA data={data.nextStepsCTA} />
    </main>
  );
}