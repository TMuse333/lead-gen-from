# API-First Architecture: Homebase ↔ Chatbot Service

## Vision: Zero Direct Chatbot Access Needed

**Goal:** Agent works 100% in their homebase (next-js-template). Chatbot is a consumed service, like Stripe or SendGrid.

```
┌─────────────────────────────────────────┐
│         Agent's Experience              │
│  (Everything happens in homebase)       │
├─────────────────────────────────────────┤
│  1. Deploy homebase → chatbot auto-provisions │
│  2. Edit profile → chatbot auto-syncs   │
│  3. Add story → chatbot auto-indexes    │
│  4. View leads → fetch from chatbot API │
│  5. See analytics → fetch from chatbot  │
│  6. Customize questions → POST to API   │
│  7. Change colors → chatbot updates     │
│  8. Test bot → iframe in homebase admin │
└─────────────────────────────────────────┘
              │
              │ All interactions via API
              ↓
┌─────────────────────────────────────────┐
│   Chatbot Service (Black Box)          │
│   No direct access needed              │
└─────────────────────────────────────────┘
```

---

## What Should Be Homebase-Controlled (API-Driven)

### ✅ **Agent Can Do From Homebase (Via API)**

| Operation | Method | Endpoint | Current Status |
|-----------|--------|----------|----------------|
| **Initial Setup** |
| Create chatbot | `POST` | `/api/provision` | ✅ Implemented |
| Delete chatbot | `DELETE` | `/api/provision?slug=X` | ✅ Implemented |
| Check if slug available | `GET` | `/api/provision?slug=X` | ✅ Implemented |
| **Content Management** |
| Add stories | `POST` | `/api/stories` | ❌ Need to build |
| Update story | `PATCH` | `/api/stories/:id` | ❌ Need to build |
| Delete story | `DELETE` | `/api/stories/:id` | ❌ Need to build |
| List all stories | `GET` | `/api/stories?slug=X` | ❌ Need to build |
| Bulk sync stories | `POST` | `/api/stories/sync` | ❌ Need to build |
| **Profile Management** |
| Update agent profile | `PATCH` | `/api/profile` | ❌ Need to build |
| Update profile photo | `POST` | `/api/profile/photo` | ❌ Need to build |
| Update contact info | `PATCH` | `/api/profile/contact` | ❌ Need to build |
| **Branding** |
| Update theme colors | `PATCH` | `/api/theme` | ❌ Need to build |
| Update greeting | `PATCH` | `/api/greeting` | ❌ Need to build |
| Update homebase URL | `PATCH` | `/api/homebase-url` | ❌ Need to build |
| **Questions & Flow** |
| Get current questions | `GET` | `/api/questions?slug=X&flow=buy` | ❌ Need to build |
| Update questions | `PUT` | `/api/questions` | ❌ Need to build |
| Reorder questions | `PATCH` | `/api/questions/order` | ❌ Need to build |
| **Lead Management** |
| List leads | `GET` | `/api/leads?slug=X&limit=50` | ❌ Need to build |
| Get lead details | `GET` | `/api/leads/:id` | ❌ Need to build |
| Get conversation | `GET` | `/api/conversations/:id` | ❌ Need to build |
| Export leads (CSV) | `GET` | `/api/leads/export?slug=X` | ❌ Need to build |
| **Analytics** |
| Get overview stats | `GET` | `/api/analytics/:slug` | ❌ Need to build |
| Get funnel data | `GET` | `/api/analytics/:slug/funnel` | ❌ Need to build |
| Get top questions | `GET` | `/api/analytics/:slug/questions` | ❌ Need to build |
| **Configuration** |
| Get full config | `GET` | `/api/config/:slug` | ❌ Need to build |
| Update settings | `PATCH` | `/api/config/:slug` | ❌ Need to build |
| Configure webhooks | `PATCH` | `/api/webhooks` | ❌ Need to build |
| Test webhook | `POST` | `/api/webhooks/test` | ❌ Need to build |

