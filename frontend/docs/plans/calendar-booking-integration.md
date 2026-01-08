# Calendar Booking Integration Plan

> "More questions? Book a meeting here" - Allow agents to add booking CTAs to their offer pages

## Overview

This plan outlines how to integrate calendar booking functionality into offer landing pages, giving end-users a seamless way to schedule meetings with agents. We'll support two approaches:

1. **Calendly** (Simple) - Embed-based, no OAuth required
2. **Google Calendar** (Complex) - Native integration with OAuth flow

---

## Comparison

| Feature | Calendly | Google Calendar |
|---------|----------|-----------------|
| Setup Complexity | Low | High |
| OAuth Required | No | Yes |
| Agent Setup | Paste URL | Connect Google Account |
| Customization | Limited to Calendly options | Full control |
| Cost | Free tier available | Free (API limits) |
| Branding | Calendly branded | Can be fully branded |
| Dependencies | react-calendly or iframe | googleapis, OAuth flow |

**Recommendation:** Start with Calendly for MVP, add Google Calendar later for agents who want tighter integration.

---

## Part 1: Calendly Integration

### 1.1 How It Works

Calendly provides several embed options:
- **Inline Embed** - Calendar appears directly on page
- **Popup Widget** - Floating button that opens calendar
- **Popup Text** - Link/button that triggers popup

### 1.2 Implementation Options

#### Option A: react-calendly Package (Recommended)

```bash
npm install react-calendly
```

```tsx
import { InlineWidget, PopupButton, PopupWidget } from 'react-calendly';

// Inline embed
<InlineWidget url="https://calendly.com/agent-name/30min" />

// Popup button
<PopupButton
  url="https://calendly.com/agent-name/30min"
  rootElement={document.getElementById('root')}
  text="Book a Meeting"
/>

// Floating popup widget
<PopupWidget
  url="https://calendly.com/agent-name/30min"
  rootElement={document.getElementById('root')}
  text="Schedule Time"
  textColor="#ffffff"
  color="#00a2ff"
/>
```

#### Option B: Direct Iframe Embed

```tsx
<iframe
  src="https://calendly.com/agent-name/30min?hide_gdpr_banner=1&primary_color=3b82f6"
  width="100%"
  height="700"
  frameBorder="0"
/>
```

### 1.3 Agent Configuration

Add to agent onboarding/settings:

```typescript
// In agent config/user table
interface AgentBookingConfig {
  calendlyEnabled: boolean;
  calendlyUrl?: string; // e.g., "https://calendly.com/sarah-macleod/30min"
  calendlyEventTypes?: string[]; // If agent has multiple meeting types
  bookingCTAText?: string; // Custom CTA text
  bookingCTAPosition?: 'inline' | 'floating' | 'footer';
}
```

### 1.4 Dashboard UI

**Settings > Booking Integration:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Calendar Booking                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [x] Enable booking CTA on offer pages                       │
│                                                             │
│ Calendly URL:                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://calendly.com/your-name/30min                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CTA Text:                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Have questions? Let's chat!                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Display Style:                                              │
│ ( ) Inline section on page                                  │
│ (•) Floating button                                         │
│ ( ) Footer CTA only                                         │
│                                                             │
│ [Preview] [Save]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.5 Offer Page Component

```tsx
// components/ux/resultsComponents/timeline/components/BookingCTA.tsx

'use client';

import { Calendar, MessageCircle } from 'lucide-react';
import { PopupButton } from 'react-calendly';

interface BookingCTAProps {
  calendlyUrl: string;
  agentName: string;
  ctaText?: string;
  variant?: 'inline' | 'floating' | 'card';
  accentColor?: string;
}

export function BookingCTA({
  calendlyUrl,
  agentName,
  ctaText = "Have questions? Let's schedule a call!",
  variant = 'card',
  accentColor = 'blue',
}: BookingCTAProps) {
  if (variant === 'floating') {
    return (
      <PopupWidget
        url={calendlyUrl}
        rootElement={document.getElementById('__next')!}
        text="Book a Call"
        textColor="#ffffff"
        color="#3b82f6"
      />
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{ctaText}</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Get personalized answers from {agentName}. Pick a time that works for you.
      </p>

      <PopupButton
        url={calendlyUrl}
        rootElement={document.getElementById('__next')!}
        text="Schedule a Free Consultation"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
      />
    </div>
  );
}
```

### 1.6 Pre-fill User Data

Calendly supports prefilling fields via URL params:

