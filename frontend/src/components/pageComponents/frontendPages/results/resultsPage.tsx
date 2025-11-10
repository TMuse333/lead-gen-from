import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { LlmProfileSummary } from "@/components/ux/resultsComponents/profileSummary";
import { SELLER_URGENT_SAMPLE } from "@/data/sample/llmOutput/hero";
import { SELLER_URGENT_PROFILE } from "@/data/sample/llmOutput/profileSummary";
import React from "react";






export default function ResultsPage () {



  return (
      <main className="bg-blue-100">
        <LlmHerobanner
        data={SELLER_URGENT_SAMPLE}
        />
        <LlmProfileSummary
        data={SELLER_URGENT_PROFILE}
        />
      </main>
  )
}