### ❌ **Requires Chatbot Codebase Access**

These should be rare and only for platform-level changes:

| Operation | Why Codebase Access Needed |
|-----------|---------------------------|
| Add new question types | Requires UI component development |
| Add new offer types (beyond timeline) | Requires generation logic changes |
| Change database schema | Requires migrations |
| Add new chatbot features | Requires React component work |
| Fix bugs in chat logic | Code changes needed |
| Upgrade dependencies | Package.json changes |
| Infrastructure changes | Vercel/hosting config |
| Add new integrations (Zapier, etc.) | Platform feature development |

**Goal:** Keep this list as short as possible. Anything that can be exposed via API should be.

---

## Recommended API Design: RESTful Resource-Based

### Base URL
```
https://chatbot.focusflowsoftware.com/api/v1
```

### Authentication
All requests require API key in header:
```
x-api-key: <PROVISION_API_KEY>
```

Future: Consider JWT tokens for user-specific access:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Detailed API Specifications

### 1. **Profile Management API**

#### Update Agent Profile
```http
PATCH /api/v1/profile
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "profile": {
    "name": "Sarah Johnson",
    "title": "Senior Real Estate Agent",
    "company": "Keller Williams",
    "bio": "20+ years helping families...",
    "photo": "https://vercel-blob.../headshot.jpg",
    "phone": "+1-512-555-0123",
    "email": "sarah@example.com",
    "yearsExperience": 20,
    "certifications": ["CRS", "ABR", "GRI"],
    "serviceAreas": ["Austin", "Round Rock", "Cedar Park"],
    "specializations": ["First-time buyers", "Luxury homes"]
  }
}

Response:
{
  "success": true,
  "message": "Profile updated",
  "profile": { ... }
}
```

**What this does in chatbot:**
- Updates `agentProfile` in MongoDB
- Next conversation uses updated info on results page
- Clears profile cache

**Homebase implementation:**
```typescript
// In next-js-template admin panel
async function syncProfileToChatbot(profile: AgentProfile) {
  await fetch('https://chatbot.../api/v1/profile', {
    method: 'PATCH',
    headers: {
      'x-api-key': process.env.CHATBOT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slug: process.env.AGENT_SLUG,
      profile,
    }),
  });
}
```

---

### 2. **Stories/Knowledge Base API**

#### Add Story
```http
POST /api/v1/stories
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "story": {
    "title": "Helped first-time buyer win in competitive market",
    "situation": "Young couple competing against cash offers",
    "action": "Wrote personalized letter to seller, waived inspection contingency",
    "outcome": "Won the house and closed in 21 days",
    "flow": "buy",
    "kind": "story",
    "tags": ["competitive-market", "first-time-buyer"]
  }
}

Response:
{
  "success": true,
  "storyId": "story-abc123",
  "qdrantId": "story-xyz789",
  "message": "Story added and indexed"
}
```

**What this does in chatbot:**
- Generates embedding via OpenAI
- Stores in Qdrant collection
- Adds to `knowledgeBaseItems` in MongoDB
- Available in next conversation for semantic search

#### Bulk Sync Stories
```http
POST /api/v1/stories/sync
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "action": "replace", // "replace" | "merge"
  "stories": [
    { title, situation, action, outcome, flow, kind },
    { title, situation, action, outcome, flow, kind },
    ...
  ]
}

Response:
{
  "success": true,
  "added": 5,
  "updated": 2,
  "deleted": 1,
  "total": 7
}
```

**Homebase implementation:**
```typescript
// In next-js-template CMS
async function onStorySave(story: Story) {
  // Sync to chatbot whenever story saved in homebase
  await fetch('https://chatbot.../api/v1/stories', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CHATBOT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slug: process.env.AGENT_SLUG,
      story,
    }),
  });
}
```

---

### 3. **Questions/Flow Configuration API**