```tsx
const prefillUrl = new URL(calendlyUrl);
prefillUrl.searchParams.set('name', userData.name || '');
prefillUrl.searchParams.set('email', userData.email || '');
prefillUrl.searchParams.set('a1', userData.location || ''); // Custom question 1
prefillUrl.searchParams.set('a2', userData.budget || '');   // Custom question 2

// Use prefillUrl.toString() in the embed
```

This creates a seamless experience - user's info from the chat is pre-filled!

---

## Part 2: Google Calendar Integration

### 2.1 Complexity Overview

Google Calendar integration is more involved because:
1. **OAuth 2.0 Flow** - Agent must authorize access to their calendar
2. **API Calls** - Need to query availability and create events
3. **Token Management** - Store and refresh OAuth tokens
4. **Availability Logic** - Must build or use scheduling logic

### 2.2 Architecture Options

#### Option A: Google Calendar Appointment Scheduling (Recommended)

Google now has built-in appointment scheduling (similar to Calendly):
- Agent sets up appointment slots in Google Calendar
- We generate a booking link
- No complex availability logic needed

```
Agent Setup:
1. Go to Google Calendar → Create Appointment Schedule
2. Configure availability, duration, buffer times
3. Copy the booking link
4. Paste in our dashboard (similar to Calendly flow)
```

This is essentially "Calendly but Google" - much simpler than building custom availability.

#### Option B: Full Custom Integration

Build our own scheduling system using Google Calendar API:

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent Dashboard              Our Backend              Google │
│  ┌──────────────┐          ┌─────────────┐         ┌───────┐│
│  │ Connect      │──OAuth──▶│ Store       │◀───────▶│ API   ││
│  │ Google       │          │ Tokens      │         │       ││
│  │ Account      │          │             │         │       ││
│  └──────────────┘          └─────────────┘         └───────┘│
│                                   │                          │
│  Offer Page                       │                          │
│  ┌──────────────┐                 │                          │
│  │ Show         │◀─Availability──│                          │
│  │ Available    │                 │                          │
│  │ Slots        │                 │                          │
│  │              │──Book Slot────▶│──Create Event───────────▶│
│  └──────────────┘                 │                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Google OAuth Setup

#### 2.3.1 Google Cloud Console

1. Create project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (dev)

#### 2.3.2 Required Scopes

```typescript
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',  // Read availability
  'https://www.googleapis.com/auth/calendar.events',    // Create events
];
```

#### 2.3.3 OAuth Flow

```typescript
// app/api/auth/google/route.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });

  return NextResponse.redirect(authUrl);
}
```

```typescript
// app/api/auth/google/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const { tokens } = await oauth2Client.getToken(code);

  // Store tokens securely (encrypted in DB)
  await storeGoogleTokens(agentId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(tokens.expiry_date),
  });

  return NextResponse.redirect('/dashboard/settings?google=connected');
}
```

### 2.4 Availability Query

```typescript
// lib/google-calendar/availability.ts
import { google } from 'googleapis';

export async function getAgentAvailability(
  agentId: string,
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 30
): Promise<TimeSlot[]> {
  const tokens = await getGoogleTokens(agentId);
  const oauth2Client = createOAuthClient(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Get busy times
  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: 'primary' }],
    },
  });

  const busyTimes = freeBusy.data.calendars?.primary?.busy || [];

  // Calculate available slots (subtract busy from working hours)
  return calculateAvailableSlots(
    startDate,
    endDate,
    busyTimes,
    agentWorkingHours,
    durationMinutes
  );
}
```

### 2.5 Event Creation

```typescript
// lib/google-calendar/booking.ts
export async function createBooking(
  agentId: string,
  slot: TimeSlot,
  attendee: { name: string; email: string },
  notes?: string
): Promise<CalendarEvent> {
  const tokens = await getGoogleTokens(agentId);
  const oauth2Client = createOAuthClient(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Meeting with ${attendee.name}`,
      description: notes || 'Scheduled via real estate timeline',
      start: {
        dateTime: slot.start.toISOString(),
        timeZone: agentTimeZone,
      },
      end: {
        dateTime: slot.end.toISOString(),
        timeZone: agentTimeZone,
      },
      attendees: [{ email: attendee.email }],
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
    conferenceDataVersion: 1, // Enable Google Meet link
  });

  return {
    id: event.data.id,
    meetLink: event.data.hangoutLink,
    start: slot.start,
    end: slot.end,
  };
}
```

### 2.6 Database Schema

```typescript
// Google OAuth tokens (encrypted)
interface GoogleCalendarConnection {
  agentId: string;
  accessToken: string;      // Encrypted
  refreshToken: string;     // Encrypted
  expiresAt: Date;
  calendarId: string;       // Usually 'primary'
  connectedAt: Date;
  lastSyncedAt: Date;
}

