import OpenAI from 'openai';

import { generateSellerPrompt, generateBuyerPrompt, generateBrowsePrompt } from './flowPrompts';
import {  FormAnswer, LeadSubmission } from '@/types';
import { ComparableHome } from '@/types';
import { MarketTrend } from '@/types';
import { AgentAdviceScenario } from '@/types';
import { FormConfig } from '@/types';
import { FlowType } from '@/data/conversationFlows/conversationFlows';
import { AnalysisInput, BrowseAnalysis, BuyerAnalysis, FlowAnalysis, FlowAnalysisInput, SellerAnalysis } from '@/types/analysis.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export function buildUserProfileText(answers: FormAnswer[]): string {
  const profileParts: string[] = [];

  answers.forEach((answer) => {
    const value = Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
    profileParts.push(`${answer.question}: ${value}`);
  });

  return profileParts.join('. ');
}


export async function generateFlowAnalysis(
  flowType: FlowType,
  input: AnalysisInput
): Promise<FlowAnalysis> {
  const { leadData, comparableHomes, marketTrends, agentAdvice, formConfig } = input;

  // === 1. Build Prompt ===
  let prompt: string;
  switch (flowType) {
    case 'sell':
      prompt = generateSellerPrompt(leadData, comparableHomes, marketTrends, agentAdvice, formConfig);
      break;
    case 'buy':
      prompt = generateBuyerPrompt(leadData, comparableHomes, marketTrends, agentAdvice, formConfig);
      break;
    case 'browse':
      prompt = generateBrowsePrompt(leadData, comparableHomes, marketTrends, agentAdvice, formConfig);
      break;
    default:
      throw new Error(`Unsupported flow type: ${flowType}`);
  }

  // === 2. Call OpenAI ===
  let responseText = '{}';
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are ${formConfig.branding.agentName}, an expert real estate agent in ${formConfig.targetArea}. Always return valid JSON matching the exact schema below. No extra fields. No explanations.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    responseText = completion.choices[0]?.message?.content?.trim() || '{}';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate analysis');
  }

  // === 3. Parse & Validate ===
  let raw: unknown;
  try {
    raw = JSON.parse(responseText);
  } catch (error) {
    console.error('Invalid JSON from AI:', responseText);
    throw new Error('AI returned invalid JSON');
  }

  if (typeof raw !== 'object' || raw === null) {
    throw new Error('AI response is not an object');
  }

  // === 4. Normalize Base Fields ===
  const base = {
    marketSummary: typeof raw.marketSummary === 'string' ? raw.marketSummary : '',
    personalizedAdvice: Array.isArray(raw.personalizedAdvice)
      ? raw.personalizedAdvice.filter((s): s is string => typeof s === 'string')
      : [],
    recommendedActions: Array.isArray(raw.recommendedActions)
      ? raw.recommendedActions.filter((s): s is string => typeof s === 'string')
      : [],
    generatedAt: new Date().toISOString(),
    tokensUsed: typeof raw.tokensUsed === 'number' ? raw.tokensUsed : 0,
  };

  // === 5. Return Typed Analysis ===
  switch (flowType) {
    case 'sell': {
      const comps = Array.isArray(raw.comparablesSummary)
        ? raw.comparablesSummary.filter(
            (c: any): c is { address: string; details: string; soldPrice: number } =>
              typeof c.address === 'string' &&
              typeof c.details === 'string' &&
              typeof c.soldPrice === 'number'
          )
        : [];

      return {
        ...base,
        estimatedValue: typeof raw.estimatedValue === 'number' ? raw.estimatedValue : 0,
        comparablesSummary: comps,
      } as SellerAnalysis;
    }

    case 'buy': {
      return {
        ...base,
        recommendedNeighborhoods: Array.isArray(raw.recommendedNeighborhoods)
          ? raw.recommendedNeighborhoods.filter((s): s is string => typeof s === 'string')
          : [],
        financingTips: Array.isArray(raw.financingTips)
          ? raw.financingTips.filter((s): s is string => typeof s === 'string')
          : [],
      } as BuyerAnalysis;
    }

    case 'browse': {
      return {
        ...base,
        highlights: Array.isArray(raw.highlights)
          ? raw.highlights.filter((s): s is string => typeof s === 'string')
          : [],
        suggestedFilters: Array.isArray(raw.suggestedFilters)
          ? raw.suggestedFilters.filter((s): s is string => typeof s === 'string')
          : [],
        neighborhoodInsights:
          typeof raw.neighborhoodInsights === 'object' && raw.neighborhoodInsights !== null
            ? (raw.neighborhoodInsights as Record<string, string>)
            : {},
      } as BrowseAnalysis;
    }
  }
}

export { openai };
