// app/results/page.tsx
"use client";

import  { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useChatStore, selectLlmOutput, selectIsComplete } from "@/stores/chatStore";
import { LlmOutput } from "@/types/componentSchema";
import { GenerationDebugInfo } from "@/stores/chatStore";
import { GenerationSummary } from "@/components/ux/resultsComponents/generationSummary";
import { ErrorBoundary } from "@/components/errorBoundary";
import { 
  GenericOutputDisplay, 
  GenericContentCard, 
  GenericKeyValueList,
  CompactDebugPanel 
} from "@/components/ux/resultsComponents/genericOutput";
import { 
  isSimpleContent, 
  isKeyValueData, 
  isValidOutputComponent 
} from "@/types/genericOutput.types";

const STORAGE_KEY = "llmResultsCache";
const DEBUG_STORAGE_KEY = "llmDebugCache";

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localDebugInfo, setLocalDebugInfo] = useState<GenerationDebugInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const llmOutput = useChatStore(selectLlmOutput);
  const isComplete = useChatStore(selectIsComplete);
  const setLlmOutput = useChatStore((s) => s.setLlmOutput);
  const zustandDebugInfo = useChatStore(state => state.debugInfo);

  // Wait for client-side hydration before accessing Zustand/store
  useEffect(() => {
    setIsHydrated(true);
    console.log('✅ Results page hydrated');
  }, []);

  // Sync zustand debugInfo to local state when it changes
  useEffect(() => {
    if (zustandDebugInfo) {
      try {
        console.log("Zustand debugInfo detected, syncing to local state");
        setLocalDebugInfo(zustandDebugInfo);
        // Also cache it
        if (typeof window !== 'undefined') {
          localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(zustandDebugInfo));
        }
      } catch (err) {
        console.error('Error syncing debug info:', err);
      }
    }
  }, [zustandDebugInfo]);
  
  // Load from cache on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const loadFromCache = (): LlmOutput | null => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) {
          console.log("No cached data found in localStorage");
          return null;
        }

        const parsed = JSON.parse(cached);
        console.log("Parsed cached data:", parsed);
        
        // More flexible validation - just check that it's an object with at least one component
        if (parsed && typeof parsed === "object") {
          const componentKeys = Object.keys(parsed).filter(key => 
            key !== '_debug' && 
            parsed[key] !== null && 
            parsed[key] !== undefined && 
            typeof parsed[key] === 'object'
          );
          if (componentKeys.length > 0) {
            console.log("✅ Cache hit: Loaded LLM result from localStorage");
            console.log("Available components:", componentKeys);
            return parsed as LlmOutput;
          } else {
            console.warn("⚠️ Cached data exists but no valid components found");
            console.warn("Cached data keys:", Object.keys(parsed));
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse cached LLM data:", err);
        console.error("Error details:", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        // Clear corrupted cache
        try {
          localStorage.removeItem(STORAGE_KEY);
          console.log("Cleared corrupted cache");
        } catch (clearErr) {
          console.error("Failed to clear corrupted cache:", clearErr);
        }
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
  
  // Catch any unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('❌ Unhandled error:', event.error);
      console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
      setError(`An error occurred: ${event.message || 'Unknown error'}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
      setError(`An error occurred: ${event.reason?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Detect when Zustand has fresh output (only after hydration)
  useEffect(() => {
    if (!isHydrated) {
      console.log("⏳ Waiting for hydration...");
      return;
    }

    console.log("🔍 Checking for llmOutput (hydrated):", {
      hasLlmOutput: !!llmOutput,
      isComplete,
      llmOutputKeys: llmOutput ? Object.keys(llmOutput) : [],
    });

    if (llmOutput) {
      console.log("✅ Zustand llmOutput ready:", llmOutput);
      console.log("Output keys:", Object.keys(llmOutput));
      setLoading(false);
    } else if (isComplete) {
      console.log("⏳ Chat complete, awaiting results...");
      // Set a timeout to show error if results don't arrive
      const timeout = setTimeout(() => {
        if (!llmOutput) {
          console.error("⚠️ Results not received after completion");
          setError("Results are taking longer than expected. Please try refreshing the page.");
          setLoading(false);
        }
      }, 10000); // 10 second timeout
      return () => clearTimeout(timeout);
    } else {
      // Not complete and no output - might be a fresh page load
      console.log("ℹ️ No output yet, checking cache...");
    }
  }, [llmOutput, isComplete, isHydrated]);

  // CLEAR CACHE + ZUSTAND WHEN LEAVING PAGE
  useEffect(() => {
    return () => {
      console.log("Leaving /results → clearing cache and LLM output");
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DEBUG_STORAGE_KEY);
      // setLlmOutput(null); // clear Zustand store if needed
    };
  }, []);

  // Loading state - show loading until hydrated
  if (!isHydrated || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-100 p-6">
        <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
        <div className="text-center max-w-md">
          <p className="text-lg font-medium text-blue-900">
            {!isHydrated
              ? "Initializing..."
              : llmOutput
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

  // Render components conditionally - only show what's available
  const data = llmOutput;
  
  // Wrap in try-catch for safety
  let availableComponents: string[] = [];
  try {
    availableComponents = Object.keys(data).filter(key => 
      key !== '_debug' && 
      data[key] !== null && 
      data[key] !== undefined && 
      typeof data[key] === 'object'
    );
  } catch (err) {
    console.error('❌ Error processing llmOutput:', err);
    console.error('llmOutput data:', data);
    setError('Error processing results data. Please try again.');
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
          <h2 className="text-xl font-bold">Error Processing Results</h2>
          <p className="mt-2">An error occurred while processing the results data.</p>
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

  if (availableComponents.length === 0) {
    console.error('❌ No valid components found in llmOutput');
    console.error('Full llmOutput:', JSON.stringify(data, null, 2));
    console.error('llmOutput type:', typeof data);
    console.error('llmOutput keys:', Object.keys(data || {}));
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
          <h2 className="text-xl font-bold">Invalid Results Data</h2>
          <p className="mt-2">No valid components found in the results data.</p>
          <p className="mt-2 text-sm text-red-600">Please check the console for more details.</p>
          <p className="mt-2 text-xs text-red-500">Data keys: {Object.keys(data || {}).join(', ') || 'none'}</p>
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

  console.log('✅ Available components:', availableComponents);

  // Filter out debug data from main output
  const { _debug, ...mainOutput } = data;
  
  // Convert main output to array of entries for flexible rendering
  const outputEntries = Object.entries(mainOutput).filter(([key, value]) => 
    isValidOutputComponent(value)
  );

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Main Generation Summary - Always show if debug info exists */}
          {localDebugInfo && (
            <ErrorBoundary
              fallback={
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">Error rendering generation summary</p>
                </div>
              }
            >
              <GenerationSummary
                metadata={localDebugInfo.qdrantRetrieval}
                promptLength={localDebugInfo.promptLength}
                adviceUsed={localDebugInfo.adviceUsed}
                generationTime={localDebugInfo.generationTime}
                userInput={localDebugInfo.userInput}
                flow={localDebugInfo.flow}  
              />
            </ErrorBoundary>
          )}

          {/* Generic LLM Output Display */}
          {outputEntries.length > 0 && (
            <div className="space-y-6">
              {outputEntries.map(([key, value], index) => {
                // Use type guards to determine the best component type
                const isSimple = isSimpleContent(value);
                const isKeyValue = !isSimple && isKeyValueData(value);

                return (
                  <ErrorBoundary
                    key={key}
                    fallback={
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Error rendering {key}</p>
                      </div>
                    }
                  >
                    {isSimple ? (
                      <GenericContentCard
                        title={(value as { title?: string; heading?: string }).title || 
                               (value as { heading?: string }).heading || 
                               key.replace(/([A-Z])/g, ' $1').trim()}
                        content={(value as { content?: string; text?: string; message?: string }).content || 
                                 (value as { text?: string; message?: string }).text || 
                                 (value as { message?: string }).message || 
                                 JSON.stringify(value, null, 2)}
                        type="info"
                        className="w-full"
                      />
                    ) : isKeyValue ? (
                      <GenericKeyValueList
                        data={value as Record<string, import('@/types/genericOutput.types').OutputValue>}
                        title={key.replace(/([A-Z])/g, ' $1').trim()}
                        className="w-full"
                      />
                    ) : (
                      <GenericOutputDisplay
                        data={value as Record<string, import('@/types/genericOutput.types').OutputValue>}
                        title={key.replace(/([A-Z])/g, ' $1').trim()}
                        className="w-full"
                      />
                    )}
                  </ErrorBoundary>
                );
              })}
            </div>
          )}

          {/* Compact Debug Panel - Fixed position */}
          <CompactDebugPanel debugInfo={localDebugInfo} />
        </div>
      </main>
    </ErrorBoundary>
  );
}