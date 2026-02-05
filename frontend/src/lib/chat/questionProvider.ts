// src/lib/chat/questionProvider.ts
/**
 * Question Provider - Fetches questions from MongoDB with default fallbacks
 *
 * Flow:
 * 1. Try to fetch custom questions from MongoDB via /api/custom-questions
 * 2. If fetch fails or returns empty, fall back to default questions
 * 3. Default questions ensure the bot always has something to ask
 *
 * Agents can customize questions via the setup wizard. The defaults cover:
 * - Buy: reason, location, budget, timeline, pre-approval
 * - Sell: reason, location, home value, timeline
 */

import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';
import type { ButtonOption } from '@/types/conversation.types';
import { getDefaultQuestions, getAllDefaultQuestions } from './defaultQuestions';

// Cache for fetched questions per flow
const questionCache: Map<TimelineFlow, CustomQuestion[]> = new Map();
let cacheClientId: string | null = null;

/**
 * Fetch questions for a flow from the API
 * Uses caching to avoid repeated fetches
 */
export async function fetchQuestionsForFlow(
  flow: TimelineFlow,
  clientId?: string
): Promise<CustomQuestion[]> {
  console.log(`[QuestionProvider] 🔍 Fetching questions for flow: ${flow}, clientId: ${clientId || 'none'}`);

  // Invalidate cache if clientId changed
  if (clientId !== cacheClientId) {
    console.log(`[QuestionProvider] Cache invalidated (clientId changed: ${cacheClientId} -> ${clientId})`);
    questionCache.clear();
    cacheClientId = clientId || null;
  }

  // Return cached if available
  if (questionCache.has(flow)) {
    const cached = questionCache.get(flow)!;
    console.log(`[QuestionProvider] ✅ Returning ${cached.length} cached questions for ${flow}`);
    return cached;
  }

  try {
    const url = clientId
      ? `/api/custom-questions?flow=${flow}&clientId=${encodeURIComponent(clientId)}`
      : `/api/custom-questions?flow=${flow}`;

    console.log(`[QuestionProvider] 📡 Fetching from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[QuestionProvider] ❌ API returned ${response.status} for ${flow}, using defaults`);
      const defaults = getDefaultQuestions(flow);
      questionCache.set(flow, defaults);
      return defaults;
    }

    const data = await response.json();
    console.log(`[QuestionProvider] 📥 API response for ${flow}:`, data);

    let questions = data.questions || [];

    // Fall back to defaults if API returned empty
    if (questions.length === 0) {
      console.warn(`[QuestionProvider] ⚠️ No questions from API for ${flow}, using defaults`);
      questions = getDefaultQuestions(flow);
    } else {
      console.log(`[QuestionProvider] 📋 Questions loaded for ${flow}:`);
      questions.forEach((q: CustomQuestion, i: number) => {
        console.log(`  ${i + 1}. ${q.id} | type: ${q.inputType} | order: ${q.order} | mappingKey: ${q.mappingKey || 'MISSING'} | buttons: ${q.buttons?.length || 0}`);
      });
    }

    // Cache the result
    questionCache.set(flow, questions);

    return questions;
  } catch (error) {
    console.error('[QuestionProvider] ❌ Error fetching questions:', error);
    // Fall back to defaults on any error
    const defaults = getDefaultQuestions(flow);
    console.log(`[QuestionProvider] 🔄 Using ${defaults.length} default questions for ${flow}`);
    questionCache.set(flow, defaults);
    return defaults;
  }
}

/**
 * Fetch ALL questions for all flows in a single API call (faster)
 * Returns questions keyed by flow, with fallbacks to defaults
 */
export async function fetchAllQuestions(
  clientId?: string
): Promise<Record<TimelineFlow, CustomQuestion[]>> {
  console.log(`[QuestionProvider] 🔍 Fetching ALL questions, clientId: ${clientId || 'none'}`);

  // Invalidate cache if clientId changed
  if (clientId !== cacheClientId) {
    console.log(`[QuestionProvider] Cache invalidated (clientId changed)`);
    questionCache.clear();
    cacheClientId = clientId || null;
  }

  // Check if both flows are already cached
  if (questionCache.has('buy') && questionCache.has('sell')) {
    console.log(`[QuestionProvider] ✅ Returning cached questions for all flows`);
    return {
      buy: questionCache.get('buy')!,
      sell: questionCache.get('sell')!,
    };
  }

  try {
    const url = clientId
      ? `/api/custom-questions/all?clientId=${encodeURIComponent(clientId)}`
      : `/api/custom-questions/all`;

    console.log(`[QuestionProvider] 📡 Fetching from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[QuestionProvider] ❌ API returned ${response.status}, using defaults`);
      const defaults = getAllDefaultQuestions();
      questionCache.set('buy', defaults.buy);
      questionCache.set('sell', defaults.sell);
      return defaults;
    }

    const data = await response.json();
    console.log(`[QuestionProvider] 📥 Loaded: buy=${data.counts?.buy || 0}, sell=${data.counts?.sell || 0}`);

    // Use defaults for any empty flows
    const result: Record<TimelineFlow, CustomQuestion[]> = {
      buy: data.questions?.buy?.length > 0 ? data.questions.buy : getDefaultQuestions('buy'),
      sell: data.questions?.sell?.length > 0 ? data.questions.sell : getDefaultQuestions('sell'),
    };

    // Cache results
    questionCache.set('buy', result.buy);
    questionCache.set('sell', result.sell);

    return result;
  } catch (error) {
    console.error('[QuestionProvider] ❌ Error fetching all questions:', error);
    const defaults = getAllDefaultQuestions();
    questionCache.set('buy', defaults.buy);
    questionCache.set('sell', defaults.sell);
    return defaults;
  }
}

