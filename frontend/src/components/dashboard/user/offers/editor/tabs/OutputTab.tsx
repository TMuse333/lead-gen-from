// frontend/src/components/dashboard/user/offers/editor/tabs/OutputTab.tsx
/**
 * Output Preview tab for offer editor
 * Shows a live preview of what users receive
 */

'use client';

import { useState, useEffect } from 'react';
import { Eye, Maximize2, Minimize2, Monitor, Smartphone } from 'lucide-react';
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
      whatTheyDid: 'We connected them with a local mortgage broker who explained NS-specific programs like the down payment assistance. They got pre-approved for $450K within a week.',
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
      whatTheyDid: 'We explored Dartmouth\'s waterfront and showed them the ferry commute. They found a beautiful home with harbour views for $80K less than Halifax equivalent.',
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
      whatTheyDid: 'We connected them with a real estate lawyer early and walked them through the NS process, including land transfer tax calculations.',
      outcome: 'Smooth closing with no surprises - they were grateful for the guidance on what makes NS different.',
      clientType: 'Out-of-province buyers',
      location: 'Halifax, NS',
      matchReasons: ['Same area', 'First-time buyer'],
    },
  ],
};

type ViewMode = 'desktop' | 'mobile';

export function OutputTab({ definition, agentName }: OutputTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [agentCredentials, setAgentCredentials] = useState<AgentCredentials>(SAMPLE_AGENT_CREDENTIALS);
  const [displayAgentName, setDisplayAgentName] = useState(agentName || 'Atlantic Realty Group');

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
