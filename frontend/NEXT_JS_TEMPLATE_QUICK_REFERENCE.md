# Quick Reference: Next.js Template Architecture

## What is it?
A **SaaS website builder** for realtors. Key insight: The website is table stakes; the chatbot is the product.

## Filestructure
```
frontend/
├── src/
│   ├── app/                    # Next.js pages & routes
│   │   ├── (index)             # Public home
│   │   ├── /[slug]             # Dynamic pages
│   │   ├── /dashboard          # User control panel
│   │   ├── /onboarding         # Setup wizard
│   │   ├── /auth               # Authentication
│   │   └── /api/               # API routes
│   │       ├── chatbot/        # Chatbot integration
│   │       ├── knowledge/      # Qdrant search
│   │       ├── assistant/      # AI editing
│   │       └── production/     # Deployment
│   ├── components/             # React components
│   ├── stores/                 # Zustand state management
│   ├── types/                  # TypeScript definitions
│   ├── lib/                    # Utilities
│   │   ├── qdrant/            # Knowledge search
│   │   ├── easy-money-client  # Billing integration
│   │   └── deploy/            # Deployment logic
│   └── data/
│       └── websiteData.json    # Site content (fallback)
├── .env.example                # Environment template
└── package.json                # Dependencies
```

## Key Routes

### Public
- `/` - Homepage (PageRenderer with slug="index")
- `/[slug]` - Any custom page
- `/blog/[slug]` - Blog post

### Protected (Auth Required)
- `/dashboard` - Main control panel
  - `/dashboard/chatbot` - Configure bot (coming soon)
  - `/dashboard/leads` - Captured leads (coming soon)
  - `/dashboard/seo` - SEO tools
  - `/dashboard/settings` - Site config

### Onboarding
- `/onboarding` - Setup wizard

### Auth
- `/auth/signin` - Login
- `/auth/callback` - OAuth callback

## Key API Endpoints

### Chatbot Integration
```
POST   /api/chatbot/provision    # Create/update chatbot
GET    /api/chatbot/config?slug  # Get config for widget
POST   /api/chatbot/colors       # Update colors
GET    /api/chatbot/status       # Check deployment
```

### Knowledge Base (Qdrant)
```
POST   /api/knowledge/search     # Semantic search → Qdrant → OpenAI → Response
```

### Deployment
```
POST   /api/production/deploy    # Deploy to Vercel
POST   /api/vercel/deploy-*      # Vercel operations
```

## Data Model: WebsiteMaster

```typescript
{
  templateName: "template-name"
  pages: {
    "index": { pageName, slug, components },
    "about": { ... }
  }
  colorTheme: {
    primary: "#f43f5e",
    text: "#ffffff",
    background: "#18181b"
  }
  chatbot: {
    enabled: true,
    slug: "sarah-realty",
    embedUrl: "...",
    greeting: "Hi! I'm Sarah",
    stories: [
      {
        title: "...",
        situation: "...",
        action: "...",
        outcome: "...",
        flow: "buy" | "sell" | "browse",
        kind: "story" | "tip"
      }
    ]
  }
  deployment: {
    vercelProjectId: "...",
    customDomain: "sarah.example.com",
    githubRepo: "TMuse333/realtor-site"
  }
}
```

## How Chatbot Integration Works

### 1. Provision (Setup)
```
User completes onboarding
  ↓
POST /api/chatbot/provision {
  slug: "sarah-realty",
  agentInfo: { name, email, phone, serviceArea },
  stories: [...],
  colorConfig: { primary, text, background },
  greeting: "..."
}
  ↓
Proxied to: CHATBOT_API_URL/api/provision
  ↓
Agent-Lead-Gen:
  • Creates Qdrant vectors for stories
  • Stores config
  • Generates embed script URL
  ↓
Template saves chatbot config
```

### 2. Deployment
```
Site deployed to Vercel
  ↓
HTML includes:
  <script src="https://chatbot.focusflowsoftware.com/embed.js"
          data-client-id="sarah-realty"></script>
  ↓
Script fetches config from:
  GET CHATBOT_API_URL/api/client/sarah-realty
    ↓ (template proxies to)
  GET /api/chatbot/config?slug=sarah-realty
```

### 3. Lead Capture
```
Visitor on site
  ↓
Chatbot widget loads
  ↓
Visitor asks question
  ↓
Chatbot queries Qdrant for relevant stories
  ↓
LLM generates response (contextualized by stories)
  ↓
If lead qualifies:
  • Collection form
  • Send to realtor
  • Appear in dashboard
```

## Environment Variables

