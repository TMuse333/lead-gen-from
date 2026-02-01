# Next.js Template Analysis & Integration Guide

This directory contains comprehensive documentation about the next-js-template codebase and how it integrates with the agent-lead-gen chatbot system.

## Quick Start: Which Document to Read?

### For a 5-Minute Overview
- **Read**: `ANALYSIS_SUMMARY.txt`
- **Contains**: Key findings, quick facts, critical files list
- **Best for**: Getting oriented quickly

### For Working Reference While Coding
- **Read**: `NEXT_JS_TEMPLATE_QUICK_REFERENCE.md`
- **Contains**: Routes, APIs, environment vars, data models, code snippets
- **Best for**: Quick lookup while implementing features

### For Deep Understanding
- **Read**: `NEXT_JS_TEMPLATE_ANALYSIS.md`
- **Contains**: Comprehensive architectural analysis with detailed explanations
- **Best for**: Understanding the full picture before making changes

---

## Document Breakdown

### 1. ANALYSIS_SUMMARY.txt (3KB)
Quick facts and overview:
- Project overview
- Core architecture
- Routing structure
- Chatbot integration flow
- Qdrant integration
- Client/homebase configuration
- API integration points
- Critical files to study
- Next steps

**Reading Time**: 5 minutes

---

### 2. NEXT_JS_TEMPLATE_QUICK_REFERENCE.md (8.5KB)
Fast lookup guide:
- File structure diagram
- All route tables
- API endpoints table
- Data model TypeScript
- Integration flows (provision, deployment, lead capture)
- Environment variables
- Qdrant details
- Key store definitions
- Authentication flow
- Deployment flow
- Important files table

**Reading Time**: 10 minutes
**Use Case**: Quick reference while coding

---

### 3. NEXT_JS_TEMPLATE_ANALYSIS.md (16KB, 607 lines)
Comprehensive analysis:
1. Overall architecture
2. Qdrant integration (detailed)
3. Routing & navigation
4. Entry points & landing pages
5. Configuration system
6. Chatbot integration points
7. API routes & integration
8. Existing chatbot references
9. Data flow summary
10. Key takeaways
11. Deployment & hosting
12. Authentication & authorization
13. Testing & development

**Reading Time**: 20-30 minutes
**Use Case**: Deep understanding of system design

---

## Key Questions Answered

### What is next-js-template?
A **SaaS website builder** for realtors with integrated AI chatbot for lead capture and qualification.

### How does it integrate with agent-lead-gen?
1. Template calls `/api/chatbot/provision` during onboarding
2. Sends agent info, stories, and colors
3. Agent-lead-gen creates Qdrant vectors from stories
4. Returns embed script URL
5. Template includes script on deployed site
6. Chatbot uses stories as context for responses

