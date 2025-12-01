import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';
import type { AdviceType } from '@/types/advice.types';
import { DEFAULT_ADVICE_TYPE } from '@/types/advice.types';

export type DataCollectionType = 'email' | 'phone' | 'propertyAddress' | 'custom';
export type FlowIntention = 'buy' | 'sell' | 'browse';
export type OfferType = 'pdf' | 'landingPage' | 'video' | 'home-estimate' | 'custom';

export interface OnboardingState {
  // Step 1: Business Info & Setup
  businessName: string;
  industry: string;
  dataCollection: DataCollectionType[];
  customDataCollection: string;
  selectedIntentions: FlowIntention[];
  
  // Step 2: Offers
  selectedOffers: OfferType[];
  customOffer: string;
  offerFlowMap: Record<OfferType, FlowIntention[]>; // Which flows each offer applies to
  
  // Step 3: Conversation Flows
  conversationFlows: Record<string, ConversationFlow>; // keyed by flow type (buy/sell/browse)
  
  // Step 4: Knowledge Base
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: 'manual' | 'questions' | 'document';
    type?: AdviceType; // Optional advice type (defaults to 'general-advice')
  }>;
  
  // Step 5: Color Configuration
  colorConfig: ColorTheme;
  
  // Flow state
  currentStep: number;
  completedSteps: number[];
  
  // Actions
  setBusinessName: (name: string) => void;
  setIndustry: (industry: string) => void;
  setDataCollection: (types: DataCollectionType[]) => void;
  setCustomDataCollection: (value: string) => void;
  setSelectedIntentions: (intentions: FlowIntention[]) => void;
  setSelectedOffers: (offers: OfferType[]) => void;
  setCustomOffer: (offer: string) => void;
  setOfferFlowMap: (offer: OfferType, flows: FlowIntention[]) => void;
  setConversationFlows: (flows: Record<string, ConversationFlow>) => void;
  addConversationFlow: (flow: ConversationFlow) => void;
  updateConversationFlow: (flowType: string, flow: Partial<ConversationFlow>) => void;
  addKnowledgeBaseItem: (item: Omit<OnboardingState['knowledgeBaseItems'][0], 'id'>) => void;
  removeKnowledgeBaseItem: (id: string) => void;
  setColorConfig: (theme: ColorTheme) => void;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  reset: () => void;
}

const initialState = {
  businessName: '',
  industry: 'real-estate',
  dataCollection: [] as DataCollectionType[],
  customDataCollection: '',
  selectedIntentions: [] as FlowIntention[],
  selectedOffers: [] as OfferType[],
  customOffer: '',
  offerFlowMap: {} as Record<OfferType, FlowIntention[]>,
  conversationFlows: {} as Record<string, ConversationFlow>,
  knowledgeBaseItems: [] as Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: 'manual' | 'questions' | 'document';
    type?: AdviceType;
  }>,
  colorConfig: DEFAULT_THEME,
  currentStep: 1,
  completedSteps: [] as number[],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setBusinessName: (name) => set({ businessName: name }),
      setIndustry: (industry) => set({ industry }),
      setDataCollection: (types) => set({ dataCollection: types }),
      setCustomDataCollection: (value) => set({ customDataCollection: value }),
      setSelectedIntentions: (intentions) => set({ selectedIntentions: intentions }),
      setSelectedOffers: (offers) => set({ selectedOffers: offers }),
      setCustomOffer: (offer) => set({ customOffer: offer }),
      setOfferFlowMap: (offer, flows) => set((state) => ({
        offerFlowMap: { ...state.offerFlowMap, [offer]: flows },
      })),
      setConversationFlows: (flows) => set({ conversationFlows: flows }),
      addConversationFlow: (flow) =>
        set((state) => ({
          conversationFlows: { ...state.conversationFlows, [flow.type]: flow },
        })),
      updateConversationFlow: (flowType, updates) =>
        set((state) => {
          const existing = state.conversationFlows[flowType];
          if (!existing) return state;
          return {
            conversationFlows: {
              ...state.conversationFlows,
              [flowType]: { ...existing, ...updates },
            },
          };
        }),
      addKnowledgeBaseItem: (item) =>
        set((state) => ({
          knowledgeBaseItems: [
            ...state.knowledgeBaseItems,
            { ...item, id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
          ],
        })),
      removeKnowledgeBaseItem: (id) =>
        set((state) => ({
          knowledgeBaseItems: state.knowledgeBaseItems.filter((item) => item.id !== id),
        })),
      setColorConfig: (theme) => set({ colorConfig: theme }),
      setCurrentStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

