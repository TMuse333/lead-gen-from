// frontend/src/components/dashboard/user/offers/editor/tabs/PromptTab.tsx
/**
 * Prompt Configuration tab for offer editor
 * Shows system prompt (view-only for now)
 */

'use client';

import { Info } from 'lucide-react';
import { getOfferDefinition } from '@/lib/offers';
import type { OfferDefinition } from '@/lib/offers/core/types';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface PromptTabProps {
  definition: OfferDefinition | null;
  offerType: OfferType | null;
}

export function PromptTab({ definition, offerType }: PromptTabProps) {
  // Get the full definition from registry (includes functions that can't be serialized)
  const fullDefinition = offerType ? getOfferDefinition(offerType) : null;
  const buildPrompt = fullDefinition?.buildPrompt || definition?.buildPrompt;

  return (
    <div className="space-y-6">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-cyan-400 font-semibold">How AI Generation Works</h3>
          <p className="text-slate-300 text-sm mt-1">
            This offer uses AI to automatically generate personalized content for each user.
            The system creates custom prompts based on the conversation and your knowledge base.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          What Gets Included in Generation
        </h3>
        <div className="space-y-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-slate-100 font-medium mb-2">✓ User's Conversation Data</h4>
            <p className="text-slate-400 text-sm">
              All answers and information collected during the chat conversation
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-slate-100 font-medium mb-2">✓ Your Agent Knowledge</h4>
            <p className="text-slate-400 text-sm">
              Relevant advice and tips from your Qdrant knowledge base
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-slate-100 font-medium mb-2">✓ Best Practices</h4>
            <p className="text-slate-400 text-sm">
              Industry best practices and proven real estate guidance
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-slate-100 font-medium mb-2">✓ Personalization</h4>
            <p className="text-slate-400 text-sm">
              Customized for the user's specific situation, location, budget, and timeline
            </p>
          </div>
        </div>
      </div>

      {definition?.type === 'real-estate-timeline' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Timeline Generation Process
          </h3>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <ol className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <div>
                  <strong className="text-slate-100">Analyze User Situation</strong>
                  <p className="text-slate-400 mt-1">Determine if they're buying, selling, or browsing and their specific needs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <div>
                  <strong className="text-slate-100">Select Appropriate Template</strong>
                  <p className="text-slate-400 mt-1">Choose the right timeline structure (buying has 6-7 phases, selling has 7 phases)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <div>
                  <strong className="text-slate-100">Customize Each Phase</strong>
                  <p className="text-slate-400 mt-1">Adjust timeline estimates, action items, and descriptions based on user's timeline and location</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <div>
                  <strong className="text-slate-100">Add Your Agent Advice</strong>
                  <p className="text-slate-400 mt-1">Integrate relevant tips from your Qdrant knowledge base into each phase</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                <div>
                  <strong className="text-slate-100">Generate Final Timeline</strong>
                  <p className="text-slate-400 mt-1">Create a personalized, step-by-step timeline with action items and your expertise</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}

      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          <strong className="text-slate-300">Note:</strong> The AI prompt is automatically optimized for each offer type.
          You don't need to configure anything - just ensure your Qdrant knowledge base is up to date with your best advice.
        </p>
      </div>
    </div>
  );
}