#### Get Current Questions
```http
GET /api/v1/questions?slug=sarah-johnson-real-estate&flow=buy
x-api-key: <key>

Response:
{
  "flow": "buy",
  "questions": [
    {
      "id": "q1",
      "question": "Are you pre-approved for a mortgage?",
      "order": 1,
      "mappingKey": "preApproved",
      "linkedPhaseId": "financing",
      "triggersContactModal": false
    },
    {
      "id": "q2",
      "question": "What's your budget?",
      "order": 2,
      "mappingKey": "budget",
      "linkedPhaseId": "financing",
      "triggersContactModal": false
    },
    ...
  ]
}
```

#### Update Questions
```http
PUT /api/v1/questions
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "flow": "buy",
  "questions": [
    {
      "id": "q1",
      "question": "Have you been pre-approved by a lender?", // ← Changed wording
      "order": 1,
      "mappingKey": "preApproved"
    },
    ...
  ]
}

Response:
{
  "success": true,
  "updated": 5
}
```

**What this does:**
- Updates `customQuestions[flow]` in MongoDB
- Next conversation uses new question wording
- Preserves mappingKey for timeline generation

**Homebase UI:**
```typescript
// next-js-template admin: "Chatbot Questions" page
function ChatbotQuestionsEditor() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Fetch current questions
    fetch(`https://chatbot.../api/v1/questions?slug=${slug}&flow=buy`)
      .then(r => r.json())
      .then(data => setQuestions(data.questions));
  }, []);

  async function saveQuestions() {
    await fetch('https://chatbot.../api/v1/questions', {
      method: 'PUT',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, flow: 'buy', questions }),
    });
  }

  return (
    <div>
      <h2>Edit Chatbot Questions (Buy Flow)</h2>
      {questions.map((q, i) => (
        <input
          value={q.question}
          onChange={(e) => {
            const updated = [...questions];
            updated[i].question = e.target.value;
            setQuestions(updated);
          }}
        />
      ))}
      <button onClick={saveQuestions}>Save to Chatbot</button>
    </div>
  );
}
```

---

### 4. **Leads & Conversations API**

#### List Leads
```http
GET /api/v1/leads?slug=sarah-johnson-real-estate&limit=50&offset=0&status=completed
x-api-key: <key>

Response:
{
  "leads": [
    {
      "id": "conv_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-512-555-9999",
      "intent": "buy",
      "status": "completed",
      "createdAt": "2025-01-28T10:30:00Z",
      "completedAt": "2025-01-28T10:45:00Z",
      "resultsUrl": "https://chatbot.../results?id=conv_123"
    },
    ...
  ],
  "total": 127,
  "hasMore": true
}
```

#### Get Conversation Details
```http
GET /api/v1/conversations/conv_123
x-api-key: <key>

