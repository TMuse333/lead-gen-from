// ============================================
// OPENAI CLIENT - Embeddings & Analysis Generation
// ============================================

import OpenAI from 'openai';
import { AIAnalysis, AnalysisInput, FormAnswer } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Generate embedding vector for text (used for Qdrant similarity search)
 */
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

/**
 * Generate a user profile summary for Qdrant embedding
 * This creates a text representation of the user's situation for semantic search
 */
export function buildUserProfileText(answers: FormAnswer[]): string {
  const profileParts: string[] = [];

  answers.forEach((answer) => {
    const value = Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
    profileParts.push(`${answer.question}: ${value}`);
  });

  return profileParts.join('. ');
}

/**
 * Generate comprehensive property analysis using OpenAI
 */
export async function generatePropertyAnalysis(
  input: AnalysisInput
): Promise<AIAnalysis> {
  try {
    const { leadData, comparableHomes, marketTrends, agentAdvice, formConfig } = input;

    // Build context from user answers
    const userContext = leadData.answers
      .map((a) => `${a.question}: ${Array.isArray(a.value) ? a.value.join(', ') : a.value}`)
      .join('\n');

    // Build comparable homes summary
    const compsContext = comparableHomes
      .map(
        (comp, i) =>
          `${i + 1}. ${comp.address} - ${comp.propertyDetails.type}, ${comp.propertyDetails.bedrooms}bd/${comp.propertyDetails.bathrooms}ba${comp.propertyDetails.squareFeet ? `, ${comp.propertyDetails.squareFeet.toLocaleString()} sqft` : ''}, ${comp.saleInfo.soldPrice ? `Sold: $${comp.saleInfo.soldPrice.toLocaleString()}` : `Listed: $${comp.saleInfo.listPrice?.toLocaleString()}`}`
      )
      .join('\n');

    // Build agent advice context
    const adviceContext = agentAdvice
      .map((advice) => `Scenario: ${advice.scenario}\nAdvice: ${advice.advice}`)
      .join('\n\n');

    // Create the prompt
    const prompt = `You are an expert real estate analyst helping a homeowner understand their property's value and selling potential in ${formConfig.targetArea}.

USER'S PROPERTY INFORMATION:
${userContext}

COMPARABLE PROPERTIES IN THE AREA:
${compsContext}

MARKET TRENDS:
- Area: ${marketTrends.area}
- Average Sale Price: $${marketTrends.metrics.averageSalePrice.toLocaleString()}
- Median Sale Price: $${marketTrends.metrics.medianSalePrice.toLocaleString()}
- Average Days on Market: ${marketTrends.metrics.averageDaysOnMarket}
- Market Trend: ${marketTrends.trend.direction} (${marketTrends.trend.percentageChange > 0 ? '+' : ''}${marketTrends.trend.percentageChange}%)
- Inventory Level: ${marketTrends.metrics.inventoryLevel}

AGENT'S EXPERTISE (personalized advice from ${formConfig.branding.agentName}):
${adviceContext}

TASK:
Generate a comprehensive, personalized property analysis. Be specific, data-driven, and actionable. Use the agent's advice to provide personalized guidance that reflects their expertise and approach.

Provide your response in the following JSON format:
{
  "estimatedValue": {
    "low": <number>,
    "high": <number>,
    "confidence": <0-1>,
    "reasoning": "<2-3 sentences explaining the valuation based on the comparable properties and market conditions>"
  },
  "marketSummary": "<2-3 sentences about current market conditions in ${formConfig.targetArea} and what they mean for this seller. Be specific about inventory levels and trends.>",
  "personalizedAdvice": "<3-4 paragraphs of specific, actionable advice. Incorporate the agent's expertise from the provided scenarios. Reference their specific situation (timeline: ${leadData.propertyProfile.timeline}, reason: ${leadData.propertyProfile.sellingReason}). Be empathetic, professional, and helpful. This should feel like it's coming directly from ${formConfig.branding.agentName}.>",
  "recommendedActions": [
    "<specific action 1 based on their timeline and situation>",
    "<specific action 2>",
    "<specific action 3>"
  ],
  "comparablesSummary": "<2-3 sentences explaining why these comparable properties were selected and what they tell us about the user's property value. Reference specific properties by address.>"
}

Be warm, professional, and specific. Use actual numbers from the data. Make the homeowner feel understood and informed. The advice should sound like it's coming from ${formConfig.branding.agentName}, not a generic AI.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are ${formConfig.branding.agentName}, an expert real estate agent in ${formConfig.targetArea}. Provide accurate, data-driven property valuations and personalized advice that reflects your expertise. Always return valid JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '{}';
    const analysis = JSON.parse(responseText);

    // Return structured analysis
    return {
      estimatedValue: analysis.estimatedValue,
      marketSummary: analysis.marketSummary,
      personalizedAdvice: analysis.personalizedAdvice,
      recommendedActions: analysis.recommendedActions,
      comparablesSummary: analysis.comparablesSummary,
      generatedAt: new Date(),
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}

export { openai };