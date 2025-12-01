# Payment Tiers, Multi-Domain & Iframe Embedding Guide

This guide covers three critical aspects for deploying your SaaS:
1. **Payment & Subscription Tiers** - Stripe integration with tiered plans
2. **Multi-Domain Support** - Allowing different domains to point to your app
3. **Iframe Embedding** - Making your app embeddable in iframes

---

## 1. Payment & Subscription Tiers

### Overview
Your app already has a `plan` field in `AgentDocument` but no payment integration. We'll use Stripe for subscriptions.

### Step 1: Install Stripe Dependencies

```bash
cd frontend
npm install stripe @stripe/stripe-js
npm install -D @types/stripe
```

### Step 2: Environment Variables

Add to your `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription Plans (IDs from Stripe Dashboard)
STRIPE_PLAN_FREE=price_...
STRIPE_PLAN_BASIC=price_...
STRIPE_PLAN_PRO=price_...
STRIPE_PLAN_ENTERPRISE=price_...
```

### Step 3: Create Subscription Plans in Stripe Dashboard

1. Go to Stripe Dashboard → Products
2. Create 4 products:
   - **Free**: $0/month (or trial)
   - **Basic**: $29/month
   - **Pro**: $99/month
   - **Enterprise**: Custom pricing
3. Copy the Price IDs to your `.env`

### Step 4: Update MongoDB Schema

Update `src/lib/mongodb/models.ts`:

```typescript
export interface AgentDocument {
  // ... existing fields ...
  
  // Subscription/Plan
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  planStartDate?: Date;
  planEndDate?: Date;
  
  // Stripe Integration
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  
  // Feature Limits (based on plan)
  featureLimits?: {
    maxLeads?: number;
    maxConversations?: number;
    maxOffers?: number;
    maxKnowledgeBaseItems?: number;
    customDomain?: boolean;
    whiteLabel?: boolean;
    apiAccess?: boolean;
  };
}
```

### Step 5: Create Stripe API Routes

**`app/api/stripe/create-checkout/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import Stripe from 'stripe';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();
    
    // Get user's current config
    const collection = await getClientConfigsCollection();
    const config = await collection.findOne({ userId: session.user.id });
    
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = config.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
      
      // Save customer ID
      await collection.updateOne(
        { userId: session.user.id },
        { $set: { stripeCustomerId: customerId } }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**`app/api/stripe/webhook/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getClientConfigsCollection } from '@/lib/mongodb/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const collection = await getClientConfigsCollection();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        
        await collection.updateOne(
          { userId },
          {
            $set: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeStatus: subscription.status,
              plan: getPlanFromPriceId(subscription.items.data[0].price.id),
              planStartDate: new Date(subscription.current_period_start * 1000),
              planEndDate: new Date(subscription.current_period_end * 1000),
            },
          }
        );
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      const config = await collection.findOne({
        stripeCustomerId: customer.id,
      });
      
      if (config) {
        await collection.updateOne(
          { userId: config.userId },
          {
            $set: {
              stripeStatus: subscription.status,
              plan: subscription.status === 'active' 
                ? getPlanFromPriceId(subscription.items.data[0].price.id)
                : 'free',
              planEndDate: new Date(subscription.current_period_end * 1000),
            },
          }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId: string): 'free' | 'basic' | 'pro' | 'enterprise' {
  if (priceId === process.env.STRIPE_PLAN_BASIC) return 'basic';
  if (priceId === process.env.STRIPE_PLAN_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PLAN_ENTERPRISE) return 'enterprise';
  return 'free';
}
```

### Step 6: Create Subscription Management Component

**`src/components/dashboard/user/subscription/SubscriptionManager.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['10 leads/month', 'Basic offers', 'Standard support'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    features: ['100 leads/month', 'All offers', 'Email support', 'Custom branding'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    features: ['Unlimited leads', 'All offers', 'Priority support', 'Custom domain', 'API access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: ['Everything in Pro', 'White label', 'Dedicated support', 'Custom integrations'],
  },
];

export function SubscriptionManager() {
  const { config, refetch } = useUserConfig();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const priceId = process.env[`NEXT_PUBLIC_STRIPE_PLAN_${planId.toUpperCase()}`];
      if (!priceId) {
        alert('Plan not configured');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {PLANS.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-6">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-3xl font-bold my-4">
            ${plan.price}
            {typeof plan.price === 'number' && <span className="text-sm">/mo</span>}
          </p>
          <ul className="space-y-2 mb-4">
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade(plan.id)}
            disabled={loading === plan.id || config?.plan === plan.id}
            className="w-full py-2 bg-blue-500 text-white rounded"
          >
            {loading === plan.id ? 'Loading...' : config?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 2. Multi-Domain Support

### Overview
Allow different domains to point to your app and serve different client configurations.

### Step 1: Update Next.js Config

**`next.config.ts`**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow multiple domains
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Will be overridden for iframe embedding
          },
        ],
      },
    ];
  },
  
  // Allow images from any domain (for client logos)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