Response:
{
  "id": "conv_123",
  "lead": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-512-555-9999"
  },
  "intent": "buy",
  "status": "completed",
  "userInput": {
    "preApproved": "Yes",
    "budget": "$500,000",
    "timeline": "3-6 months",
    "location": "Austin, TX"
  },
  "messages": [
    { "role": "assistant", "content": "Hi! I'm Sarah's AI assistant..." },
    { "role": "user", "content": "I want to buy a home" },
    ...
  ],
  "timeline": { ... }, // Generated timeline data
  "createdAt": "2025-01-28T10:30:00Z",
  "completedAt": "2025-01-28T10:45:00Z"
}
```

**Homebase implementation:**
```typescript
// next-js-template: "Leads Dashboard" page
function LeadsDashboard() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch(`https://chatbot.../api/v1/leads?slug=${slug}`)
      .then(r => r.json())
      .then(data => setLeads(data.leads));
  }, []);

  return (
    <div>
      <h2>Recent Chatbot Leads</h2>
      <table>
        {leads.map(lead => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.intent}</td>
            <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
            <td>
              <a href={`/admin/leads/${lead.id}`}>View Details</a>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

---

### 5. **Analytics API**

#### Get Overview Stats
```http
GET /api/v1/analytics/sarah-johnson-real-estate
x-api-key: <key>

Response:
{
  "period": "last-30-days",
  "totalConversations": 156,
  "completedConversations": 87,
  "completionRate": 0.56,
  "avgDuration": 423, // seconds
  "intentBreakdown": {
    "buy": 62,
    "sell": 19,
    "browse": 75
  },
  "topQuestions": [
    { "question": "What's your budget?", "askCount": 156 },
    { "question": "Are you pre-approved?", "askCount": 156 },
    { "question": "Where are you looking?", "askCount": 143 }
  ],
  "dropOffPoints": [
    { "questionId": "q3", "question": "What's your budget?", "dropOffRate": 0.15 }
  ]
}
```

#### Get Funnel Data
```http
GET /api/v1/analytics/sarah-johnson-real-estate/funnel?flow=buy
x-api-key: <key>

Response:
{
  "flow": "buy",
  "steps": [
    { "step": 1, "question": "Intent selection", "reached": 156, "completed": 156, "dropOff": 0 },
    { "step": 2, "question": "Pre-approval", "reached": 156, "completed": 145, "dropOff": 11 },
    { "step": 3, "question": "Budget", "reached": 145, "completed": 123, "dropOff": 22 },
    { "step": 4, "question": "Location", "reached": 123, "completed": 110, "dropOff": 13 },
    { "step": 5, "question": "Timeline", "reached": 110, "completed": 98, "dropOff": 12 },
    { "step": 6, "question": "Email", "reached": 98, "completed": 87, "dropOff": 11 }
  ]
}
```

**Homebase implementation:**
```typescript
// next-js-template: "Analytics" page
function ChatbotAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`https://chatbot.../api/v1/analytics/${slug}`)
      .then(r => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Chatbot Performance</h2>
      <div className="stats-grid">
        <StatCard title="Total Conversations" value={stats.totalConversations} />
        <StatCard title="Completed" value={stats.completedConversations} />
        <StatCard title="Completion Rate" value={`${(stats.completionRate * 100).toFixed(1)}%`} />
      </div>

      <h3>Intent Breakdown</h3>
      <PieChart data={stats.intentBreakdown} />

      <h3>Top Questions</h3>
      <ul>
        {stats.topQuestions.map(q => (
          <li>{q.question} ({q.askCount} times)</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 6. **Theme/Branding API**

#### Update Colors
```http
PATCH /api/v1/theme
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "colorConfig": {
    "name": "Custom Brand Colors",
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f1f5f9",
    "accent": "#06b6d4",
    "gradientFrom": "#3b82f6",
    "gradientTo": "#8b5cf6"
  }
}

Response:
{
  "success": true,
  "message": "Theme updated"
}
```

**What this does:**
- Updates `colorConfig` in MongoDB
- Next iframe load injects new CSS variables
- Existing sessions continue with old colors (cached)

**Homebase implementation:**
```typescript
// next-js-template: Color picker in admin
function BrandingSettings() {
  const [colors, setColors] = useState({ primary: '#3b82f6', ... });

  async function syncColors() {
    // Get colors from homebase theme
    const homebaseColors = getComputedStyle(document.documentElement);

    // Sync to chatbot
    await fetch('https://chatbot.../api/v1/theme', {
      method: 'PATCH',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        colorConfig: {
          primary: homebaseColors.getPropertyValue('--color-primary'),
          background: homebaseColors.getPropertyValue('--color-background'),
          text: homebaseColors.getPropertyValue('--color-text'),
          // ...
        },
      }),
    });
  }

  return (
    <div>
      <h2>Brand Colors</h2>
      <ColorPicker value={colors.primary} onChange={(c) => setColors({...colors, primary: c})} />
      <button onClick={syncColors}>Sync to Chatbot</button>
    </div>
  );
}
```

---

### 7. **Webhook Configuration API**

#### Configure Webhooks
```http
PATCH /api/v1/webhooks
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "webhooks": {
    "leadCreated": "https://sarah-johnson-real-estate.vercel.app/api/webhooks/chatbot-lead",
    "leadUpdated": "https://sarah-johnson-real-estate.vercel.app/api/webhooks/chatbot-lead-updated",
    "conversationCompleted": "https://sarah-johnson-real-estate.vercel.app/api/webhooks/chatbot-completed",
    "secret": "whsec_abc123..." // For HMAC signature verification
  }
}

Response:
{
  "success": true,
  "webhooks": { ... }
}
```

#### Test Webhook
```http
POST /api/v1/webhooks/test
Content-Type: application/json
x-api-key: <key>

{
  "slug": "sarah-johnson-real-estate",
  "webhookType": "leadCreated",
  "testData": {
    "lead": { "name": "Test User", "email": "test@example.com" },
    "intent": "buy"
  }
}

Response:
{
  "success": true,
  "statusCode": 200,
  "response": { ... },
  "latency": 123 // ms
}
```

**Homebase implementation:**
```typescript
// next-js-template: Webhook settings
function WebhookSettings() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/chatbot-lead`;

  async function setupWebhooks() {
    await fetch('https://chatbot.../api/v1/webhooks', {
      method: 'PATCH',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        webhooks: {
          leadCreated: webhookUrl,
          secret: process.env.WEBHOOK_SECRET,
        },
      }),
    });
  }

  async function testWebhook() {
    const result = await fetch('https://chatbot.../api/v1/webhooks/test', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        webhookType: 'leadCreated',
        testData: { lead: { name: 'Test', email: 'test@example.com' }, intent: 'buy' },
      }),
    }).then(r => r.json());

    alert(result.success ? 'Webhook working!' : 'Webhook failed');
  }

  return (
    <div>
      <h2>Webhook Configuration</h2>
      <input value={webhookUrl} disabled />
      <button onClick={setupWebhooks}>Save Webhook URL</button>
      <button onClick={testWebhook}>Test Webhook</button>
    </div>
  );
}
```

---

## Recommended SDK/Client Library

Instead of raw `fetch()` calls, create a TypeScript SDK for homebase:

### Installation (in next-js-template)
```bash
npm install @focusflow/chatbot-sdk
```

### Usage
```typescript
// lib/chatbot.ts
import { ChatbotClient } from '@focusflow/chatbot-sdk';

