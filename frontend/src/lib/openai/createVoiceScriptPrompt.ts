// lib/openai/createVoiceScriptPrompt.ts

import { Flow } from '@/types/recording.types';

interface CreateVoiceScriptPromptParams {
  agentId: string;
  flows: Flow[];
  customPrompt?: string;
  agentName?: string;
  yearsExperience?: number;
  specialty?: string;
}

export function createVoiceScriptPrompt({
  agentId,
  flows,
  customPrompt = '',
  agentName = 'the agent',
  yearsExperience = 10,
  specialty = 'residential real estate',
}: CreateVoiceScriptPromptParams): string {
  const flowContext = flows.length > 0
    ? `The questions should be relevant to these client journeys: ${flows
        .map(f => f.charAt(0).toUpperCase() + f.slice(1))
        .join(', ')}.`
    : 'The questions should cover general real estate scenarios (buying, selling, and browsing).';

  const basePrompt = `You are an expert real estate content strategist helping a top-performing agent create powerful, authentic voice advice for their AI assistant.

Agent Profile:
- Name: ${agentName}
- ${yearsExperience}+ years of experience
- Specializes in: ${specialty}
- Known for: giving direct, no-BS, high-value advice that builds trust instantly

Your task: Generate 8–12 high-impact questions that this agent should record short voice answers to (30–90 seconds each).

Rules:
1. Questions must sound like real client questions — natural, urgent, emotional
2. Avoid generic fluff like "What is your favorite part of being an agent?"
3. Focus on pain points, fears, objections, and aspirations
4. Prioritize questions that position the agent as the obvious expert
5. ${flowContext}
6. Make them specific enough to show deep market knowledge, but universal enough to apply broadly
7. Vary question types: strategy, mistakes, timing, negotiation, psychology, insider tips

${
  customPrompt
    ? `Additional guidance from the agent: "${customPrompt}"\nUse this to tailor the questions.`
    : ''
}

Examples of GREAT questions:
• "In this market, should I wait for rates to drop before buying, or is that a mistake?"
• "What are the red flags you see in listings that most buyers completely miss?"
• "How do you actually win when there are 10+ offers on a house?"
• "What's the one thing sellers do that kills their sale before it even starts?"
• "Are new construction homes really worth it, or is it a trap?"

Return ONLY a clean JSON array of strings. No explanations, no numbering, no markdown.

Example response:
["Question one?", "Question two?", "Question three?"]

Now generate the list:`;

  return basePrompt;
}