```env
# Repository (set by parent/easy-money)
REPO_OWNER=user
REPO_NAME=website-repo
CURRENT_BRANCH=development
PRODUCTION_BRANCH=main

# APIs
GITHUB_TOKEN=ghp_xxxxx
OPENAI_KEY=sk-proj-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
CHATBOT_API_URL=https://chatbot.focusflowsoftware.com
PROVISION_API_KEY=xxx
NEURAL_NETWORK_URL=xxx

# Services
MONGODB_URI=mongodb+srv://...
VERCEL_API_TOKEN=xxx
BLOB_READ_WRITE_TOKEN=xxx

# Authentication
NEXTAUTH_SECRET=xxx
AUTH_SECRET=xxx

# Easy-Money (billing)
EASY_MONEY_API_URL=https://focusflowsoftware.com
CLIENT_API_KEY=xxx

# Development
NEXT_PUBLIC_DEV_RESET=false
NEXT_PUBLIC_USER_ID=user-id
```

## Qdrant Integration Details

**What**: Vector database for semantic search
**Where**: `/api/knowledge/search` endpoint
**How**: 
1. Query → OpenAI embedding
2. Embedding → Qdrant search
3. Results → GPT-4o-mini synthesis
4. Response → User

**Collections**: 
- `general-website-knowledge` (main)
- Custom per-client (future)

**For Chatbot**:
- Agent stories → Vectors
- Visitor question → Searched against stories
- Top results → Context for LLM response

## Pages Data Structure

```typescript
// pages in websiteData is an object keyed by slug:
pages: {
  "index": {
    pageName: "Home",
    slug: "index",
    components: [
      { id, type, props, ... }
    ]
  },
  "about": {
    pageName: "About",
    slug: "about",
    components: [...]
  }
}

// Rendered by: PageRenderer.tsx
// Renders: <Component key={slug} {...component.props} />
// Per-page theme support (future)
```

## State Management (Zustand)

### Main Stores
- `websiteStore` - Website data, pages, colors
- `onboardingStore` - Setup wizard progress
- `deploymentHistoryStore` - Deploy history
- `helperBotStore` - AI assistant state
- `editHistoryStore` - Undo/redo

### Example: websiteStore
```typescript
useWebsiteStore()
  .websiteData        // Full website object
  .setWebsiteData()   // Update entire state
  .setPageData()      // Update single page
  .updateColorTheme() // Update colors
```

## Authentication Flow

```
User visits /dashboard
  ↓
Middleware checks token
  ↓
No token? → Redirect /auth/signin
  ↓
User clicks OAuth button
  ↓
NextAuth handles OAuth flow
  ↓
Token stored (JWT in session)
  ↓
Redirect /dashboard
  ↓
Dashboard loads website data
```

## Deployment Flow

```
User clicks Deploy
  ↓
Files collected (components, pages, etc.)
  ↓
websiteData.json created
  ↓
Pushed to GitHub repo (development branch)
  ↓
Vercel notified (webhook)
  ↓
Vercel builds & deploys
  ↓
Status updated in dashboard
```

## Important Files for Understanding

| File | Purpose |
|------|---------|
| `/src/types/website.ts` | WebsiteMaster type definition |
| `/src/components/pageComponents/PageRenderer.tsx` | Renders pages by slug |
| `/src/stores/websiteStore.ts` | State management |
| `/src/app/api/chatbot/provision/route.ts` | Chatbot setup |
| `/src/app/api/knowledge/search/route.ts` | Qdrant integration |
| `/src/middleware.ts` | Auth protection |
| `/CHATBOT_STRATEGY.md` | Product strategy |

## Development

```bash
# Install
npm install

# Dev
npm run dev  # http://localhost:3000

# Build
npm run build

# Lint
npm run lint
```

## Things to Know

1. **Multi-tenant**: Each realtor gets own site + chatbot config
2. **Slug-based**: Everything keyed by slug (pages, chatbot, leads)
3. **Real-time editor**: Live preview while editing
4. **AI-powered**: Claude/OpenAI used for content generation
5. **Self-hosted on Vercel**: Each site is separate deployment
6. **Stories matter**: Agent case studies → Qdrant vectors → Chat context

## Integration Points with Agent-Lead-Gen

1. **Configuration**: `/api/chatbot/provision`
   - Agent info, stories, colors
   - Creates client in chatbot system

2. **Theme Sync**: `/api/chatbot/colors`
   - When template colors change
   - Chatbot widget updates

3. **Config Fetch**: `/api/chatbot/config`
   - Widget calls this to get settings
   - Returns agentInfo, stories, colors

4. **Leads**: (Future)
   - Chatbot sends leads to template
   - Template shows in `/dashboard/leads`

---

## Key Insight

**Website = Storefront**
**Chatbot = Salesperson**
**Qualification = Value**

The realtor doesn't pay for a website. They pay for qualified leads on their doorstep before they ever dial the phone.