export const chatbot = new ChatbotClient({
  apiKey: process.env.CHATBOT_API_KEY!,
  baseUrl: 'https://chatbot.focusflowsoftware.com/api/v1',
  slug: process.env.AGENT_SLUG!,
});

// In your homebase code
import { chatbot } from '@/lib/chatbot';

// Provision chatbot (on first deploy)
await chatbot.provision({
  agentInfo: { name, email, phone },
  stories: [...],
  colorConfig: {...},
  homebaseUrl: process.env.NEXT_PUBLIC_URL,
  webhooks: {
    leadCreated: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/chatbot-lead`,
  },
});

// Update profile
await chatbot.profile.update({
  name: 'Sarah Johnson',
  photo: 'https://...',
  bio: 'Updated bio...',
});

// Add story
await chatbot.stories.add({
  title: 'New success story',
  situation: '...',
  action: '...',
  outcome: '...',
  flow: 'buy',
  kind: 'story',
});

// Get leads
const leads = await chatbot.leads.list({ limit: 50, status: 'completed' });

// Get analytics
const stats = await chatbot.analytics.getOverview();

// Update questions
await chatbot.questions.update('buy', [
  { id: 'q1', question: 'Updated question text', order: 1, mappingKey: 'preApproved' },
  ...
]);
```

### SDK Structure
```typescript
class ChatbotClient {
  constructor(config: { apiKey: string; baseUrl: string; slug: string });

  // Main provision
  provision(data: ProvisionRequest): Promise<ProvisionResponse>;
  delete(): Promise<void>;

  // Resources
  profile: ProfileResource;
  stories: StoriesResource;
  questions: QuestionsResource;
  leads: LeadsResource;
  analytics: AnalyticsResource;
  theme: ThemeResource;
  webhooks: WebhooksResource;
}

class ProfileResource {
  update(profile: AgentProfile): Promise<void>;
  get(): Promise<AgentProfile>;
}

class StoriesResource {
  add(story: Story): Promise<{ storyId: string }>;
  update(id: string, story: Partial<Story>): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Story[]>;
  sync(stories: Story[], action: 'replace' | 'merge'): Promise<SyncResult>;
}

class QuestionsResource {
  get(flow: 'buy' | 'sell' | 'browse'): Promise<Question[]>;
  update(flow: string, questions: Question[]): Promise<void>;
  reorder(flow: string, questionIds: string[]): Promise<void>;
}

class LeadsResource {
  list(options?: { limit?: number; offset?: number; status?: string }): Promise<Lead[]>;
  get(id: string): Promise<LeadDetails>;
  export(format: 'csv' | 'json'): Promise<Blob>;
}

class AnalyticsResource {
  getOverview(): Promise<AnalyticsOverview>;
  getFunnel(flow: string): Promise<FunnelData>;
  getTopQuestions(): Promise<QuestionStats[]>;
}

class ThemeResource {
  update(colorConfig: ColorTheme): Promise<void>;
  get(): Promise<ColorTheme>;
}

class WebhooksResource {
  configure(webhooks: WebhookConfig): Promise<void>;
  test(webhookType: string, testData: any): Promise<TestResult>;
  get(): Promise<WebhookConfig>;
}
```

---

## Homebase Auto-Sync Patterns

### Pattern 1: Deploy-Time Provision
```typescript
// next-js-template: scripts/provision-chatbot.ts
// Run during Vercel build: `npm run provision-chatbot`

import { chatbot } from '@/lib/chatbot';
import { getAgentProfile, getStories, getTheme } from '@/lib/cms';

async function provision() {
  const profile = await getAgentProfile();
  const stories = await getStories();
  const theme = getTheme();

  await chatbot.provision({
    slug: process.env.AGENT_SLUG!,
    agentInfo: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    },
    stories,
    colorConfig: theme,
    homebaseUrl: process.env.NEXT_PUBLIC_URL,
    webhooks: {
      leadCreated: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/chatbot-lead`,
    },
  });

  console.log('✅ Chatbot provisioned');
}

