// lib/tracking/visitorTracking.ts
/**
 * Visitor Tracking Utility
 *
 * Generates and manages visitor identification cookies for the chatbot.
 * Used to identify returning visitors and link conversations across sessions.
 */

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

// Cookie expiry (days)
const VISITOR_COOKIE_DAYS = 365;
const SESSION_COOKIE_DAYS = 30;

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

/**
 * Set a cookie with expiry
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;

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
 * Update last visit timestamp
 */
export function updateLastVisit(): void {
  setCookie(LAST_VISIT_KEY, new Date().toISOString(), SESSION_COOKIE_DAYS);
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
 * Store user intent (buy/sell/browse)
 */
export function setUserIntent(intent: 'buy' | 'sell' | 'browse'): void {
  setCookie(USER_INTENT_KEY, intent, SESSION_COOKIE_DAYS);
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
 * Store chat progress percentage
 */
export function setChatProgress(progress: number): void {
  setCookie(CHAT_PROGRESS_KEY, progress.toString(), SESSION_COOKIE_DAYS);
}

/**
 * Get chat progress
 */
export function getChatProgress(): number {
  const progress = getCookie(CHAT_PROGRESS_KEY);
  return progress ? parseInt(progress, 10) : 0;
}

/**
 * Mark that lead info has been captured
 */
export function setLeadCaptured(captured: boolean): void {
  setCookie(LEAD_CAPTURED_KEY, captured ? 'true' : 'false', SESSION_COOKIE_DAYS);
}

/**
 * Check if lead has been captured
 */
export function isLeadCaptured(): boolean {
  return getCookie(LEAD_CAPTURED_KEY) === 'true';
}

/**
 * Track page view
 */
export function trackPageView(pageUrl?: string): void {
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
    setCookie(PAGES_VIEWED_KEY, JSON.stringify(pages), SESSION_COOKIE_DAYS);
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
 * Store referral source from URL params
 */
export function captureReferralSource(): void {
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
    setCookie(REFERRAL_SOURCE_KEY, JSON.stringify(referralData), SESSION_COOKIE_DAYS);
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
export function initVisitorTracking(): VisitorData {
  // Generate/retrieve visitor ID
  getOrCreateVisitorId();

  // Capture referral source on first visit
  if (!isReturningVisitor()) {
    captureReferralSource();
  }

  // Track this page view
  trackPageView();

  // Update last visit
  updateLastVisit();

  return getVisitorData();
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
}

/**
 * Get visitor ID for iframe URL param
 * Use this when embedding the chatbot iframe
 */
export function getVisitorIdForEmbed(): string {
  return getOrCreateVisitorId();
}