### What does Qdrant do?
Stores vector embeddings of agent stories. When a visitor asks the chatbot a question:
1. Question → OpenAI embedding
2. Embedding → Qdrant search (find similar stories)
3. Top results → GPT-4o-mini synthesizes response
4. Response → Visitor (contextualized by agent's real experiences)

### How are "homebases" configured?
Each realtor site is a separate "client" identified by a unique **slug** (e.g., "sarah-realty"):
- Stored in: `websiteData.chatbot`
- Contains: agentInfo, stories, colorConfig, greeting
- Sent to chatbot via: `POST /api/chatbot/provision`
- Updated via: `POST /api/chatbot/colors` (when colors change)

### What routes exist?
See `NEXT_JS_TEMPLATE_QUICK_REFERENCE.md` for complete route table. Key routes:
- Public: `/`, `/[slug]`, `/blog/[slug]`
- Protected: `/dashboard/*` (requires auth)
- Onboarding: `/onboarding`
- Auth: `/auth/signin`, `/auth/callback`

### How is the chatbot currently integrated?
API routes are **fully implemented**:
- ✓ `POST /api/chatbot/provision` - Create chatbot
- ✓ `GET /api/chatbot/config` - Fetch config
- ✓ `POST /api/chatbot/colors` - Update colors
- ✓ `GET /api/chatbot/status` - Check status

Dashboard UI exists but shows "Coming Soon". Future work needed:
- Implement `/dashboard/chatbot` configuration UI
- Implement `/dashboard/leads` to show captured leads
- Add chatbot setup to onboarding wizard

---

## Important Paths in Codebase

### Critical Files to Understand
```
/src/types/website.ts
  → WebsiteMaster type (complete site definition)
  → Pages keyed by slug
  → Chatbot configuration

/src/components/pageComponents/PageRenderer.tsx
  → Renders pages by slug
  → Loads from store, JSON, or code defaults

/src/stores/websiteStore.ts
  → Zustand state management
  → Website data in memory

/src/app/api/chatbot/provision/route.ts
  → Receives: agentInfo, stories, colors, greeting
  → Proxies to: CHATBOT_API_URL/api/provision

/src/app/api/knowledge/search/route.ts
  → Qdrant integration
  → Query → OpenAI embedding → Qdrant search → GPT synthesis

/src/middleware.ts
  → Auth protection
  → Route guards

/CHATBOT_STRATEGY.md
  → Product philosophy
  → Why chatbot is the value
```

### Data Files
```
/src/data/websiteData.json
  → Local fallback for website content
  → Lives in GitHub repo
  → Loaded at runtime

/src/types/website.ts
  → Type definitions for everything

/src/types/forms.ts
  → Onboarding form structure

/src/types/usage.ts
  → LLM usage tracking
```

---

## Core Concepts

### Multi-Tenant Architecture
Each realtor = separate "client" with:
- Unique slug identifier
- Own website pages
- Own chatbot configuration
- Own deployment on Vercel
- Own Qdrant story vectors

### Slug-Based System
Everything uses slugs:
- Pages: `pages.index`, `pages.about`, etc.
- Chatbot: `chatbot.slug` (e.g., "sarah-realty")
- Leads: tracked by slug
- Config: keyed by slug

### Data Flow Priority
When rendering a page:
1. Check Zustand store (in-memory)
2. Check local websiteData.json
3. Fall back to code-defined defaults

### WebsiteMaster Type
The complete definition of a website:
```typescript
{
  templateName: string
  pages: Record<string, WebsitePage>
  colorTheme: { primary, text, background }
  chatbot?: { enabled, slug, stories, greeting, embedUrl }
  deployment?: { vercelProjectId, customDomain, githubRepo }
  // ... plus 20+ other fields
}
```

---

## Integration Checklist for Agent-Lead-Gen

- [ ] Understand WebsiteMaster type (see ANALYSIS.md section 5)
- [ ] Understand Qdrant integration (see ANALYSIS.md section 2)
- [ ] Review provision API flow (see QUICK_REFERENCE.md)
- [ ] Understand story structure (title, situation, action, outcome, flow)
- [ ] Understand client identification (slug-based)
- [ ] Implement vector storage for stories
- [ ] Implement story search during conversation
- [ ] Implement color configuration
- [ ] Implement lead API (future)

---

## Environment Variables

Key variables needed:
```env
# Chatbot API
CHATBOT_API_URL=https://chatbot.focusflowsoftware.com
PROVISION_API_KEY=xxx

# Qdrant (for knowledge search)
QDRANT_URL=http://localhost:6333
OPENAI_KEY=sk-proj-xxxxx
NEURAL_NETWORK_URL=xxx

# Deployment
REPO_OWNER=user
REPO_NAME=template
GITHUB_TOKEN=ghp_xxxxx
VERCEL_API_TOKEN=xxx

# Database
MONGODB_URI=mongodb+srv://...
```

See `.env.example` in template for complete list.

---

## Technology Stack

### Frontend
- Next.js 16.1.0
- React 19.1.0
- Framer Motion (animations)
- Tailwind CSS (styling)
- Zustand (state management)

### Backend
- Next.js API routes
- MongoDB + Mongoose
- NextAuth.js (authentication)

### AI/ML
- OpenAI (embeddings, GPT-4o-mini)
- Anthropic Claude (content generation)
- Qdrant (vector database)

### Hosting & Deployment
- Vercel (per-site deployments)
- Vercel Blob (image storage)
- GitHub (version control)

### Integrations
- Stripe (billing, via Easy-Money)
- Octokit (GitHub API)
- Easy-Money (SaaS control plane)

---

## Next Steps

### For Understanding the System
1. Read ANALYSIS_SUMMARY.txt (5 min)
2. Read NEXT_JS_TEMPLATE_QUICK_REFERENCE.md (10 min)
3. Read NEXT_JS_TEMPLATE_ANALYSIS.md (30 min)
4. Clone next-js-template repo
5. Study the 7 critical files listed above
6. Trace through the provision → qdrant → response flow

### For Development
1. Understand how stories are sent via provision API
2. Implement Qdrant vector storage for stories
3. Implement story search in chatbot response generation
4. Implement color matching (chatbot theme = site theme)
5. Implement lead APIs for dashboard
6. Test end-to-end: provision → deploy → chat → lead capture

---

## Key Insight

**This is not a website builder business. This is a lead qualification business.**

- Website = Delivery mechanism (table stakes)
- Chatbot = Salesperson working 24/7 (the real product)
- Stories = Sales collateral (context for intelligence)
- Qualified leads = What customers actually pay for

Realtors don't pay for nice websites. They pay for leads with:
- Intent signals (buy/sell/browse)
- Budget information
- Timeline
- Property preferences
- Contact information

All captured before the realtor ever picks up the phone.

---

## Document Versioning

Created: 2026-01-31
Analyzed: next-js-template (experiment/development branch)
Context: Integration with agent-lead-gen chatbot system

For questions or updates, refer to:
- Repository: ~/Desktop/javascript_projects/next-js-template
- Current analysis branch: experiment
- Documentation branch: development

---

## Quick Links to Key Files in Codebase

Absolute paths:
- `/Users/thomasmusial/Desktop/javascript_projects/next-js-template/frontend/src/types/website.ts`
- `/Users/thomasmusial/Desktop/javascript_projects/next-js-template/frontend/src/app/api/chatbot/provision/route.ts`
- `/Users/thomasmusial/Desktop/javascript_projects/next-js-template/frontend/src/app/api/knowledge/search/route.ts`
- `/Users/thomasmusial/Desktop/javascript_projects/next-js-template/CHATBOT_STRATEGY.md`

All stored in: `/Users/thomasmusial/Desktop/javascript_projects/next-js-template`

---

## How to Use These Documents

### Scenario 1: "I need to understand what next-js-template does"
→ Read ANALYSIS_SUMMARY.txt (5 min)

### Scenario 2: "I'm implementing chatbot provisioning"
→ Read NEXT_JS_TEMPLATE_QUICK_REFERENCE.md sections on APIs & chatbot integration (10 min)

### Scenario 3: "I need to understand the full architecture before redesigning something"
→ Read NEXT_JS_TEMPLATE_ANALYSIS.md sections 1-9 (30 min)

### Scenario 4: "I need specific details about how Qdrant integrates"
→ Read NEXT_JS_TEMPLATE_ANALYSIS.md section 2 (5 min)

### Scenario 5: "I need to know what APIs are available"
→ Check NEXT_JS_TEMPLATE_QUICK_REFERENCE.md API endpoints section (2 min)

---

Created for: Agent-Lead-Gen development team  
Purpose: Understanding the homebase website builder system  
Scope: Architecture, integration points, and key concepts  
Depth: Comprehensive with quick references
