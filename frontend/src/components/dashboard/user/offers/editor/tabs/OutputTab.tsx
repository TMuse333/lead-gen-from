// frontend/src/components/dashboard/user/offers/editor/tabs/OutputTab.tsx
/**
 * Output Preview tab for offer editor
 * Shows a live preview of what users receive
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  ChevronDown,
  Lightbulb,
  BookOpen,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import type { OfferDefinition } from '@/lib/offers/core/types';
import { TimelineLandingPage } from '@/components/ux/resultsComponents/timeline/TimelineLandingPage';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
import type { MarketData } from '@/components/ux/resultsComponents/timeline/components/MarketContext';
import type { AgentCredentials } from '@/components/ux/resultsComponents/timeline/components/AgentExpertise';
import type { MatchedStory } from '@/components/ux/resultsComponents/timeline/components/StoryCard';

interface OutputTabProps {
  definition: OfferDefinition;
  agentName?: string;
}

// Type for user config API response
interface UserConfigResponse {
  success: boolean;
  config?: {
    agentProfile?: AgentCredentials;
    businessName?: string;
  };
}

// Sample timeline data for preview - Halifax, Nova Scotia
const SAMPLE_TIMELINE_OUTPUT: TimelineOutput = {
  id: 'preview-timeline-001',
  type: 'real-estate-timeline',
  businessName: 'Atlantic Realty Group',
  flow: 'buy',
  generatedAt: new Date().toISOString(),
  version: '1.0.0',
  title: 'Your Personal Home Buying Timeline',
  subtitle: 'Customized for first-time buyers in Halifax, Nova Scotia',
  userSituation: {
    flow: 'buy',
    timeline: '6 months',
    location: 'Halifax, NS',
    budget: '$425,000',
    currentStage: 'Just starting',
    isFirstTime: true,
    propertyType: 'Single-family home',
  },
  phases: [
    {
      id: 'financial-prep',
      name: 'Financial Preparation',
      timeline: 'Week 1-2',
      description: 'Get your finances in order and secure pre-approval to know your exact budget. Halifax\'s market moves quickly, so being prepared gives you an advantage.',
      actionItems: [
        { task: 'Check your credit score and review your credit report', priority: 'high', estimatedTime: '1 hour' },
        { task: 'Get pre-approved for a mortgage with a local lender', priority: 'high', estimatedTime: '3-5 days' },
        { task: 'Calculate your total budget including closing costs (1.5-4%)', priority: 'medium', estimatedTime: '2 hours' },
        { task: 'Research first-time home buyer programs in Nova Scotia', priority: 'medium', estimatedTime: '1 hour' },
      ],
      agentAdvice: [
        'In Halifax, pre-approval is essential. The market has been competitive, especially in desirable areas like the South End and Bedford.',
        'Don\'t forget about the First-Time Home Buyers\' Tax Credit and the Nova Scotia Down Payment Assistance Program - they can save you thousands.',
      ],
      order: 1,
    },
    {
      id: 'house-hunting',
      name: 'House Hunting',
      timeline: 'Week 2-9',
      description: 'Tour properties across Halifax Regional Municipality and narrow down your must-haves versus nice-to-haves.',
      actionItems: [
        { task: 'Create your wish list (must-haves vs nice-to-haves)', priority: 'high', estimatedTime: '2 hours' },
        { task: 'Research neighbourhoods: Dartmouth, Bedford, Clayton Park, South End', priority: 'high', estimatedTime: '4-5 hours' },
        { task: 'Attend open houses and schedule private showings', priority: 'medium', estimatedTime: 'Ongoing' },
        { task: 'Consider commute times - Halifax traffic can be surprising!', priority: 'low', estimatedTime: '1 hour' },
      ],
      agentAdvice: [
        'Halifax homes in popular areas like the South End or near Dalhousie can move within days. Be ready to act!',
        'Don\'t overlook Dartmouth - it offers great value and the ferry commute is actually quite pleasant.',
      ],
      order: 2,
    },
    {
      id: 'make-offer',
      name: 'Make an Offer',
      timeline: 'Week 9-11',
      description: 'Found the one? Let\'s put together a competitive offer that stands out.',
      actionItems: [
        { task: 'Review comparable sales with your agent', priority: 'high', estimatedTime: '1-2 hours' },
        { task: 'Determine your offer price and terms', priority: 'high', estimatedTime: '2 hours' },
        { task: 'Submit deposit (typically $5,000-$10,000 in Halifax)', priority: 'high', estimatedTime: '1 day' },
        { task: 'Negotiate any counter-offers', priority: 'medium', estimatedTime: 'Varies' },
      ],
      agentAdvice: [
        'In Halifax\'s current market, clean offers with fewer conditions can help you stand out - but never skip the home inspection!',
      ],
      order: 3,
    },
    {
      id: 'under-contract',
      name: 'Under Contract',
      timeline: 'Week 11-15',
      description: 'Complete due diligence, inspections, and prepare for closing. Halifax homes often have unique considerations.',
      actionItems: [
        { task: 'Schedule home inspection (check for Halifax-specific issues)', priority: 'high', estimatedTime: '3-4 hours' },
        { task: 'Review inspection report and negotiate repairs if needed', priority: 'high', estimatedTime: '2-3 days' },
        { task: 'Complete appraisal process', priority: 'medium', estimatedTime: '1-2 weeks' },
        { task: 'Finalize mortgage and lock in rate', priority: 'high', estimatedTime: '1 week' },
        { task: 'Get homeowner\'s insurance quotes', priority: 'medium', estimatedTime: '2-3 hours' },
      ],
      agentAdvice: [
        'Halifax homes, especially older ones in the South End or North End, should be checked for knob-and-tube wiring, oil tank issues, and foundation concerns due to the soil conditions.',
      ],
      order: 4,
    },
    {
      id: 'closing',
      name: 'Closing Day',
      timeline: 'Week 15-17',
      description: 'Final walkthrough, sign documents at your lawyer\'s office, and get your keys!',
      actionItems: [
        { task: 'Complete final walkthrough of the property', priority: 'high', estimatedTime: '1 hour' },
        { task: 'Review statement of adjustments from your lawyer', priority: 'high', estimatedTime: '30 min' },
        { task: 'Arrange wire transfer of closing funds', priority: 'high', estimatedTime: '1 day' },
        { task: 'Sign closing documents at lawyer\'s office', priority: 'high', estimatedTime: '1-2 hours' },
        { task: 'Collect your keys!', priority: 'high', estimatedTime: 'The best moment!' },
      ],
      agentAdvice: [
        'In Nova Scotia, you\'ll close at a lawyer\'s office rather than a title company. Budget $1,200-$1,800 for legal fees.',
        'Beware of wire fraud! Always verify wiring instructions by calling your lawyer directly at a known number.',
      ],
      order: 5,
    },
  ],
  totalEstimatedTime: '4-5 months',
  disclaimer: 'Timelines are estimates and can vary based on market conditions, financing approval, and other factors. The Halifax market can be competitive, so actual timelines may differ. Always consult with your real estate professional for current market conditions.',
  metadata: {
    phasesCount: 5,
    totalActionItems: 23,
  },
};

// Sample market data for Halifax
const SAMPLE_MARKET_DATA: MarketData = {
  location: 'Halifax, NS',
  avgDaysOnMarket: 21,
  medianPrice: '$485,000',
  priceChange30d: 2.3,
  competitiveness: 'high',
  inventory: 'low',
  bestTimeToAct: 'Spring (March-May)',
  marketInsight: 'Halifax remains one of Atlantic Canada\'s hottest markets. With low inventory and steady demand from newcomers, homes in desirable areas often receive multiple offers. Being prepared and acting quickly is essential.',
};

// Sample agent credentials
const SAMPLE_AGENT_CREDENTIALS: AgentCredentials = {
  name: 'Sarah MacLeod',
  title: 'REALTOR®',
  company: 'Atlantic Realty Group',
  yearsExperience: 14,
  totalTransactions: 320,
  transactionsInArea: 85,
  similarClientsHelped: 42,
  specializations: ['First-Time Buyers', 'Halifax Peninsula', 'Relocation'],
  certifications: ['ABR (Accredited Buyer\'s Representative)', 'SRES (Seniors Real Estate Specialist)'],
  avgRating: 4.9,
  reviewCount: 127,
  areasServed: ['Halifax', 'Dartmouth', 'Bedford', 'Clayton Park', 'Sackville'],
  email: 'sarah@atlanticrealty.ca',
  phone: '(902) 555-0123',
};

// Sample matched stories per phase
const SAMPLE_STORIES_BY_PHASE: Record<string, MatchedStory[]> = {
  'financial-prep': [
    {
      id: 'story-1',
      title: 'The Murphys\' Pre-Approval Journey',
      situation: 'First-time buyers relocating from Toronto to Halifax, unsure about the Nova Scotia market and financing options.',
      action: 'We connected them with a local mortgage broker who explained NS-specific programs like the down payment assistance. They got pre-approved for $450K within a week.',
      outcome: 'Saved $8,000 through first-time buyer programs and felt confident knowing their exact budget before starting the search.',
      clientType: 'First-time buyer',
      location: 'Halifax, NS',
      budget: '$420,000',
      matchReasons: ['Similar budget', 'First-time buyer', 'Same area'],
    },
  ],
  'house-hunting': [
    {
      id: 'story-2',
      title: 'Finding Hidden Gems in Dartmouth',
      situation: 'Young couple wanted to be near downtown Halifax but couldn\'t afford South End prices.',
      action: 'We explored Dartmouth\'s waterfront and showed them the ferry commute. They found a beautiful home with harbour views for $80K less than Halifax equivalent.',
      outcome: 'Purchased a renovated 3-bedroom in Dartmouth with a 12-minute ferry commute - they love it!',
      clientType: 'Young professionals',
      location: 'Dartmouth, NS',
      budget: '$400,000',
      matchReasons: ['Similar budget', 'First-time buyer'],
    },
  ],
  'closing': [
    {
      id: 'story-3',
      title: 'Navigating the Nova Scotia Closing Process',
      situation: 'Buyers from Ontario were confused about closing at a lawyer\'s office instead of a title company.',
      action: 'We connected them with a real estate lawyer early and walked them through the NS process, including land transfer tax calculations.',
      outcome: 'Smooth closing with no surprises - they were grateful for the guidance on what makes NS different.',
      clientType: 'Out-of-province buyers',
      location: 'Halifax, NS',
      matchReasons: ['Same area', 'First-time buyer'],
    },
  ],
};

type ViewMode = 'desktop' | 'mobile';

// ============================================================
// Step Advice Accordion Component (Demo)
// Shows how extra step-level advice appears below a step card
// ============================================================

interface StepAdvice {
  stepTitle: string;
  tip?: string;
  story?: {
    situation: string;
    action: string;
    outcome: string;
  };
}

interface StepAdviceAccordionProps {
  advice: StepAdvice;
  isOpen: boolean;
  onToggle: () => void;
}

function StepAdviceAccordion({ advice, isOpen, onToggle }: StepAdviceAccordionProps) {
  const hasContent = advice.tip || advice.story;
  if (!hasContent) return null;

  return (
    <div className="border-l-2 border-purple-500/30 ml-4 pl-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors py-1"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Extra insights for this step</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-3 space-y-3">
              {/* Tip */}
              {advice.tip && (
                <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                  <div className="p-1.5 bg-cyan-100 rounded-lg flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">
                      Pro Tip
                    </p>
                    <p className="text-sm text-gray-700">{advice.tip}</p>
                  </div>
                </div>
              )}

              {/* Story */}
              {advice.story && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Related Story
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="text-amber-600 font-medium">Situation:</span> {advice.story.situation}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-amber-600 font-medium">What I did:</span> {advice.story.action}
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                      <p className="text-green-800 text-sm">
                        <span className="font-medium">Result:</span> {advice.story.outcome}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sample step-level advice for demo
const SAMPLE_STEP_ADVICE: Record<string, StepAdvice> = {
  'get-pre-approved': {
    stepTitle: 'Get pre-approved for a mortgage',
    tip: 'Shop around with at least 3 lenders. Credit unions in Nova Scotia often have better rates than big banks, and multiple inquiries within 14 days count as one for your credit score.',
    story: {
      situation: 'A client was nervous about pre-approval affecting their credit score and kept delaying.',
      action: 'I explained the 14-day shopping window and connected them with two local credit unions and one bank. They compared offers side-by-side.',
      outcome: 'Saved $12,000 over the life of their mortgage by getting a 0.3% lower rate from a credit union.',
    },
  },
  'schedule-inspection': {
    stepTitle: 'Schedule home inspection',
    tip: 'In Halifax, always ask about oil tanks, knob-and-tube wiring, and vermiculite insulation. These are common in older homes and can affect insurance.',
  },
  'negotiate-repairs': {
    stepTitle: 'Negotiate repairs if needed',
    story: {
      situation: 'Inspection revealed the roof needed replacement within 2 years.',
      action: 'Instead of asking for repairs, we negotiated a $15,000 price reduction so the buyers could choose their own contractor.',
      outcome: 'Buyers got the house at a fair price and replaced the roof 6 months later with a contractor they trusted.',
    },
  },
};

export function OutputTab({ definition, agentName }: OutputTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [agentCredentials, setAgentCredentials] = useState<AgentCredentials>(SAMPLE_AGENT_CREDENTIALS);
  const [displayAgentName, setDisplayAgentName] = useState(agentName || 'Atlantic Realty Group');
  const [expandedStepAdvice, setExpandedStepAdvice] = useState<string | null>(null);

  // Fetch user's agent profile from config
  useEffect(() => {
    async function fetchAgentProfile() {
      try {
        const response = await fetch('/api/user/config');
        if (response.ok) {
          const data: UserConfigResponse = await response.json();
          if (data.success && data.config?.agentProfile) {
            // Use user's custom agent profile
            setAgentCredentials({
              ...SAMPLE_AGENT_CREDENTIALS,
              ...data.config.agentProfile,
            });
          }
          if (data.config?.businessName) {
            setDisplayAgentName(agentName || data.config.businessName);
          }
        }
      } catch {
        // Keep using sample credentials on error
      }
    }
    fetchAgentProfile();
  }, [agentName]);

  const isTimeline = definition.type === 'real-estate-timeline';

  if (!isTimeline) {
    // For non-timeline offers, show the schema view
    return (
      <div className="space-y-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-cyan-400 font-semibold mb-2">What Gets Generated</h3>
          <p className="text-slate-300 text-sm">
            This shows the structure of content that will be created for each user.
            The AI automatically fills in all the details based on their specific situation.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-3">
            Output Components
          </h3>
          <div className="space-y-2">
            {Object.entries(definition.outputSchema.properties || {}).map(([key, prop]: [string, any]) => (
              <div key={key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-100 font-medium">{key}</span>
                      {prop.required && (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">{prop.type}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{prop.description}</p>
                    {prop.example && (
                      <div className="mt-2 text-xs text-slate-500">
                        Example: <span className="text-cyan-400">{typeof prop.example === 'string' ? prop.example : JSON.stringify(prop.example)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Timeline offer - show live preview with all new features
  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Live Output Preview</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded transition ${
                viewMode === 'desktop'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded transition ${
                viewMode === 'mobile'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Expand/collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="text-sm">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-slate-300 text-sm">
          <span className="text-cyan-400 font-semibold">This is exactly what your users will receive</span> —
          a personalized landing page with their timeline, action items, market insights, and your expert advice.
          The content below is sample data for Halifax, NS; real outputs will be customized based on each user&apos;s responses.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Stories</div>
          <div className="text-slate-200 text-sm">Client stories matched to each phase</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">Interactive</div>
          <div className="text-slate-200 text-sm">Checkable action items with notes</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">Market Data</div>
          <div className="text-slate-200 text-sm">Real-time market context</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-1">Agent Profile</div>
          <div className="text-slate-200 text-sm">Your expertise highlighted</div>
        </div>
      </div>

      {/* Step-Level Advice Demo Section */}
      <div className="bg-gradient-to-br from-purple-500/10 to-slate-800/50 border border-purple-500/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-semibold text-slate-100">Step-Level Advice (Demo)</h4>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <p className="text-slate-300 text-sm mb-3">
            Each phase automatically shows <span className="text-emerald-400 font-medium">1 tip + 1 story</span> matched
            to the client&apos;s situation. If you add extra advice to specific steps in the Setup Wizard, it appears
            in an expandable accordion like this:
          </p>

          {/* Demo: Sample step cards with expandable advice */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            {/* Sample Phase Header */}
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                  Phase 1
                </span>
                <span className="text-xs text-gray-500">Week 1-2</span>
              </div>
              <h5 className="text-lg font-semibold text-gray-900">Financial Preparation</h5>
            </div>

            {/* Demo Steps */}
            <div className="space-y-3">
              {/* Step 1 - With extra advice */}
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-red-400 bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckSquare className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Get pre-approved for a mortgage</p>
                    <p className="text-gray-500 text-sm">3-5 days</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">High</span>
                </div>
                <StepAdviceAccordion
                  advice={SAMPLE_STEP_ADVICE['get-pre-approved']}
                  isOpen={expandedStepAdvice === 'get-pre-approved'}
                  onToggle={() => setExpandedStepAdvice(
                    expandedStepAdvice === 'get-pre-approved' ? null : 'get-pre-approved'
                  )}
                />
              </div>

              {/* Step 2 - No extra advice (normal step) */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border-2 border-red-400 bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckSquare className="w-3 h-3 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Check your credit score</p>
                  <p className="text-gray-500 text-sm">1 hour</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">High</span>
              </div>

              {/* Step 3 - With tip only */}
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckSquare className="w-3 h-3 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Schedule home inspection</p>
                    <p className="text-gray-500 text-sm">3-4 hours</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">Medium</span>
                </div>
                <StepAdviceAccordion
                  advice={SAMPLE_STEP_ADVICE['schedule-inspection']}
                  isOpen={expandedStepAdvice === 'schedule-inspection'}
                  onToggle={() => setExpandedStepAdvice(
                    expandedStepAdvice === 'schedule-inspection' ? null : 'schedule-inspection'
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          <strong className="text-slate-400">Note:</strong> Most steps don&apos;t need extra advice—the phase-level
          1 tip + 1 story covers it. Use step-level advice for critical steps where you have specific insights.
        </p>
      </div>

      {/* Preview container */}
      <div
        className={`
          bg-white rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl
          transition-all duration-300
          ${isExpanded ? 'fixed inset-4 z-50' : ''}
        `}
      >
        {/* Browser chrome */}
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-700 rounded px-3 py-1 text-xs text-slate-400 text-center">
              yoursite.com/timeline/abc123
            </div>
          </div>
        </div>

        {/* Preview iframe container */}
        <div
          className={`
            overflow-auto bg-gray-50
            ${isExpanded ? 'h-[calc(100%-40px)]' : 'h-[700px]'}
          `}
        >
          <div
            className={`
              mx-auto transition-all duration-300
              ${viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'}
            `}
            style={{
              transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
              transformOrigin: 'top center',
            }}
          >
            <TimelineLandingPage
              data={SAMPLE_TIMELINE_OUTPUT}
              userName="Alex"
              agentName={displayAgentName}
              agentCredentials={agentCredentials}
              marketData={SAMPLE_MARKET_DATA}
              storiesByPhase={SAMPLE_STORIES_BY_PHASE}
              interactive={true}
              forceMobileLayout={viewMode === 'mobile'}
            />
          </div>
        </div>
      </div>

      {/* Overlay backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Note */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          <strong className="text-slate-300">Note:</strong> Users can download this as a PDF,
          share the link, and track their progress through the interactive checklist.
          Stories from your knowledge base are automatically matched to relevant phases based on the user&apos;s situation.
        </p>
      </div>
    </div>
  );
}
