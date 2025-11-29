# Conversation & Generation Tracking System - Overview

## 🎯 Goals

Track and display:
1. **Conversation History**: Full chat sessions (messages, flow, user answers)
2. **Generation Results**: LLM outputs with debug metadata
3. **Analytics**: Summary stats for both user and admin dashboards

## 📊 MongoDB Collections

### 1. `conversations` Collection

**Purpose**: Store complete chat sessions

```typescript
interface ConversationDocument {
  _id?: ObjectId;
  
  // User/Client Identification
  userId?: string;              // For authenticated users (NextAuth session.user.id)
  clientIdentifier?: string;    // For public bots (businessName from client config)
  sessionId?: string;           // Browser session ID for anonymous tracking
  
  // Conversation Metadata
  flow: 'buy' | 'sell' | 'browse' | string;  // Flow type (flexible for future flows)
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  
  // Chat Messages
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    buttons?: Array<{ label: string; value: string }>;
    timestamp: Date;
    questionId?: string;        // Link to conversation flow question
  }>;
  
  // User Input/Answers
  userInput: Record<string, string>;  // Key-value pairs of answers
  
  // Flow Context
  currentFlowId?: string;      // Which flow was used
  currentNodeId?: string;       // Last question node
  progress: number;             // 0-100 completion percentage
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  pageUrl?: string;
  
  // Analytics
  messageCount: number;
  duration?: number;           // Seconds from start to completion
  abandonedAt?: Date;          // If user left mid-conversation
}
```

### 2. `generations` Collection

**Purpose**: Store LLM generation results

```typescript
interface GenerationDocument {
  _id?: ObjectId;
  
  // Link to Conversation
  conversationId: ObjectId;     // References conversations._id
  
  // User/Client Identification (denormalized for easier queries)
  userId?: string;
  clientIdentifier?: string;
  
  // Generation Metadata
  flow: string;                // Flow type used
  offerType?: string;           // Future: 'pdf', 'landingPage', 'video', 'homeEvaluation', etc.
  generatedAt: Date;
  generationTime: number;      // Milliseconds
  
  // LLM Output
  llmOutput: LlmOutput;        // The actual generated content (flexible structure)
  
  // Debug/Technical Info
  debugInfo: {
    qdrantRetrieval: QdrantRetrievalMetadata[];
    promptLength: number;
    adviceUsed: number;
    generationTime: number;
    userInput: Record<string, string>;
    flow: string;
  };
  
  // User Input (snapshot at generation time)
  userInput: Record<string, string>;
  
  // Status
  status: 'success' | 'error' | 'partial';
  errorMessage?: string;
  
  // Analytics
  outputSize: number;          // Size of llmOutput in bytes
  componentCount: number;      // Number of components in output
}
```

## 🔄 Data Flow

### 1. Conversation Start
```
User starts chat → Create ConversationDocument
- Set status: 'in-progress'
- Record first message
- Store session info
```

### 2. During Conversation
```
Each message/answer → Update ConversationDocument
- Append to messages array
- Update userInput
- Update progress
- Update lastActivityAt
```

### 3. Generation Trigger
```
Chat completes → Call /api/test-component
- Generate LLM output
- Create GenerationDocument
- Link to ConversationDocument via conversationId
- Update ConversationDocument status to 'completed'
```

### 4. Display in Dashboard
```
Fetch conversations + generations
- Join by conversationId
- Display summary similar to GenerationSummary component
- Show chat transcript + generation results
```

## 📁 Implementation Structure

### MongoDB Models
```
frontend/src/lib/mongodb/models/
  ├── conversation.ts          # ConversationDocument interface
  ├── generation.ts            # GenerationDocument interface
  └── index.ts                 # Re-export all models
```

### API Routes
```
frontend/app/api/
  ├── conversations/
  │   ├── route.ts            # GET: List conversations (with filters)
  │   └── [id]/
  │       ├── route.ts        # GET: Single conversation details
  │       └── generations/
  │           └── route.ts   # GET: Generations for a conversation
  ├── generations/
  │   ├── route.ts            # GET: List all generations
  │   └── [id]/
  │       └── route.ts        # GET: Single generation details
  └── analytics/
      └── route.ts            # GET: Summary stats (counts, averages, etc.)
```

### Dashboard Components
```
frontend/src/components/
  ├── dashboard/
  │   ├── ConversationList.tsx        # List of conversations
  │   ├── ConversationDetail.tsx       # Full conversation view
  │   ├── GenerationSummary.tsx        # Reuse existing component
  │   └── AnalyticsOverview.tsx        # Stats cards
  └── admin/
      ├── AllConversations.tsx         # Admin: all users' conversations
      └── AllGenerations.tsx           # Admin: all generations
```

## 🔌 Integration Points

### 1. Chat Store Integration
**Location**: `frontend/src/stores/chatStore/`

**Changes Needed**:
- Add `conversationId` to ChatState
- On conversation start: Create conversation in MongoDB
- On each message: Update conversation in MongoDB
- On completion: Link generation to conversation

**Example**:
```typescript
// In chatStore actions
const startConversation = async () => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({
      flow: state.currentFlow,
      messages: [state.messages[0]],
      // ...
    })
  });
  const { _id } = await response.json();
  set({ conversationId: _id });
};
```

### 2. API Route Integration
**Location**: `frontend/app/api/test-component/route.ts`

**Changes Needed**:
- Accept `conversationId` in request body
- After successful generation, create GenerationDocument
- Link to ConversationDocument

**Example**:
```typescript
// After LLM generation succeeds
if (conversationId) {
  await createGeneration({
    conversationId,
    llmOutput: parsed,
    debugInfo: { ... },
    // ...
  });
}
```

