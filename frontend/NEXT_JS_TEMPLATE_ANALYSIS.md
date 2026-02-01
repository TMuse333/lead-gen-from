# Next.js Template (experiment/development branch) - Comprehensive Architecture Analysis

## Executive Summary

The next-js-template is a **website builder platform** that serves as the "homebase" for realtor websites. It's the control plane that manages:
- Website creation, editing, and deployment
- Client/user onboarding
- Site publishing to Vercel
- Integration with agent-lead-gen chatbot system
- Lead capture and analytics

The chatbot (agent-lead-gen) is embedded on deployed websites to capture and qualify leads. The template handles configuration, provisioning, and integration.

---

## 1. Overall Architecture

### Project Type
- **Next.js 16.1.0** full-stack application
- **Real-time editor** with AI-powered assistance
- **Multi-tenant** deployment system
- **SaaS platform** for realtor websites

### Core Purpose
Website builder + Chatbot integration platform. The website is the delivery mechanism; the chatbot is the product.

### Technology Stack
- **Frontend**: React 19.1.0, Framer Motion, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB, Mongoose
- **Storage**: Vercel Blob, GitHub (version control)
- **AI/ML**: OpenAI, Anthropic Claude, Qdrant (vector DB)
- **Hosting**: Vercel deployment
- **Auth**: NextAuth.js 4.24.5

### Key Dependencies
```json
{
  "@qdrant/js-client-rest": "^1.16.2",      // Vector search for knowledge base
  "@anthropic-ai/sdk": "^0.71.2",           // Claude API
  "@octokit/rest": "^22.0.1",               // GitHub API
  "@vercel/blob": "^2.0.0",                 // Blob storage
  "openai": "^6.15.0",                      // OpenAI embeddings & GPT
  "mongoose": "^9.0.2",                     // MongoDB ORM
  "zustand": "^5.0.9"                       // State management
}
```

---

## 2. Qdrant Integration - Lead Generation Knowledge Base

### What Qdrant Does
Qdrant is used to create a **semantic search knowledge base** that powers the chatbot's intelligent responses.

### Architecture
```
User Query
    ↓
OpenAI Embeddings (text-embedding-ada-002)
    ↓
Qdrant Vector Search
    ↓
Top-K Results (similar knowledge points)
    ↓
GPT-4o-mini (synthesize results into conversational response)
    ↓
Agent-Lead-Gen Chatbot
```

### Key Files
1. **Knowledge Search API**: `/src/app/api/knowledge/search/route.ts`
   - Proxies requests to neural-network API
   - Normalizes Qdrant responses
   - Uses OpenAI to generate conversational answers
   - Returns `{ results, response, sources }`

2. **Qdrant Client**: `/src/lib/qdrant/knowledge-client.ts`
   - Initializes QdrantClient
   - Generates embeddings via OpenAI
   - Searches knowledge collections
   - Transforms raw results

### Collections
- Primary: `general-website-knowledge`
- Used for: Website building advice, components, best practices
- Indexed by: Vector embeddings from OpenAI

### Environment Variables
```env
QDRANT_URL=http://localhost:6333    # Local dev
QDRANT_API_KEY=optional             # Production
OPENAI_KEY=sk-proj-xxxxx           # For embeddings
NEURAL_NETWORK_URL=xxxxx           # Proxied API endpoint
```

### Usage Flow
1. User asks question in UI
2. Query sent to `/api/knowledge/search`
3. Qdrant finds similar knowledge points
4. OpenAI synthesizes response
5. Response returned with sources for transparency

---

## 3. Routing & Navigation Structure

### Main Routes
```
/ (index)
├── /auth
│   ├── /signin
│   └── /callback
├── /dashboard (protected)
│   ├── / (overview)
│   ├── /chatbot (AI assistant configuration)
│   ├── /leads (lead management - coming soon)
│   ├── /blog (blog management)
│   ├── /seo (SEO tools)
│   ├── /settings (site settings)
│   ├── /billing (payment/subscription)
│   ├── /intel (analytics - coming soon)
│   └── /analytics (stats)
├── /onboarding (first-time setup)
│   ├── /welcome
│   ├── /assistant
│   └── /complete
├── /blog (public blog)
│   └── /[slug]
├── /[slug] (dynamic page rendering)
├── /info (informational pages)
│   ├── /editor
│   ├── /dashboard
│   └── /claude-code
├── /features (marketing page)
└── /usage (token usage info)
```

