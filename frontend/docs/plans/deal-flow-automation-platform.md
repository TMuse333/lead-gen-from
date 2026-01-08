# Deal Flow Automation Platform

> "Mr. Lead Gen + Mr. Automator" - From first conversation to closing day, all in one ecosystem.

## The Vision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE FULL FUNNEL OWNERSHIP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CURRENT STATE                    FUTURE STATE                              │
│   ─────────────                    ────────────                              │
│                                                                              │
│   ┌─────────────┐                  ┌─────────────────────────────────────┐  │
│   │ Lead Gen    │                  │ Lead Gen                            │  │
│   │ Chatbot     │                  │ ↓                                   │  │
│   └──────┬──────┘                  │ Personalized Timeline               │  │
│          │                         │ ↓                                   │  │
│          ▼                         │ Video + Booking                     │  │
│   Lead goes to                     │ ↓                                   │  │
│   agent's email                    │ DEAL ROOM ← ← ← NEW                │  │
│          │                         │ ↓                                   │  │
│          ▼                         │ Document Collection                 │  │
│   Agent uses                       │ ↓                                   │  │
│   separate tools                   │ E-Signatures                        │  │
│   (Dotloop, email,                 │ ↓                                   │  │
│   spreadsheets...)                 │ Milestone Tracking                  │  │
│          │                         │ ↓                                   │  │
│          ▼                         │ Close & Handoff                     │  │
│   ???                              └─────────────────────────────────────┘  │
│                                                                              │
│   You lose visibility              You own the entire journey               │
│   after lead handoff               Data + Revenue at every step             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why This Is Extremely Valuable

### 1. Revenue Multiplication

| Stage | Revenue Model | Potential |
|-------|---------------|-----------|
| Lead Gen | Monthly SaaS | $99-299/mo |
| Deal Room | Per-transaction fee | $50-200/deal |
| E-Signatures | Usage fee or included | $10-30/deal |
| Premium Features | Add-ons | $50-100/deal |
| **Total per agent** | | **$200-600/deal** |

Average agent closes 8-12 deals/year. That's **$1,600-7,200/year per agent** on top of SaaS fees.

### 2. Stickiness & Moat

Once an agent has active deals in your system:
- They can't easily switch (deals in progress)
- Historical data becomes valuable
- Clients expect the portal
- Workflows are customized
- **Churn drops dramatically**

### 3. Network Effects

```
Agent uses platform
       ↓
Client loves the portal experience
       ↓
Client tells friends buying homes
       ↓
Friends ask THEIR agent "why don't you have this?"
       ↓
New agent signs up
       ↓
More agents = more integrations = more value
```

### 4. Data Moat

You'll have data NO ONE else has:
- Lead → Close conversion rates by agent
- Average time-to-close by market
- Document bottlenecks
- Which phases take longest
- Client engagement patterns

This data is **extremely valuable** for:
- Agent coaching/recommendations
- Market insights
- Predictive analytics
- Industry benchmarking

---

## The Product: "Deal Room"

### Two Apps, One Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────┐     ┌─────────────────────────────┐       │
│  │      AGENT DASHBOARD        │     │      CLIENT PORTAL          │       │
│  │      (Existing App+)        │     │      (New App)              │       │
│  ├─────────────────────────────┤     ├─────────────────────────────┤       │
│  │                             │     │                             │       │
│  │ • Deal pipeline view        │     │ • My home journey           │       │
│  │ • Document checklist mgmt   │     │ • Documents to complete     │       │
│  │ • Client communication      │     │ • Sign documents            │       │
│  │ • Task automation           │     │ • Track progress            │       │
│  │ • E-signature workflows     │     │ • Message my agent          │       │
│  │ • Analytics & reporting     │     │ • Next steps & advice       │       │
│  │ • Team collaboration        │     │ • Timeline view             │       │
│  │                             │     │ • Important dates           │       │
│  └─────────────────────────────┘     └─────────────────────────────┘       │
│              │                                   │                          │
│              └───────────────┬───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │  Shared Backend │                                      │
│                    │  • Deals DB     │                                      │
│                    │  • Documents    │                                      │
│                    │  • Messages     │                                      │
│                    │  • Signatures   │                                      │
│                    └─────────────────┘                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Client Portal: The "GitHub for Real Estate"

