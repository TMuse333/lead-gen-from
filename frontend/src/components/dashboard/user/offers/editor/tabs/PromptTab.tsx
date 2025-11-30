// frontend/src/components/dashboard/user/offers/editor/tabs/PromptTab.tsx
/**
 * Prompt Configuration tab for offer editor
 * Shows system prompt (view-only for now)
 */

'use client';

import { Info } from 'lucide-react';
import type { OfferDefinition } from '@/lib/offers/core/types';

interface PromptTabProps {
  definition: OfferDefinition;
}

export function PromptTab({ definition }: PromptTabProps) {
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
          Prompt Builder
        </h3>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <code className="text-slate-400 text-sm">
            {definition.buildPrompt.toString().substring(0, 300)}...
          </code>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          The prompt builder function generates dynamic prompts based on user input
          and context.
        </p>
      </div>
    </div>
  );
}
