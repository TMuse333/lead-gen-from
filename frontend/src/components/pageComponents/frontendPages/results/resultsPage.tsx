import { ActionPlan } from "@/components/ux/resultsComponents/actionPlan";
import { LlmHerobanner } from "@/components/ux/resultsComponents/herobanner";
import { PersonalMessage } from "@/components/ux/resultsComponents/personalMessage";
import { LlmProfileSummary } from "@/components/ux/resultsComponents/profileSummary";
import { SELLER_PREPARATION_PLAN, SELLER_STEP_PREPARATION } from "@/data/sample/llmOutput/actionPlans";
import { SELLER_URGENT_SAMPLE } from "@/data/sample/llmOutput/hero";
import { SELLER_PLANNED_UPSIZE_SAMPLE } from "@/data/sample/llmOutput/personalMessages";
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
        <PersonalMessage
        data={SELLER_PLANNED_UPSIZE_SAMPLE}
        />
        <ActionPlan
        
        data={SELLER_PREPARATION_PLAN}
        />
      </main>
  )
}