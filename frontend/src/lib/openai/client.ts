// lib/openai/client.ts
"use server"
import OpenAI from 'openai';


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});