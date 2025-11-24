// app/results/page.tsx
"use client";

import  { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { useChatStore, selectLlmOutput, selectIsComplete } from "@/stores/chatStore";
import { LlmOutput } from "@/types/componentSchema";
import { ActionPlan, LlmProfileSummary, MarketInsights, NextStepsCTA, PersonalMessage } from "@/components/ux/resultsComponents";

import { GenerationDebugInfo } from "@/stores/chatStore";
import { GenerationSummary } from "@/components/ux/resultsComponents/generationSummary";

const STORAGE_KEY = "llmResultsCache";
const DEBUG_STORAGE_KEY = "llmDebugCache";

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localDebugInfo, setLocalDebugInfo] = useState<GenerationDebugInfo | null>(null);

  const llmOutput = useChatStore(selectLlmOutput);
  const isComplete = useChatStore(selectIsComplete);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput);
  const zustandDebugInfo = useChatStore(state => state.debugInfo);

  // Sync zustand debugInfo to local state when it changes
  useEffect(() => {
    if (zustandDebugInfo) {
      console.log("Zustand debugInfo detected, syncing to local state");
      setLocalDebugInfo(zustandDebugInfo);
      // Also cache it
      localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(zustandDebugInfo));
    }
  }, [zustandDebugInfo]);
  
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

    const loadDebugFromCache = (): GenerationDebugInfo | null => {
      try {
        const cached = localStorage.getItem(DEBUG_STORAGE_KEY);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        console.log("Cache hit: Loaded debug info from localStorage");
        return parsed as GenerationDebugInfo;
      } catch (err) {
        console.warn("Failed to parse cached debug data:", err);
      }
      return null;
    };

    const cached = loadFromCache();
    const cachedDebug = loadDebugFromCache();
    
    if (cached) {
      setLlmOutput(cached);
      setLoading(false);
    }
    
    if (cachedDebug) {
      setLocalDebugInfo(cachedDebug);
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
      localStorage.removeItem(DEBUG_STORAGE_KEY);
      // setLlmOutput(null); // clear Zustand store if needed
    };
  }, []);

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

  // Validate data before rendering
  if (!llmOutput) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-yellow-50 p-6 text-yellow-800 shadow-md">
          <h2 className="text-xl font-bold">No Results Available</h2>
          <p className="mt-2">No results data found. Please complete the chat to generate results.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Validate that all required fields exist
  const data = llmOutput;
  const missingFields: string[] = [];
  
  if (!data.hero) missingFields.push('hero');
  if (!data.profileSummary) missingFields.push('profileSummary');
  if (!data.personalMessage) missingFields.push('personalMessage');
  if (!data.marketInsights) missingFields.push('marketInsights');
  if (!data.actionPlan) missingFields.push('actionPlan');
  if (!data.nextStepsCTA) missingFields.push('nextStepsCTA');

  if (missingFields.length > 0) {
    console.error('Missing required fields in llmOutput:', missingFields, 'Full data:', data);
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
          <h2 className="text-xl font-bold">Invalid Results Data</h2>
          <p className="mt-2">The results data is missing required fields: {missingFields.join(', ')}</p>
          <p className="mt-2 text-sm text-red-600">Please check the console for more details.</p>
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

  return (
    <main className="bg-blue-100">
      <LlmHerobanner data={data.hero} />
      <LlmProfileSummary data={data.profileSummary} />
      <PersonalMessage data={data.personalMessage} />
      <MarketInsights data={data.marketInsights} />
      <ActionPlan data={data.actionPlan} />
      <NextStepsCTA data={data.nextStepsCTA} />
      
      {/* Show debug info if available from either zustand or local state */}
      {localDebugInfo && (
        <GenerationSummary
          metadata={localDebugInfo.qdrantRetrieval}
          promptLength={localDebugInfo.promptLength}
          adviceUsed={localDebugInfo.adviceUsed}
          generationTime={localDebugInfo.generationTime}
          userInput={localDebugInfo.userInput}  // ADD THIS
          flow={localDebugInfo.flow}  
        />
      )}
    </main>
  );
}