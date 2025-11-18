// stores/conversation/defaults/flow.browse.ts
import { Eye } from 'lucide-react';
import type { ConversationFlow } from '../conversation.store';

export const browseFlow: ConversationFlow = {
  id: 'browse',
  name: 'Market Explorer',
  type: 'browse',
  description: 'For market researchers and curious browsers',
  visual: { type: 'icon', value: Eye },
  flowPrompt: {
    systemBase: "You are Chris's AI real estate assistant sharing market insights and trends.",
    context: "The user is curious about the market. Be insightful, data-rich, and fun.",
    personality: "Curious, witty, and full of surprising stats",
  },
  questions: [
    {
      id: 'interest',
      question: "What are you most curious about today?",
      order: 1,
      mappingKey: 'interest',
      buttons: [
        { id: 'prices', label: 'Current home prices', value: 'prices', tracker: { insight: "People love talking numbers", dbMessage: "Loading latest MLS data..." } },
        { id: 'trends', label: 'Market trends', value: 'trends', tracker: { insight: "The crystal ball is warming up...", dbMessage: "Analyzing 18-month price velocity..." } },
        { id: 'hot', label: 'Hot neighborhoods', value: 'hot-areas', tracker: { insight: "Time for the heat map", dbMessage: "Ranking areas by days-on-market and appreciation..." } },
        { id: 'worth', label: 'What my home is worth', value: 'valuation', tracker: { insight: "Everyone's favorite question", dbMessage: "Running instant CMA with 47 data points..." } },
      ],
    },
    {
      id: 'location',
      question: "Which area are you curious about?",
      order: 2,
      mappingKey: 'location',
      allowFreeText: true,
      validation: { required: true },
    },
    {
      id: 'email',
      question: "Want weekly market reports sent to your inbox?",
      order: 3,
      mappingKey: 'email',
      allowFreeText: true,
      validation: { type: 'email', required: false },
    },
  ],
  metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1, author: 'system' },
};