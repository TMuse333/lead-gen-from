# Personalized Video Generation Plan

> Generate unique, personalized video timelines for each lead - transforming a PDF/landing page into an engaging video experience.

## Overview

This feature generates a personalized video for each lead who completes the chatbot flow. Instead of just receiving a static timeline, users get a professional video walkthrough of their home buying/selling journey, personalized with their name, location, budget, and timeline.

**Value Proposition:**
- Dramatically higher engagement than PDF/email
- "Wow factor" that makes agents stand out
- Premium feature that justifies higher pricing tier
- Shareable content leads can show family/friends

---

## Video API Options Comparison

### Option 1: AI Avatar Videos

**Services:** Synthesia, HeyGen, D-ID

| Aspect | Details |
|--------|---------|
| How it works | AI avatar "speaks" personalized script |
| Pros | Professional, personal feel, can use agent likeness |
| Cons | Expensive, uncanny valley risk, slower rendering |
| Cost | $1-4 per minute of video |
| Render time | 2-5 minutes |
| Best for | High-touch, low-volume leads |

**API Example (HeyGen):**
```typescript
const response = await fetch('https://api.heygen.com/v2/video/generate', {
  method: 'POST',
  headers: {
    'X-Api-Key': process.env.HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: 'agent_sarah_custom', // Custom avatar from agent's photo
      },
      voice: {
        type: 'text',
        input_text: `Hi ${userName}, congratulations on starting your home buying journey in ${location}! Based on your ${budget} budget...`,
        voice_id: 'professional_female_1',
      },
      background: {
        type: 'image',
        url: 'https://yourdomain.com/backgrounds/real-estate-bg.jpg',
      },
    }],
    dimension: { width: 1920, height: 1080 },
  }),
});
```

---

### Option 2: Template Video Personalization

**Services:** Tavus, Rephrase.ai, BHuman

| Aspect | Details |
|--------|---------|
| How it works | Agent records once, AI personalizes lip-sync for each lead |
| Pros | Uses agent's REAL face/voice, most authentic |
| Cons | Requires agent to record template, lip-sync limitations |
| Cost | $0.50-2 per video |
| Render time | 1-3 minutes |
| Best for | Authentic agent presence at scale |

**How Tavus Works:**
```
1. Agent records: "Hi [NAME], I'm excited to help you find a home in [LOCATION]..."
2. Upload to Tavus, mark variable sections
3. API call with variables → AI generates personalized version
4. Agent's lips sync to personalized audio
```

**API Example (Tavus):**
```typescript
const response = await fetch('https://api.tavus.io/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.TAVUS_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: 'agent_timeline_intro',
    variables: {
      name: 'John',
      location: 'Halifax, NS',
      budget: '$425,000',
      timeline: '6 months',
    },
    webhook_url: 'https://yourdomain.com/api/webhooks/video-complete',
  }),
});
```

---

### Option 3: Automated Video Assembly (Recommended)

**Services:** Shotstack, Creatomate, Remotion

| Aspect | Details |
|--------|---------|
| How it works | Assemble video from templates, footage, text, voiceover |
| Pros | Full control, cheapest, consistent, no uncanny valley |
| Cons | Less "personal" (no face), requires template design |
| Cost | $0.05-0.30 per video |
| Render time | 30 seconds - 2 minutes |
| Best for | Scale, consistency, full brand control |

**This is the recommended approach for this project.**

---

## Recommended Architecture: Shotstack + ElevenLabs

### Why This Stack?

| Component | Service | Why |
|-----------|---------|-----|
| Video Assembly | Shotstack | Best API, good pricing, reliable |
| Voice Generation | ElevenLabs | Natural voices, fast, reasonable cost |
| Storage | AWS S3 / Cloudflare R2 | Cheap, fast CDN delivery |
| Processing | Background job queue | Async rendering, webhook notifications |

### Cost Breakdown Per Video

| Component | Cost |
|-----------|------|
| Shotstack render (2 min video) | $0.10-0.20 |
| ElevenLabs voice (~500 chars) | $0.15-0.25 |
| Storage (50MB video, 30 days) | $0.01 |
| **Total per video** | **$0.26-0.46** |