### Why GitHub as Inspiration?

GitHub's genius:
- Complex process (software development) made visible
- Progress tracking (commits, PRs, issues)
- Collaboration (comments, reviews)
- Checklists (CI/CD checks)
- Timeline/history of everything

Real estate needs the same thing:
- Complex process (home buying) made visible
- Progress tracking (phases, milestones)
- Collaboration (agent, lender, title, inspector)
- Checklists (documents, tasks)
- Timeline/history of the deal

### Client Portal UI Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 Smith Family Home Purchase                              [Messages] [?]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ PROGRESS                                                             │   │
│  │ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░ 58% Complete     │   │
│  │                                                                      │   │
│  │ ✓ Pre-Approval  ✓ Agent  ✓ Hunting  ● Offer  ○ Contract  ○ Close   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ 📋 ACTION REQUIRED (3)      │  │ 📅 UPCOMING                         │  │
│  ├─────────────────────────────┤  ├─────────────────────────────────────┤  │
│  │                             │  │                                     │  │
│  │ ⚠️ Sign Purchase Agreement  │  │ Tomorrow, 2pm                       │  │
│  │   Due: Today by 5pm        │  │ Home Inspection                     │  │
│  │   [Sign Now →]             │  │ 123 Oak Street                      │  │
│  │                             │  │                                     │  │
│  │ 📄 Upload Bank Statements   │  │ Friday, 10am                        │  │
│  │   Due: Tomorrow            │  │ Call with Lender                    │  │
│  │   [Upload →]               │  │ Re: Final approval                  │  │
│  │                             │  │                                     │  │
│  │ ✍️ Review Inspection Report │  │ Dec 15                              │  │
│  │   Ready for your review    │  │ 🎉 Closing Day!                     │  │
│  │   [View →]                 │  │ Title Company Office                │  │
│  │                             │  │                                     │  │
│  └─────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📁 DOCUMENTS                                                  [All] │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │ Needs Attention                                                      │   │
│  │ ┌────────────────────────────────────────────────────────────────┐  │   │
│  │ │ 📄 Purchase Agreement          ⚠️ Signature Required           │  │   │
│  │ │    From: Agent Sarah           Due: Today 5pm    [Sign →]      │  │   │
│  │ └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │ Completed ✓                                                          │   │
│  │ • Pre-Approval Letter (uploaded Oct 15)                              │   │
│  │ • Proof of Funds (uploaded Oct 15)                                   │   │
│  │ • ID Verification (signed Oct 12)                                    │   │
│  │ • Buyer Representation Agreement (signed Oct 10)                     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 RECENT UPDATES                                                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │ Today, 9:15am - Sarah MacLeod (Your Agent)                          │   │
│  │ "Great news! The seller accepted our offer. I've sent over the      │   │
│  │  purchase agreement for your signature. Let me know if you have     │   │
│  │  any questions!"                                                     │   │
│  │                                        [Reply]                       │   │
│  │                                                                      │   │
│  │ Yesterday, 4:30pm - System                                          │   │
│  │ Milestone reached: Offer Accepted 🎉                                │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────┐                                                   │
│  │ 👤 Your Team         │                                                   │
│  ├──────────────────────┤                                                   │
│  │ Sarah MacLeod        │ Agent        [Message]                            │
│  │ John Smith           │ Lender       [Message]                            │
│  │ ABC Title Co         │ Title        [Message]                            │
│  └──────────────────────┘                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Experience

```
┌─────────────────────┐
│ 🏠 Your Home Journey│
├─────────────────────┤
│                     │
│ ████████░░░░ 58%    │
│                     │
│ ⚠️ 3 items need     │
│    attention        │
│                     │
│ ┌─────────────────┐ │
│ │ Sign Purchase   │ │
│ │ Agreement       │ │
│ │ Due: Today 5pm  │ │
│ │                 │ │
│ │ [Sign Now]      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 📅 Tomorrow 2pm │ │
│ │ Home Inspection │ │
│ │ 123 Oak Street  │ │
│ │ [Add to Cal]    │ │
│ └─────────────────┘ │
│                     │
│ 💬 New message from │
│    Sarah (Agent)    │
│    [View →]         │
│                     │
├─────────────────────┤
│ [Home][Docs][Chat]  │
└─────────────────────┘
```

---

