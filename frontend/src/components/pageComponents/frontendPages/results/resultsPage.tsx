"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { LlmProfileSummary } from "@/components/ux/resultsComponents/profileSummary";
import { PersonalMessage } from "@/components/ux/resultsComponents/personalMessage";
import { MarketInsights } from "@/components/ux/resultsComponents/marketInsights";

import type { LlmOutput } from "@/types";
import { useChatStore, selectLlmOutput, selectIsComplete } from "@/stores/chatStore";
import { ActionPlan } from "@/components/ux/resultsComponents/actionPlan";
import { NextStepsCTA } from "@/components/ux/resultsComponents/cta";

const STORAGE_KEY = "llmResultsCache";

export default function ResultsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Zustand selectors
  const llmOutput = useChatStore(selectLlmOutput);
  const isComplete = useChatStore(selectIsComplete);

  // 1. Try to load from localStorage cache first
  useEffect(() => {
    const loadFromCache = (): LlmOutput | null => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        if (
          parsed &&
          typeof parsed.hero === "object" &&
          typeof parsed.profileSummary === "object"
        ) {
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
      // Sync cache → Zustand (optional)
      useChatStore.getState().setLlmOutput(cached);
      setLoading(false);
    }
  }, []);

  // 2. Wait for Zustand to have llmOutput
  useEffect(() => {
    if (llmOutput) {
      console.log("Zustand llmOutput ready:", llmOutput);
      setLoading(false);
    } else if (isComplete) {
      console.log("Chat complete, but no llmOutput yet → waiting...");
    }
  }, [llmOutput, isComplete]);

  // Render states
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-100 p-6">
        <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
        <div className="text-center max-w-md">
          <p className="text-lg font-medium text-blue-900">
            {llmOutput
              ? "Loading from cache…"
              : isComplete
              ? "Finalizing your report…"
              : "Waiting for your answers…"}
          </p>
          {!isComplete && (
            <p className="mt-2 text-sm text-blue-700">
              Complete the chat to see your personalized results
            </p>
          )}
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

  // Safe render: llmOutput is guaranteed
  const data = llmOutput!;

  return (
    <main className="bg-blue-100">
      <LlmHerobanner data={data.hero} />
      <LlmProfileSummary data={data.profileSummary} />
      <PersonalMessage data={data.personalMessage} />
      <MarketInsights data={data.marketInsights} />
      <ActionPlan data={data.actionPlan}
      />
      <NextStepsCTA data={data.nextStepsCTA}/>
      {/* Add more as they become available */}
    </main>
  );
}