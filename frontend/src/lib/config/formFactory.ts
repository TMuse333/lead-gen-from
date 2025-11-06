// ============================================
// FORM CONFIGURATION FACTORY
// ============================================

import { FormConfig } from '@/types/config.types';
import { FlowConfig, flowConfigs } from './flowConfig';

interface CommonConfig {
  agentId: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    agentName: string;
    logoUrl?: string;
    agentPhoto?: string;
  };
  targetArea?: string;
}

export function createFormConfig(
  flow: 'sell' | 'buy' | 'browse',
  common: CommonConfig
): FormConfig {
  const flowConfig = flowConfigs[flow];

  return {
    id: `${flow}-form`,
    agentId: common.agentId,
    name: flowConfig.title,
    targetArea: common.targetArea || 'Halifax',
    questions: flowConfig.questions || [],
    emailCaptureAfter: 6,
    branding: common.branding,
    resultConfig: flowConfig.resultConfig!,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };
}

export function mapFlowConfigToFormConfig(flowConfig: FlowConfig, agentId: string, targetArea: string): FormConfig {
  return {
    id: flowConfig.id,
    agentId,
    name: flowConfig.title,
    targetArea,
    questions: flowConfig.questions,
    emailCaptureAfter: 6, // or dynamically
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#10b981',
      agentName: 'Chris Crowell', // or dynamic
    },
    resultConfig: flowConfig.resultConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };
}