## Agent Dashboard: Deal Pipeline

### Pipeline View (Like CRM)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Deals Pipeline                                    [+ New Deal] [Filters ▼] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Pre-Approval    Hunting        Offer         Contract       Closing         │
│ (2 deals)       (5 deals)      (2 deals)     (3 deals)      (1 deal)       │
│                                                                              │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│ │Smith      │  │Johnson    │  │Williams   │  │Brown      │  │Davis      │  │
│ │$425K      │  │$380K      │  │$510K      │  │$445K      │  │$395K      │  │
│ │Halifax    │  │Dartmouth  │  │Bedford    │  │Halifax    │  │Halifax    │  │
│ │           │  │           │  │           │  │           │  │           │  │
│ │⚠️ Docs    │  │🔄 Active  │  │⏳ Waiting │  │✅ On track│  │🎉 Dec 15  │  │
│ │  needed   │  │  search   │  │  response │  │           │  │           │  │
│ └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │
│                                                                              │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│ │Taylor     │  │Anderson   │  │Miller     │  │Wilson     │                  │
│ │$350K      │  │$290K      │  │$620K      │  │$475K      │                  │
│ │Sackville  │  │Dartmouth  │  │South End  │  │Bedford    │                  │
│ │           │  │           │  │           │  │           │                  │
│ │✅ Ready   │  │🔄 Active  │  │           │  │⚠️ Inspect │                  │
│ │           │  │           │  │           │  │  tomorrow │                  │
│ └───────────┘  └───────────┘  └───────────┘  └───────────┘                  │
│                                                                              │
│               ┌───────────┐                  ┌───────────┐                  │
│               │Martinez   │                  │Lee        │                  │
│               │$410K      │                  │$525K      │                  │
│               │Clayton Pk │                  │Halifax    │                  │
│               │           │                  │           │                  │
│               │🔄 Active  │                  │✅ On track│                  │
│               └───────────┘                  └───────────┘                  │
│                                                                              │
│               ... +2 more                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Deal Detail View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Pipeline                                                          │
│                                                                              │
│  Smith Family - 123 Oak Street, Halifax                                     │
│  $425,000 | Under Contract | Closing: Dec 15                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Overview] [Documents] [Tasks] [Messages] [Timeline] [Notes]               │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Progress                                                                    │
│  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░ 58%                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Documents Status                                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Required: 12  |  Collected: 8  |  Signed: 6  |  Pending: 4          │   │
│  │                                                                      │   │
│  │ ⚠️ Awaiting Client:                                                 │   │
│  │ • Purchase Agreement (sent, awaiting signature)                      │   │
│  │ • Bank Statements (requested)                                        │   │
│  │                                                                      │   │
│  │ ⏳ Awaiting Others:                                                  │   │
│  │ • Inspection Report (inspector, due tomorrow)                        │   │
│  │ • Appraisal (lender, in progress)                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Quick Actions                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [Send Document]  [Request Signature]  [Send Reminder]  [Add Task]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Key Dates                                                            │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Offer Accepted     Oct 28     ✓ Complete                            │   │
│  │ Inspection         Nov 2      ⏳ Tomorrow 2pm                        │   │
│  │ Appraisal          Nov 8      ○ Scheduled                           │   │
│  │ Financing Deadline Nov 15     ○ Upcoming                            │   │
│  │ Closing            Dec 15     ○ Target                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Document Management

**Document Checklist by Phase:**
```typescript
interface DocumentChecklist {
  dealId: string;
  phase: DealPhase;
  documents: {
    id: string;
    name: string;
    description: string;
    required: boolean;
    status: 'not_started' | 'requested' | 'uploaded' | 'signed' | 'verified';
    assignedTo: 'client' | 'agent' | 'lender' | 'title' | 'other';
    dueDate?: Date;
    uploadedAt?: Date;
    signedAt?: Date;
    fileUrl?: string;
  }[];
}
```

**Standard Document Templates:**

| Phase | Documents |
|-------|-----------|
| Pre-Approval | Pre-approval letter, Proof of funds, ID |
| Offer | Purchase agreement, Earnest money receipt |
| Contract | Inspection report, Appraisal, Title commitment |
| Closing | Closing disclosure, Final walkthrough, Wire instructions |

### 2. E-Signature Integration

**Supported Providers:**

