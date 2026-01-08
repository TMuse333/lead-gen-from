# API Folder Reorganization Proposal

## Current Structure Issues
- Routes are scattered across the root `/api` directory
- No clear grouping by domain/feature
- Hard to find related endpoints
- Mixing of admin, user, public, and utility routes

## Proposed New Structure

```
api/
├── auth/
│   └── [...nextauth]/          # NextAuth authentication
│       └── route.ts
│
├── admin/                       # Admin-only routes (owner/developer)
│   ├── analytics/
│   │   └── route.ts            # System-wide analytics
│   ├── client-configs/
│   │   ├── route.ts            # List all client configs
│   │   └── [id]/
│   │       └── route.ts        # Get/delete specific config
│   └── qdrant-items/
│       └── route.ts            # View Qdrant collections
│
├── user/                       # Authenticated user routes
│   ├── config/
│   │   └── route.ts            # Get user's config
│   ├── onboarding-status/
│   │   └── route.ts            # Check onboarding completion
│   ├── color-config/
│   │   └── route.ts            # Update color theme
│   └── analytics/
│       └── route.ts            # User-specific analytics
│
├── onboarding/                 # Onboarding flow routes
│   ├── complete/
│   │   └── route.ts            # Complete onboarding & save config
│   ├── generate-flow/
│   │   └── route.ts            # LLM: Generate conversation flow
│   └── generate-advice-questions/
│       └── route.ts            # LLM: Generate knowledge base questions
│
├── chat/                       # Chat/conversation utilities
│   ├── extract/
│   │   └── route.ts            # Extract data from chat
│   ├── smart/
│   │   └── route.ts            # Smart chat responses
│   └── instant-reaction/
│       └── route.ts            # Instant reaction generation
│
├── conversations/               # Conversation tracking
│   ├── route.ts                # List/create conversations
│   └── [id]/
│       └── route.ts             # Get/update conversation
│
├── generations/                 # Generation tracking
│   ├── route.ts                 # List/create generations
│   └── [id]/
│       └── route.ts             # Get specific generation
│
├── agent-advice/                # Knowledge base management
│   ├── add/
│   │   └── route.ts             # Add advice to Qdrant
│   ├── get/
│   │   └── route.ts             # Get advice from Qdrant
│   └── generate-voice-script/
│       └── route.ts             # LLM: Generate voice script
│
├── client/                      # Public client routes
│   └── [clientId]/
│       └── route.ts             # Get client config (public)
│
├── generation/                  # LLM generation routes
│   └── test-component/
│       └── route.ts             # Main generation endpoint
│
└── feedback/                    # Feedback & testing
    ├── submit/
    │   └── route.ts             # Submit feedback
    └── test-rules/
        └── route.ts              # Test rule matching
```

## Migration Plan

### Phase 1: Create New Structure
1. Create new folder structure
2. Move files to new locations
3. Update imports in moved files

### Phase 2: Update Route References
1. Update frontend API calls
2. Update any internal API calls
3. Test all endpoints

### Phase 3: Cleanup
1. Remove old files
2. Update documentation
3. Verify all routes work

## Benefits

1. **Clear Organization**: Routes grouped by domain/feature
2. **Easy Navigation**: Find related endpoints quickly
3. **Scalability**: Easy to add new routes in appropriate folders
4. **Maintainability**: Clear separation of concerns
5. **Better Developer Experience**: Intuitive structure

## Route Mapping

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `/api/analytics` | `/api/user/analytics` | User-specific analytics |
| `/api/admin/analytics` | `/api/admin/analytics` | No change |
| `/api/user/config` | `/api/user/config` | No change |
| `/api/user/onboarding-status` | `/api/user/onboarding-status` | No change |
| `/api/user/update-color-config` | `/api/user/color-config` | Simplified name |
| `/api/onboarding/complete` | `/api/onboarding/complete` | No change |
| `/api/generate-flow` | `/api/onboarding/generate-flow` | Moved to onboarding |
| `/api/generate-advice-questions` | `/api/onboarding/generate-advice-questions` | Moved to onboarding |
| `/api/add-agent-advice` | `/api/agent-advice/add` | Grouped with advice |
| `/api/get-agent-advice` | `/api/agent-advice/get` | Grouped with advice |
| `/api/generate-voice-script` | `/api/agent-advice/generate-voice-script` | Grouped with advice |
| `/api/chat-extract` | `/api/chat/extract` | Grouped with chat |
| `/api/chat-smart` | `/api/chat/smart` | Grouped with chat |
| `/api/get-instant-reaction` | `/api/chat/instant-reaction` | Grouped with chat |
| `/api/conversations` | `/api/conversations` | No change |
| `/api/conversations/[id]` | `/api/conversations/[id]` | No change |
| `/api/generations` | `/api/generations` | No change |
| `/api/generations/[id]` | `/api/generations/[id]` | No change |
| `/api/client-config/[clientId]` | `/api/client/[clientId]` | Simplified |
| `/api/test-component` | `/api/generation/test-component` | Grouped with generation |
| `/api/submit-feedback` | `/api/feedback/submit` | Grouped with feedback |
| `/api/test-rules` | `/api/feedback/test-rules` | Grouped with feedback |
| `/api/auth/[...nextauth]` | `/api/auth/[...nextauth]` | No change |