provision();
```

### Pattern 2: Real-Time Sync on Content Change
```typescript
// next-js-template: app/api/cms/stories/route.ts
// When agent saves a story in CMS

import { chatbot } from '@/lib/chatbot';

export async function POST(req: Request) {
  const story = await req.json();

  // Save to homebase database
  await db.stories.create(story);

  // Sync to chatbot immediately
  await chatbot.stories.add(story);

  return Response.json({ success: true });
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();

  // Update in homebase
  await db.stories.update(id, updates);

  // Sync to chatbot
  await chatbot.stories.update(id, updates);

  return Response.json({ success: true });
}
```

### Pattern 3: Scheduled Periodic Sync
```typescript
// next-js-template: app/api/cron/sync-chatbot/route.ts
// Vercel Cron: runs every hour

import { chatbot } from '@/lib/chatbot';
import { getStories, getAgentProfile, getTheme } from '@/lib/cms';

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Full sync
  const [stories, profile, theme] = await Promise.all([
    getStories(),
    getAgentProfile(),
    getTheme(),
  ]);

  await Promise.all([
    chatbot.stories.sync(stories, 'replace'),
    chatbot.profile.update(profile),
    chatbot.theme.update(theme),
  ]);

  return Response.json({ success: true, syncedAt: new Date() });
}
```

---

## Configuration File Approach

Another approach: Homebase defines everything in a config file, chatbot reads it.

### homebase: `chatbot.config.ts`
```typescript
// next-js-template: chatbot.config.ts