### Step 2: Create Domain-to-Client Mapping

**`src/lib/domains/domainResolver.ts`**:
```typescript
import { getClientConfigsCollection } from '@/lib/mongodb/db';

export interface DomainConfig {
  domain: string;
  clientId: string;
  businessName: string;
  isActive: boolean;
}

/**
 * Resolve client configuration from domain
 */
export async function resolveClientFromDomain(hostname: string): Promise<DomainConfig | null> {
  const collection = await getClientConfigsCollection();
  
  // Try exact match first
  let config = await collection.findOne({
    customDomain: hostname,
    isActive: true,
  });
  
  // Try subdomain match (e.g., client1.yourdomain.com)
  if (!config) {
    const subdomain = hostname.split('.')[0];
    config = await collection.findOne({
      businessName: subdomain,
      isActive: true,
    });
  }
  
  if (!config) return null;
  
  return {
    domain: hostname,
    clientId: config._id?.toString() || '',
    businessName: config.businessName,
    isActive: config.isActive,
  };
}

/**
 * Get all configured domains for admin
 */
export async function getAllDomainConfigs(): Promise<DomainConfig[]> {
  const collection = await getClientConfigsCollection();
  const configs = await collection
    .find({ isActive: true, customDomain: { $exists: true, $ne: null } })
    .toArray();
  
  return configs.map((config) => ({
    domain: config.customDomain || '',
    clientId: config._id?.toString() || '',
    businessName: config.businessName,
    isActive: config.isActive,
  }));
}
```

### Step 3: Create Middleware for Domain Resolution

**`middleware.ts`** (root of `frontend/`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveClientFromDomain } from '@/lib/domains/domainResolver';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Skip for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Resolve client from domain
  const domainConfig = await resolveClientFromDomain(hostname);
  
  if (domainConfig) {
    // Add client identifier to headers for use in pages
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-client-id', domainConfig.clientId);
    requestHeaders.set('x-business-name', domainConfig.businessName);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 4: Update Client Config Model

Add to `src/lib/mongodb/models.ts` or create new model:

```typescript
export interface ClientConfigDocument {
  _id?: ObjectId;
  userId: string;
  businessName: string;
  
  // Domain Configuration
  customDomain?: string; // e.g., "client1.com"
  subdomain?: string; // e.g., "client1" for client1.yourdomain.com
  
  // ... existing fields ...
}
```

### Step 5: Create Domain Management API

**`app/api/admin/domains/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { getAllDomainConfigs } from '@/lib/domains/domainResolver';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check
    const domains = await getAllDomainConfigs();
    return NextResponse.json({ domains });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, domain } = await req.json();
    const collection = await getClientConfigsCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(clientId) },
      { $set: { customDomain: domain } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}
```

### Step 6: DNS Configuration Guide

For each client domain:
1. **CNAME Record**: Point `client1.com` → `your-app.vercel.app` (or your hosting)
2. **A Record** (alternative): Point to your server IP
3. **SSL Certificate**: Your hosting provider (Vercel, etc.) will auto-provision SSL

---

## 3. Iframe Embedding

### Overview
Make your app embeddable in iframes for white-label integration.

### Step 1: Update Next.js Config for Iframe Support

**`next.config.ts`** (update):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allow embedding in any iframe
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;", // Allow all parent frames
          },
        ],
      },
    ];
  },
  
  // ... rest of config
};

export default nextConfig;
```

### Step 2: Create Iframe-Compatible Layout

**`app/embed/layout.tsx`**:
```typescript
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 3: Create Embeddable Bot Page

**`app/embed/bot/[clientId]/page.tsx`**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';
import { useSearchParams } from 'next/navigation';

