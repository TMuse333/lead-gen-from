import { ChatNode, ChatNodeId } from "@/types/chat.types";


// Initial greeting message
export const INITIAL_MESSAGE_NODE: ChatNode = {
  id: 'initialMessage',
  question: "Hi! I'm Chris's AI assistant. How can I help you today?",
  buttons: [
    { id: 'sell', label: '🏠 I want to sell my home', value: 'sell' },
    { id: 'buy', label: '🔍 I\'m looking to buy', value: 'buy' },
    { id: 'browse', label: '👀 Just browsing the market', value: 'browse' },
    { id: 'question', label: '💬 I have a question', value: 'question' },
  ]
};

// ====================== SELLER FLOW ======================
export const SELLER_FLOW: Record<ChatNodeId, ChatNode> = {
  propertyType: {
    id: 'propertyType',
    question: "What type of property do you have?",
    buttons: [
      { id: 'house', label: 'Single-family house', value: 'single-family house' },
      { id: 'condo', label: 'Condo/Apartment', value: 'condo' },
      { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
      { id: 'multi', label: 'Multi-family', value: 'multi-family' },
    ],
    mappingKey: 'propertyType',
  },
  propertyAge: {
    id: 'propertyAge',
    question: "How old is your home?",
    buttons: [
      { id: 'new', label: '< 10 years', value: '0-10' },
      { id: 'mid1', label: '10-20 years', value: '10-20' },
      { id: 'mid2', label: '20-30 years', value: '20-30' },
      { id: 'old', label: '30+ years', value: '30+' },
    ],
    allowFreeText: true, // user can type "7.5" years
    mappingKey: 'propertyAge',
  },
  renovations: {
    id: 'renovations',
    question: "Have you done any major renovations?",
    buttons: [
      { id: 'yes-kitchen', label: 'Kitchen', value: 'kitchen' },
      { id: 'yes-bath', label: 'Bathroom', value: 'bathroom' },
      { id: 'yes-both', label: 'Both', value: 'kitchen and bathroom' },
      { id: 'no', label: 'No major renovations', value: 'none' },
    ],
    mappingKey: 'renovations',
  },
  timeline: {
    id: 'timeline',
    question: "When are you looking to sell?",
    buttons: [
      { id: 'asap', label: '0-3 months (ASAP)', value: '0-3' },
      { id: 'soon', label: '3-6 months', value: '3-6' },
      { id: 'planning', label: '6-12 months', value: '6-12' },
      { id: 'exploring', label: 'Just exploring', value: '12+' },
    ],
    mappingKey: 'timeline',
  },
  sellingReason: {
    id: 'sellingReason',
    question: "What's your main reason for selling?",
    buttons: [
      { id: 'relocate', label: 'Relocating', value: 'relocating' },
      { id: 'upsize', label: 'Upsizing', value: 'upsizing' },
      { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
      { id: 'investment', label: 'Investment', value: 'investment' },
    ],
    mappingKey: 'sellingReason',
  },
  email: {
    id: 'email',
    question: "What's your email address?",
    allowFreeText: true,
    mappingKey: 'email',
  }
};

// ====================== BUYER FLOW ======================
export const BUYER_FLOW: Record<ChatNodeId, ChatNode> = {
  propertyType: {
    id: 'propertyType',
    question: "What type of property are you looking for?",
    buttons: [
      { id: 'house', label: 'Single-family house', value: 'single-family house' },
      { id: 'condo', label: 'Condo/Apartment', value: 'condo' },
      { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
      { id: 'any', label: 'Open to any type', value: 'any' },
    ],
    mappingKey: 'propertyType',
  },
  budget: {
    id: 'budget',
    question: "What's your budget range?",
    buttons: [
      { id: 'under400', label: 'Under $400K', value: 'under-400k' },
      { id: '400-600', label: '$400K - $600K', value: '400k-600k' },
      { id: '600-800', label: '$600K - $800K', value: '600k-800k' },
      { id: 'over800', label: 'Over $800K', value: 'over-800k' },
    ],
    mappingKey: 'budget',
  },
  bedrooms: {
    id: 'bedrooms',
    question: "How many bedrooms do you need?",
    buttons: [
      { id: '1-2', label: '1-2 bedrooms', value: '1-2' },
      { id: '3', label: '3 bedrooms', value: '3' },
      { id: '4', label: '4 bedrooms', value: '4' },
      { id: '5plus', label: '5+ bedrooms', value: '5+' },
    ],
    mappingKey: 'bedrooms',
  },
  timeline: {
    id: 'timeline',
    question: "When are you looking to buy?",
    buttons: [
      { id: 'asap', label: 'ASAP (0-3 months)', value: '0-3' },
      { id: 'soon', label: '3-6 months', value: '3-6' },
      { id: 'planning', label: '6-12 months', value: '6-12' },
      { id: 'exploring', label: 'Just exploring', value: '12+' },
    ],
    mappingKey: 'timeline',
  },
  buyingReason: {
    id: 'buyingReason',
    question: "What's your main reason for buying?",
    buttons: [
      { id: 'first-home', label: 'First home', value: 'first-home' },
      { id: 'upgrade', label: 'Upgrading', value: 'upgrade' },
      { id: 'downsize', label: 'Downsizing', value: 'downsize' },
      { id: 'investment', label: 'Investment property', value: 'investment' },
    ],
    mappingKey: 'buyingReason',
  },
  email: {
    id: 'email',
    question: "What's your email address?",
    allowFreeText: true,
    mappingKey: 'email',
  }
};

// ====================== BROWSER FLOW ======================
export const BROWSER_FLOW: Record<ChatNodeId, ChatNode> = {
  interest: {
    id: 'interest',
    question: "What interests you most about real estate?",
    buttons: [
      { id: 'market-trends', label: 'Market trends', value: 'market-trends' },
      { id: 'investment', label: 'Investment opportunities', value: 'investment' },
      { id: 'neighborhood', label: 'Neighborhood info', value: 'neighborhood' },
      { id: 'general', label: 'General curiosity', value: 'general' },
    ],
    mappingKey: 'interest',
  },
  location: {
    id: 'location',
    question: "Which area are you interested in?",
    buttons: [
      { id: 'downtown', label: 'Downtown Halifax', value: 'downtown-halifax' },
      { id: 'dartmouth', label: 'Dartmouth', value: 'dartmouth' },
      { id: 'bedford', label: 'Bedford', value: 'bedford' },
      { id: 'other', label: 'Other areas', value: 'other' },
    ],
    mappingKey: 'location',
  },
  priceRange: {
    id: 'priceRange',
    question: "What price range interests you?",
    buttons: [
      { id: 'under400', label: 'Under $400K', value: 'under-400k' },
      { id: '400-600', label: '$400K - $600K', value: '400k-600k' },
      { id: '600-800', label: '$600K - $800K', value: '600k-800k' },
      { id: 'over800', label: 'Over $800K', value: 'over-800k' },
    ],
    mappingKey: 'priceRange',
  },
  timeline: {
    id: 'timeline',
    question: "When might you consider entering the market?",
    buttons: [
      { id: 'soon', label: 'Within 6 months', value: '0-6' },
      { id: 'year', label: 'Within a year', value: '6-12' },
      { id: 'later', label: '1-2 years', value: '12-24' },
      { id: 'just-looking', label: 'Just gathering info', value: '24+' },
    ],
    mappingKey: 'timeline',
  },
  goal: {
    id: 'goal',
    question: "What's your main goal?",
    buttons: [
      { id: 'buy-future', label: 'Planning to buy', value: 'buy-future' },
      { id: 'sell-future', label: 'Planning to sell', value: 'sell-future' },
      { id: 'invest', label: 'Looking to invest', value: 'invest' },
      { id: 'learn', label: 'Just learning', value: 'learn' },
    ],
    mappingKey: 'goal',
  },
  email: {
    id: 'email',
    question: "Want market updates sent to your email?",
    allowFreeText: true,
    mappingKey: 'email',
  }
};

// ====================== COMBINED FLOWS ======================
export const CONVERSATION_FLOWS: Record<'sell' | 'buy' | 'browse', Record<ChatNodeId, ChatNode>> = {
  sell: SELLER_FLOW,
  buy: BUYER_FLOW,
  browse: BROWSER_FLOW,
};