| Provider | Best For | API Cost |
|----------|----------|----------|
| DocuSign | Enterprise, compliance | $1-3/envelope |
| HelloSign (Dropbox) | SMB, simple flows | $0.50-1/envelope |
| PandaDoc | Documents + signatures | $1-2/envelope |
| SignWell | Budget option | $0.25-0.50/envelope |

**Workflow:**
```
Agent uploads document
       ↓
Marks signature fields
       ↓
System sends to client portal
       ↓
Client sees "Sign Required" notification
       ↓
Client signs in-app (embedded signing)
       ↓
Signed document stored
       ↓
All parties notified
       ↓
Next task auto-triggered
```

**API Integration (DocuSign example):**
```typescript
// Create envelope for signing
async function createSignatureRequest(
  document: Buffer,
  signers: Signer[],
  dealId: string
): Promise<string> {
  const envelope = await docusign.createEnvelope({
    emailSubject: 'Please sign: Purchase Agreement',
    documents: [{
      documentBase64: document.toString('base64'),
      name: 'Purchase Agreement',
      fileExtension: 'pdf',
      documentId: '1',
    }],
    recipients: {
      signers: signers.map((signer, index) => ({
        email: signer.email,
        name: signer.name,
        recipientId: String(index + 1),
        clientUserId: signer.id, // For embedded signing
        tabs: {
          signHereTabs: signer.signatureLocations,
          dateSignedTabs: signer.dateLocations,
        },
      })),
    },
    status: 'sent',
    eventNotification: {
      url: `https://yourdomain.com/api/webhooks/docusign?dealId=${dealId}`,
      loggingEnabled: true,
      events: ['envelope-completed', 'envelope-declined'],
    },
  });

  return envelope.envelopeId;
}

// Generate embedded signing URL
async function getSigningUrl(
  envelopeId: string,
  signer: Signer,
  returnUrl: string
): Promise<string> {
  const view = await docusign.createRecipientView({
    envelopeId,
    returnUrl,
    authenticationMethod: 'none',
    email: signer.email,
    userName: signer.name,
    clientUserId: signer.id,
  });

  return view.url;
}
```

### 3. Automated Workflows

**Trigger-Based Automation:**

```typescript
interface WorkflowTrigger {
  event:
    | 'deal_created'
    | 'phase_changed'
    | 'document_signed'
    | 'document_uploaded'
    | 'task_completed'
    | 'date_approaching'
    | 'date_passed';

  conditions?: {
    phase?: DealPhase;
    documentType?: string;
    daysUntil?: number;
  };

  actions: WorkflowAction[];
}

interface WorkflowAction {
  type:
    | 'send_email'
    | 'send_sms'
    | 'create_task'
    | 'request_document'
    | 'send_signature_request'
    | 'notify_agent'
    | 'update_deal_phase'
    | 'schedule_reminder';

  config: Record<string, any>;
}
```

**Example Workflows:**

```typescript
const WORKFLOWS: WorkflowTrigger[] = [
  // When offer accepted, request inspection scheduling
  {
    event: 'phase_changed',
    conditions: { phase: 'under_contract' },
    actions: [
      { type: 'create_task', config: { task: 'Schedule home inspection', assignTo: 'client', dueDays: 3 }},
      { type: 'send_email', config: { template: 'offer_accepted_next_steps' }},
    ],
  },

  // 3 days before closing, send reminder
  {
    event: 'date_approaching',
    conditions: { daysUntil: 3 },
    actions: [
      { type: 'send_email', config: { template: 'closing_reminder' }},
      { type: 'create_task', config: { task: 'Final walkthrough', assignTo: 'agent' }},
    ],
  },

  // When all documents signed, notify agent
  {
    event: 'document_signed',
    conditions: { allRequiredSigned: true },
    actions: [
      { type: 'notify_agent', config: { message: 'All documents signed for {dealName}' }},
      { type: 'update_deal_phase', config: { phase: 'ready_to_close' }},
    ],
  },
];
```

### 4. Communication Hub

**Unified Messaging:**
- In-app messaging between all parties
- Email integration (messages sync to email)
- SMS notifications for urgent items
- Message threading by topic/document

**Message Types:**
```typescript
interface Message {
  id: string;
  dealId: string;
  threadId?: string;

