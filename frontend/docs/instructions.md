# Intelligent Chatbot Lead Generator - MVP Overview

## What It Does
Conversational lead capture chatbot that:
1. **Asks guided questions** (sell/buy/browse flows with buttons + free text)
2. **Tracks progress visually** (gamified with animations, confetti, real-time insights)
3. **Generates personalized landing page** instantly upon completion using user answers + RAG (Qdrant semantic search)
4. **Delivers instant value** - custom action plans, advice, market insights tailored to their situation

## How It Works
```
User clicks "Start" 
→ Selects flow (sell/buy/browse)
→ Answers 5-6 questions (mix of buttons + text input)
→ Tracker shows progress + insights
→ On completion: calls /api/test-component
→ Generates personalized landing page (action plans, advice, offers)
→ User sees results immediately
```

**Tech Stack:**
- Frontend: Next.js, Zustand stores (chatStore, conversationConfig)
- Backend: OpenAI GPT-4 + RAG (Qdrant vector DB with embeddings)
- Personalization: Agent advice scenarios matched via rules + semantic search

## Current MVP Status
✅ **Working:**
- Full conversation flows with tracking
- Button + free text answers
- Progress tracking & gamification
- API generates landing page on completion
- Admin dashboards (conversation editor, advice uploader)

⚠️ **Current Limitations:**
- Landing page uses **preset components with hardcoded props**
- LLM generates content, but layout/structure is fixed
- No dynamic component selection yet

## What Clients Can Customize (Admin Dashboard)
1. **Conversation flows** - Questions, buttons, order, tracker messages
2. **Agent advice** - Upload expert knowledge that personalizes responses
3. **Action steps** - Define steps shown in results (rule-based matching)

## Feedback Page - Implementation Guide

### Goal
Collect client feedback on:
- What results/offers they want to show users
- What they can actually provide (services, resources)
- Desired landing page structure

### Suggested Structure

**Page Layout:**
```tsx
<FeedbackForm>
  <Section title="About Your Business">
    - What services do you offer?
    - What's your unique value prop?
    - What outcomes can you deliver?
  </Section>

  <Section title="Desired Results Page">
    - What should users see after completing chat?
    - Which components matter most? (action plan, pricing, testimonials, etc.)
    - Example: Upload screenshot or describe ideal page
  </Section>

  <Section title="Lead Data Needs">
    - What info do you need from leads?
    - Current flow captures: {list fields from userInput}
    - Additional fields needed?
  </Section>

  <Section title="Content & Assets">
    - Can you provide agent bio/photo?
    - Testimonials available?
    - Pricing tiers?
    - Sample properties/listings?
  </Section>

  <Section title="Priority & Next Steps">
    - What's most important to launch?
    - Timeline expectations?
    - Budget for custom features?
  </Section>
</FeedbackForm>
```

### Implementation

**File: `/app/feedback/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    businessServices: '',
    desiredResults: '',
    leadDataNeeds: '',
    contentAssets: '',
    priorities: '',
    email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send to your email or save to DB
    await fetch('/api/submit-feedback', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    alert('Feedback submitted!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">MVP Feedback</h1>
        <p className="text-gray-600 mb-8">
          Help us customize the chatbot to perfectly match your business needs
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repeat for each section with textarea inputs */}
          <div>
            <label className="block font-semibold mb-2">
              1. What services/outcomes do you provide?
            </label>
            <textarea
              className="w-full border rounded-lg p-3"
              rows={4}
              value={formData.businessServices}
              onChange={(e) => setFormData({...formData, businessServices: e.target.value})}
              placeholder="E.g., Home valuations, buyer consultations, market reports..."
            />
          </div>

          {/* Add more sections... */}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
```

**API Route: `/app/api/submit-feedback/route.ts`**

```ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; // or your email service

export async function POST(req: Request) {
  const feedback = await req.json();
  
  // Email to yourself
  const transporter = nodemailer.createTransport({...});
  await transporter.sendMail({
    to: 'you@example.com',
    subject: 'New Client Feedback',
    html: `<pre>${JSON.stringify(feedback, null, 2)}</pre>`,
  });
  
  return NextResponse.json({ success: true });
}
```

## Key Questions for Clients

1. **Results Priority:** What matters most on the results page?
   - Action plan with next steps?
   - Instant valuation/pricing?
   - Schedule consultation CTA?
   - Market insights?

2. **Content Ownership:** What can you provide?
   - Agent expertise (for RAG knowledge base)
   - Testimonials, case studies
   - Photos, logos, branding

3. **Customization Level:** How much do you want to control?
   - Just content (easy)
   - Question flows (medium)
   - Full page layouts (complex)

## Next Steps for Dev
1. Create `/feedback` page with form
2. Set up email/DB submission
3. Share MVP link with clients
4. Collect feedback on desired results
5. Prioritize component development based on feedback

---

**Tip:** Show clients the current results page, then ask: "What would you change/add/remove?"