At 1,000 videos/month: **$260-460/month**

---

## Video Template Structure

### Scene Breakdown (2-minute video)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VIDEO TEMPLATE STRUCTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SCENE 1: Intro (0:00 - 0:08)                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ - Agent logo/branding animation                              │    │
│  │ - Background: City skyline or real estate imagery            │    │
│  │ - Text: "Your Personalized Home Buying Timeline"             │    │
│  │ - Music: Upbeat, professional intro                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  SCENE 2: Personalized Greeting (0:08 - 0:20)                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ - Voiceover: "Hi {name}, congratulations on starting your    │    │
│  │   home buying journey in {location}!"                        │    │
│  │ - Visual: Map pin dropping on their location                 │    │
│  │ - Text overlay: "{name}'s Timeline" + "{location}"           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  SCENE 3: Situation Summary (0:20 - 0:35)                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ - Voiceover: "Based on your {budget} budget and {timeline}   │    │
│  │   timeframe, here's your personalized roadmap..."            │    │
│  │ - Visual: Animated icons for budget, timeline, property type │    │
│  │ - Stats display: Budget | Timeline | Property Type           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  SCENES 4-9: Phase Walkthroughs (0:35 - 1:35)                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ For each phase (~10 seconds each):                           │    │
│  │ - Phase icon animation                                       │    │
│  │ - Phase name + timeline ("Week 1-2")                         │    │
│  │ - Voiceover: Brief description                               │    │
│  │ - 2-3 key action items as bullet points                      │    │
│  │ - Transition to next phase                                   │    │
│  │                                                              │    │
│  │ Phases:                                                      │    │
│  │ 1. Financial Preparation                                     │    │
│  │ 2. Find Your Agent                                           │    │
│  │ 3. House Hunting                                             │    │
│  │ 4. Make an Offer                                             │    │
│  │ 5. Under Contract                                            │    │
│  │ 6. Closing Day                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  SCENE 10: Agent Highlight (1:35 - 1:50)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ - Agent photo with frame                                     │    │
│  │ - Voiceover: "I'm {agentName}, and I'll be guiding you       │    │
│  │   through every step of this journey."                       │    │
│  │ - Credentials: Years experience, transactions, specialties   │    │
│  │ - Optional: Quick testimonial quote                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  SCENE 11: CTA + Outro (1:50 - 2:00)                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ - Voiceover: "Ready to get started? Book a call or view      │    │
│  │   your full interactive timeline."                           │    │
│  │ - Visual: QR code to timeline page                           │    │
│  │ - Contact info: Phone, email, website                        │    │
│  │ - Agent logo + "Your journey starts here"                    │    │
│  │ - Music: Resolve, fade out                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Template Variables

```typescript
interface VideoTemplateVariables {
  // Lead info
  userName: string;
  userEmail?: string;

  // Situation
  location: string;
  budget: string;
  timeline: string;
  propertyType: string;
  isFirstTime: boolean;

  // Phases (dynamic)
  phases: {
    name: string;
    timeline: string;
    description: string;
    keyActions: string[]; // Top 2-3 actions
  }[];

  // Agent info
  agentName: string;
  agentPhoto: string;
  agentCompany: string;
  agentPhone?: string;
  agentEmail?: string;
  agentYearsExperience?: number;

  // Branding
  primaryColor: string;
  logoUrl: string;

  // Generated
  timelinePageUrl: string;
  qrCodeUrl: string;
}
```

---