### Page Rendering System
- **Dynamic Pages**: `/src/components/pageComponents/PageRenderer.tsx`
- Renders pages by slug from `websiteData.pages` object
- Priority: Store data → Local JSON → Code-defined fallback
- Supports unlimited custom pages

### Navigation Implementation
- **PageSwitcher**: Fixed component for page navigation
- **Navbar**: Dynamic, customizable per site
- **Sidebar**: Dashboard navigation

---

## 4. Entry Points & Landing Pages

### Public Entry Points
1. **Home Page** (`/`)
   - `src/app/page.tsx`
   - Renders PageRenderer with `slug="index"`
   - Shows primary website content

2. **Dynamic Pages** (`/[slug]`)
   - `src/app/[slug]/page.tsx`
   - Any custom page created in editor
   - Fully editable in real-time

3. **Auth Pages**
   - `/auth/signin` - NextAuth login
   - `/auth/callback` - OAuth callback

### Admin Entry Points
1. **Dashboard** (`/dashboard`)
   - Main control panel for users
   - Site overview, deployment history
   - Chatbot configuration (coming soon)
   - Lead management (coming soon)

2. **Onboarding** (`/onboarding`)
   - First-time user flow
   - Choose mascot/colors
   - Set up business info
   - Upload images
   - Review and publish

---

## 5. Configuration System - How "Homebases" Work

### Multi-Tenant Architecture
Each "realtor site" is a separate **client** configured through the chatbot provision API.

### Configuration Flow
```
Onboarding Complete
    ↓
Trigger Chatbot Provision
    ↓
POST /api/chatbot/provision { slug, agentInfo, stories, colorConfig }
    ↓
Agent-Lead-Gen Receives Config
    ↓
Creates Vector Embeddings for Stories
    ↓
Stores in Qdrant Collection
    ↓
Returns Embed Script URL
    ↓
Added to Deployed Website
```

### Key Configuration Files

1. **WebsiteMaster Type** (`/src/types/website.ts`)
   ```typescript
   {
     templateName: string;
     repoName: string;
     pages: Record<string, WebsitePage>;
     colorTheme: { primary, text, background };
     chatbot?: {
       enabled: boolean;
       slug: string;              // Unique identifier
       embedUrl: string;
       greeting?: string;
       stories?: Array<Story>;
     };
     deployment: {
       vercelProjectId: string;
       customDomain?: string;
       githubRepo: string;
     };
   }
   ```

2. **Website Data** (`/src/data/websiteData.json`)
   - Local fallback for page content
   - Lives in GitHub repo
   - Loaded at build time or runtime

3. **Form Answers** (`/src/types/forms.ts`)
   - Stores user onboarding responses
   - Business name, contact info, etc.

### Client Identification
- **Slug**: Unique identifier for chatbot (e.g., "sarah-realty")
- **Repo Owner/Name**: GitHub location (e.g., "user/realtor-website")
- **Project ID**: For tracking (repoOwner/repoName)

### Environment Variables Per Deployment
```env
REPO_OWNER=user
REPO_NAME=realtor-website
CHATBOT_API_URL=https://chatbot.focusflowsoftware.com
PROVISION_API_KEY=dev-provision-key
EASY_MONEY_API_URL=https://focusflowsoftware.com
CLIENT_API_KEY=api-key-for-billing
```

---

## 6. Chatbot Integration Points

### How the Chatbot Integrates

#### Provision API (Template → Agent-Lead-Gen)
```typescript
// POST /api/chatbot/provision
{
  slug: "sarah-realty",
  agentInfo: {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-1234",
    serviceArea: "San Francisco Bay Area"
  },
  stories?: [
    {
      title: "First-Time Buyer Success",
      situation: "Young couple nervous about purchasing",
      action: "Educated on market, down payments, timeline",
      outcome: "Closed $450k home in 60 days",
      flow: "buy",
      kind: "story"
    }
  ],
  colorConfig?: {
    primary: "#f43f5e",
    background: "#ffffff",
    text: "#000000"
  },
  greeting?: "Hi! I'm Sarah, your AI assistant. How can I help?"
}
```

#### Config API (Embedded Chatbot ← Template)
```typescript
// GET /api/chatbot/config?slug=sarah-realty
// Proxies to: CHATBOT_API_URL/api/client/{slug}
// Returns client config for embedded widget
{
  config: {
    colorConfig: { primary, text, background },
    greeting: string,
    agentInfo: { name, email, phone },
    stories: Array<Story>
  }
}
```

