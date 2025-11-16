// components/FastTrackButton.tsx
"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useRouter } from "next/navigation";
import { Zap, X, Play, Loader2, ChevronRight } from "lucide-react";
import axios from "axios";
import { CONVERSATION_FLOWS } from "@/data/conversationFlows/conversationFlows";


type Flow = "buy" | "sell" | "browse";

interface Answers {
  [key: string]: string;
}

const PRESETS = {
  buy: {
    name: "Buyer – Upgrading Condo",
    answers: {
      propertyType: "condo",
      budget: "600k-800k",
      bedrooms: "4",
      timeline: "6-12",
      buyingReason: "upgrade",
      email: "jonathan@gmail.com",
    },
  },
  sell: {
    name: "Seller – Downsizing ASAP",
    answers: {
      propertyType: "condo",
      propertyAge: "10-20",
      renovations: "kitchen and bathroom",
      timeline: "0-3",
      sellingReason: "downsizing",
      email: "seller@example.com",
    },
  },
  browse: {
    name: "Investor – Downtown Halifax",
    answers: {
      interest: "investment",
      location: "downtown-halifax",
      priceRange: "over-800k",
      timeline: "6-12",
      goal: "invest",
      email: "investor@example.com",
    },
  },
};

export function FastTrackButton() {
  const router = useRouter();
  const { setCurrentFlow, addAnswer, setComplete, setLlmOutput, reset,
  setDebugInfo } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flow, setFlow] = useState<Flow>("buy");
  const [answers, setAnswers] = useState<Answers>({});
  

  const loadPreset = () => {
    setAnswers(PRESETS[flow].answers);
  };

  const runFastTrack = async () => {
    setIsLoading(true);
    reset();
    setCurrentFlow(flow);

    Object.entries(answers).forEach(([key, value]) => {
      addAnswer(key, value);
    });
    setComplete(true);

    try {
      const { data } = await axios.post("/api/test-component", {
        flow,
        userInput: answers,
      });

      const {_debug, llmOutput} = data

      setLlmOutput(llmOutput);
      localStorage.setItem("llmResultsCache", JSON.stringify(llmOutput));

      if (_debug) {
        setDebugInfo(_debug);
        localStorage.setItem("llmDebugCache", JSON.stringify(_debug));
        console.log('Debug info stored:', _debug);
      }

      router.push("/results");
      setIsOpen(false);
    } catch (err) {
      console.error("Fast Track failed", err);
      alert("Failed! Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const flowNodes = CONVERSATION_FLOWS[flow];
  const questions = Object.values(flowNodes).filter((node) => node.id !== "email" && node.buttons);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4 font-bold text-white shadow-2xl hover:scale-110 transition-all"
      >
        <Zap className="h-6 w-6" />
        Fast Track Testing
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Fast Track Testing</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-7 w-7" />
              </button>
            </div>

            {/* Flow Selector */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-3">Select Flow</label>
              <div className="flex gap-4">
                {(["buy", "sell", "browse"] as Flow[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFlow(f);
                      setAnswers({});
                    }}
                    className={`px-6 py-3 rounded-xl font-medium capitalize transition ${
                      flow === f
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {f === "buy" ? "Buying" : f === "sell" ? "Selling" : "Browsing"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Button */}
            <div className="mb-8">
              <button
                onClick={loadPreset}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:scale-105 transition"
              >
                Load {PRESETS[flow].name}
              </button>
            </div>

            {/* Questions with Real Buttons */}
            <div className="space-y-8">
              {questions.map((node) => {
                const currentAnswer = answers[node.mappingKey!];

                return (
                  <div key={node.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">{node.question}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {node.buttons!.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setAnswers({ ...answers, [node.mappingKey!]: btn.value })}
                          className={`px-5 py-3 rounded-lg font-medium transition flex items-center justify-between ${
                            currentAnswer === btn.value
                              ? "bg-indigo-600 text-white shadow-md"
                              : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{btn.label}</span>
                          {currentAnswer === btn.value && <ChevronRight className="h-5 w-5" />}
                        </button>
                      ))}
                    </div>
                    {currentAnswer && (
                      <p className="mt-3 text-sm text-indigo-600 font-medium">
                        Selected: {node.buttons!.find(b => b.value === currentAnswer)?.label}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Email Field */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <label className="block font-semibold text-gray-800 mb-3">Email</label>
                <input
                  type="email"
                  value={answers.email || ""}
                  onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={runFastTrack}
                disabled={isLoading || !answers.email}
                className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-60 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generating Results...
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6" />
                    Run & View Results
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}