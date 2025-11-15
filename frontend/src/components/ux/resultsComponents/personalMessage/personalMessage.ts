import { SchemaField } from '../../../../types/schemas'; // adjust import path as needed

// ------------------------------------------
// Personal Message Schema
// ------------------------------------------

export const PERSONAL_MESSAGE_SCHEMA: {
  componentName: string;
  description: string;
  fields: Record<string, SchemaField>;
} = {
  componentName: 'personalMessage',
  description:
    "A personal message from Chris that builds trust and human connection. This component uses Qdrant advice to match Chris's voice, tone, and expertise. It should feel like a real note from the agent, not generic marketing copy.",

  fields: {
    agentName: {
      type: 'string',
      description: "The agent's name (usually 'Chris').",
      required: true,
      constraints: { wordCount: '1-2 words' },
      example: 'Chris',
      context: 'Should match the agent providing the advice.',
    },

    greeting: {
      type: 'string',
      description: 'Personal opening that addresses the user.',
      required: true,
      constraints: {
        wordCount: '2-5 words',
        tone: 'warm, conversational, friendly',
      },
      example: 'Hi Sarah,',
      context:
        'Use first name from email if available; otherwise use "Hi there," or "Hello,"',
    },

    messageBody: {
      type: 'string',
      description:
        "Main personal message (3–4 sentences) referencing the user's situation and Chris's relevant experience.",
      required: true,
      constraints: {
        wordCount: '60-100 words',
        tone: 'personal, experienced, reassuring, conversational',
      },
      example:
        "I've helped over 20 families navigate tight relocation timelines just like yours. The 0-3 month window you mentioned is actually quite common, and with the right strategy, we can maximize your sale price despite the urgency. Your recent kitchen renovation is a strong selling point that we'll leverage in positioning your home.",
      context:
        'Weave together (1) their situation from userInput, (2) Chris’s relevant experience from Qdrant advice, and (3) reassurance about their concerns.',
    },

    signature: {
      type: 'string',
      description: 'Closing signature line.',
      required: true,
      constraints: {
        wordCount: '2-4 words',
        tone: 'warm, professional',
      },
      example: 'Looking forward to connecting,',
      context:
        'Should transition naturally to the sign-off. Examples: "Talk soon," "Let’s make this happen," "Here to help,"',
    },

    agentTitle: {
      type: 'string',
      description: "Agent's professional title or credentials.",
      required: false,
      constraints: { wordCount: '2-6 words' },
      example: 'Real Estate Advisor',
      context:
        'Keep it simple and relevant: "Real Estate Advisor", "REALTOR®", "Senior Real Estate Agent".',
    },

    photoUrl: {
      type: 'string',
      description: "URL to agent's professional photo.",
      required: false,
      context: 'If available, should be a friendly, professional headshot.',
    },

    credibilityPoints: {
      type: 'array',
      description:
        'Optional 2–3 short credibility points supporting the message.',
      required: false,
      constraints: { minLength: 2, maxLength: 3 },
      context:
        'Use when Qdrant advice includes stats or achievements. Each should be short and specific.',
      example: [
        { icon: '🏆', text: '150+ homes sold in Halifax' },
        { icon: '📊', text: 'Top 1% REALTOR® in Nova Scotia' },
      ],
    },

    tone: {
      type: 'enum',
      description: 'Overall tone matching user urgency and situation.',
      required: false,
      constraints: {
        options: ['urgent-supportive', 'calm-confident', 'excited-encouraging'],
      },
      context:
        'urgent-supportive = tight timeline; calm-confident = planning ahead; excited-encouraging = first-time buyer/seller.',
    },
  },
};

// ------------------------------------------
// Output Interface
// ------------------------------------------

export interface CredibilityPoint {
  icon: string;
  text: string;
}

export interface LlmPersonalMessageProps {
  agentName: string;
  greeting: string;
  messageBody: string;
  signature: string;
  agentTitle?: string;
  photoUrl?: string;
  credibilityPoints?: CredibilityPoint[];
  tone?: 'urgent-supportive' | 'calm-confident' | 'excited-encouraging';
}