export default {
  slug: 'sarah-johnson-real-estate',
  agentInfo: {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-512-555-0123',
  },
  branding: {
    primary: '#3b82f6',
    background: '#0f172a',
    text: '#f1f5f9',
  },
  flows: {
    buy: {
      questions: [
        { id: 'q1', text: 'Are you pre-approved?', mappingKey: 'preApproved' },
        { id: 'q2', text: "What's your budget?", mappingKey: 'budget' },
        // ...
      ],
    },
    sell: {
      questions: [...],
    },
  },
  webhooks: {
    leadCreated: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/chatbot-lead`,
  },
  features: {
    enableContactModal: true,
    enableTimeline: true,
    enableAnalytics: true,
  },
};
```

### Chatbot reads config from homebase
```typescript
// Chatbot fetches homebase config on each conversation start
const config = await fetch('https://sarah-johnson-real-estate.vercel.app/api/chatbot-config')
  .then(r => r.json());

// Use config questions instead of MongoDB
const questions = config.flows[intent].questions;
```

**Pros:**
- Single source of truth (homebase)
- No sync lag
- Agent sees immediate changes

**Cons:**
- Chatbot depends on homebase being online
- Slower (network call on each conversation)
- More complex error handling

---

## Recommended Approach: Hybrid

1. **Initial Provision:** Homebase calls `/api/provision` on first deploy
2. **Incremental Updates:** Homebase calls specific endpoints (profile, stories, theme) when changed
3. **Periodic Full Sync:** Cron job every 6 hours for consistency
4. **Webhooks:** Chatbot sends leads back to homebase in real-time
5. **SDK Usage:** Homebase uses `@focusflow/chatbot-sdk` for all interactions

---

## Implementation Priority

### Phase 1: Essential APIs (Next 2 Weeks)
1. ✅ `POST /api/provision` (done)
2. ✅ `DELETE /api/provision` (done)
3. ✅ `GET /api/provision?slug=X` (done)
4. ❌ `PATCH /api/profile` (update agent profile)
5. ❌ `POST /api/stories` (add story)
6. ❌ `POST /api/stories/sync` (bulk sync stories)
7. ❌ `GET /api/leads` (list leads)
8. ❌ `GET /api/conversations/:id` (get conversation details)

### Phase 2: Management APIs (Next Month)
9. ❌ `GET /api/questions` (get current questions)
10. ❌ `PUT /api/questions` (update questions)
11. ❌ `PATCH /api/theme` (update colors)
12. ❌ `PATCH /api/webhooks` (configure webhooks)
13. ❌ `POST /api/webhooks/test` (test webhook)

### Phase 3: Analytics & Advanced (Next Quarter)
14. ❌ `GET /api/analytics/:slug` (overview stats)
15. ❌ `GET /api/analytics/:slug/funnel` (funnel data)
16. ❌ `GET /api/leads/export` (CSV export)
17. ❌ SDK package (`@focusflow/chatbot-sdk`)

---

## Summary

**Current State:** 10% API coverage
- ✅ Provision (create)
- ✅ Check availability
- ✅ Delete

**Target State:** 100% API coverage
- Agent never needs chatbot codebase access
- All operations via REST API
- SDK for easy integration
- Real-time webhooks for leads
- Full analytics access

**Answer to your question:**
> How much can be done on homebase vs chatbot codebase?

**Homebase should handle:**
- ✅ Content creation (stories, profile, questions)
- ✅ Branding (colors, theme)
- ✅ Lead management (view, export, sync to CRM)
- ✅ Analytics (view performance)
- ✅ Configuration (webhooks, settings)
- ✅ Testing (iframe preview)

**Chatbot codebase only for:**
- ❌ Platform features (new offer types, UI components)
- ❌ Bug fixes
- ❌ Infrastructure (hosting, databases)
- ❌ Dependency updates

**Next steps:**
Build the missing APIs to make this vision reality!