## Technical Implementation

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VIDEO GENERATION SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │ User completes│                                                   │
│  │ chatbot flow  │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │ Generate     │────▶│ Queue Video  │────▶│ Background   │        │
│  │ Timeline     │     │ Job          │     │ Worker       │        │
│  │ (existing)   │     │              │     │              │        │
│  └──────────────┘     └──────────────┘     └──────┬───────┘        │
│                                                    │                 │
│                              ┌─────────────────────┼─────────────┐  │
│                              │                     │             │  │
│                              ▼                     ▼             │  │
│                       ┌──────────────┐     ┌──────────────┐     │  │
│                       │ ElevenLabs   │     │ Generate     │     │  │
│                       │ Generate     │     │ QR Code      │     │  │
│                       │ Voiceover    │     │              │     │  │
│                       └──────┬───────┘     └──────┬───────┘     │  │
│                              │                     │             │  │
│                              └──────────┬──────────┘             │  │
│                                         │                        │  │
│                                         ▼                        │  │
│                              ┌──────────────────┐                │  │
│                              │ Shotstack API    │                │  │
│                              │ Render Video     │                │  │
│                              │ (async)          │                │  │
│                              └────────┬─────────┘                │  │
│                                       │                          │  │
│                                       ▼                          │  │
│                              ┌──────────────────┐                │  │
│                              │ Webhook:         │                │  │
│                              │ Video Complete   │                │  │
│                              └────────┬─────────┘                │  │
│                                       │                          │  │
│                    ┌──────────────────┼──────────────────┐       │  │
│                    │                  │                  │       │  │
│                    ▼                  ▼                  ▼       │  │
│           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│           │ Store in S3  │  │ Update DB    │  │ Send Email   │  │  │
│           │              │  │ with URL     │  │ Notification │  │  │
│           └──────────────┘  └──────────────┘  └──────────────┘  │  │
│                                                                  │  │
└──────────────────────────────────────────────────────────────────┘  │
```

### Database Schema

```typescript
// Video generation job tracking
interface VideoGenerationJob {
  id: string;

  // Relations
  agentId: string;
  leadId: string;
  timelineId: string;

  // Status
  status: 'queued' | 'generating_voice' | 'rendering' | 'complete' | 'failed';
  progress: number; // 0-100

  // External IDs
  elevenlabsRequestId?: string;
  shotstackRenderId?: string;

  // Results
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  fileSize?: number; // bytes

  // Metadata
  templateVersion: string;
  variables: VideoTemplateVariables;

  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date; // When video will be deleted

  // Error handling
  error?: string;
  retryCount: number;
}

// Agent video settings
interface AgentVideoSettings {
  agentId: string;

  // Feature flags
  videoGenerationEnabled: boolean;
  autoGenerateOnComplete: boolean;

  // Branding
  logoUrl?: string;
  primaryColor: string;
  backgroundStyle: 'modern' | 'classic' | 'minimal';

  // Voice
  voiceId: string; // ElevenLabs voice ID
  voiceStyle: 'professional' | 'friendly' | 'energetic';

  // Content
  includeAgentPhoto: boolean;
  includeQRCode: boolean;
  customOutroText?: string;

  // Limits
  monthlyVideoLimit: number;
  videosGeneratedThisMonth: number;
}
```

### API Routes

```typescript
// POST /api/video/generate
// Trigger video generation for a timeline
interface GenerateVideoRequest {
  timelineId: string;
  priority?: 'normal' | 'high';
}

// GET /api/video/status/:jobId
// Check video generation status
interface VideoStatusResponse {
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  videoUrl?: string;
  estimatedTimeRemaining?: number;
}

// GET /api/video/:videoId
// Get video details and signed URL
interface VideoResponse {
  id: string;
  videoUrl: string; // Signed URL, expires in 1 hour
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
  expiresAt: string;
}