  from: {
    id: string;
    role: 'client' | 'agent' | 'lender' | 'title' | 'system';
    name: string;
  };

  to: {
    id: string;
    role: string;
    name: string;
  }[];

  content: string;
  attachments?: Attachment[];

  relatedTo?: {
    type: 'document' | 'task' | 'milestone';
    id: string;
  };

  readBy: { oddduserId: string; readAt: Date }[];

  createdAt: Date;
}
```

### 5. Timeline & Activity Feed

**Activity Types:**
```typescript
type ActivityType =
  | 'deal_created'
  | 'phase_changed'
  | 'document_uploaded'
  | 'document_signed'
  | 'task_created'
  | 'task_completed'
  | 'message_sent'
  | 'milestone_reached'
  | 'reminder_sent'
  | 'team_member_added';

interface ActivityFeedItem {
  id: string;
  dealId: string;
  type: ActivityType;
  actor: { id: string; name: string; role: string };
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

**Feed Display:**
```
─── Today ───────────────────────────────────

  10:30 AM  📄 Sarah uploaded "Inspection Report"

  9:15 AM   💬 Sarah: "Great news! Inspection went well..."

  9:00 AM   ✅ Milestone: Inspection Complete

─── Yesterday ───────────────────────────────

  4:30 PM   ✍️ John signed "Purchase Agreement"

  2:15 PM   📧 Signature request sent to John

  11:00 AM  🎉 Phase changed: Offer → Under Contract
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEAL FLOW PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Agent App     │  │   Client App    │  │   Admin App     │             │
│  │   (Next.js)     │  │   (Next.js)     │  │   (Next.js)     │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                                ▼                                            │
│                    ┌───────────────────────┐                                │
│                    │      API Gateway      │                                │
│                    │   (Next.js API / tRPC)│                                │
│                    └───────────┬───────────┘                                │
│                                │                                            │
│         ┌──────────────────────┼──────────────────────┐                    │
│         │                      │                      │                    │
│         ▼                      ▼                      ▼                    │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│  │   Auth      │       │   Deals     │       │  Documents  │              │
│  │   Service   │       │   Service   │       │   Service   │              │
│  └─────────────┘       └─────────────┘       └─────────────┘              │
│                                │                      │                    │
│                                ▼                      ▼                    │
│                        ┌─────────────┐       ┌─────────────┐              │
│                        │  Workflow   │       │  Signature  │              │
│                        │   Engine    │       │   Service   │              │
│                        └─────────────┘       └─────────────┘              │
│                                                      │                     │
│                                                      ▼                     │
│                                              ┌─────────────┐              │
│                                              │  DocuSign/  │              │
│                                              │  HelloSign  │              │
│                                              └─────────────┘              │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                           DATA LAYER                                 │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │PostgreSQL│  │  Redis   │  │    S3    │  │  Qdrant  │            │  │
│  │  │ (Deals,  │  │ (Cache,  │  │(Documents│  │ (Search, │            │  │
│  │  │  Users)  │  │  Queue)  │  │  ,Videos)│  │  Advice) │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        EXTERNAL SERVICES                             │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │  DocuSign │ Twilio │ SendGrid │ Stripe │ Google │ Plaid            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema (Core Tables)

```typescript
// Deals
interface Deal {
  id: string;
  agentId: string;

  // Client info
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;

  // Property
  propertyAddress?: string;
  propertyPrice?: number;
  propertyType?: string;

  // Status
  phase: DealPhase;
  status: 'active' | 'on_hold' | 'closed_won' | 'closed_lost';

  // Key dates
  offerDate?: Date;
  acceptedDate?: Date;
  inspectionDate?: Date;
  appraisalDate?: Date;
  closingDate?: Date;
  actualCloseDate?: Date;

  // Source
  sourceType: 'chatbot' | 'manual' | 'import';
  sourceLeadId?: string; // Link to original lead

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

type DealPhase =
  | 'lead'
  | 'pre_approval'
  | 'searching'
  | 'offer_pending'
  | 'under_contract'
  | 'inspection'
  | 'appraisal'
  | 'final_approval'
  | 'closing'
  | 'closed';

// Documents
interface Document {
  id: string;
  dealId: string;

  name: string;
  description?: string;
  category: DocumentCategory;

