import OpenAI from 'openai';


import { FlowType } from '@/data/conversationFlows/conversationFlows';
import {  BrowseAnalysis, BuyerAnalysis, FlowAnalysis,  SellerAnalysis } from '@/types/analysis.types';

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






export { openai };