// POST /api/webhooks/shotstack
// Webhook for Shotstack render completion
interface ShotstackWebhook {
  id: string;
  status: 'done' | 'failed';
  url?: string;
  error?: string;
}
```

### Shotstack Template (JSON)

```json
{
  "timeline": {
    "soundtrack": {
      "src": "https://yourdomain.com/audio/background-music.mp3",
      "effect": "fadeOut"
    },
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<div class='intro'>Your Personalized Timeline</div>",
              "css": ".intro { font-family: 'Inter'; font-size: 72px; color: white; }",
              "width": 1920,
              "height": 1080
            },
            "start": 0,
            "length": 5,
            "transition": { "in": "fade", "out": "fade" }
          },
          {
            "asset": {
              "type": "html",
              "html": "<div class='greeting'>Hi {{userName}}, welcome to your {{location}} home buying journey!</div>",
              "width": 1920,
              "height": 1080
            },
            "start": 5,
            "length": 8
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "video",
              "src": "https://yourdomain.com/backgrounds/real-estate-loop.mp4"
            },
            "start": 0,
            "length": 120
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "audio",
              "src": "{{voiceoverUrl}}"
            },
            "start": 5,
            "length": 110
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd",
    "fps": 30
  }
}
```

### Voice Generation (ElevenLabs)

```typescript
// lib/video/voiceover.ts
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function generateVoiceover(
  script: string,
  voiceId: string = 'default_professional'
): Promise<Buffer> {
  const audio = await client.generate({
    voice: voiceId,
    text: script,
    model_id: 'eleven_turbo_v2', // Faster, good quality
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.8,
    },
  });

  // Convert stream to buffer
  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function buildVoiceoverScript(variables: VideoTemplateVariables): string {
  const { userName, location, budget, timeline, phases, agentName } = variables;

  let script = `Hi ${userName}! Congratulations on starting your home buying journey in ${location}. `;
  script += `Based on your ${budget} budget and ${timeline} timeframe, I've created a personalized roadmap just for you. `;
  script += `Let's walk through the key phases. `;

  // Add phase summaries
  phases.forEach((phase, index) => {
    script += `Phase ${index + 1}: ${phase.name}. ${phase.description} `;
  });

  script += `I'm ${agentName}, and I'll be guiding you through every step of this journey. `;
  script += `Ready to get started? Book a call or view your full interactive timeline. Your dream home awaits!`;

  return script;
}
```

---

## Implementation Phases

### Phase 1: Foundation (1 week)

**Goal:** Basic video generation working end-to-end

- [ ] Set up Shotstack account and API keys
- [ ] Set up ElevenLabs account and API keys
- [ ] Create basic video template in Shotstack
- [ ] Build voiceover generation service
- [ ] Create background job queue (Bull/Redis or similar)
- [ ] Build `/api/video/generate` endpoint
- [ ] Build webhook handler for completion
- [ ] Set up S3/R2 storage for videos
- [ ] Create basic video status tracking

**Deliverables:**
- Can generate a basic 30-second video with personalized text
- Video stored and accessible via URL

### Phase 2: Template Polish (1 week)

**Goal:** Professional-looking video template

- [ ] Design full 2-minute template structure
- [ ] Create scene transitions and animations
- [ ] Add background music options
- [ ] Implement phase-by-phase walkthrough scenes
- [ ] Add agent branding section
- [ ] Create QR code generation for timeline link
- [ ] Build thumbnail generation
- [ ] Add multiple template style options

**Deliverables:**
- Professional 2-minute video template
- Customizable branding (colors, logo)
- Generated QR code linking to full timeline

### Phase 3: Integration (3-4 days)

**Goal:** Integrated into user flow

- [ ] Add "Generate Video" option after timeline creation
- [ ] Build video status/progress UI
- [ ] Create video player component
- [ ] Add video to timeline landing page
- [ ] Implement email notification when video ready
- [ ] Add video download option
- [ ] Build video sharing (social media links)

**Deliverables:**
- Users can opt-in to video generation
- Video embedded in timeline landing page
- Email notification with video link

### Phase 4: Agent Dashboard (3-4 days)

**Goal:** Agents can manage video settings

- [ ] Create video settings page in dashboard
- [ ] Upload custom logo
- [ ] Select brand colors
- [ ] Choose voice style
- [ ] Preview video template
- [ ] View video generation history
- [ ] Track monthly usage/limits

**Deliverables:**
- Full agent control over video branding
- Usage tracking and limits

### Phase 5: Optimization (Ongoing)

**Goal:** Scale and improve

- [ ] Implement caching for common assets
- [ ] Add video analytics (views, watch time)
- [ ] A/B test different templates
- [ ] Add more voice options
- [ ] Create seasonal/themed templates
- [ ] Implement video expiration/cleanup
- [ ] Add batch generation for multiple leads

---

## Cost Analysis

### Per-Video Costs

| Component | Cost | Notes |
|-----------|------|-------|
| ElevenLabs (500 chars) | $0.18 | ~500 characters for 2-min script |
| Shotstack render | $0.15 | 2-minute HD video |
| S3 storage (50MB, 30 days) | $0.01 | With cleanup |
| Bandwidth (1 view) | $0.01 | CloudFront/R2 |
| **Total per video** | **~$0.35** | |

### Monthly Projections

| Scale | Videos/Month | Video Cost | Potential Revenue |
|-------|--------------|------------|-------------------|
| Small | 100 | $35 | $100-200 premium |
| Medium | 1,000 | $350 | $1,000-2,000 premium |
| Large | 10,000 | $3,500 | $10,000-20,000 premium |

### Pricing Strategy

| Tier | Video Included | Overage |
|------|----------------|---------|
| Basic | 0 | N/A |
| Pro | 50/month | $1/video |
| Premium | 500/month | $0.75/video |
| Enterprise | Unlimited | Custom |

**Premium tier at +$100/month = 285 videos to break even at $0.35/video**

Most agents won't use 285 videos/month, so this is highly profitable.

---

## Alternative: AI Avatar Option

If you want to offer AI avatar videos as a premium option:

### HeyGen Integration

```typescript
// lib/video/heygen.ts
export async function generateAvatarVideo(
  script: string,
  avatarId: string,
  backgroundUrl: string
): Promise<string> {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: avatarId,
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: 'en-US-professional-female',
        },
        background: {
          type: 'image',
          url: backgroundUrl,
        },
      }],
      dimension: { width: 1920, height: 1080 },
    }),
  });

  const { video_id } = await response.json();
  return video_id;
}
```

**Cost:** $2-4 per video (vs $0.35 for template assembly)

**Use case:** Offer as "Ultra Premium" add-on for agents who want maximum personalization.

---

## Security Considerations

### Video Access Control

```typescript
// Signed URLs for video access
function generateSignedVideoUrl(videoId: string, expiresIn: number = 3600): string {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.VIDEO_BUCKET,
    Key: `videos/${videoId}.mp4`,
    Expires: expiresIn,
  });
}
```

### Rate Limiting

```typescript
// Prevent abuse
const VIDEO_LIMITS = {
  perAgent: {
    daily: 50,
    monthly: 500,
  },
  perLead: {
    total: 3, // Max regenerations per lead
  },
};
```

### Data Privacy

- Videos should expire after configurable period (30-90 days)
- Include option to delete video on request
- Don't store sensitive financial details in video (just ranges)
- Comply with GDPR right to deletion

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/video/shotstack.ts` | Shotstack API client |
| `lib/video/elevenlabs.ts` | ElevenLabs voice generation |
| `lib/video/templates.ts` | Video template definitions |
| `lib/video/voiceover.ts` | Script generation |
| `lib/video/qrcode.ts` | QR code generation |
| `app/api/video/generate/route.ts` | Trigger video generation |
| `app/api/video/[id]/route.ts` | Get video details |
| `app/api/video/status/[jobId]/route.ts` | Check job status |
| `app/api/webhooks/shotstack/route.ts` | Render completion webhook |
| `components/video/VideoPlayer.tsx` | Video player component |
| `components/video/VideoStatus.tsx` | Generation progress UI |
| `components/dashboard/VideoSettings.tsx` | Agent video settings |
| `workers/videoGeneration.ts` | Background job processor |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Video generation success rate | > 98% |
| Average render time | < 3 minutes |
| Video view rate (of generated) | > 60% |
| Average watch time | > 70% of video |
| Lead response rate (with video) | 2x vs without |
| Agent adoption (of those eligible) | > 40% |

---

## Summary

**Recommended Stack:**
- **Shotstack** for video assembly (full control, cheap)
- **ElevenLabs** for natural voiceover
- **S3/R2** for storage
- **Background jobs** for async processing

**Timeline:** 3-4 weeks for full implementation

**Cost:** ~$0.35 per video at scale

**Revenue potential:** $100-200/month premium per agent

**Key differentiator:** Most competitors offer static PDFs. A personalized video is a "wow" moment that agents can use as a selling point for their services.
