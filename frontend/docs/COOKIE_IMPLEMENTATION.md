# Cookie Implementation Guide for Agent Lead Gen Chatbot

This document outlines cookie possibilities, implementations, and ideas for the chatbot and analytics.

---

## Current Implementation

### Visitor Tracking (`src/lib/tracking/visitorTracking.ts`)

The visitor tracking utility provides the following cookies:

| Cookie Name | Purpose | Expiry | Value |
|-------------|---------|--------|-------|
| `chatbot_visitor_id` | Unique visitor identification | 1 year | UUID v4 |
| `chatbot_last_conversation` | Resume abandoned conversations | 30 days | MongoDB ObjectId |
| `chatbot_user_intent` | Remember buy/sell/browse preference | 30 days | `buy`, `sell`, `browse` |
| `chatbot_progress` | Track conversation progress | 30 days | `0-100` |
| `chatbot_lead_captured` | Skip contact collection if already provided | 30 days | `true/false` |
| `chatbot_last_visit` | Identify returning visitors | 30 days | ISO timestamp |
| `chatbot_pages_viewed` | Track property pages viewed | 30 days | JSON array of URLs |
| `chatbot_referral_source` | Track UTM params and referrals | 30 days | JSON object |

---

## Usage

### Basic Initialization

```typescript
import { initVisitorTracking, getVisitorData } from '@/lib/tracking/visitorTracking';

// On page/chatbot load
const visitorData = initVisitorTracking();
console.log(visitorData);
// {
//   visitorId: "abc-123-def",
//   lastConversationId: "mongo-id-here",
//   userIntent: "buy",
//   chatProgress: 45,
//   leadCaptured: false,
//   isReturningVisitor: true,
//   ...
// }
```

### Embedding Chatbot in Iframe

```typescript
import { getVisitorIdForEmbed } from '@/lib/tracking/visitorTracking';

// Parent site (e.g., chris-crowell.ca)
const visitorId = getVisitorIdForEmbed();
const iframeSrc = `https://chatbot.example.com/chat?visitorId=${visitorId}&clientId=chris-crowell`;
```

### Tracking User Intent

```typescript
import { setUserIntent, getUserIntent } from '@/lib/tracking/visitorTracking';

// When user selects buy/sell/browse
setUserIntent('buy');

// Later, to personalize greeting
const intent = getUserIntent(); // 'buy'
```

### Conversation Resumption

```typescript
import {
  setLastConversation,
  getLastConversation,
  clearLastConversation,
  getChatProgress
} from '@/lib/tracking/visitorTracking';

// When conversation starts
setLastConversation(conversationId);

// On return visit
const lastConvo = getLastConversation();
const progress = getChatProgress();

if (lastConvo && progress > 0 && progress < 100) {
  // Show "Continue where you left off?" prompt
}

// After conversation completes
clearLastConversation();
```

### GDPR Compliance

```typescript
import { clearAllTrackingCookies } from '@/lib/tracking/visitorTracking';

// When user declines cookies or requests data deletion
clearAllTrackingCookies();
```

---

## Future Cookie Ideas

### 1. Chatbot Behavior Cookies

| Cookie | Purpose | Implementation |
|--------|---------|----------------|
| `chatbot_preferred_contact` | Remember if user prefers email/phone/text | Store after contact modal |
| `chatbot_timezone` | Auto-detect user timezone for scheduling | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| `chatbot_language` | Preferred language for multi-lingual support | Browser language or selection |
| `chatbot_chat_style` | Verbose vs concise responses | User preference toggle |

### 2. Lead Qualification Cookies

| Cookie | Purpose | Use Case |
|--------|---------|----------|
| `chatbot_budget_range` | Stored budget from conversation | Pre-fill on return, segment leads |
| `chatbot_timeline` | When they want to buy/sell | Urgency scoring |
| `chatbot_location_prefs` | Preferred neighborhoods | Show relevant listings |
| `chatbot_pre_approved` | Mortgage pre-approval status | Qualify lead temperature |
| `chatbot_first_time_buyer` | First-time buyer flag | Tailor advice/content |

### 3. Engagement Scoring Cookies

| Cookie | Purpose | Value |
|--------|---------|-------|
| `chatbot_engagement_score` | Calculated engagement level | `0-100` based on interactions |
| `chatbot_questions_answered` | Count of questions answered | Integer |
| `chatbot_session_count` | Number of chat sessions | Integer |
| `chatbot_total_messages` | Total messages sent | Integer |

### 4. A/B Testing Cookies

| Cookie | Purpose | Value |
|--------|---------|-------|
| `chatbot_variant` | Which chatbot variant to show | `control`, `variant_a`, `variant_b` |
| `chatbot_greeting_test` | Test different greeting styles | `friendly`, `professional`, `casual` |
| `chatbot_cta_test` | Test different CTAs | `schedule`, `call`, `email` |

---

## Analytics Integration Ideas

### 1. Google Analytics Events

Track these events based on cookie data:

```typescript
// When visitor returns
gtag('event', 'returning_visitor', {
  visitor_id: visitorData.visitorId,
  days_since_last: daysSinceLastVisit,
  previous_intent: visitorData.userIntent,
});