/**
 * Prefetch questions for all flows (uses single API call)
 * Call this on chatbot init for faster question loading
 */
export async function prefetchAllQuestions(clientId?: string): Promise<void> {
  await fetchAllQuestions(clientId);
}

/**
 * Get the first question for a flow
 */
export function getFirstQuestion(
  questions: CustomQuestion[]
): CustomQuestion | null {
  if (!questions || questions.length === 0) return null;

  // Sort by order and return first
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  return sorted[0];
}

/**
 * Get the next question after the current one
 */
export function getNextQuestion(
  questions: CustomQuestion[],
  currentQuestionId: string
): CustomQuestion | null {
  if (!questions || questions.length === 0) {
    console.warn(`[QuestionProvider] getNextQuestion: No questions provided`);
    return null;
  }

  console.log(`[QuestionProvider] getNextQuestion: Looking for next after "${currentQuestionId}"`);
  console.log(`[QuestionProvider]   Available questions:`, questions.map(q => ({ id: q.id, order: q.order })));

  // Sort by order
  const sorted = [...questions].sort((a, b) => a.order - b.order);

  // Find current index
  const currentIndex = sorted.findIndex(q => q.id === currentQuestionId);

  if (currentIndex === -1) {
    console.warn(`[QuestionProvider] Question not found: ${currentQuestionId}`);
    console.warn(`[QuestionProvider]   Available IDs:`, sorted.map(q => q.id));
    return null;
  }

  console.log(`[QuestionProvider]   Current index: ${currentIndex} (of ${sorted.length})`);

  // Return next question or null if at end
  if (currentIndex + 1 >= sorted.length) {
    console.log(`[QuestionProvider]   ✅ This is the last question`);
    return null;
  }

  const nextQuestion = sorted[currentIndex + 1];
  console.log(`[QuestionProvider]   ✅ Next question:`, { id: nextQuestion.id, question: nextQuestion.question });
  return nextQuestion;
}

/**
 * Get a specific question by ID
 */
export function getQuestionById(
  questions: CustomQuestion[],
  questionId: string
): CustomQuestion | null {
  if (!questions || questions.length === 0) return null;
  return questions.find(q => q.id === questionId) || null;
}

/**
 * Get total question count
 */
export function getQuestionCount(questions: CustomQuestion[]): number {
  return questions?.length || 0;
}

/**
 * Calculate progress percentage
 * Uses mappingKey if available, falls back to question id
 */
export function calculateProgress(
  questions: CustomQuestion[],
  answeredKeys: Set<string>
): number {
  if (!questions || questions.length === 0) return 0;

  // All questions are answerable - use mappingKey or id
  const totalQuestions = questions.length;

  // Count answered using mappingKey OR id as fallback
  const answeredCount = questions.filter(q => {
    const key = q.mappingKey || q.id;
    return key && answeredKeys.has(key);
  }).length;

  return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Check if all required questions are answered
 * Uses mappingKey if available, falls back to question id
 */
export function isFlowComplete(
  questions: CustomQuestion[],
  userInput: Record<string, string>
): boolean {
  if (!questions || questions.length === 0) return true;

  // Get required questions - use mappingKey OR id as the answer key
  const requiredQuestions = questions.filter(q => q.required !== false);

  // If no required questions found, check if we have ANY questions
  if (requiredQuestions.length === 0) {
    return questions.length === 0;
  }

  // Check if all required questions are answered using mappingKey OR id
  return requiredQuestions.every(q => {
    const key = q.mappingKey || q.id;
    return key && userInput[key];
  });
}

/**
 * Convert CustomQuestion buttons to ButtonOption format
 */
export function convertButtons(question: CustomQuestion): ButtonOption[] | undefined {
  console.log(`[convertButtons] Converting for question: ${question.id}`);
  console.log(`[convertButtons]   inputType: ${question.inputType}`);
  console.log(`[convertButtons]   has buttons: ${!!question.buttons} (${question.buttons?.length || 0})`);

  if (!question.buttons || question.inputType !== 'buttons') {
    console.log(`[convertButtons]   ➡️ Returning undefined (not a button question or no buttons)`);
    return undefined;
  }

  const converted = question.buttons.map(btn => ({
    id: btn.id,
    label: btn.label,
    value: btn.value,
  }));

  console.log(`[convertButtons]   ✅ Converted ${converted.length} buttons:`, converted.map(b => b.label));
  return converted;
}

/**
 * Get all bot questions sorted by order
 * Questions can optionally be linked to timeline phases, but it's not required.
 * All questions will be asked by the bot in the order specified.
 *
 * @param questions - All questions from MongoDB
 * @returns All questions sorted by their order property
 */
export function getBotQuestions(questions: CustomQuestion[]): CustomQuestion[] {
  if (!questions || questions.length === 0) return [];

  // Return ALL questions, sorted by order
  // Note: linkedPhaseId is optional - questions can be used in bot without being linked to timeline phases
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  const withPhases = questions.filter(q => q.linkedPhaseId).length;
  const withoutPhases = questions.length - withPhases;

  console.log(`[QuestionProvider] 🤖 Bot questions: ${questions.length} total (${withPhases} linked to phases, ${withoutPhases} standalone)`);

  return sortedQuestions;
}

/**
 * Clear the question cache
 * Call this when questions might have changed (e.g., after saving in dashboard)
 */
export function clearQuestionCache(): void {
  questionCache.clear();
  cacheClientId = null;
}

/**
 * Get cached questions for a flow (synchronous, returns null if not cached)
 */
export function getCachedQuestions(flow: TimelineFlow): CustomQuestion[] | null {
  return questionCache.get(flow) || null;
}
