# next-js-template ↔ Chatbot Integration Architecture

## Overview

The relationship between **next-js-template** (agent's main website) and **chatbot app** (lead generation tool) is critical for seamless agent operations. This document outlines current integration, gaps, and recommended enhancements.

---

## Current Architecture

### **Relationship Model**
```
next-js-template (Agent's Main Site)
    ↓ Provisions chatbot via API
Chatbot App (Lead Generation)
    ↓ Embedded via iframe
next-js-template pages (Contact, About, etc.)
```

### **Data Flow Direction**
Currently: **One-way** (next-js-template → chatbot)
Needed: **Two-way** (bidirectional sync)

---

## Currently Shared Data (via Provision API)

### ✅ What's Being Synced Now

| Data Type | Field | Purpose | Source |
|-----------|-------|---------|--------|
| **Identity** | `slug` | Business name, URL routing | next-js-template config |
| **Identity** | `externalUserId` | Link chatbot to template user account | next-js-template auth |
| **Agent Info** | `agentInfo.name` | Bot personalization, display | Agent profile |
| **Agent Info** | `agentInfo.email` | Lead notifications | Agent profile |
| **Agent Info** | `agentInfo.phone` | Contact info display | Agent profile |
| **Agent Info** | `agentInfo.serviceArea` | Geographic context | Agent profile |
| **Branding** | `colorConfig.primary` | Brand consistency | Template theme |
| **Branding** | `colorConfig.background` | Visual harmony | Template theme |
| **Branding** | `colorConfig.text` | Readability | Template theme |
| **Content** | `stories[]` | Knowledge base (SAR stories, tips) | CMS/database |
| **Content** | `greeting` | Custom welcome message | Agent preferences |
| **Integration** | `homebaseUrl` | Back to Home button | Template deployment URL |

### 🔧 Provision API Endpoint
```typescript
POST https://chatbot.focusflowsoftware.com/api/provision

Headers:
  x-api-key: <PROVISION_API_KEY>

Body: {
  slug: "sarah-johnson-real-estate",
  agentInfo: { name, email, phone, serviceArea },
  stories: [ { title, situation, action, outcome, flow, kind } ],
  colorConfig: { primary, background, text },
  greeting: "Hi! I'm Sarah...",
  homebaseUrl: "https://sarah-johnson-real-estate.vercel.app",
  externalUserId: "auth0|12345"
}

Response: {
  success: true,
  data: {
    chatbotUrl: "https://chatbot.focusflowsoftware.com/bot/sarah-johnson-real-estate",
    qdrantCollection: "sarah-johnson-real-estate",
    storiesUploaded: 12
  }
}
```

---

## Critical Gaps (What's NOT Shared)

### ❌ Missing Two-Way Sync

#### 1. **Leads Flow** (Chatbot → Template)
Currently: Lead notifications sent via email only
**Problem**: Template site doesn't know about chatbot leads in real-time

**Should Sync:**
- Lead contact info (name, email, phone)
- Lead intent (buy/sell/browse)
- Lead answers (budget, timeline, location, etc.)
- Lead source tracking (which page embedded the bot)
- Conversation transcript
- Generated timeline/results

**Solution Needed:**
```typescript
// Webhook from chatbot → next-js-template
POST https://sarah-johnson-real-estate.vercel.app/api/webhooks/chatbot-lead
{
  source: "chatbot",
  lead: { name, email, phone },
  intent: "buy",
  answers: { budget: "$500k", timeline: "3-6 months" },
  conversationId: "conv_123",
  chatbotUrl: "https://chatbot.../bot/sarah-johnson-real-estate",
  resultsUrl: "https://chatbot.../results?id=conv_123"
}
```

#### 2. **Agent Profile Updates** (Template → Chatbot)
Currently: Agent profile only synced on initial provision
**Problem**: Changes to agent bio, photo, certifications require manual re-provision

**Should Sync:**
- Profile photo (headshot URL)
- Bio/description
- Years of experience
- Certifications (e.g., "Certified Residential Specialist")
- Service areas (multiple cities/neighborhoods)
- Specializations (e.g., "First-time buyers", "Luxury homes")
- Social media links
- Reviews/testimonials

**Solution Needed:**
```typescript
// Update endpoint
PATCH https://chatbot.focusflowsoftware.com/api/provision/update
{
  slug: "sarah-johnson-real-estate",
  agentProfile: {
    photo: "https://vercel-blob.../headshot.jpg",
    bio: "20+ years helping families...",
    yearsExperience: 20,
    certifications: ["CRS", "ABR"],
    serviceAreas: ["Austin", "Round Rock", "Cedar Park"],
    specializations: ["First-time buyers", "Investment properties"]
  }
}
```

#### 3. **Content Sync** (Bi-directional)
Currently: Stories synced one-way during provision
**Problem**:
- Template CMS changes don't update chatbot knowledge base
- Chatbot can't suggest new story topics based on lead questions

**Should Sync:**
- Story additions/edits/deletions
- FAQ updates
- Market data updates
- Property listings (if relevant to bot)

#### 4. **Brand/Theme Updates** (Template → Chatbot)
Currently: Colors synced only on provision
**Problem**: Agent rebrands their main site, chatbot stays old colors

**Should Sync:**
- Color theme updates
- Logo changes
- Font preferences
- Custom CSS overrides

#### 5. **Analytics/Insights** (Chatbot → Template)
Currently: No analytics shared
**Problem**: Agent can't see chatbot performance from their main dashboard

**Should Sync:**
- Conversation count
- Completion rate
- Drop-off points
- Most common questions
- Lead quality metrics
- A/B test results

---

## Recommended Integration Enhancements

### **Phase 1: Essential Two-Way Sync**

#### 1.1 Lead Webhooks (CRITICAL)
```typescript
// Add to chatbot provision API
interface ProvisionRequest {
  // ... existing fields
  webhooks?: {
    leadCreated?: string;  // URL to POST new leads
    leadUpdated?: string;  // URL to POST lead updates
    conversationCompleted?: string;
  };
}
```

**Implementation:**
- Chatbot fires webhook when contact info collected
- Template receives lead in real-time
- Template can trigger email sequences, CRM sync, etc.

#### 1.2 Agent Profile Sync API
```typescript
// New endpoint: /api/provision/sync-profile
PATCH /api/provision/sync-profile
{
  slug: string;
  agentProfile: {
    photo?: string;
    bio?: string;
    phone?: string;
    email?: string;
    serviceAreas?: string[];
    certifications?: string[];
  };
}
```

#### 1.3 Content Sync API
```typescript
// New endpoint: /api/provision/sync-stories
POST /api/provision/sync-stories
{
  slug: string;
  action: "add" | "update" | "delete";
  stories: Story[];
}
```

### **Phase 2: Advanced Features**

#### 2.1 Shared Authentication
- Template user logs in → can access chatbot admin
- Single sign-on (SSO) between apps
- Shared session management

#### 2.2 Embedded Analytics Dashboard
- Template site displays chatbot metrics
- Iframe embed of chatbot analytics
- Unified reporting

#### 2.3 Live Sync (WebSockets/SSE)
- Real-time lead notifications
- Live conversation monitoring
- Instant updates when agent changes profile

#### 2.4 CRM Integration Passthrough
- Template configures CRM (Salesforce, HubSpot)
- Chatbot automatically syncs leads to CRM
- No duplicate configuration

---

## Security Considerations

### Current Security
✅ API key authentication (`x-api-key` header)
✅ Slug sanitization to prevent injection
✅ HTTPS only

### Needed Security Enhancements
- ❌ **Rate limiting** on provision API (prevent abuse)
- ❌ **Webhook signature verification** (ensure requests from chatbot are authentic)
- ❌ **IP whitelisting** (optional, for enterprise)
- ❌ **Audit logging** (track who provisioned/updated what)
- ❌ **Scope-based API keys** (read-only vs full access)

**Recommended Implementation:**
```typescript
// Webhook signature (HMAC)
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

// Template verifies:
if (signature !== req.headers['x-chatbot-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## Data Sovereignty & Ownership

### Current Model
- **Chatbot App** owns: Qdrant vectors, conversation logs, MongoDB configs
- **Template App** owns: User auth, agent content, CMS data

### Recommended Shared Ownership
| Data | Owner | Access |
|------|-------|--------|
| Agent Profile | Template | Chatbot reads (cached) |
| Stories/Knowledge | Template | Chatbot reads (synced to Qdrant) |
| Leads | **Both** | Template writes, Chatbot reads |
| Conversations | Chatbot | Template can read via API |
| Analytics | Chatbot | Template can read via API |
| Theme/Branding | Template | Chatbot reads (cached) |

---

## Proposed API Expansion

### New Endpoints Needed

#### **On Chatbot App:**
```typescript
// 1. Get conversation details (for template to display)
GET /api/conversations/:conversationId
Response: { messages, userInput, intent, status, createdAt }

// 2. List all conversations for a slug
GET /api/conversations?slug=sarah-johnson-real-estate&limit=50
Response: { conversations: [...], total, hasMore }

// 3. Get analytics for a slug
GET /api/analytics/:slug
Response: { totalConversations, completionRate, avgDuration, topQuestions }

// 4. Sync-profile endpoint (update agent profile)
PATCH /api/provision/sync-profile
Body: { slug, agentProfile: {...} }

// 5. Sync-stories endpoint (update knowledge base)
POST /api/provision/sync-stories
Body: { slug, action: "add|update|delete", stories: [...] }

// 6. Delete/archive chatbot
DELETE /api/provision?slug=sarah-johnson-real-estate
(Already exists!)
```

#### **On next-js-template:**
```typescript
// 1. Receive lead webhook
POST /api/webhooks/chatbot-lead
Body: { source, lead, intent, answers, conversationId }

// 2. Receive conversation completed webhook
POST /api/webhooks/chatbot-completed
Body: { conversationId, resultsUrl, lead }

// 3. Trigger re-sync from template to chatbot
POST /api/chatbot/sync
(Calls chatbot provision API with updated data)
```

---

## Usage Scenarios

### Scenario 1: Agent Updates Their Bio
```
1. Agent logs into next-js-template admin
2. Updates bio, adds new certification
3. Template calls: PATCH chatbot.../api/provision/sync-profile
4. Chatbot updates agentProfile in MongoDB
5. Next conversation uses updated info in results page
```

### Scenario 2: New Lead Completes Chatbot
```
1. User completes chatbot, submits email
2. Chatbot generates timeline/results
3. Chatbot fires webhook: POST template.../api/webhooks/chatbot-lead
4. Template receives lead, adds to CRM
5. Template triggers email sequence
6. Agent sees lead in template dashboard
```

### Scenario 3: Agent Publishes New Success Story
```
1. Agent writes new story in template CMS
2. Template calls: POST chatbot.../api/provision/sync-stories
3. Chatbot generates embedding, adds to Qdrant
4. Next lead gets this story in their personalized advice
```

### Scenario 4: Agent Rebrands
```
1. Agent changes colors in template theme
2. Template calls: PATCH chatbot.../api/provision/sync-theme
3. Chatbot updates colorConfig in MongoDB
4. Next iframe load uses new colors (via CSS variables)
```

---

## Performance & Caching Strategy

### Current Caching
- Colors cached in localStorage (results page)
- Agent profile cached in localStorage
- No cache invalidation strategy

### Recommended Caching
```typescript
// Chatbot side
{
  agentProfile: {
    data: {...},
    cachedAt: timestamp,
    ttl: 3600 // 1 hour
  },
  colorConfig: {
    data: {...},
    cachedAt: timestamp,
    ttl: 86400 // 24 hours
  },
  stories: {
    lastSyncedAt: timestamp,
    version: "v2.1" // Track version for cache busting
  }
}

// Cache invalidation on webhook/sync
POST /api/provision/sync-profile → clears agentProfile cache
POST /api/provision/sync-stories → increments stories.version
```

---

## Deployment Coordination

### Current Deployment
- **next-js-template**: Independent Vercel deployment per agent
- **Chatbot**: Shared instance (chatbot.focusflowsoftware.com)

### Considerations
1. **Version Compatibility**: Template might use newer provision API features
   - Solution: API versioning (e.g., `/api/v2/provision`)

2. **Breaking Changes**: Chatbot API changes might break old templates
   - Solution: Deprecation policy (warn 30 days before removal)

3. **Feature Flags**: New features rolled out gradually
   - Solution: Feature flags in provision request

```typescript
interface ProvisionRequest {
  // ... existing
  features?: {
    enableWebhooks?: boolean;
    enableLiveSync?: boolean;
    enableAdvancedAnalytics?: boolean;
  };
}
```

---

## Cost Implications

### Current Costs
- **Qdrant**: Per collection (per agent)
- **OpenAI**: Embeddings for stories
- **MongoDB**: Per document (configs, conversations)
- **Vercel**: Hosting (both apps)

### Sync Costs (if implemented)
- **Webhooks**: Minimal (just HTTP POST)
- **Real-time sync**: WebSocket/SSE connections (higher)
- **Analytics**: More MongoDB queries
- **Re-embedding**: OpenAI costs if stories change frequently

### Optimization Strategies
1. **Batch updates**: Sync every 5 min instead of instant
2. **Diff-based sync**: Only update changed stories
3. **Webhook queuing**: Use job queue for async processing
4. **CDN caching**: Cache agent profiles at edge

---

## Recommended Immediate Actions

### Priority 1 (This Week)
1. ✅ **Add `homebaseUrl` to provision API** (DONE)
2. 🔲 **Implement lead webhook** (chatbot → template)
   - Add `webhooks.leadCreated` to ProvisionRequest
   - Fire webhook when contact collected
   - Template creates `/api/webhooks/chatbot-lead` endpoint

### Priority 2 (This Month)
3. 🔲 **Add agent profile sync endpoint**
   - `PATCH /api/provision/sync-profile`
   - Allow updating photo, bio, certifications without full re-provision
4. 🔲 **Add conversation API**
   - `GET /api/conversations/:id` for template to fetch details
   - Template can show "Recent Leads" with full context

### Priority 3 (Next Quarter)
5. 🔲 **Implement story sync**
   - Add/update/delete individual stories without full re-provision
6. 🔲 **Build analytics API**
   - Template dashboard shows chatbot metrics
7. 🔲 **Add webhook signature verification**
   - Secure the integration with HMAC

---

## Example: Full Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    next-js-template                         │
│  (https://sarah-johnson-real-estate.vercel.app)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1. Provision on deploy
                            ↓
                POST /api/provision
                {
                  slug: "sarah-johnson-real-estate",
                  agentInfo: {...},
                  stories: [...],
                  colorConfig: {...},
                  homebaseUrl: "https://sarah-johnson-real-estate.vercel.app",
                  webhooks: {
                    leadCreated: "https://sarah-johnson-real-estate.vercel.app/api/webhooks/chatbot-lead"
                  }
                }
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Chatbot App (chatbot.focusflowsoftware.com)   │
│  - Creates MongoDB config                                   │
│  - Creates Qdrant collection                                │
│  - Embeds stories                                           │
│  - Returns chatbot URL                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 2. Embed chatbot
                            ↓
        <iframe src="https://chatbot.../bot/sarah-johnson-real-estate?embed=true" />

        (User interacts with chatbot)
                            │
                            │ 3. Lead completes
                            ↓
                POST webhook: leadCreated
                {
                  lead: { name, email, phone },
                  intent: "buy",
                  answers: {...},
                  conversationId: "conv_123"
                }
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              next-js-template receives webhook              │
│  - Adds lead to database                                    │
│  - Triggers CRM sync (Salesforce/HubSpot)                  │
│  - Sends email sequence                                     │
│  - Shows in agent dashboard                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 4. Agent updates profile
                            ↓
                PATCH /api/provision/sync-profile
                { agentProfile: { photo: "new-headshot.jpg" } }
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Chatbot updates MongoDB                        │
│  - Next lead sees new photo on results page                │
└─────────────────────────────────────────────────────────────┘
```

---

## Conclusion

The provision API is **currently a one-way street** (template → chatbot). For a production-ready system, you need:

1. **Lead webhooks** (chatbot → template) - CRITICAL
2. **Profile sync API** (template → chatbot) - HIGH PRIORITY
3. **Conversation access API** (chatbot → template) - HIGH PRIORITY
4. **Content sync** (bi-directional) - MEDIUM PRIORITY
5. **Analytics API** (chatbot → template) - MEDIUM PRIORITY

The relationship should evolve from "provision once" to "continuous sync" between the two apps.
