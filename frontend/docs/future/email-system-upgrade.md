# Email System Upgrade Plan

> **Status:** Planned for post-rebrand
> **Priority:** Medium
> **Blocker:** Brand name decision

## Current State

### agent-lead-gen (this project)
- **Service:** Gmail SMTP via Nodemailer
- **Sender:** `focusflowwebsite@gmail.com`
- **Env vars:** `EMAIL_USER`, `EMAIL_PASSWORD`
- **Location:** `/app/api/notify-lead/route.ts`
- **Limitations:**
  - 500 emails/day (Gmail limit)
  - Single generic sender for all users
  - Not professional for a SaaS product
  - Risk of Google flagging for "suspicious activity"

### easy-money project (reference implementation)
- **Service:** Resend SDK
- **Sender:** `onboarding@focusflowsoftware.com`
- **Env vars:** `RESEND_API_KEY`
- **Domain:** `focusflowsoftware.com` (verified in Resend)

## Future State (Post-Rebrand)

### Goals
1. Professional sender addresses matching new brand
2. Scalable email infrastructure (Resend)
3. Dynamic sender support per user/agent
4. Consistent email system across all projects

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Resend Account                        │
├─────────────────────────────────────────────────────────┤
│  Verified Domain: {newbrand}.com                        │
│                                                         │
│  Possible sender patterns:                              │
│  ├── noreply@{newbrand}.com      (transactional)       │
│  ├── leads@{newbrand}.com        (lead notifications)  │
│  ├── onboarding@{newbrand}.com   (auth/magic links)    │
│  └── {agent-slug}@{newbrand}.com (per-user dynamic)    │
└─────────────────────────────────────────────────────────┘
```

### Dynamic Sender Options

#### Option A: Single notification address
```typescript
from: `${agent.businessName} Bot <leads@{newbrand}.com>`
to: agent.notificationEmail
```
- Simplest setup
- All notifications come from same address
- Agent's business name in display name only

#### Option B: Per-agent dynamic sender
```typescript
from: `${agent.businessName} <${agent.slug}-bot@{newbrand}.com>`
to: agent.notificationEmail
```
- More professional
- Each agent gets unique sender
- Requires domain verification only (no per-email setup)

#### Option C: Subdomain for leads (most scalable)
```typescript
from: `${agent.businessName} <bot@${agent.slug}.leads.{newbrand}.com>`
```
- Requires wildcard subdomain verification
- Maximum flexibility
- Better email deliverability isolation per user

## Implementation Steps

### Phase 1: Resend Setup
1. [ ] Decide on new brand name
2. [ ] Purchase/configure new domain
3. [ ] Create Resend account (or use existing)
4. [ ] Verify new domain in Resend (add DNS records)
5. [ ] Generate API key for production

### Phase 2: Code Changes
1. [ ] Install `resend` package in agent-lead-gen
   ```bash
   npm install resend
   ```

2. [ ] Create email service abstraction
   ```typescript
   // src/lib/email/emailService.ts
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendLeadNotification(params: {
     agentEmail: string;
     agentName: string;
     agentSlug?: string;
     lead: { name: string; email: string; phone?: string };
     userInput: Record<string, string>;
     flow?: string;
   }) {
     const senderAddress = params.agentSlug
       ? `${params.agentSlug}-bot@{newbrand}.com`
       : `leads@{newbrand}.com`;

     return resend.emails.send({
       from: `${params.agentName} Bot <${senderAddress}>`,
       to: params.agentEmail,
       subject: `New Lead: ${params.lead.name}`,
       html: generateLeadEmailHtml(params),
     });
   }
   ```

3. [ ] Update `/api/notify-lead/route.ts` to use new service

4. [ ] Update auth system to use Resend (magic links)

### Phase 3: Environment Updates
```env
# Remove old Gmail config
# EMAIL_USER=xxx
# EMAIL_PASSWORD=xxx

# Add Resend config
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM_DOMAIN={newbrand}.com
```

### Phase 4: Testing
1. [ ] Test lead notification emails
2. [ ] Test magic link emails
3. [ ] Verify deliverability (check spam scores)
4. [ ] Test dynamic sender addresses

## Resend Pricing Reference

| Plan | Emails/Month | Price | Notes |
|------|-------------|-------|-------|
| Free | 3,000 | $0 | Good for MVP/testing |
| Pro | 50,000 | $20/mo | Good for launch |
| Pro | 100,000 | $40/mo | Scale as needed |

## DNS Records Needed

When verifying domain in Resend, you'll add:
- SPF record (TXT)
- DKIM records (CNAME x3)
- Optional: DMARC record (TXT)

Resend provides these automatically in their dashboard.

## Related Files

- Current notify-lead API: `/app/api/notify-lead/route.ts`
- Auth config: `/src/lib/auth/authConfig.ts`
- Reference Resend implementation: `/Users/thomasmusial/Desktop/javascript_projects/easy-money/frontend/src/lib/auth/authConfig.ts`

---

*Last updated: January 2026*
*Author: Claude (pair programming session)*
