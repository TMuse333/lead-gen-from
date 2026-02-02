// lib/tracking/visitorTracking.ts
/**
 * Visitor Tracking Utility
 *
 * Generates and manages visitor identification cookies for the chatbot.
 * Used to identify returning visitors and link conversations across sessions.
 * Respects user cookie consent preferences.
 */

// Cookie consent key (shared with CookieConsent component)
const CONSENT_KEY = 'chatbot_cookie_consent';

/**
 * Check if user has given consent for analytics cookies
 */
export function hasTrackingConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

/**
 * Generate a UUID v4 (uses crypto.randomUUID if available, fallback otherwise)
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Cookie names
const VISITOR_ID_KEY = 'chatbot_visitor_id';
const LAST_CONVERSATION_KEY = 'chatbot_last_conversation';
const USER_INTENT_KEY = 'chatbot_user_intent';
const CHAT_PROGRESS_KEY = 'chatbot_progress';
const LEAD_CAPTURED_KEY = 'chatbot_lead_captured';
const LAST_VISIT_KEY = 'chatbot_last_visit';
const PAGES_VIEWED_KEY = 'chatbot_pages_viewed';
const REFERRAL_SOURCE_KEY = 'chatbot_referral_source';

// New session-level tracking cookies
const SESSION_START_KEY = 'chatbot_session_start';
const MESSAGES_SENT_KEY = 'chatbot_messages_sent';
const DEVICE_TYPE_KEY = 'chatbot_device_type';
const TIME_ON_QUESTIONS_KEY = 'chatbot_time_on_questions';
const SCROLL_DEPTH_KEY = 'chatbot_scroll_depth';
const FIRST_MESSAGE_TIME_KEY = 'chatbot_first_message_time';
const QUESTION_TIMESTAMPS_KEY = 'chatbot_question_timestamps';

// Cookie expiry (days)
const VISITOR_COOKIE_DAYS = 365;
const SESSION_COOKIE_DAYS = 30;
const SESSION_EXPIRY_DAYS = 1; // Session cookies expire after 1 day of inactivity

export interface VisitorData {
  visitorId: string;
  lastConversationId: string | null;
  userIntent: 'buy' | 'sell' | 'browse' | null;
  chatProgress: number;
  leadCaptured: boolean;
  lastVisit: string | null;
  pagesViewed: string[];
  referralSource: string | null;
  isReturningVisitor: boolean;
}

export interface SessionData {
  sessionStart: string | null;
  messagesSent: number;
  deviceType: 'mobile' | 'tablet' | 'desktop' | null;
  timeOnQuestions: Record<string, number>; // questionId -> seconds spent
  scrollDepth: number; // 0-100 percentage
  firstMessageTime: string | null;
  questionTimestamps: Record<string, string>; // questionId -> ISO timestamp when reached
  sessionDuration: number; // seconds since session start
}

export interface FullVisitorData extends VisitorData, SessionData {}

// Essential cookies that are required for basic functionality (not analytics)
const ESSENTIAL_COOKIES = [VISITOR_ID_KEY, LAST_CONVERSATION_KEY];

/**
 * Set a cookie with expiry
 * @param requiresConsent - If true, only sets cookie when user has consented to analytics
 */
