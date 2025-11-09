// ============================================
// SAMPLE CONVERSATION FLOWS
// Real conversation examples for testing
// ============================================

export interface FormAnswer {
    questionId: string;
    question: string;
    value: string | string[] | number;
    answeredAt: Date;
  }
  
  // ============================================
  // SELLER FLOW SAMPLE
  // ============================================
  export const SAMPLE_SELLER_CONVERSATION: FormAnswer[] = [
    {
      questionId: 'propertyType',
      question: 'What type of property do you have?',
      value: 'single-family house',
      answeredAt: new Date('2024-01-15T10:30:00'),
    },
    {
      questionId: 'propertyAge',
      question: 'How old is your home?',
      value: '10-20',
      answeredAt: new Date('2024-01-15T10:30:15'),
    },
    {
      questionId: 'renovations',
      question: 'Have you done any major renovations?',
      value: 'kitchen',
      answeredAt: new Date('2024-01-15T10:30:30'),
    },
    {
      questionId: 'timeline',
      question: 'When are you looking to sell?',
      value: '3-6',
      answeredAt: new Date('2024-01-15T10:30:45'),
    },
    {
      questionId: 'sellingReason',
      question: "What's your main reason for selling?",
      value: 'relocating',
      answeredAt: new Date('2024-01-15T10:31:00'),
    },
    {
      questionId: 'email',
      question: "What's your email address?",
      value: 'seller@example.com',
      answeredAt: new Date('2024-01-15T10:31:15'),
    },
  ];
  
  // Variant: Urgent seller
  export const SAMPLE_SELLER_URGENT: FormAnswer[] = [
    {
      questionId: 'propertyType',
      question: 'What type of property do you have?',
      value: 'condo',
      answeredAt: new Date('2024-01-15T11:00:00'),
    },
    {
      questionId: 'propertyAge',
      question: 'How old is your home?',
      value: '0-10',
      answeredAt: new Date('2024-01-15T11:00:15'),
    },
    {
      questionId: 'renovations',
      question: 'Have you done any major renovations?',
      value: 'none',
      answeredAt: new Date('2024-01-15T11:00:30'),
    },
    {
      questionId: 'timeline',
      question: 'When are you looking to sell?',
      value: '0-3', // ASAP
      answeredAt: new Date('2024-01-15T11:00:45'),
    },
    {
      questionId: 'sellingReason',
      question: "What's your main reason for selling?",
      value: 'investment',
      answeredAt: new Date('2024-01-15T11:01:00'),
    },
    {
      questionId: 'email',
      question: "What's your email address?",
      value: 'urgent.seller@example.com',
      answeredAt: new Date('2024-01-15T11:01:15'),
    },
  ];
  
  // ============================================
  // BUYER FLOW SAMPLE
  // ============================================
  export const SAMPLE_BUYER_CONVERSATION: FormAnswer[] = [
    {
      questionId: 'propertyType',
      question: 'What type of property are you looking for?',
      value: 'condo',
      answeredAt: new Date('2024-01-15T12:00:00'),
    },
    {
      questionId: 'budget',
      question: "What's your budget range?",
      value: '400k-600k',
      answeredAt: new Date('2024-01-15T12:00:15'),
    },
    {
      questionId: 'bedrooms',
      question: 'How many bedrooms do you need?',
      value: '3',
      answeredAt: new Date('2024-01-15T12:00:30'),
    },
    {
      questionId: 'timeline',
      question: 'When are you looking to buy?',
      value: '0-3', // ASAP
      answeredAt: new Date('2024-01-15T12:00:45'),
    },
    {
      questionId: 'buyingReason',
      question: "What's your main reason for buying?",
      value: 'first-home',
      answeredAt: new Date('2024-01-15T12:01:00'),
    },
    {
      questionId: 'email',
      question: "What's your email address?",
      value: 'buyer@example.com',
      answeredAt: new Date('2024-01-15T12:01:15'),
    },
  ];
  
  // Variant: High budget buyer
  export const SAMPLE_BUYER_LUXURY: FormAnswer[] = [
    {
      questionId: 'propertyType',
      question: 'What type of property are you looking for?',
      value: 'single-family house',
      answeredAt: new Date('2024-01-15T13:00:00'),
    },
    {
      questionId: 'budget',
      question: "What's your budget range?",
      value: 'over-800k',
      answeredAt: new Date('2024-01-15T13:00:15'),
    },
    {
      questionId: 'bedrooms',
      question: 'How many bedrooms do you need?',
      value: '4',
      answeredAt: new Date('2024-01-15T13:00:30'),
    },
    {
      questionId: 'timeline',
      question: 'When are you looking to buy?',
      value: '6-12',
      answeredAt: new Date('2024-01-15T13:00:45'),
    },
    {
      questionId: 'buyingReason',
      question: "What's your main reason for buying?",
      value: 'upgrade',
      answeredAt: new Date('2024-01-15T13:01:00'),
    },
    {
      questionId: 'email',
      question: "What's your email address?",
      value: 'luxury.buyer@example.com',
      answeredAt: new Date('2024-01-15T13:01:15'),
    },
  ];
  
  // ============================================
  // BROWSER FLOW SAMPLE
  // ============================================
  export const SAMPLE_BROWSER_CONVERSATION: FormAnswer[] = [
    {
      questionId: 'interest',
      question: 'What interests you most about real estate?',
      value: 'market-trends',
      answeredAt: new Date('2024-01-15T14:00:00'),
    },
    {
      questionId: 'location',
      question: 'Which area are you interested in?',
      value: 'downtown-halifax',
      answeredAt: new Date('2024-01-15T14:00:15'),
    },
    {
      questionId: 'priceRange',
      question: 'What price range interests you?',
      value: '600k-800k',
      answeredAt: new Date('2024-01-15T14:00:30'),
    },
    {
      questionId: 'timeline',
      question: 'When might you consider entering the market?',
      value: '6-12',
      answeredAt: new Date('2024-01-15T14:00:45'),
    },
    {
      questionId: 'goal',
      question: "What's your main goal?",
      value: 'invest',
      answeredAt: new Date('2024-01-15T14:01:00'),
    },
    {
      questionId: 'email',
      question: 'Want market updates sent to your email?',
      value: 'browser@example.com',
      answeredAt: new Date('2024-01-15T14:01:15'),
    },
  ];
  
  // Variant: Casual browser
  export const SAMPLE_BROWSER_CASUAL: FormAnswer[] = [
    {
      questionId: 'interest',
      question: 'What interests you most about real estate?',
      value: 'general',
      answeredAt: new Date('2024-01-15T15:00:00'),
    },
    {
      questionId: 'location',
      question: 'Which area are you interested in?',
      value: 'dartmouth',
      answeredAt: new Date('2024-01-15T15:00:15'),
    },
    {
      questionId: 'priceRange',
      question: 'What price range interests you?',
      value: 'under-400k',
      answeredAt: new Date('2024-01-15T15:00:30'),
    },
    {
      questionId: 'timeline',
      question: 'When might you consider entering the market?',
      value: '24+', // Just gathering info
      answeredAt: new Date('2024-01-15T15:00:45'),
    },
    {
      questionId: 'goal',
      question: "What's your main goal?",
      value: 'learn',
      answeredAt: new Date('2024-01-15T15:01:00'),
    },
    {
      questionId: 'email',
      question: 'Want market updates sent to your email?',
      value: 'casual.browser@example.com',
      answeredAt: new Date('2024-01-15T15:01:15'),
    },
  ];
  
  // ============================================
  // EXPORT ALL SAMPLES
  // ============================================
  export const ALL_SAMPLE_CONVERSATIONS = {
    seller: {
      standard: SAMPLE_SELLER_CONVERSATION,
      urgent: SAMPLE_SELLER_URGENT,
    },
    buyer: {
      standard: SAMPLE_BUYER_CONVERSATION,
      luxury: SAMPLE_BUYER_LUXURY,
    },
    browse: {
      standard: SAMPLE_BROWSER_CONVERSATION,
      casual: SAMPLE_BROWSER_CASUAL,
    },
  };
  
  // Helper to get conversation by flow type
  export function getSampleConversation(
    flowType: 'sell' | 'buy' | 'browse',
    variant: 'standard' | 'urgent' | 'luxury' | 'casual' = 'standard'
  ): FormAnswer[] {
    if (flowType === 'sell') {
      return variant === 'urgent' ? SAMPLE_SELLER_URGENT : SAMPLE_SELLER_CONVERSATION;
    }
    if (flowType === 'buy') {
      return variant === 'luxury' ? SAMPLE_BUYER_LUXURY : SAMPLE_BUYER_CONVERSATION;
    }
    return variant === 'casual' ? SAMPLE_BROWSER_CASUAL : SAMPLE_BROWSER_CONVERSATION;
  }