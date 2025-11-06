import OpenAI from 'openai';

import { generateSellerPrompt, generateBuyerPrompt, generateBrowsePrompt } from './flowPrompts';
import {  FormAnswer, LeadSubmission } from '@/types';
import { ComparableHome } from '@/types';
import { MarketTrend } from '@/types';
import { AgentAdviceScenario } from '@/types';
import { FormConfig } from '@/types';
import { FlowType } from '@/data/conversationFlows/conversationFlows';
import { FlowAnalysis, FlowAnalysisInput } from '@/types/analysis.types';

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
  input: FlowAnalysisInput
): Promise<FlowAnalysis> {
  const { leadData, comparableHomes, marketTrends, agentAdvice, formConfig } = input;

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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are ${formConfig.branding.agentName}, an expert real estate agent in ${formConfig.targetArea}. Provide accurate, professional, data-driven advice. Always return valid JSON.`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0].message.content || '{}';
  const analysis = JSON.parse(responseText);

  return {
    ...analysis,
    generatedAt: new Date(),
    tokensUsed: completion.usage?.total_tokens || 0,
  } as FlowAnalysis;
}

export { openai };
