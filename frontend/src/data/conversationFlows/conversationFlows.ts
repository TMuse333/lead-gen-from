// data/conversationFlows.ts

import { ConversationFlows } from '@/types/chat.types';

export const CONVERSATION_FLOWS: ConversationFlows = {
  sell: {
    propertyType: {
      question: "What type of property do you have?",
      buttons: [
        { id: 'house', label: 'Single-family house', value: 'single-family house' },
        { id: 'condo', label: 'Condo/Apartment', value: 'condo' },
        { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
        { id: 'multi', label: 'Multi-family', value: 'multi-family' },
      ]
    },
    propertyAge: {
      question: "How old is your home approximately?",
      buttons: [
        { id: 'new', label: '< 10 years', value: '0-10' },
        { id: 'mid1', label: '10-20 years', value: '10-20' },
        { id: 'mid2', label: '20-30 years', value: '20-30' },
        { id: 'old', label: '30+ years', value: '30+' },
      ]
    },
    renovations: {
      question: "Have you done any major renovations?",
      buttons: [
        { id: 'yes-kitchen', label: 'Kitchen', value: 'kitchen' },
        { id: 'yes-bath', label: 'Bathroom', value: 'bathroom' },
        { id: 'yes-both', label: 'Both', value: 'kitchen and bathroom' },
        { id: 'no', label: 'No major renovations', value: 'none' },
      ]
    },
    timeline: {
      question: "When are you looking to sell?",
      buttons: [
        { id: 'asap', label: '0-3 months (ASAP)', value: '0-3' },
        { id: 'soon', label: '3-6 months', value: '3-6' },
        { id: 'planning', label: '6-12 months', value: '6-12' },
        { id: 'exploring', label: 'Just exploring', value: '12+' },
      ]
    },
    sellingReason: {
      question: "What's your main reason for selling?",
      buttons: [
        { id: 'relocate', label: 'Relocating', value: 'relocating' },
        { id: 'upsize', label: 'Upsizing', value: 'upsizing' },
        { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
        { id: 'investment', label: 'Investment', value: 'investment' },
      ]
    },
    email: {
      question: "What's your email address?",
      buttons: []
    }
  }
};

export const INITIAL_MESSAGE = {
  role: 'assistant' as const,
  content: "Hi! I'm Chris's AI assistant. How can I help you today?",
  buttons: [
    { id: 'sell', label: '🏠 I want to sell my home', value: 'sell' },
    { id: 'buy', label: '🔍 I\'m considering buying', value: 'buy' },
    { id: 'value', label: '💰 Get a home valuation', value: 'value' },
    { id: 'question', label: '💬 Just have a question', value: 'question' },
  ]
};