import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';

// Keep these types exported for backwards compatibility
export type DataCollectionType = 'email' | 'phone' | 'propertyAddress' | 'custom';
export type FlowIntention = 'buy' | 'sell' | 'browse';
export type OfferType = 'pdf' | 'landingPage' | 'video' | 'home-estimate' | 'custom' | 'real-estate-timeline';

export interface OnboardingState {
  // Step 1: Basic Info (NEW - simplified)
  agentFirstName: string;
  agentLastName: string;
  agentEmail: string;
  agentPhone: string;
  businessName: string;

  // Auto-set values (no longer user-selected)
  industry: string;
  selectedIntentions: FlowIntention[]; // Auto-set to all 3
  selectedOffers: OfferType[]; // Auto-set to timeline only

  // Step 2: Wizard state
  wizardSkipped: boolean;
  wizardCompleted: boolean;

  // Legacy fields (kept for backwards compatibility with existing configs)
  dataCollection: DataCollectionType[];
  customDataCollection: string;
  customOffer: string;
  offerFlowMap: Record<OfferType, FlowIntention[]>;
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: 'manual' | 'questions' | 'document';
  }>;
  colorConfig: ColorTheme;

  // Flow state
  currentStep: number;
  completedSteps: number[];

  // Actions - Step 1
  setAgentFirstName: (name: string) => void;
  setAgentLastName: (name: string) => void;
  setAgentEmail: (email: string) => void;
  setAgentPhone: (phone: string) => void;
  setBusinessName: (name: string) => void;

  // Actions - Step 2
  setWizardSkipped: (skipped: boolean) => void;
  setWizardCompleted: (completed: boolean) => void;

  // Actions - Flow control
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  reset: () => void;

  // Legacy actions (kept for backwards compatibility)
  setIndustry: (industry: string) => void;
  setDataCollection: (types: DataCollectionType[]) => void;
  setCustomDataCollection: (value: string) => void;
  setSelectedIntentions: (intentions: FlowIntention[]) => void;
  setSelectedOffers: (offers: OfferType[]) => void;
  setCustomOffer: (offer: string) => void;
  setOfferFlowMap: (offer: OfferType, flows: FlowIntention[]) => void;
  addKnowledgeBaseItem: (item: Omit<OnboardingState['knowledgeBaseItems'][0], 'id'>) => void;
  removeKnowledgeBaseItem: (id: string) => void;
  setColorConfig: (theme: ColorTheme) => void;
}

const initialState = {
  // Step 1: Basic Info
  agentFirstName: '',
  agentLastName: '',
  agentEmail: '',
  agentPhone: '',
  businessName: '',

  // Auto-set values
  industry: 'real-estate',
  selectedIntentions: ['buy', 'sell', 'browse'] as FlowIntention[], // All 3 enabled
  selectedOffers: ['real-estate-timeline'] as OfferType[], // Timeline only

  // Step 2: Wizard state
  wizardSkipped: false,
  wizardCompleted: false,

  // Legacy fields (defaults)
  dataCollection: ['email', 'phone'] as DataCollectionType[], // Predefined
  customDataCollection: '',
  customOffer: '',
  offerFlowMap: {} as Record<OfferType, FlowIntention[]>,
  knowledgeBaseItems: [] as OnboardingState['knowledgeBaseItems'],
  colorConfig: DEFAULT_THEME,

  // Flow state
  currentStep: 0, // 0 = welcome screen, 1-3 = actual steps
  completedSteps: [] as number[],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      // Step 1 actions
      setAgentFirstName: (name) => set({ agentFirstName: name }),
      setAgentLastName: (name) => set({ agentLastName: name }),
      setAgentEmail: (email) => set({ agentEmail: email }),
      setAgentPhone: (phone) => set({ agentPhone: phone }),
      setBusinessName: (name) => set({ businessName: name }),

      // Step 2 actions
      setWizardSkipped: (skipped) => set({ wizardSkipped: skipped }),
      setWizardCompleted: (completed) => set({ wizardCompleted: completed }),

      // Flow control actions
      setCurrentStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),
      reset: () => set(initialState),

      // Legacy actions (kept for backwards compatibility)
      setIndustry: (industry) => set({ industry }),
      setDataCollection: (types) => set({ dataCollection: types }),
      setCustomDataCollection: (value) => set({ customDataCollection: value }),
      setSelectedIntentions: (intentions) => set({ selectedIntentions: intentions }),
      setSelectedOffers: (offers) => set({ selectedOffers: offers }),
      setCustomOffer: (offer) => set({ customOffer: offer }),
      setOfferFlowMap: (offer, flows) => set((state) => ({
        offerFlowMap: { ...state.offerFlowMap, [offer]: flows },
      })),
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
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
