// stores/conversation/defaults/flow.buy.ts
import { Key } from 'lucide-react';
import type { ConversationFlow } from '../conversation.store';

export const buyFlow: ConversationFlow = {
  id: 'buy',
  name: 'Buyer Journey',
  type: 'buy',
  description: 'For people looking to purchase a home',
  visual: { type: 'icon', value: Key },
  flowPrompt: {
    systemBase: "You are Chris's AI real estate assistant helping buyers find their perfect home.",
    context: "The user is looking to buy. Focus on budget, needs, timeline, and dream home vision.",
    personality: "Excited, patient, and laser-focused on their happiness",
  },
  questions: [
    {
      id: 'buyingReason',
      question: "Why are you looking to buy right now?",
      order: 1,
      mappingKey: 'buyingReason',
      buttons: [
        { id: 'first', label: 'First-time buyer', value: 'first-time', tracker: { insight: "Welcome to the club! Let’s make this smooth", dbMessage: "Loading first-time buyer grants & programs..." } },
        { id: 'moveup', label: 'Moving up', value: 'moving-up', tracker: { insight: "Time for more space — let’s find your forever home", dbMessage: "Analyzing equity from your current home..." } },
        { id: 'downsize', label: 'Downsizing', value: 'downsizing', tracker: { insight: "Smart move — more freedom, less stress", dbMessage: "Finding low-maintenance gems..." } },
        { id: 'invest', label: 'Investment property', value: 'investment', tracker: { insight: "Investor mode activated", dbMessage: "Running cash-flow + appreciation models..." } },
      ],
      validation: { required: true },
    },
    {
      id: 'budget',
      question: "What's your budget range?",
      order: 2,
      mappingKey: 'budget',
      buttons: [
        { id: 'b1', label: 'Under $400k', value: '<400k', tracker: { insight: "Great starter range", dbMessage: "Finding hidden gems under budget..." } },
        { id: 'b2', label: '$400k–$600k', value: '400-600k', tracker: { insight: "Sweet spot — most inventory here", dbMessage: "Filtering 312 active listings..." } },
        { id: 'b3', label: '$600k–$800k', value: '600-800k', tracker: { insight: "Moving up nicely", dbMessage: "Unlocking premium neighborhoods..." } },
        { id: 'b4', label: '$800k+', value: '800k+', tracker: { insight: "Luxury buyer detected", dbMessage: "Accessing off-market & pocket listings..." } },
      ],
      validation: { required: true },
    },
    {
      id: 'bedrooms',
      question: "How many bedrooms do you need?",
      order: 3,
      mappingKey: 'bedrooms',
      buttons: [
        { id: 'bed1', label: '1–2 beds', value: '1-2' },
        { id: 'bed2', label: '3 beds', value: '3' },
        { id: 'bed3', label: '4 beds', value: '4' },
        { id: 'bed4', label: '5+ beds', value: '5+' },
      ],
    },
    {
      id: 'timeline',
      question: "When do you want to move?",
      order: 4,
      mappingKey: 'timeline',
      buttons: [
        { id: 't1', label: 'ASAP (0–3 months)', value: '0-3' },
        { id: 't2', label: '3–6 months', value: '3-6' },
        { id: 't3', label: '6–12 months', value: '6-12' },
        { id: 't4', label: 'Just looking', value: '12+' },
      ],
    },
    // {
    //   id: 'mustHaves',
    //   question: "What's your #1 must-have?",
    //   order: 5,
    //   mappingKey: 'mustHaves',
    //   allowFreeText: true,
    // //   validation: { required: true },
    // },
    {
      id: 'email',
      question: "What's your email so I can send your personalized home matches?",
      order: 6,
      mappingKey: 'email',
      allowFreeText: true,
      validation: { type: 'email', required: true },
    },
  ],
  metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1, author: 'system' },
};