function setCookie(name: string, value: string, days: number, requiresConsent: boolean = false): void {
  if (typeof document === 'undefined') return;

  // Check consent for non-essential cookies
  if (requiresConsent && !hasTrackingConsent()) {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Generate or retrieve visitor ID
 */
export function getOrCreateVisitorId(): string {
  let visitorId = getCookie(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = generateUUID();
    setCookie(VISITOR_ID_KEY, visitorId, VISITOR_COOKIE_DAYS);
  }

  return visitorId;
}

/**
 * Get visitor ID (without creating if doesn't exist)
 */
export function getVisitorId(): string | null {
  return getCookie(VISITOR_ID_KEY);
}

/**
 * Check if this is a returning visitor
 */
export function isReturningVisitor(): boolean {
  return getCookie(LAST_VISIT_KEY) !== null;
}

/**
 * Update last visit timestamp (analytics - requires consent)
 */
export function updateLastVisit(): void {
  setCookie(LAST_VISIT_KEY, new Date().toISOString(), SESSION_COOKIE_DAYS, true);
}

/**
 * Store last conversation ID for resumption
 */
export function setLastConversation(conversationId: string): void {
  setCookie(LAST_CONVERSATION_KEY, conversationId, SESSION_COOKIE_DAYS);
}

/**
 * Get last conversation ID
 */
export function getLastConversation(): string | null {
  return getCookie(LAST_CONVERSATION_KEY);
}

/**
 * Clear last conversation (after completion)
 */
export function clearLastConversation(): void {
  deleteCookie(LAST_CONVERSATION_KEY);
}

/**
 * Store user intent (buy/sell/browse) - analytics, requires consent
 */
export function setUserIntent(intent: 'buy' | 'sell' | 'browse'): void {
  setCookie(USER_INTENT_KEY, intent, SESSION_COOKIE_DAYS, true);
}

/**
 * Get stored user intent
 */
export function getUserIntent(): 'buy' | 'sell' | 'browse' | null {
  const intent = getCookie(USER_INTENT_KEY);
  if (intent === 'buy' || intent === 'sell' || intent === 'browse') {
    return intent;
  }
  return null;
}

/**
 * Store chat progress percentage - analytics, requires consent
 */
export function setChatProgress(progress: number): void {
  setCookie(CHAT_PROGRESS_KEY, progress.toString(), SESSION_COOKIE_DAYS, true);
}

/**
 * Get chat progress
 */
export function getChatProgress(): number {
  const progress = getCookie(CHAT_PROGRESS_KEY);
  return progress ? parseInt(progress, 10) : 0;
}

/**
 * Mark that lead info has been captured - analytics, requires consent
 */
export function setLeadCaptured(captured: boolean): void {
  setCookie(LEAD_CAPTURED_KEY, captured ? 'true' : 'false', SESSION_COOKIE_DAYS, true);
}

/**
 * Check if lead has been captured
 */
export function isLeadCaptured(): boolean {
  return getCookie(LEAD_CAPTURED_KEY) === 'true';
}

/**
 * Track page view - analytics, requires consent
 */
export function trackPageView(pageUrl?: string): void {
  // Check consent before tracking
  if (!hasTrackingConsent()) return;

  const url = pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '');
  const pagesJson = getCookie(PAGES_VIEWED_KEY);
  let pages: string[] = [];

  try {
    pages = pagesJson ? JSON.parse(pagesJson) : [];
  } catch {
    pages = [];
  }

  // Add page if not already tracked (limit to last 20 pages)
  if (!pages.includes(url)) {
    pages.push(url);
    if (pages.length > 20) {
      pages = pages.slice(-20);
    }
    setCookie(PAGES_VIEWED_KEY, JSON.stringify(pages), SESSION_COOKIE_DAYS, true);
  }
}

/**
 * Get viewed pages
 */
export function getPagesViewed(): string[] {
  const pagesJson = getCookie(PAGES_VIEWED_KEY);
  try {
    return pagesJson ? JSON.parse(pagesJson) : [];
  } catch {
    return [];
  }
}

/**
 * Store referral source from URL params - analytics, requires consent
 */
export function captureReferralSource(): void {
  // Check consent before tracking
  if (!hasTrackingConsent()) return;
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const ref = params.get('ref');

  if (utmSource || utmMedium || utmCampaign || ref) {
    const referralData = {
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      ref: ref,
      landingPage: window.location.pathname,
      timestamp: new Date().toISOString(),
    };
    setCookie(REFERRAL_SOURCE_KEY, JSON.stringify(referralData), SESSION_COOKIE_DAYS, true);
  }
}

/**
 * Get referral source data
 */
export function getReferralSource(): Record<string, string | null> | null {
  const referralJson = getCookie(REFERRAL_SOURCE_KEY);
  try {
    return referralJson ? JSON.parse(referralJson) : null;
  } catch {
    return null;
  }
}

/**
 * Get all visitor data at once
 */
export function getVisitorData(): VisitorData {
  const returning = isReturningVisitor();

  return {
    visitorId: getOrCreateVisitorId(),
    lastConversationId: getLastConversation(),
    userIntent: getUserIntent(),
    chatProgress: getChatProgress(),
    leadCaptured: isLeadCaptured(),
    lastVisit: getCookie(LAST_VISIT_KEY),
    pagesViewed: getPagesViewed(),
    referralSource: getCookie(REFERRAL_SOURCE_KEY),
    isReturningVisitor: returning,
  };
}

/**
 * Initialize visitor tracking on page load
 * Call this when the chatbot/page loads
 */
export function initVisitorTracking(): FullVisitorData {
  // Generate/retrieve visitor ID
  getOrCreateVisitorId();

  // Start or resume session
  startSession();

  // Capture referral source on first visit
  if (!isReturningVisitor()) {
    captureReferralSource();
  }

  // Track this page view
  trackPageView();

  // Update last visit
  updateLastVisit();

  return getFullVisitorData();
}

// ==================== SESSION TRACKING ====================

/**
 * Detect device type from user agent
 */
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();

  // Check for tablets first (they often have 'mobile' in UA too)
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'tablet';
  }

  // Check for mobile
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Start or resume a session - analytics, requires consent
 */
