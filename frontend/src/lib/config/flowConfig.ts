// ============================================
// FLOW CONFIGURATION DATA
// ============================================

import { FlowType } from '@/types';
import { FormQuestion } from '@/types/question.types';

export interface FlowConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: string; // string-based icon reference (e.g., lucide name)
  heroTitle: string;
  heroSubtitle: string;
  nextSteps: string[];
  cta: string;
  questions: FormQuestion[];
  resultConfig: {
    showComparableHomes: boolean;
    showMarketTrends: boolean;
    showAgentAdvice: boolean;
    showEstimatedValue: boolean;
    emailReportSubject: string;
  };
}

export const flowConfigs: Record<FlowType, FlowConfig> = {
  // =======================
  // SELL FLOW
  // =======================
  sell: {
    id: 'sell',
    title: "Your Home Sale Strategy Is Ready!",
    subtitle: "We’ve analyzed your home in Halifax.",
    iconName: 'home',
    heroTitle: 'Estimated Sale Price',
    heroSubtitle: 'Based on current market + your home details',
    nextSteps: [
      'Schedule your FREE staging consultation',
      'Lock in your listing photos (drone included)',
      'Go live on MLS in 72 hours',
    ],
    cta: 'Launch My Sale →',
    questions: [
      {
        id: 'property_type',
        question: 'What type of property do you have?',
        type: 'button-select',
        required: true,
        weight: 1,
        aiContext: 'Determines the type of home being sold for valuation context.',
        choices: [
          { id: 'house', label: 'House', value: 'house' },
          { id: 'condo', label: 'Condo', value: 'condo' },
          { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
          { id: 'multi', label: 'Multi-family', value: 'multi' },
        ],
      },
      {
        id: 'property_age',
        question: 'How old is your home?',
        type: 'button-select',
        required: false,
        weight: 0.8,
        aiContext: 'Helps adjust valuation based on property age and maintenance expectations.',
        choices: [
          { id: 'new', label: '< 10 years', value: '0-10' },
          { id: 'mid', label: '10-20 years', value: '10-20' },
          { id: 'older', label: '20-30 years', value: '20-30' },
          { id: 'vintage', label: '30+ years', value: '30+' },
        ],
      },
      {
        id: 'renovations',
        question: 'Have you done any major renovations?',
        type: 'multi-select',
        required: false,
        weight: 0.6,
        aiContext: 'Renovations can impact home value; identifies property upgrades.',
        choices: [
          { id: 'kitchen', label: 'Kitchen', value: 'kitchen' },
          { id: 'bathroom', label: 'Bathroom', value: 'bathroom' },
          { id: 'both', label: 'Both', value: 'kitchen and bathroom' },
          { id: 'none', label: 'No major renovations', value: 'none' },
        ],
      },
      {
        id: 'timeline',
        question: 'When are you looking to sell?',
        type: 'button-select',
        required: true,
        weight: 0.9,
        aiContext: 'Establishes the urgency and ideal market timing for selling.',
        choices: [
          { id: 'asap', label: '0-3 months (ASAP)', value: '0-3' },
          { id: 'soon', label: '3-6 months', value: '3-6' },
          { id: 'planning', label: '6-12 months', value: '6-12' },
          { id: 'exploring', label: 'Just exploring', value: '12+' },
        ],
      },
      {
        id: 'selling_reason',
        question: "What's your main reason for selling?",
        type: 'button-select',
        required: false,
        weight: 0.7,
        aiContext: 'Provides emotional and practical motivation for sale insights.',
        choices: [
          { id: 'relocate', label: 'Relocating', value: 'relocating' },
          { id: 'upsize', label: 'Upsizing', value: 'upsizing' },
          { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
          { id: 'investment', label: 'Investment sale', value: 'investment' },
        ],
      },
      {
        id: 'email',
        question: "What's your email address?",
        type: 'email',
        required: true,
        weight: 1,
        aiContext: 'Used to deliver the valuation report to the user.',
      },
    ],
    resultConfig: {
      showComparableHomes: true,
      showMarketTrends: true,
      showAgentAdvice: true,
      showEstimatedValue: true,
      emailReportSubject: 'Your Personalized Home Value Analysis',
    },
  },

  // =======================
  // BUY FLOW
  // =======================
  buy: {
    id: 'buy',
    title: 'Your Dream Home Blueprint Is Here!',
    subtitle: 'We found homes matching your budget & timeline.',
    iconName: 'heart',
    heroTitle: 'Your Buying Power',
    heroSubtitle: 'Pre-approved range + hidden gems',
    nextSteps: [
      'Get pre-approved in 24 hrs',
      'See 3 off-market listings',
      'Tour your top match this weekend',
    ],
    cta: 'Find My Home →',
    questions: [
      {
        id: 'property_type',
        question: 'What type of property are you looking for?',
        type: 'button-select',
        required: true,
        weight: 1,
        aiContext: 'Defines the target property type for recommendation and matching.',
        choices: [
          { id: 'house', label: 'House', value: 'house' },
          { id: 'condo', label: 'Condo/Apartment', value: 'condo' },
          { id: 'townhouse', label: 'Townhouse', value: 'townhouse' },
          { id: 'any', label: 'Open to any type', value: 'any' },
        ],
      },
      {
        id: 'budget',
        question: "What's your budget range?",
        type: 'button-select',
        required: true,
        weight: 0.9,
        aiContext: 'Budget range helps filter suitable listings.',
        choices: [
          { id: 'under400', label: 'Under $400K', value: 'under-400k' },
          { id: '400-600', label: '$400K - $600K', value: '400k-600k' },
          { id: '600-800', label: '$600K - $800K', value: '600k-800k' },
          { id: 'over800', label: 'Over $800K', value: 'over-800k' },
        ],
      },
      {
        id: 'bedrooms',
        question: 'How many bedrooms do you need?',
        type: 'button-select',
        required: false,
        weight: 0.7,
        aiContext: 'Determines household needs and search filters.',
        choices: [
          { id: '1-2', label: '1-2 bedrooms', value: '1-2' },
          { id: '3', label: '3 bedrooms', value: '3' },
          { id: '4', label: '4 bedrooms', value: '4' },
          { id: '5plus', label: '5+ bedrooms', value: '5+' },
        ],
      },
      {
        id: 'timeline',
        question: 'When are you looking to buy?',
        type: 'button-select',
        required: true,
        weight: 0.8,
        aiContext: 'Helps match urgency and mortgage readiness.',
        choices: [
          { id: 'asap', label: 'ASAP (0-3 months)', value: '0-3' },
          { id: 'soon', label: '3-6 months', value: '3-6' },
          { id: 'planning', label: '6-12 months', value: '6-12' },
          { id: 'exploring', label: 'Just exploring', value: '12+' },
        ],
      },
      {
        id: 'buying_reason',
        question: "What's your main reason for buying?",
        type: 'button-select',
        required: false,
        weight: 0.6,
        aiContext: 'Provides motivation and context for buyer intent.',
        choices: [
          { id: 'first-home', label: 'First home', value: 'first-home' },
          { id: 'upgrade', label: 'Upgrading', value: 'upgrade' },
          { id: 'downsize', label: 'Downsizing', value: 'downsize' },
          { id: 'investment', label: 'Investment property', value: 'investment' },
        ],
      },
      {
        id: 'email',
        question: "What's your email address?",
        type: 'email',
        required: true,
        weight: 1,
        aiContext: 'Used to deliver your home recommendations.',
      },
    ],
    resultConfig: {
      showComparableHomes: true,
      showMarketTrends: true,
      showAgentAdvice: true,
      showEstimatedValue: false,
      emailReportSubject: 'Your Dream Home Blueprint',
    },
  },

  // =======================
  // BROWSE FLOW
  // =======================
  browse: {
    id: 'browse',
    title: 'Your Market Intelligence Report Is Ready!',
    subtitle: 'Custom insights for your area & budget.',
    iconName: 'dollar-sign',
    heroTitle: 'Market Overview',
    heroSubtitle: 'Real-time trends + opportunities',
    nextSteps: [
      'Download your market trends PDF',
      'Get alerts for your area',
      'Schedule a strategy call',
    ],
    cta: 'Get Market Updates →',
    questions: [
      {
        id: 'interest',
        question: 'What interests you most about real estate?',
        type: 'button-select',
        required: false,
        weight: 0.7,
        aiContext: 'Determines focus area of market insights (e.g., investment, trends).',
        choices: [
          { id: 'market-trends', label: 'Market trends', value: 'market-trends' },
          { id: 'investment', label: 'Investment opportunities', value: 'investment' },
          { id: 'neighborhood', label: 'Neighborhood info', value: 'neighborhood' },
          { id: 'general', label: 'General curiosity', value: 'general' },
        ],
      },
      {
        id: 'location',
        question: 'Which area are you interested in?',
        type: 'button-select',
        required: true,
        weight: 0.9,
        aiContext: 'Specifies the geographic focus of the market report.',
        choices: [
          { id: 'downtown', label: 'Downtown Halifax', value: 'downtown-halifax' },
          { id: 'dartmouth', label: 'Dartmouth', value: 'dartmouth' },
          { id: 'bedford', label: 'Bedford', value: 'bedford' },
          { id: 'other', label: 'Other areas', value: 'other' },
        ],
      },
      {
        id: 'price_range',
        question: 'What price range interests you?',
        type: 'button-select',
        required: false,
        weight: 0.8,
        aiContext: 'Used to tailor listings and market comparisons by budget.',
        choices: [
          { id: 'under400', label: 'Under $400K', value: 'under-400k' },
          { id: '400-600', label: '$400K - $600K', value: '400k-600k' },
          { id: '600-800', label: '$600K - $800K', value: '600k-800k' },
          { id: 'over800', label: 'Over $800K', value: 'over-800k' },
        ],
      },
      {
        id: 'timeline',
        question: 'When might you consider entering the market?',
        type: 'button-select',
        required: false,
        weight: 0.6,
        aiContext: 'Helps forecast engagement period for follow-up.',
        choices: [
          { id: 'soon', label: 'Within 6 months', value: '0-6' },
          { id: 'year', label: 'Within a year', value: '6-12' },
          { id: 'later', label: '1-2 years', value: '12-24' },
          { id: 'just-looking', label: 'Just gathering info', value: '24+' },
        ],
      },
      {
        id: 'goal',
        question: "What's your main goal?",
        type: 'button-select',
        required: false,
        weight: 0.7,
        aiContext: 'Identifies long-term intent (buy, sell, invest, learn).',
        choices: [
          { id: 'buy-future', label: 'Planning to buy', value: 'buy-future' },
          { id: 'sell-future', label: 'Planning to sell', value: 'sell-future' },
          { id: 'invest', label: 'Looking to invest', value: 'invest' },
          { id: 'learn', label: 'Just learning', value: 'learn' },
        ],
      },
      {
        id: 'email',
        question: 'Want market updates sent to your email?',
        type: 'email',
        required: true,
        weight: 1,
        aiContext: 'Used to deliver the personalized market report.',
      },
    ],
    resultConfig: {
      showComparableHomes: false,
      showMarketTrends: true,
      showAgentAdvice: true,
      showEstimatedValue: false,
      emailReportSubject: 'Your Market Intelligence Report',
    },
  },
};
