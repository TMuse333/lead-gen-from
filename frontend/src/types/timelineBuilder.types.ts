// src/types/timelineBuilder.types.ts
/**
 * Types for the Timeline Builder feature
 * Allows agents to customize their offer timeline phases and steps
 */

// ==================== PHASE CONFIGURATION ====================

/**
 * Priority levels for actionable steps
 */
export type StepPriority = 'high' | 'medium' | 'low';

/**
 * An actionable step within a phase
 * Can link to a Qdrant story OR have inline custom experience text
 */
export interface CustomActionableStep {
  id: string;
  title: string;
  description?: string;
  priority: StepPriority;
  order: number;
  linkedStoryId?: string;      // Qdrant story ID (if linking existing story)
  inlineExperience?: string;   // Custom inline text (if not using Qdrant)
}

/**
 * A customizable phase in the timeline
 */
export interface CustomPhaseConfig {
  id: string;                  // e.g., 'financial-prep', 'custom-phase-1'
  name: string;                // Display name
  timeline: string;            // e.g., 'Week 1-2'
  description: string;
  order: number;
  isOptional?: boolean;
  actionableSteps: CustomActionableStep[];
}

/**
 * Flow type for timeline phases
 */
export type TimelineFlow = 'buy' | 'sell' | 'browse';

/**
 * Phase configurations organized by flow type
 */
export interface FlowPhaseConfigs {
  buy?: CustomPhaseConfig[];
  sell?: CustomPhaseConfig[];
  browse?: CustomPhaseConfig[];
}

// ==================== BOT RESPONSE CONFIGURATION ====================

/**
 * Links a chatbot question to a phase, step, and personal advice
 */
export interface BotQuestionConfig {
  questionId: string;          // Links to ConversationQuestion.id
  linkedPhaseId?: string;      // Links to CustomPhaseConfig.id
  linkedStepId?: string;       // Links to CustomActionableStep.id (optional)
  personalAdvice?: string;     // Custom advice to include in bot response
  linkedStoryId?: string;      // Qdrant story to include in response
}

/**
 * Bot configurations organized by flow type
 */
export interface FlowBotConfig {
  buy?: BotQuestionConfig[];
  sell?: BotQuestionConfig[];
  browse?: BotQuestionConfig[];
}

// ==================== CUSTOM QUESTIONS ====================

/**
 * Input type for custom questions
 */
export type QuestionInputType = 'buttons' | 'text' | 'email' | 'phone' | 'number';

/**
 * A button option for custom questions
 */
export interface CustomButtonOption {
  id: string;
  label: string;
  value: string;
}

/**
 * A customizable question in the chatbot flow
 */
export interface CustomQuestion {
  id: string;
  question: string;              // The question text
  label?: string;                // Short display label for tracking (e.g., "Timeline", "Budget")
  order: number;
  inputType: QuestionInputType;
  mappingKey?: string;           // What field this maps to (e.g., 'timeline', 'budget')
  buttons?: CustomButtonOption[]; // For button-type questions
  placeholder?: string;          // For text input questions
  required?: boolean;
  // Linking to phases/advice
  linkedPhaseId?: string;
  linkedStepId?: string;
  personalAdvice?: string;       // Advice to show after this question
  linkedStoryId?: string;        // Story to reference
}

/**
 * Custom questions organized by flow type
 */
export interface FlowQuestionConfigs {
  buy?: CustomQuestion[];
  sell?: CustomQuestion[];
  browse?: CustomQuestion[];
}

// ==================== CONSTRAINTS ====================

/**
 * Validation constraints for phases, steps, and questions
 */
export const PHASE_CONSTRAINTS = {
  MIN_PHASES: 5,
  MAX_PHASES: 10,
  MIN_STEPS_PER_PHASE: 1,
  MAX_STEPS_PER_PHASE: 8,
} as const;

export const QUESTION_CONSTRAINTS = {
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 15,
  MIN_BUTTONS: 2,
  MAX_BUTTONS: 6,
} as const;

// ==================== API TYPES ====================

/**
 * Response from GET /api/custom-phases
 */