// When conversation completes
gtag('event', 'lead_captured', {
  visitor_id: visitorData.visitorId,
  intent: userIntent,
  pages_viewed: pagesViewed.length,
  referral_source: referralSource?.source,
});

// Conversation abandonment
gtag('event', 'conversation_abandoned', {
  progress: chatProgress,
  last_question: currentQuestionId,
});
```

### 2. Lead Scoring Algorithm

Use cookies to calculate lead temperature:

```typescript
function calculateLeadScore(visitorData: VisitorData): number {
  let score = 0;

  // Returning visitor = warmer lead
  if (visitorData.isReturningVisitor) score += 20;

  // More pages viewed = more interested
  score += Math.min(visitorData.pagesViewed.length * 5, 25);

  // Higher progress = more engaged
  score += visitorData.chatProgress * 0.3;

  // Intent-based scoring
  if (visitorData.userIntent === 'buy') score += 15;
  if (visitorData.userIntent === 'sell') score += 20;

  // Lead captured = qualified
  if (visitorData.leadCaptured) score += 20;

  return Math.min(score, 100);
}
```

### 3. Conversion Funnel Tracking

```
Page Visit → Chat Opened → Intent Selected → Questions Answered → Lead Captured → Follow-up Scheduled
```

Track drop-off at each stage using cookies:

```typescript
const funnelStages = {
  page_visit: getCookie('chatbot_visitor_id') !== null,
  chat_opened: getCookie('chatbot_last_conversation') !== null,
  intent_selected: getCookie('chatbot_user_intent') !== null,
  questions_answered: getChatProgress() > 0,
  lead_captured: isLeadCaptured(),
  // follow_up scheduled tracked server-side
};
```

---

## MongoDB Integration

Link cookies to server-side conversation data:

```typescript
// In conversation creation API
const conversation = {
  // ... existing fields
  visitorId: req.cookies.chatbot_visitor_id,
  referralSource: JSON.parse(req.cookies.chatbot_referral_source || '{}'),
  pagesViewedBeforeChat: JSON.parse(req.cookies.chatbot_pages_viewed || '[]'),
  isReturningVisitor: req.cookies.chatbot_last_visit !== undefined,
  previousIntent: req.cookies.chatbot_user_intent,
};
```

---

## Privacy Considerations

### Cookie Consent Integration

1. **Essential Cookies** (no consent needed):
   - `chatbot_visitor_id` - Required for basic functionality
   - `chatbot_last_conversation` - UX feature (conversation resume)

2. **Functional Cookies** (consent recommended):
   - `chatbot_user_intent`
   - `chatbot_progress`
   - `chatbot_lead_captured`

3. **Analytics Cookies** (consent required):
   - `chatbot_pages_viewed`
   - `chatbot_referral_source`
   - Engagement scoring cookies

### Data Retention

- Visitor ID: 1 year (for returning visitor recognition)
- Session data: 30 days (reasonable for real estate consideration timeline)
- Clear all on user request (GDPR right to erasure)

---

## Implementation Checklist

- [x] Create visitor tracking utility
- [ ] Integrate with chatbot initialization
- [ ] Pass visitorId to iframe embed
- [ ] Update conversation API to store visitor data
- [ ] Add cookie consent check before tracking
- [ ] Create analytics dashboard using cookie data
- [ ] Implement lead scoring algorithm
- [ ] Set up A/B testing framework
- [ ] Create conversation resumption UI
- [ ] Add "returning visitor" personalized greeting

---

## Example: Full Integration

```typescript
// In chatbot component initialization
import { initVisitorTracking, getVisitorData, setUserIntent, setChatProgress } from '@/lib/tracking/visitorTracking';

function ChatbotWidget() {
  useEffect(() => {
    // Initialize tracking
    const visitorData = initVisitorTracking();

    // Check for returning visitor with incomplete conversation
    if (visitorData.lastConversationId && visitorData.chatProgress < 100) {
      showResumePrompt(visitorData.lastConversationId);
    }

    // Personalize greeting for returning visitors
    if (visitorData.isReturningVisitor && visitorData.userIntent) {
      setInitialMessage(`Welcome back! Still interested in ${visitorData.userIntent}ing?`);
    }
  }, []);

  // On intent selection
  const handleIntentSelect = (intent: 'buy' | 'sell' | 'browse') => {
    setUserIntent(intent);
    // ... rest of handler
  };

  // On progress update
  const handleProgressUpdate = (progress: number) => {
    setChatProgress(progress);
    // ... rest of handler
  };
}
```
