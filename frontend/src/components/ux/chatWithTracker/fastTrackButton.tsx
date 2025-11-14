// components/FastTrackButton.tsx
"use client";

import { useChatStore, selectLlmOutput } from "@/stores/chatStore";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import axios from "axios";

export function FastTrackButton() {
  const router = useRouter();
  const { setCurrentFlow, addAnswer, setComplete, setLlmOutput } = useChatStore();

  const handleFastTrack = async () => {
    useChatStore.getState().reset();
    setCurrentFlow("buy");

    const answers = {
      propertyType: "Condo/Apartment",
      bedrooms: "4",
      budget: "$600K - $800K",
      timeline: "6-12 months",
      buyingReason: "Upgrading",
      email: "jonathan@gmail.com",
    };

    Object.entries(answers).forEach(([k, v]) => addAnswer(k, v));
    setComplete(true);

    try {
      const { data } = await axios.post("/api/test-component", {
        flow: "buy",
        userInput: answers,
      });

      // Store full result
      setLlmOutput(data);
      localStorage.setItem("llmResultsCache", JSON.stringify(data));

      router.push("/results");
    } catch (err) {
      console.error("Fast Track failed", err);
    }
  };

  return (
    <button
      onClick={handleFastTrack}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-3 font-semibold text-white shadow-lg hover:scale-105"
    >
      <Zap className="h-5 w-5" />
      Fast Track
    </button>
  );
}