export function startSession(): void {
  // Check consent before starting analytics session
  if (!hasTrackingConsent()) return;

  const existingStart = getCookie(SESSION_START_KEY);
  if (!existingStart) {
    setCookie(SESSION_START_KEY, new Date().toISOString(), SESSION_EXPIRY_DAYS, true);
  }

  // Set device type if not already set
  if (!getCookie(DEVICE_TYPE_KEY)) {
    setCookie(DEVICE_TYPE_KEY, detectDeviceType(), SESSION_COOKIE_DAYS, true);
  }
}

/**
 * Get session start time
 */
export function getSessionStart(): string | null {
  return getCookie(SESSION_START_KEY);
}

/**
 * Get session duration in seconds
 */
export function getSessionDuration(): number {
  const start = getCookie(SESSION_START_KEY);
  if (!start) return 0;

  const startTime = new Date(start).getTime();
  const now = Date.now();
  return Math.floor((now - startTime) / 1000);
}

/**
 * Increment message count - analytics, requires consent
 */
export function incrementMessageCount(): number {
  // Check consent before tracking
  if (!hasTrackingConsent()) return 0;

  const current = parseInt(getCookie(MESSAGES_SENT_KEY) || '0', 10);
  const newCount = current + 1;
  setCookie(MESSAGES_SENT_KEY, newCount.toString(), SESSION_EXPIRY_DAYS, true);

  // Track first message time
  if (newCount === 1) {
    setCookie(FIRST_MESSAGE_TIME_KEY, new Date().toISOString(), SESSION_EXPIRY_DAYS, true);
  }

  return newCount;
}

/**
 * Get message count
 */
export function getMessageCount(): number {
  return parseInt(getCookie(MESSAGES_SENT_KEY) || '0', 10);
}

/**
 * Get first message time
 */
export function getFirstMessageTime(): string | null {
  return getCookie(FIRST_MESSAGE_TIME_KEY);
}

/**
 * Get time to first message in seconds
 */