  status: 'required' | 'requested' | 'uploaded' | 'pending_signature' | 'signed' | 'verified';

  // File info
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;

  // Signature info
  signatureProvider?: 'docusign' | 'hellosign' | 'pandadoc';
  externalEnvelopeId?: string;
  signedAt?: Date;
  signedBy?: string[];

  // Assignment
  requestedFrom?: string;
  uploadedBy?: string;
  dueDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Tasks
interface Task {
  id: string;
  dealId: string;

  title: string;
  description?: string;

  assignedTo: string;
  assignedToRole: 'client' | 'agent' | 'lender' | 'title';

  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  dueDate?: Date;
  completedAt?: Date;

  relatedDocumentId?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Team Members (per deal)
interface DealTeamMember {
  id: string;
  dealId: string;

  userId?: string; // If they have an account
  name: string;
  email: string;
  phone?: string;

  role: 'client' | 'co_client' | 'agent' | 'co_agent' | 'lender' | 'title' | 'attorney' | 'inspector';
  company?: string;

  permissions: {
    canView: boolean;
    canUpload: boolean;
    canSign: boolean;
    canMessage: boolean;
  };

  addedAt: Date;
}
```

---

## Integration Points

### With Existing Lead Gen App

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEAD GEN → DEAL ROOM HANDOFF                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Lead Gen App                              Deal Room                         │
│  ───────────                               ─────────                         │
│                                                                              │
│  Lead completes chat                                                         │
│         │                                                                    │
│         ▼                                                                    │
│  Timeline generated                                                          │
│         │                                                                    │
│         ├──────────────────────────────────────────────────────────────┐    │
│         │                                                              │    │
│         ▼                                                              ▼    │
│  Agent receives lead                                            (Optional)  │
│         │                                                       Auto-create │
│         ▼                                                       Deal Room   │
│  Agent clicks                                                              │
│  "Start Deal" ─────────────────────────────────────────────────────────┐   │
│                                                                         │   │
│                                                                         ▼   │
│                                                              ┌─────────────┐│
│                                                              │ Deal Created││
│                                                              │             ││
│  Data transferred:                                           │ • Lead data ││
│  • Client name, email, phone                                 │ • Timeline  ││
│  • Location, budget, timeline                                │ • Phase     ││
│  • Timeline phases                                           │ • Documents ││
│  • Agent context/notes                                       │   checklist ││
│                                                              └─────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### External Service Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| **DocuSign/HelloSign** | E-signatures | P0 - Essential |
| **Twilio** | SMS notifications | P1 - Important |
| **SendGrid** | Email notifications | P1 - Important |
| **Stripe** | Earnest money deposits | P2 - Nice to have |
| **Plaid** | Bank verification | P2 - Nice to have |
| **Google Calendar** | Appointment sync | P1 - Important |
| **Zapier** | Agent's other tools | P2 - Nice to have |

---

## Implementation Phases

### Phase 1: Foundation (4-6 weeks)

**Goal:** Basic deal tracking and document management

- [ ] Database schema and migrations
- [ ] Deal CRUD operations
- [ ] Basic client portal (view-only)
- [ ] Document upload/storage
- [ ] Simple task management
- [ ] Activity feed
- [ ] Agent dashboard with pipeline view

**Deliverables:**
- Agents can create and track deals
- Clients can view their deal status
- Documents can be uploaded and organized

### Phase 2: E-Signatures (2-3 weeks)

**Goal:** Integrated document signing

- [ ] DocuSign/HelloSign integration
- [ ] Signature request workflow
- [ ] Embedded signing in client portal
- [ ] Signature status tracking
- [ ] Completed document storage
- [ ] Webhook handlers for status updates

**Deliverables:**
- Agents can send documents for signature
- Clients can sign without leaving portal
- Signed documents auto-saved to deal

### Phase 3: Automation (2-3 weeks)

**Goal:** Workflow automation engine

- [ ] Workflow trigger system
- [ ] Action execution engine
- [ ] Email/SMS notification templates
- [ ] Automated reminders
- [ ] Phase transition automation
- [ ] Custom workflow builder (agent)

**Deliverables:**
- Automatic notifications and reminders
- Phase auto-progression based on events
- Configurable workflow rules

### Phase 4: Communication (2 weeks)

**Goal:** Unified communication hub

- [ ] In-app messaging
- [ ] Email sync (optional)
- [ ] Message threading
- [ ] File sharing in messages
- [ ] @mentions and notifications
- [ ] Read receipts

**Deliverables:**
- All communication in one place
- Clients can message agent directly
- Full conversation history

### Phase 5: Polish & Scale (Ongoing)

**Goal:** Enterprise-ready features

- [ ] Team/brokerage support
- [ ] Role-based permissions
- [ ] White-labeling
- [ ] API for integrations
- [ ] Advanced analytics
- [ ] Mobile apps (React Native)
- [ ] Audit logging
- [ ] Compliance features

---

## Pricing Model

### Transaction-Based Revenue

| Tier | Monthly Fee | Per-Deal Fee | Included Deals |
|------|-------------|--------------|----------------|
| Starter | $0 | $75/deal | 0 |
| Pro | $149/mo | $50/deal | 3 |
| Business | $299/mo | $35/deal | 10 |
| Enterprise | Custom | $20/deal | Unlimited |

### Add-On Revenue

| Feature | Price |
|---------|-------|
| Additional team members | $25/user/mo |
| White-label portal | $100/mo |
| API access | $50/mo |
| Premium support | $100/mo |
| Custom integrations | Project-based |

### Revenue Projection

```
Year 1:
- 100 agents × $149/mo = $14,900/mo base
- 100 agents × 8 deals × $50 = $40,000/year transactions
- Total Year 1: ~$220,000

Year 2:
- 500 agents × $149/mo = $74,500/mo base
- 500 agents × 10 deals × $40 = $200,000/year transactions
- Total Year 2: ~$1,100,000

Year 3+:
- Scale to thousands of agents
- Add brokerage/team accounts
- Enterprise contracts
```

---

## Competitive Landscape

### Existing Players

| Competitor | Strength | Weakness | Your Advantage |
|------------|----------|----------|----------------|
| **Dotloop** (Zillow) | Market leader, full-featured | Expensive, complex | Simpler, lead gen integrated |
| **SkySlope** | Transaction mgmt focused | No lead gen | Full funnel ownership |
| **Open To Close** | Modern UI | Limited features | More automation |
| **Qualia** | Closing-focused | Not agent-facing | Earlier in funnel |
| **Follow Up Boss** | CRM leader | No transaction mgmt | Deal management |

### Your Moat

1. **Full Funnel:** Lead gen → Close in one ecosystem
2. **Data Continuity:** Lead context flows into deal
3. **Client Experience:** Consumer-grade portal
4. **AI Integration:** Advice, automation, video
5. **Simplicity:** Built for individual agents first

---

## Success Metrics

### Product Metrics

| Metric | Target |
|--------|--------|
| Deals created from leads | > 30% |
| Document completion rate | > 90% |
| Signature turnaround | < 24 hours |
| Client portal DAU | > 40% of active deals |
| Agent time saved | > 5 hours/deal |

### Business Metrics

| Metric | Target |
|--------|--------|
| Lead gen → Deal room conversion | > 50% |
| Deal room revenue per agent | > $500/year |
| Churn rate | < 5%/month |
| NPS | > 50 |

---

## Summary

### The Vision

**"Mr. Lead Gen + Mr. Automator"**

You're not just building a chatbot or a transaction manager - you're building the **operating system for real estate agents**. Every interaction from first website visit to closing day happens in your ecosystem.

### Why It Works

1. **Natural extension:** Agents already trust you with lead gen
2. **Data advantage:** You have context competitors don't
3. **Client experience:** Beautiful portal is a differentiator
4. **Sticky revenue:** Active deals = can't churn
5. **Network effects:** Happy clients → agent referrals

### The Flywheel

```
Better lead gen
      ↓
More agents sign up
      ↓
More deals in platform
      ↓
More data & insights
      ↓
Better automation & AI
      ↓
Agents close faster
      ↓
Agents tell other agents
      ↓
(repeat)
```

### Next Steps

1. **Validate:** Talk to agents about pain points in deal management
2. **MVP scope:** Start with deal tracking + basic documents
3. **Pilot:** 5-10 agents using Deal Room with real deals
4. **Iterate:** Add e-signatures, automation based on feedback
5. **Scale:** Marketing, integrations, team features

---

*This is a big vision. Start small, prove value, expand.*