#### Colors API (Dashboard ← Template)
```typescript
// POST /api/chatbot/colors
// Updates chatbot colors when site theme changes
{
  slug: "sarah-realty",
  colorConfig: { primary, text, background }
}
```

#### Status API (Monitoring)
```typescript
// GET /api/chatbot/status?slug=sarah-realty
// Checks if chatbot is deployed and working
```

### Embed Script Integration
When site is deployed, the deployed page includes:
```html
<script
  src="https://chatbot.focusflowsoftware.com/embed.js"
  data-client-id="sarah-realty"
  data-position="bottom-right"
></script>
```

### Dashboard Integration (Future)
- `/dashboard/chatbot` - Configure chatbot settings
- `/dashboard/leads` - See captured leads
- Show lead qualification data:
  - Intent (buy/sell/browse)
  - Budget range
  - Timeline
  - Contact info

---

## 7. API Routes & Integration Points

### External APIs Called
```
Template (this repo)
  ↓
  ├─→ GitHub API (/api/versions/*)
  ├─→ Vercel API (/api/vercel/*)
  ├─→ Agent-Lead-Gen (/api/chatbot/*)
  ├─→ Qdrant (/api/knowledge/search)
  ├─→ OpenAI (/api/assistant/*)
  ├─→ Easy-Money (/api/billing/*)
  └─→ MongoDB (internal)
```

### Key API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chatbot/provision` | POST | Create/update chatbot |
| `/api/chatbot/config` | GET | Fetch chatbot config |
| `/api/chatbot/colors` | POST | Update chatbot colors |
| `/api/chatbot/status` | GET | Check chatbot status |
| `/api/knowledge/search` | POST | Qdrant semantic search |
| `/api/assistant/*` | POST | AI-powered edits |
| `/api/production/deploy` | POST | Deploy to production |
| `/api/versions/create-github` | POST | Save version to GitHub |
| `/api/seo/generate` | POST | Generate SEO content |
| `/api/images/upload` | POST | Upload images to Blob |

---

## 8. Existing Chatbot/Bot References

### Current Implementation Status
- Chatbot API routes exist: **✓**
- Provision endpoint ready: **✓**
- Config endpoint ready: **✓**
- Dashboard UI: **Coming soon**
- Lead management: **Coming soon**

### Files Mentioning Chatbot
1. **API Routes** (fully implemented)
   - `/src/app/api/chatbot/provision/route.ts` - Create/update/check chatbot
   - `/src/app/api/chatbot/config/route.ts` - Fetch config
   - `/src/app/api/chatbot/colors/route.ts` - Update colors
   - `/src/app/api/chatbot/status/route.ts` - Check status

2. **Dashboard Page**
   - `/src/app/dashboard/chatbot/page.tsx` - UI (disabled, shows "Coming soon")

3. **Types**
   - `websiteData.chatbot` field in WebsiteMaster type
   - Includes: slug, enabled, embedUrl, greeting, stories

4. **Strategy Docs**
   - `/CHATBOT_STRATEGY.md` - Product strategy & integration plan
   - References: agent-lead-gen components and architecture

### Stories/Knowledge Base Structure
```typescript
{
  id?: string;
  title: string;
  situation?: string;     // Context (what problem existed)
  action?: string;        // What you did
  outcome?: string;       // Result
  flow: "buy" | "sell" | "browse";  // Lead type
  kind: "story" | "faq" | "tip";    // Content type
}
```

---

## 9. Data Flow Summary

### Website Creation Flow
```
User Onboarding
  ↓
Form answers stored in websiteData.formData
  ↓
Pages created (initially from template)
  ↓
Components edited in real-time
  ↓
Changes saved to GitHub branch
```

### Chatbot Provisioning Flow
```
Onboarding Complete
  ↓
POST /api/chatbot/provision with agentInfo + stories
  ↓
Proxied to CHATBOT_API_URL/api/provision
  ↓
Agent-Lead-Gen processes:
  - Creates Qdrant vectors for stories
  - Stores color config
  - Generates embed script
  ↓
Template stores chatbot config in websiteData
  ↓
Deployment includes embed script
```

### Lead Capture Flow
```
Visitor arrives at deployed site
  ↓
Embed script initializes chatbot widget
  ↓
Chatbot queries Qdrant with visitor questions
  ↓
LLM generates contextual responses
  ↓
Qualification form collects lead data
  ↓
Lead sent to realtor via API
  ↓
Appears in dashboard /leads
```