export function getTimeToFirstMessage(): number | null {
  const sessionStart = getCookie(SESSION_START_KEY);
  const firstMessage = getCookie(FIRST_MESSAGE_TIME_KEY);

  if (!sessionStart || !firstMessage) return null;

  const startTime = new Date(sessionStart).getTime();
  const firstTime = new Date(firstMessage).getTime();
  return Math.floor((firstTime - startTime) / 1000);
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | null {
  const device = getCookie(DEVICE_TYPE_KEY);
  if (device === 'mobile' || device === 'tablet' || device === 'desktop') {
    return device;
  }
  return null;
}

/**
 * Track when a question is reached - analytics, requires consent
 */
export function trackQuestionReached(questionId: string): void {
  // Check consent before tracking
  if (!hasTrackingConsent()) return;

  const timestampsJson = getCookie(QUESTION_TIMESTAMPS_KEY);
  let timestamps: Record<string, string> = {};

  try {
    timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
  } catch {
    timestamps = {};
  }

  // Only set if not already tracked (first time reaching this question)
  if (!timestamps[questionId]) {
    timestamps[questionId] = new Date().toISOString();
    setCookie(QUESTION_TIMESTAMPS_KEY, JSON.stringify(timestamps), SESSION_EXPIRY_DAYS, true);
  }
}

/**
 * Track time spent on a question (call when leaving a question) - analytics, requires consent
 */
export function trackTimeOnQuestion(questionId: string): void {
  // Check consent before tracking
  if (!hasTrackingConsent()) return;

  const timestampsJson = getCookie(QUESTION_TIMESTAMPS_KEY);
  const timeOnJson = getCookie(TIME_ON_QUESTIONS_KEY);

  let timestamps: Record<string, string> = {};
  let timeOn: Record<string, number> = {};

  try {
    timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
    timeOn = timeOnJson ? JSON.parse(timeOnJson) : {};
  } catch {
    timestamps = {};
    timeOn = {};
  }

  if (timestamps[questionId]) {
    const startTime = new Date(timestamps[questionId]).getTime();
    const now = Date.now();
    const secondsSpent = Math.floor((now - startTime) / 1000);

    // Add to existing time (in case they revisit the question)
    timeOn[questionId] = (timeOn[questionId] || 0) + secondsSpent;
    setCookie(TIME_ON_QUESTIONS_KEY, JSON.stringify(timeOn), SESSION_EXPIRY_DAYS, true);
  }
}

/**
 * Get time spent on each question
 */
export function getTimeOnQuestions(): Record<string, number> {
  const timeOnJson = getCookie(TIME_ON_QUESTIONS_KEY);
  try {
    return timeOnJson ? JSON.parse(timeOnJson) : {};
  } catch {
    return {};
  }
}

/**
 * Get question timestamps
 */
export function getQuestionTimestamps(): Record<string, string> {
  const timestampsJson = getCookie(QUESTION_TIMESTAMPS_KEY);
  try {
    return timestampsJson ? JSON.parse(timestampsJson) : {};
  } catch {
    return {};
  }
}

/**
 * Update scroll depth (0-100) - analytics, requires consent
 */
export function updateScrollDepth(depth: number): void {
  // Check consent before tracking
  if (!hasTrackingConsent()) return;

  const current = parseInt(getCookie(SCROLL_DEPTH_KEY) || '0', 10);
  // Only update if new depth is greater (track max scroll)
  if (depth > current) {
    setCookie(SCROLL_DEPTH_KEY, Math.min(100, Math.round(depth)).toString(), SESSION_EXPIRY_DAYS, true);
  }
}

/**
 * Get max scroll depth
 */
export function getScrollDepth(): number {
  return parseInt(getCookie(SCROLL_DEPTH_KEY) || '0', 10);
}

/**
 * Get all session data
 */
export function getSessionData(): SessionData {
  return {
    sessionStart: getSessionStart(),
    messagesSent: getMessageCount(),
    deviceType: getDeviceType(),
    timeOnQuestions: getTimeOnQuestions(),
    scrollDepth: getScrollDepth(),
    firstMessageTime: getFirstMessageTime(),
    questionTimestamps: getQuestionTimestamps(),
    sessionDuration: getSessionDuration(),
  };
}

/**
 * Get full visitor data including session
 */
export function getFullVisitorData(): FullVisitorData {
  return {
    ...getVisitorData(),
    ...getSessionData(),
  };
}

/**
 * Clear session data (but keep visitor ID)
 */
export function clearSessionData(): void {
  deleteCookie(SESSION_START_KEY);
  deleteCookie(MESSAGES_SENT_KEY);
  deleteCookie(FIRST_MESSAGE_TIME_KEY);
  deleteCookie(TIME_ON_QUESTIONS_KEY);
  deleteCookie(QUESTION_TIMESTAMPS_KEY);
  deleteCookie(SCROLL_DEPTH_KEY);
}

/**
 * Clear all tracking cookies (for GDPR compliance)
 */
export function clearAllTrackingCookies(): void {
  deleteCookie(VISITOR_ID_KEY);
  deleteCookie(LAST_CONVERSATION_KEY);
  deleteCookie(USER_INTENT_KEY);
  deleteCookie(CHAT_PROGRESS_KEY);
  deleteCookie(LEAD_CAPTURED_KEY);
  deleteCookie(LAST_VISIT_KEY);
  deleteCookie(PAGES_VIEWED_KEY);
  deleteCookie(REFERRAL_SOURCE_KEY);
  // Also clear session data
  deleteCookie(SESSION_START_KEY);
  deleteCookie(MESSAGES_SENT_KEY);
  deleteCookie(DEVICE_TYPE_KEY);
  deleteCookie(FIRST_MESSAGE_TIME_KEY);
  deleteCookie(TIME_ON_QUESTIONS_KEY);
  deleteCookie(QUESTION_TIMESTAMPS_KEY);
  deleteCookie(SCROLL_DEPTH_KEY);
}

/**
 * Get visitor ID for iframe URL param
 * Use this when embedding the chatbot iframe
 */
export function getVisitorIdForEmbed(): string {
  return getOrCreateVisitorId();
}
