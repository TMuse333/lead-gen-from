// frontend/src/components/dashboard/user/offers/editor/tabs/OutputTab.tsx
/**
 * Output Schema tab for offer editor
 * Shows expected output structure
 */

'use client';

import type { OfferDefinition } from '@/lib/offers/core/types';

interface OutputTabProps {
  definition: OfferDefinition;
}

export function OutputTab({ definition }: OutputTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-3">
          Output Schema
        </h3>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto">
          <pre className="text-slate-300 text-sm">
            {JSON.stringify(definition.outputSchema, null, 2)}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-3">
          Properties
        </h3>
        <div className="space-y-2">
          {Object.entries(definition.outputSchema.properties || {}).map(([key, prop]: [string, any]) => (
            <div key={key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <code className="text-cyan-400">{key}</code>
                  {prop.required && (
                    <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                  <p className="text-slate-400 text-sm mt-1">{prop.description}</p>
                </div>
                <span className="text-xs text-slate-500">{prop.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
