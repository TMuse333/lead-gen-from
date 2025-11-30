// frontend/src/components/dashboard/user/offers/editor/tabs/OverviewTab.tsx
/**
 * Overview tab for offer editor
 * Shows basic info, status, enable/disable toggle
 */

'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { OfferDefinition } from '@/lib/offers/core/types';
import type { OfferCustomizations } from '@/types/offers/offerCustomization.types';

interface OverviewTabProps {
  definition: OfferDefinition;
  customization: OfferCustomizations | null;
  hasCustomizations: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  lastTestedAt?: Date;
  lastGeneratedAt?: Date;
}

export function OverviewTab({
  definition,
  customization,
  hasCustomizations,
  onToggleEnabled,
  lastTestedAt,
  lastGeneratedAt,
}: OverviewTabProps) {
  const isEnabled = customization?.enabled !== false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{definition.icon || '📄'}</span>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {definition.label}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Type: {definition.type} • Version: {definition.version.version}
              </p>
            </div>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <button
          onClick={() => onToggleEnabled(!isEnabled)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isEnabled
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          {isEnabled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Enabled
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Disabled
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-300">{definition.description}</p>
      </div>

      {/* Customization Status */}
      {hasCustomizations && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-cyan-400 font-semibold">Custom Configuration</h3>
            <p className="text-slate-300 text-sm mt-1">
              This offer has been customized from system defaults.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Model"
          value={definition.generationMetadata.model}
        />
        <StatCard
          label="Max Tokens"
          value={definition.generationMetadata.maxTokens.toLocaleString()}
        />
        <StatCard
          label="Temperature"
          value={definition.generationMetadata.temperature.toFixed(2)}
        />
        <StatCard
          label="Required Fields"
          value={definition.inputRequirements.requiredFields.length.toString()}
        />
      </div>

      {/* Activity */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Activity</h3>
        <div className="space-y-2">
          {lastTestedAt && (
            <ActivityItem
              label="Last Tested"
              date={lastTestedAt}
            />
          )}
          {lastGeneratedAt && (
            <ActivityItem
              label="Last Generated"
              date={lastGeneratedAt}
            />
          )}
          {!lastTestedAt && !lastGeneratedAt && (
            <p className="text-slate-400 text-sm">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-slate-100 text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

function ActivityItem({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex justify-between items-center bg-slate-800/30 rounded px-3 py-2">
      <span className="text-slate-300 text-sm">{label}</span>
      <span className="text-slate-400 text-sm">
        {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
      </span>
    </div>
  );
}