export interface CustomPhasesResponse {
  success: boolean;
  flow: TimelineFlow;
  phases: CustomPhaseConfig[];
  isCustom: boolean;           // true if user has customized, false if defaults
}

/**
 * Request body for PUT /api/custom-phases
 */
export interface UpdatePhasesRequest {
  flow: TimelineFlow;
  phases: CustomPhaseConfig[];
}

/**
 * Response from GET /api/bot-config
 */
export interface BotConfigResponse {
  success: boolean;
  flow: TimelineFlow;
  configs: BotQuestionConfig[];
  isConfigured: boolean;
}

/**
 * Request body for PUT /api/bot-config
 */
export interface UpdateBotConfigRequest {
  flow: TimelineFlow;
  configs: BotQuestionConfig[];
}

/**
 * Story reference for the story picker
 * Supports both new structured format (situation/action/outcome)
 * and legacy format (advice string)
 */
export interface AvailableStory {
  id: string;
  title: string;
  // Legacy field - may contain full text or be empty for new structured stories
  advice: string;
  tags: string[];
  flow?: string;
  // New structured fields for stories
  situation?: string;
  action?: string;
  outcome?: string;
  // Type discriminator (story vs tip)
  kind?: 'story' | 'tip';
}

/**
 * Response from GET /api/stories/available
 */
export interface AvailableStoriesResponse {
  success: boolean;
  stories: AvailableStory[];
  total: number;
}

// ==================== VALIDATION ====================

/**
 * Validation error for phase configuration
 */
export interface PhaseValidationError {
  phaseId?: string;
  stepId?: string;
  field: string;
  message: string;
}

/**
 * Validate phase configuration
 */
export function validatePhases(phases: CustomPhaseConfig[]): PhaseValidationError[] {
  const errors: PhaseValidationError[] = [];

  // Check phase count
  if (phases.length < PHASE_CONSTRAINTS.MIN_PHASES) {
    errors.push({
      field: 'phases',
      message: `Minimum ${PHASE_CONSTRAINTS.MIN_PHASES} phases required`,
    });
  }
  if (phases.length > PHASE_CONSTRAINTS.MAX_PHASES) {
    errors.push({
      field: 'phases',
      message: `Maximum ${PHASE_CONSTRAINTS.MAX_PHASES} phases allowed`,
    });
  }

  // Check each phase
  phases.forEach((phase) => {
    if (!phase.name.trim()) {
      errors.push({
        phaseId: phase.id,
        field: 'name',
        message: 'Phase name is required',
      });
    }

    if (!phase.description.trim()) {
      errors.push({
        phaseId: phase.id,
        field: 'description',
        message: 'Phase description is required',
      });
    }

    // Check step count
    if (phase.actionableSteps.length < PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE) {
      errors.push({
        phaseId: phase.id,
        field: 'actionableSteps',
        message: `At least ${PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE} step required`,
      });
    }
    if (phase.actionableSteps.length > PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE) {
      errors.push({
        phaseId: phase.id,
        field: 'actionableSteps',
        message: `Maximum ${PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE} steps allowed`,
      });
    }

    // Check each step
    phase.actionableSteps.forEach((step) => {
      if (!step.title.trim()) {
        errors.push({
          phaseId: phase.id,
          stepId: step.id,
          field: 'title',
          message: 'Step title is required',
        });
      }
    });
  });

  return errors;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique ID for a new phase
 */
export function generatePhaseId(): string {
  return `custom-phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for a new step
 */
export function generateStepId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new empty phase
 */
export function createEmptyPhase(order: number): CustomPhaseConfig {
  return {
    id: generatePhaseId(),
    name: 'New Phase',
    timeline: 'Week X',
    description: 'Describe this phase...',
    order,
    isOptional: false,
    actionableSteps: [createEmptyStep(0)],
  };
}

/**
 * Create a new empty step
 */
export function createEmptyStep(order: number): CustomActionableStep {
  return {
    id: generateStepId(),
    title: 'New Step',
    description: '',
    priority: 'medium',
    order,
  };
}
