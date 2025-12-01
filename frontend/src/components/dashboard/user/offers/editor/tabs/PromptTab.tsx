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
          <h3 className="text-cyan-400 font-semibold">System-Managed Prompts</h3>
          <p className="text-slate-300 text-sm mt-1">
            Prompts are currently managed by the system. Custom prompt modifications
            will be available in a future update.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-3">
          Prompt Builder Function
        </h3>
        {buildPrompt ? (
          <>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <code className="text-slate-400 text-xs whitespace-pre-wrap font-mono">
                {(() => {
                  try {
                    const funcString = buildPrompt.toString();
                    // Show the function signature and first part of the body
                    const lines = funcString.split('\n');
                    const preview = lines.slice(0, 30).join('\n');
                    return preview + (lines.length > 30 ? '\n  // ... (function continues)' : '');
                  } catch (err) {
                    return 'Unable to display prompt builder function';
                  }
                })()}
              </code>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              The prompt builder function generates dynamic prompts based on user input
              and context. This function is called during offer generation to create
              personalized prompts for each user.
            </p>
          </>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ Prompt builder not available for this offer type. The definition may be incomplete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