export default function EmbedBotPage({ params }: { params: { clientId: string } }) {
  const searchParams = useSearchParams();
  const [clientConfig, setClientConfig] = useState<any>(null);

  useEffect(() => {
    // Fetch client config
    fetch(`/api/client/${params.clientId}`)
      .then((res) => res.json())
      .then((data) => setClientConfig(data.config));
  }, [params.clientId]);

  if (!clientConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ChatWithTracker clientConfig={clientConfig} />
    </div>
  );
}
```

### Step 4: Create Embed Code Generator

**`app/api/embed/generate-code/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const width = searchParams.get('width') || '100%';
    const height = searchParams.get('height') || '600px';

    const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/embed/bot/${clientId}`;
    
    const embedCode = `
<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="clipboard-read; clipboard-write"
  style="border: none;"
></iframe>
    `.trim();

    return NextResponse.json({ embedCode, embedUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate embed code' }, { status: 500 });
  }
}
```

### Step 5: Add Embed Settings to Dashboard

**`src/components/dashboard/user/embed/EmbedSettings.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';

export function EmbedSettings() {
  const { config } = useUserConfig();
  const [embedCode, setEmbedCode] = useState('');
  const [dimensions, setDimensions] = useState({ width: '100%', height: '600px' });

  const generateEmbedCode = async () => {
    const response = await fetch(
      `/api/embed/generate-code?clientId=${config?.id}&width=${dimensions.width}&height=${dimensions.height}`
    );
    const { embedCode } = await response.json();
    setEmbedCode(embedCode);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Embed Your Bot</h2>
      
      <div className="space-y-2">
        <label>Width</label>
        <input
          type="text"
          value={dimensions.width}
          onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
          className="border rounded p-2"
        />
      </div>
      
      <div className="space-y-2">
        <label>Height</label>
        <input
          type="text"
          value={dimensions.height}
          onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
          className="border rounded p-2"
        />
      </div>
      
      <button onClick={generateEmbedCode} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Embed Code
      </button>
      
      {embedCode && (
        <div className="space-y-2">
          <label>Embed Code:</label>
          <textarea
            value={embedCode}
            readOnly
            className="w-full h-32 border rounded p-2 font-mono text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Handle PostMessage Communication (Optional)

For better iframe integration, add postMessage support:

**`src/lib/embed/postMessage.ts`**:
```typescript
/**
 * PostMessage communication for iframe embedding
 */

export interface EmbedMessage {
  type: 'resize' | 'complete' | 'error' | 'data';
  payload?: any;
}

export function sendMessageToParent(message: EmbedMessage) {
  if (typeof window !== 'undefined' && window.parent) {
    window.parent.postMessage(message, '*'); // In production, use specific origin
  }
}

export function listenToParentMessages(callback: (message: EmbedMessage) => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      // In production, verify event.origin
      callback(event.data);
    });
  }
}
```

---

## Deployment Checklist

### Payment Integration
- [ ] Set up Stripe account and get API keys
- [ ] Create subscription products in Stripe Dashboard
- [ ] Add Stripe environment variables
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test checkout flow
- [ ] Test webhook events

### Multi-Domain
- [ ] Update Next.js config
- [ ] Create domain resolver
- [ ] Set up middleware
- [ ] Test with different domains
- [ ] Configure DNS for client domains
- [ ] Verify SSL certificates

### Iframe Embedding
- [ ] Update headers in Next.js config
- [ ] Create embed routes
- [ ] Test iframe embedding
- [ ] Add embed code generator
- [ ] Test cross-origin scenarios
- [ ] Add postMessage support (optional)

---

## Security Considerations

1. **Iframe Embedding**: Use `frame-ancestors` CSP directive to restrict which domains can embed your app
2. **Domain Validation**: Verify domain ownership before allowing custom domains
3. **Webhook Security**: Always verify Stripe webhook signatures
4. **CORS**: Configure CORS properly for API endpoints
5. **Rate Limiting**: Add rate limiting for subscription endpoints

---

## Testing

### Test Payment Flow
```bash
# Use Stripe test cards
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

### Test Multi-Domain
1. Add test domain to MongoDB
2. Configure local hosts file: `127.0.0.1 test-client.local`
3. Access `http://test-client.local:3000`

### Test Iframe
```html
<!-- Test page -->
<iframe src="http://localhost:3000/embed/bot/[clientId]" width="100%" height="600px"></iframe>
```

---

## Next Steps

1. Implement feature gating based on subscription tiers
2. Add usage limits enforcement
3. Create admin dashboard for domain management
4. Add analytics for embedded usage
5. Implement domain verification system

