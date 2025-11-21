// lib/openai/utils.ts
import { openai } from './client';

export async function callJsonLlm(prompt: string, model = 'gpt-4o-mini') {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content?.trim();
  if (!content) {
    console.error('Empty LLM response');
    throw new Error('Empty response from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse LLM JSON:', content);
    throw new Error('Invalid JSON from LLM');
  }
}