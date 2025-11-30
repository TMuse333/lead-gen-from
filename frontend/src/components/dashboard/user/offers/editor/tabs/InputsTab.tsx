// frontend/src/components/dashboard/user/offers/editor/tabs/InputsTab.tsx
/**
 * Input Requirements tab for offer editor
 * Shows required/optional fields and validations
 */

'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import type { OfferDefinition } from '@/lib/offers/core/types';
import { getFieldLabel } from '@/lib/offers/utils/getSampleData';

interface InputsTabProps {
  definition: OfferDefinition;
}

export function InputsTab({ definition }: InputsTabProps) {
  const { requiredFields, optionalFields, fieldValidations } = definition.inputRequirements;

  return (
    <div className="space-y-6">
      {/* Required Fields */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Required Fields ({requiredFields.length})
        </h3>
        <div className="space-y-2">
          {requiredFields.map((field) => (
            <FieldItem
              key={field}
              field={field}
              required={true}
              validation={fieldValidations?.[field]}
            />
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      {optionalFields && optionalFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Optional Fields ({optionalFields.length})
          </h3>
          <div className="space-y-2">
            {optionalFields.map((field) => (
              <FieldItem
                key={field}
                field={field}
                required={false}
                validation={fieldValidations?.[field]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">
          These fields are collected during the conversation flow and used to generate
          personalized offers. Required fields must be present for successful generation.
        </p>
      </div>
    </div>
  );
}

function FieldItem({
  field,
  required,
  validation,
}: {
  field: string;
  required: boolean;
  validation?: any;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {required ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-slate-100 font-medium">
              {getFieldLabel(field)}
            </span>
            {required && (
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1 ml-6">
            Field name: <code className="text-cyan-400">{field}</code>
          </p>
          {validation && (
            <div className="mt-2 ml-6 space-y-1">
              {validation.type && (
                <p className="text-slate-400 text-xs">
                  Type: <span className="text-slate-300">{validation.type}</span>
                </p>
              )}
              {validation.minLength && (
                <p className="text-slate-400 text-xs">
                  Min length: <span className="text-slate-300">{validation.minLength}</span>
                </p>
              )}
              {validation.maxLength && (
                <p className="text-slate-400 text-xs">
                  Max length: <span className="text-slate-300">{validation.maxLength}</span>
                </p>
              )}
              {validation.pattern && (
                <p className="text-slate-400 text-xs">
                  Pattern: <code className="text-cyan-400 text-xs">{validation.pattern}</code>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