---

## 10. Key Takeaways for Chatbot Integration

### For Agent-Lead-Gen Developers

1. **Chatbot receives configuration via**:
   - POST `/api/chatbot/provision` (initial setup)
   - POST `/api/chatbot/colors` (theme updates)
   - Embedded in deployed website as script tag

2. **Stories/Knowledge Base**:
   - Realtors provide via setup wizard or dashboard
   - Stored in websiteData.chatbot.stories
   - Should be vectorized in Qdrant during provision
   - Used to contextualize chatbot responses

3. **Client Identification**:
   - Unique slug per site (e.g., "sarah-realty")
   - Used to fetch config: `/api/client/{slug}`
   - Used to track leads back to correct realtor

4. **Color Theming**:
   - Template manages color palette
   - Chatbot widget should match site colors
   - Colors sent via provision + color API

5. **Lead Capture Integration**:
   - Template dashboard ready for /leads page
   - Need to expose:
     - GET `/api/leads` - list leads
     - GET `/api/leads/{id}` - lead details
     - Webhook for new leads from chatbot

### For Template Enhancement

1. **Dashboard Chatbot Page**:
   - Replace "Coming soon" with config UI
   - Allow: name, greeting, tone, knowledge base upload

2. **Leads Page**:
   - Show leads captured by chatbot
   - Display qualification data (budget, timeline, etc.)
   - Link to contact info
   - Track conversion

3. **Onboarding Integration**:
   - Add "Setup Chatbot" step
   - Collect agent info (name, email, phone)
   - Record stories/case studies
   - Test chatbot before going live

4. **Analytics**:
   - Track conversations count
   - Measure response quality
   - Show lead conversion rate

---

## 11. Deployment & Hosting Model

### How Sites are Deployed
1. Developer creates website in editor
2. Site stored in GitHub (repoOwner/repoName)
3. Deployed to Vercel with custom domain option
4. Each deployment is independent Next.js instance
5. Can use different databases/configs per site

### Vercel Configuration
```env
REPO_OWNER=user              # GitHub username
REPO_NAME=website-name       # Repository name
CURRENT_BRANCH=development   # Working branch
PRODUCTION_BRANCH=main       # Live branch
VERCEL_API_TOKEN=xxxxx       # Vercel authentication
CHATBOT_API_URL=https://chatbot.focusflowsoftware.com
PROVISION_API_KEY=xxxxx      # For chatbot provision
```

### Blob Storage
- Images uploaded during editing
- Stored in Vercel Blob
- Referenced in components
- Deleted when site is removed

---

## 12. Authentication & Authorization

### NextAuth.js Integration
- Configured via `/src/app/api/auth/[...nextauth]/route.ts`
- Protected routes: `/dashboard`, `/admin`
- Unprotected: Public pages, auth flows

### Middleware (`/src/middleware.ts`)
```typescript
// Protects /dashboard, /admin
// Redirects to /auth/signin
// Stores session in JWT
```

### User Identification
- `NEXT_PUBLIC_USER_ID` - Current user ID
- `OWNER_USER_ID` - Business owner ID
- Used for: filtering data, tracking usage

---

## 13. Testing & Development

### Local Development
```bash
npm run dev
# http://localhost:3000
```

### Debugging Tools
1. **Dev Reset Panel** - Clear localStorage (env: NEXT_PUBLIC_DEV_RESET=true)
2. **Dev Test Panel** - Testing utilities
3. **Console logging** - Verbose API logging

### Key Files for Understanding Flow
1. `/src/stores/websiteStore.ts` - State management
2. `/src/components/pageComponents/PageRenderer.tsx` - Page rendering
3. `/src/app/api/chatbot/provision/route.ts` - Chatbot integration
4. `/src/app/api/knowledge/search/route.ts` - Qdrant integration
5. `/src/app/onboarding/page.tsx` - Onboarding flow

---

## Summary

The **next-js-template** is a sophisticated SaaS platform for creating realtor websites with integrated AI chatbots. The architecture is:

1. **Multi-tenant**: Each website is independent
2. **Modular**: Clear separation between website builder, chatbot, and hosting
3. **Intelligent**: Uses Qdrant + OpenAI for semantic search
4. **Scalable**: Deployed to Vercel per-site
5. **Integrated**: Tightly coupled with agent-lead-gen for lead capture

The chatbot is not just a feature—it's the core value proposition. The website is the distribution mechanism; qualified leads are the product.