## 📈 Dashboard Views

### User Dashboard (`/dashboard`)

**Conversations Tab**:
- List of user's conversations
- Each row shows:
  - Flow type
  - Started date
  - Status (completed/abandoned)
  - Message count
  - Link to view details

**Conversation Detail View**:
- Full chat transcript (messages)
- User answers summary
- Generation results (if completed)
- GenerationSummary component showing:
  - Qdrant retrieval stats
  - Performance metrics
  - Knowledge base items used

**Analytics Tab**:
- Total conversations
- Completion rate
- Average conversation length
- Most common flow type
- Average generation time

### Admin Dashboard (`/admin/dashboard`)

**All Conversations Tab**:
- Table of all conversations across all users
- Filters:
  - User/Client
  - Flow type
  - Status
  - Date range
- Export to CSV option

**All Generations Tab**:
- Table of all generations
- Shows:
  - User/Client
  - Flow type
  - Offer type (when implemented)
  - Generation time
  - Component count
  - Link to view full output

**Analytics Overview**:
- Total conversations (all users)
- Total generations
- Average completion rate
- Most popular flows
- Generation success rate
- Average generation time
- Qdrant usage stats

## 🔮 Future-Proofing for Offers

### When Offers Are Implemented

**Minimal Changes Needed**:

1. **Add `offerType` to GenerationDocument**:
   ```typescript
   offerType?: 'pdf' | 'landingPage' | 'video' | 'homeEvaluation' | string;
   ```

2. **Add Offer-Specific Metadata** (optional):
   ```typescript
   offerMetadata?: {
     pdfUrl?: string;
     videoUrl?: string;
     landingPageUrl?: string;
     // ... other offer-specific data
   };
   ```

3. **Filter/Group by Offer Type**:
   - Add offer type filter to dashboard
   - Group analytics by offer type
   - Show offer-specific stats

4. **No Breaking Changes**:
   - Existing conversations/generations still work
   - `offerType` is optional
   - Generic components still render any structure

## 🎨 UI Components

### ConversationSummary Component
Similar to GenerationSummary but for conversations:
- Shows conversation timeline
- Message count
- Flow type badge
- Completion status
- Duration
- Quick stats

### GenerationCard Component
Reusable card showing:
- Generation timestamp
- Flow type
- Offer type (when available)
- Quick stats (advice used, generation time)
- Link to full details

### ConversationTranscript Component
Displays full chat:
- Messages in chronological order
- User answers highlighted
- Question/answer pairs
- Timestamps
- Export option

## 📊 Indexes for Performance

```typescript
// conversations collection
{
  userId: 1,                    // Query user's conversations
  clientIdentifier: 1,          // Query client's conversations
  status: 1,                    // Filter by status
  startedAt: -1,                // Sort by newest first
  flow: 1,                      // Filter by flow type
  'userId + startedAt': -1,     // Compound: user's recent conversations
}

// generations collection
{
  conversationId: 1,            // Join with conversations
  userId: 1,                    // Query user's generations
  clientIdentifier: 1,          // Query client's generations
  generatedAt: -1,              // Sort by newest first
  flow: 1,                      // Filter by flow
  offerType: 1,                 // Filter by offer (when implemented)
  'userId + generatedAt': -1,   // Compound: user's recent generations
}
```

## 🔐 Security & Privacy

### Data Isolation
- **Authenticated Users**: Filter by `userId` (NextAuth session)
- **Public Bots**: Filter by `clientIdentifier` (business name)
- **Admin Access**: Can view all, but should have role-based access control

### PII Handling
- Store user input (may contain email, phone, address)
- Consider encryption for sensitive fields
- GDPR compliance: allow data export/deletion

### Rate Limiting
- Limit conversation creation per user/IP
- Prevent spam/abuse
- Track suspicious patterns

## 📝 Implementation Phases

### Phase 1: Basic Tracking (Current)
- ✅ Create MongoDB models
- ✅ Create API routes for CRUD
- ✅ Integrate with chat store
- ✅ Save conversations on start/update
- ✅ Save generations after LLM call

### Phase 2: Dashboard Views
- ✅ User dashboard: List conversations
- ✅ User dashboard: View conversation detail
- ✅ User dashboard: View generation details
- ✅ Admin dashboard: View all conversations
- ✅ Admin dashboard: View all generations

### Phase 3: Analytics
- ✅ Basic stats (counts, averages)
- ✅ Charts/graphs
- ✅ Export functionality
- ✅ Filtering/search

### Phase 4: Advanced Features (Future)
- Real-time updates
- Notifications for new conversations
- Advanced analytics
- A/B testing support
- Conversation replay

## 🚀 Benefits

1. **User Insights**: See their conversation history and results
2. **Admin Oversight**: Monitor all bot interactions
3. **Analytics**: Understand usage patterns, popular flows, completion rates
4. **Debugging**: Full context for troubleshooting issues
5. **Future-Proof**: Easy to add offer types without breaking changes
6. **Scalable**: Indexed for performance, supports high volume

## ⚠️ Considerations

1. **Storage Costs**: Conversations can be large (many messages)
   - Consider archiving old conversations
   - Compress large payloads
   - Set retention policies

2. **Performance**: Large collections need proper indexing
   - Use compound indexes for common queries
   - Paginate results
   - Cache frequently accessed data

3. **Privacy**: User data in conversations
   - Clear data retention policy
   - User consent for storage
   - Ability to delete own data

4. **Migration**: Existing users won't have conversation history
   - Start tracking from implementation date
   - Optional: Backfill from existing data if available