// Agent availability settings
interface AgentAvailabilitySettings {
  agentId: string;
  workingHours: {
    [day: string]: { start: string; end: string } | null; // null = not available
  };
  timezone: string;
  meetingDurations: number[]; // [15, 30, 60] minutes
  bufferBetweenMeetings: number; // minutes
  advanceBookingDays: number; // How far ahead can book
  minimumNotice: number; // Hours before meeting
}
```

### 2.7 UI Components for Google Calendar

```tsx
// components/booking/GoogleCalendarBooking.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video } from 'lucide-react';

interface GoogleCalendarBookingProps {
  agentId: string;
  agentName: string;
  userData?: { name?: string; email?: string };
}

export function GoogleCalendarBooking({
  agentId,
  agentName,
  userData,
}: GoogleCalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(agentId, selectedDate).then(setAvailableSlots);
    }
  }, [selectedDate, agentId]);

  const handleBook = async () => {
    if (!selectedSlot || !userData?.email) return;

    setIsBooking(true);
    const result = await bookMeeting(agentId, selectedSlot, userData);
    // Show confirmation with Google Meet link
  };

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <DatePicker value={selectedDate} onChange={setSelectedDate} />

      {/* Time slots */}
      {availableSlots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.start.toISOString()}
              onClick={() => setSelectedSlot(slot)}
              className={`p-2 rounded-lg border ${
                selectedSlot === slot
                  ? 'bg-blue-100 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              {formatTime(slot.start)}
            </button>
          ))}
        </div>
      )}

      {/* Booking form */}
      {selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          userData={userData}
          onSubmit={handleBook}
          isLoading={isBooking}
        />
      )}
    </div>
  );
}
```

---

## Part 3: Implementation Phases

### Phase 1: Calendly MVP (1-2 days)

1. Install `react-calendly`
2. Add `calendlyUrl` field to agent settings
3. Create `BookingCTA` component
4. Add to `TimelineLandingPage`
5. Support URL prefilling with user data

**Deliverables:**
- Settings UI for Calendly URL
- BookingCTA component (inline, floating, card variants)
- Integration in offer pages

### Phase 2: Google Calendar Appointment Links (2-3 days)

1. Document how agents set up Google Appointment Scheduling
2. Add `googleAppointmentUrl` field to agent settings
3. Create unified `BookingCTA` that handles both Calendly and Google
4. Add "How to set up" guide in dashboard

**Deliverables:**
- Settings UI for Google Appointment URL
- Unified BookingCTA component
- Help documentation

### Phase 3: Full Google Calendar Integration (1-2 weeks)

1. Set up Google Cloud project and OAuth
2. Build OAuth connection flow
3. Create availability API endpoints
4. Build booking API endpoints
5. Create custom booking UI component
6. Add agent availability settings

**Deliverables:**
- OAuth connection flow
- Availability query system
- Custom booking widget
- Google Meet auto-creation
- Agent availability settings

---

## Part 4: Data Flow

### Calendly Flow

```
User clicks "Book a Meeting"
         │
         ▼
┌─────────────────────┐
│ Calendly Popup      │ ◀── Prefilled with user data from chat
│ Opens               │
└─────────────────────┘
         │
         ▼
User selects time and confirms in Calendly
         │
         ▼
Calendly sends confirmation email to both parties
         │
         ▼
(Optional) Calendly webhook notifies our system
```

### Google Calendar Flow

```
User clicks "Book a Meeting"
         │
         ▼
┌─────────────────────┐
│ Our custom UI       │
│ - Date picker       │
│ - Available slots   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ API: Get Availability│
│ (queries Google     │
│  Calendar API)      │
└─────────────────────┘
         │
         ▼
User selects time slot
         │
         ▼
┌─────────────────────┐
│ API: Create Event   │
│ - Creates calendar  │
│   event             │
│ - Generates Meet    │
│   link              │
│ - Sends invites     │
└─────────────────────┘
         │
         ▼
Show confirmation with Google Meet link
```

---

## Part 5: Security Considerations

### Token Storage
- Store OAuth tokens encrypted at rest
- Use secure httpOnly cookies for session
- Implement token refresh logic

### Rate Limiting
- Google Calendar API has quotas (1,000,000 queries/day for free)
- Cache availability data (5-minute TTL)
- Implement request throttling

### Data Privacy
- Only request necessary scopes
- Allow agents to disconnect Google account
- Clear tokens on disconnect
- Don't store attendee data longer than needed

---

## Part 6: Files to Create

| File | Purpose |
|------|---------|
| `components/booking/BookingCTA.tsx` | Main booking CTA component |
| `components/booking/CalendlyEmbed.tsx` | Calendly-specific wrapper |
| `components/booking/GoogleCalendarBooking.tsx` | Google Calendar booking UI |
| `app/api/auth/google/route.ts` | OAuth initiation |
| `app/api/auth/google/callback/route.ts` | OAuth callback |
| `app/api/booking/availability/route.ts` | Get available slots |
| `app/api/booking/create/route.ts` | Create booking |
| `lib/google-calendar/client.ts` | Google API client setup |
| `lib/google-calendar/availability.ts` | Availability logic |
| `lib/google-calendar/booking.ts` | Booking creation |

---

## Part 7: Agent Settings Schema

```typescript
interface AgentBookingSettings {
  // General
  bookingEnabled: boolean;
  bookingProvider: 'calendly' | 'google-appointments' | 'google-custom' | 'none';

  // Calendly
  calendlyUrl?: string;

  // Google Appointments (simple)
  googleAppointmentUrl?: string;

  // Google Custom (full integration)
  googleConnected?: boolean;
  googleCalendarId?: string;

  // Display
  ctaText: string;
  ctaDescription?: string;
  displayStyle: 'inline' | 'floating' | 'footer' | 'card';

  // Availability (for custom Google integration)
  workingHours?: WorkingHours;
  timezone?: string;
  meetingDurations?: number[];
  bufferMinutes?: number;
}
```

---

## Summary

**Start with Calendly** - it's 90% of the value with 10% of the effort. Most agents already have Calendly, and it handles all the complexity of availability, time zones, confirmations, and reminders.

**Add Google Appointment Scheduling** as an alternative for agents who prefer Google ecosystem - it's similarly simple (just a URL).

**Consider full Google Calendar integration** only if there's strong demand for:
- Fully branded booking experience
- Custom availability logic
- Direct calendar manipulation
- No third-party branding

The Calendly integration can be done in a day. Full Google Calendar integration is a 1-2 week project.

---

## Part 8: Long-Term Vision - Full Google API Integration

> **Note:** This section outlines the strategic value of building full Google OAuth integration as a platform investment, not just for calendar booking.

### The Strategic Opportunity

The Google Appointment URL approach (MVP) has one key limitation: **it opens in a new tab**, taking users off your app. Full Google OAuth integration keeps everything in-app AND unlocks the entire Google API ecosystem.

Once OAuth infrastructure is in place, the same tokens work for ALL Google APIs. This is a **one-time investment** that enables many features.

### Google APIs Unlocked by OAuth

| API | Scope | Potential Features |
|-----|-------|-------------------|
| **Calendar** | `calendar.events`, `calendar.readonly` | In-app booking, availability display, meeting sync, "agent is free tomorrow at 2pm" prompts |
| **Gmail** | `gmail.send`, `gmail.readonly` | Send timeline PDFs from agent's email, automated follow-ups, read replies for lead tracking |
| **Contacts** | `contacts` | Auto-add leads to agent's Google Contacts, sync contact info |
| **Drive** | `drive.file` | Store/share documents (contracts, disclosures, buyer guides), collaborative folders per client |
| **Meet** | (via Calendar API) | Generate video call links on-demand, embed meeting rooms |
| **Tasks** | `tasks` | Create follow-up tasks in agent's task list, deadline reminders |
| **People API** | `userinfo.profile` | Get agent profile info, photo for display |

### High-Value Feature Ideas (Post-MVP)

#### 1. Smart Availability Display
Show agent availability directly in the timeline/offer page:
```
"Sarah has openings this week: Tomorrow 2pm, Friday 10am"
[Book Tomorrow] [Book Friday] [See All Times]
```

#### 2. Automated Email Follow-ups
After user generates timeline, agent can auto-send personalized email:
```
From: sarah@atlanticrealty.ca (agent's actual Gmail)
Subject: Your Halifax Home Buying Timeline

Hi John, here's your personalized timeline...
[Attached: timeline.pdf]
```

#### 3. Lead-to-Contact Sync
Every lead automatically added to agent's Google Contacts with:
- Name, email, phone
- Tags: "Lead", "First-time buyer", "Halifax"
- Notes: Budget, timeline, property preferences

#### 4. Document Sharing via Drive
Agent uploads buyer guides, contracts, checklists to Drive → automatically shared with leads at relevant timeline phases.

#### 5. Calendar-Aware Recommendations
"Based on your timeline and Sarah's availability, you could have your first consultation this Thursday and be pre-approved by next Friday."

#### 6. Meeting Prep Automation
Before a scheduled call, auto-generate a prep doc for the agent:
```
Meeting with John Smith - 2pm Thursday
- Budget: $425K
- Area: Halifax, South End preferred
- Stage: Pre-approval (starting)
- Questions from chat: [list]
```

### Architecture: Reusable Google Integration Layer

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GOOGLE INTEGRATION LAYER                             │
│  (One-time build, used by all features)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐ │
│  │  OAuth Manager   │     │  Token Storage   │     │  API Client      │ │
│  │  - Connect flow  │     │  - Encrypted DB  │     │  - Auto-refresh  │ │
│  │  - Disconnect    │     │  - Per-agent     │     │  - Rate limiting │ │
│  │  - Scope mgmt    │     │  - Expiry track  │     │  - Error handling│ │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘ │
│           │                        │                        │            │
│           └────────────────────────┼────────────────────────┘            │
│                                    │                                     │
│                    ┌───────────────┴───────────────┐                     │
│                    │     Unified Google Client     │                     │
│                    │   getGoogleClient(agentId)    │                     │
│                    └───────────────┬───────────────┘                     │
│                                    │                                     │
│       ┌────────────┬───────────────┼───────────────┬────────────┐       │
│       │            │               │               │            │       │
│       ▼            ▼               ▼               ▼            ▼       │
│  ┌─────────┐  ┌─────────┐    ┌─────────┐    ┌─────────┐  ┌─────────┐   │
│  │Calendar │  │  Gmail  │    │  Drive  │    │Contacts │  │  Tasks  │   │
│  │ Service │  │ Service │    │ Service │    │ Service │  │ Service │   │
│  └─────────┘  └─────────┘    └─────────┘    └─────────┘  └─────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Used by any feature needing Google APIs
```

### Implementation Phases (Long-term)

| Phase | Focus | Effort | APIs |
|-------|-------|--------|------|
| **MVP** | Google Appointment URLs | 1 hour | None (just links) |
| **Phase 1** | OAuth + Calendar Booking | 1-2 weeks | Calendar |
| **Phase 2** | Gmail Integration | 1 week | Gmail |
| **Phase 3** | Contacts Sync | 3-4 days | Contacts |
| **Phase 4** | Drive Documents | 1 week | Drive |
| **Phase 5** | Smart Features | Ongoing | All |

### Competitive Advantage

Most real estate SaaS tools offer:
- ❌ Calendly embed (third-party)
- ❌ Manual email follow-ups
- ❌ Separate CRM for contacts

With full Google integration:
- ✅ Native in-app booking (no redirect)
- ✅ Automated emails from agent's own address
- ✅ Contacts sync automatically
- ✅ Documents in agent's Drive
- ✅ Everything feels like one integrated system

This becomes a **platform differentiator** - agents get more value because their Google workspace is connected, not siloed.

### Existing Setup

> Note: Some OAuth groundwork has been started previously. Check for:
> - Google Cloud project credentials
> - Existing OAuth routes/callbacks
> - Any stored tokens in database
>
> This prior work can accelerate the full integration when ready.

---

## Decision Framework

```
                    ┌─────────────────────────┐
                    │ Does client need        │
                    │ booking to stay in-app? │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                   No                      Yes
                    │                       │
                    ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │ Use Google       │    │ Need more than   │
         │ Appointment URL  │    │ just booking?    │
         │ (MVP - 1 hour)   │    └────────┬─────────┘
         └──────────────────┘             │
                              ┌───────────┴───────────┐
                              │                       │
                             No                      Yes
                              │                       │
                              ▼                       ▼
                   ┌──────────────────┐    ┌──────────────────┐
                   │ Calendar-only    │    │ Full Google      │
                   │ OAuth            │    │ Integration      │
                   │ (1-2 weeks)      │    │ (Platform invest)│
                   └──────────────────┘    └──────────────────┘
```
