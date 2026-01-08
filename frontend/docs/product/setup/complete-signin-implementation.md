# Complete Sign-In Implementation Guide

Step-by-step guide to replace your old login system with this NextAuth email magic link authentication. Includes exact file structures and code.

---

## Prerequisites

Before starting, ensure you have:
- Next.js 16+ with App Router
- MongoDB database (local or cloud)
- SMTP email server credentials (Gmail, SendGrid, Resend, etc.)
- TypeScript configured

---

## Step 1: Install Dependencies

Add these to your `package.json` dependencies:

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.30",
    "@auth/mongodb-adapter": "^3.11.1",
    "mongodb": "^6.20.0",
    "lucide-react": "^0.552.0",
    "framer-motion": "^12.23.24"
  }
}
```

Then run:
```bash
npm install
```

**Note:** If you don't use `framer-motion` or `lucide-react`, you can remove those dependencies and update the sign-in page accordingly.

---

## Step 2: Set Up Environment Variables

Add to your `.env.local` file:

```env
# NextAuth Configuration
AUTH_SECRET=your-secret-key-here
# Generate with: openssl rand -base64 32

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-database
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# SMTP Configuration (for email magic links)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

**Important:**
- **AUTH_SECRET**: Generate a secure random string: `openssl rand -base64 32`
- **SMTP_PASSWORD**: For Gmail, use an "App Password" (not your regular password). Enable 2FA first, then generate an app password.

---

## Step 3: Create MongoDB Client Promise

**File:** `src/lib/mongodb/clientPromise.ts`

Create this file with the exact structure:

```typescript
// MongoDB client promise for NextAuth adapter
import { MongoClient } from 'mongodb';
import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' });

if (!process.env.MONGODB_URI!) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use global caching in development to prevent hot reload issues
if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

**What this does:**
- Creates a MongoDB client connection
- Caches the connection in development to prevent multiple connections during hot reloads
- Creates a fresh connection in production

**Note:** If your `.env` file is in a different location, adjust the `dotenv.config({ path: '../../.env' })` line accordingly.

---

## Step 4: Create NextAuth Configuration

**File:** `src/lib/auth/authConfig.ts`

Create this file with the exact structure:

```typescript
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import EmailProvider from "next-auth/providers/email";
import clientPromise from "@/lib/mongodb/clientPromise";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true, // Required for NextAuth v5
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If callbackUrl is provided, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Redirect to callback page which will check onboarding status
      // This allows us to check MongoDB asynchronously
      return `${baseUrl}/auth/callback`;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
});
```

**What this does:**
- Configures NextAuth with email provider
- Sets up MongoDB adapter for storing users and sessions
- Adds user ID to session object
- Configures redirect after login to `/auth/callback`
- Uses database sessions (more secure than JWT)

**Customization:**
- Change the redirect URL in the `redirect` callback if you don't need onboarding checks
- Modify the `session` callback to add more user data if needed

---

## Step 5: Create API Route Handler

**File:** `app/api/auth/[...nextauth]/route.ts`

Create this file with the exact structure:

```typescript
import { handlers } from "@/lib/auth/authConfig";

export const { GET, POST } = handlers;
```

**What this does:**
- Exports GET and POST handlers for all NextAuth endpoints
- Creates these routes automatically:
  - `GET /api/auth/signin` - Sign-in page
  - `POST /api/auth/signin/email` - Send magic link
  - `GET /api/auth/callback/email` - Verify magic link
  - `GET /api/auth/session` - Get current session
  - `POST /api/auth/signout` - Sign out
  - `GET /api/auth/csrf` - Get CSRF token

**Important:** The folder structure `[...nextauth]` is a Next.js catch-all route. Make sure the folder name is exactly `[...nextauth]`.

---

## Step 6: Update Root Layout

**File:** `app/layout.tsx`

Add `SessionProvider` to your root layout. If you already have a layout, add the import and wrap your children:

```typescript
"use client"

import { SessionProvider } from "next-auth/react";
// ... your other imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* Your existing content */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

**What this does:**
- Provides session context to all components
- Required for `useSession()` and `signIn()` to work
- Must be a client component (`"use client"`)

**Note:** If your layout is a server component, you may need to create a separate client component wrapper for SessionProvider.

---

## Step 7: Create Sign-In Page

**File:** `app/auth/signin/page.tsx`

Create this file with the exact structure:

```typescript
"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  // Check onboarding status after successful login
  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setCheckingOnboarding(true);
        try {
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedOnboarding) {
              // User has completed onboarding, redirect to dashboard
              router.push('/dashboard');
            } else {
              // User hasn't completed onboarding, redirect to onboarding
              router.push('/onboarding');
            }
          } else {
            // If check fails, default to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to onboarding on error
          router.push('/onboarding');
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingAndRedirect();
  }, [status, session, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      // Don't set callbackUrl - we'll handle redirect after checking onboarding status
      const result = await signIn("email", { 
        email,
        redirect: false,
      });
      
      if (result?.ok) {
        setEmailSent(true);
        // The useEffect will handle the redirect after session is established
      } else {
        console.error("Sign in error:", result?.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  // Show loading state while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-200">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Get Your Own Bot
            </h1>
            <p className="text-cyan-100/70">
              Sign in to create and customize your AI chatbot
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
              {error === "Configuration" && "There was a problem with the server configuration."}
              {error === "AccessDenied" && "Access denied. Please try again."}
              {error === "Verification" && "The verification token has expired or has already been used."}
              {!["Configuration", "AccessDenied", "Verification"].includes(error) && "An error occurred during sign in."}
            </div>
          )}

          {/* Email Sent Success Message */}
          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-center"
            >
              <Mail className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cyan-200 mb-2">
                Check your email!
              </h3>
              <p className="text-cyan-100/80 text-sm mb-4">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-cyan-200/60 text-xs">
                Click the link in the email to sign in. The link will expire in 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-200 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={isLoading || !email}
                whileHover={{ scale: isLoading || !email ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !email ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending magic link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Send magic link</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-cyan-200/60">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
```

**What this does:**
- Displays email input form
- Calls `signIn("email")` to send magic link
- Shows success message after email is sent
- Checks onboarding status after authentication
- Handles errors and displays them
- Redirects based on onboarding status

**Customization:**
- Replace "Get Your Own Bot" with your app name
- Update the onboarding check logic if you don't have onboarding
- Customize the styling to match your brand
- Remove `framer-motion` if you don't use it (remove `motion.` wrappers)

**Simplified version (without onboarding check):**
If you don't need onboarding checks, simplify the `useEffect`:

```typescript
useEffect(() => {
  if (status === 'authenticated' && session?.user?.id) {
    router.push(callbackUrl || '/dashboard');
  }
}, [status, session, router, callbackUrl]);
```

---

## Step 8: Create Callback Page

**File:** `app/auth/callback/page.tsx`

Create this file with the exact structure:

```typescript
// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Callback page that checks onboarding status and redirects accordingly
 * This is called after successful authentication via magic link
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedOnboarding) {
              // User has completed onboarding, redirect to dashboard
              router.push('/dashboard');
            } else {
              // User hasn't completed onboarding, redirect to onboarding
              router.push('/onboarding');
            }
          } else {
            // If check fails, default to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to onboarding on error
          router.push('/onboarding');
        } finally {
          setIsChecking(false);
        }
      } else if (status === 'unauthenticated') {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
      }
    };

    checkOnboardingAndRedirect();
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
        <p className="text-cyan-200">Setting up your account...</p>
      </div>
    </div>
  );
}
```

**What this does:**
- Handles redirect after user clicks magic link
- Checks if user is authenticated
- Checks onboarding status (if you have it)
- Redirects to appropriate page

**Simplified version (without onboarding):**
If you don't need onboarding checks:

```typescript
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Setting up your account...</p>
      </div>
    </div>
  );
}
```

---

## Step 9: Remove Old Login System

### Files to Remove/Replace:

1. **Old sign-in pages/routes**
   - Delete old login pages
   - Remove old authentication routes

2. **Old auth providers/contexts**
   - Remove old auth context providers
   - Remove old session management code

3. **Old API routes**
   - Remove old login/logout API routes
   - Remove old session check endpoints

4. **Update imports**
   - Replace old auth imports with NextAuth imports
   - Update components that use old auth

### Update Components Using Auth:

**Old way (example):**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout } = useAuth();
```

**New way:**
```typescript
import { useSession, signOut } from "next-auth/react";

const { data: session } = useSession();
// session.user.email, session.user.id, etc.
```

### Update API Routes:

**Old way (example):**
```typescript
const user = await getCurrentUser(req);
```

**New way:**
```typescript
import { auth } from "@/lib/auth/authConfig";

const session = await auth();
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.user?.id;
```

---

## Step 10: Test the Implementation

### Testing Checklist:

1. **Sign-In Page**
   - [ ] Visit `/auth/signin`
   - [ ] Page loads without errors
   - [ ] Email input works
   - [ ] Submit button is enabled/disabled correctly

2. **Email Sending**
   - [ ] Enter email and submit
   - [ ] "Check your email" message appears
   - [ ] Magic link email is received
   - [ ] Email contains correct link

3. **Magic Link**
   - [ ] Click magic link in email
   - [ ] Redirects to callback page
   - [ ] Session is created
   - [ ] Redirects to correct page (dashboard/onboarding)

4. **Session Management**
   - [ ] `useSession()` returns session data
   - [ ] `auth()` works in API routes
   - [ ] Protected routes work correctly

5. **Sign Out**
   - [ ] Sign out button works
   - [ ] Session is cleared
   - [ ] Redirects to sign-in page

---

## File Structure Summary

After implementation, your file structure should look like this:

```
your-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts              ← Step 5
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx                  ← Step 7
│   │   └── callback/
│   │       └── page.tsx                  ← Step 8
│   └── layout.tsx                        ← Step 6 (updated)
├── src/
│   └── lib/
│       ├── auth/
│       │   └── authConfig.ts             ← Step 4
│       └── mongodb/
│           └── clientPromise.ts           ← Step 3
├── .env.local                             ← Step 2
└── package.json                            ← Step 1 (updated)
```

---

## Common Issues & Solutions

### Issue: "Invalid/Missing AUTH_SECRET"
**Solution:** Generate a secret: `openssl rand -base64 32` and add to `.env.local`

### Issue: Email Not Sending
**Solution:**
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check spam folder
- Test SMTP connection separately

### Issue: "Module not found: @/lib/auth/authConfig"
**Solution:** Check your TypeScript path aliases in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Session Not Persisting
**Solution:**
- Ensure `session.strategy: 'database'` is set
- Check MongoDB connection
- Verify `sessions` collection exists in MongoDB

### Issue: Redirect Loop
**Solution:**
- Check callback page logic
- Ensure onboarding status API exists (or remove the check)
- Verify redirect URLs are correct

---

## Customization Options

### Change Redirect After Login

In `src/lib/auth/authConfig.ts`, modify the `redirect` callback:

```typescript
async redirect({ url, baseUrl }) {
  if (url.startsWith(baseUrl)) {
    return url;
  }
  // Change this to your desired redirect
  return `${baseUrl}/dashboard`;
},
```

### Add More User Data to Session

In `src/lib/auth/authConfig.ts`, modify the `session` callback:

```typescript
async session({ session, user }) {
  if (session.user) {
    session.user.id = user.id;
    // Fetch additional user data from MongoDB
    const db = (await clientPromise).db();
    const userData = await db.collection('users').findOne({ _id: user.id });
    session.user.customField = userData?.customField;
  }
  return session;
},
```

### Customize Sign-In Page Styling

Update the Tailwind classes in `app/auth/signin/page.tsx` to match your brand colors and design.

---

## Next Steps

After implementing the sign-in system:

1. **Protect Routes** - Add middleware to protect routes
2. **Add Sign Out** - Create a sign-out button/functionality
3. **User Profile** - Display user info using `useSession()`
4. **Admin Routes** - Add admin role checks if needed

---

## Summary

You've now replaced your old login system with NextAuth email magic link authentication. The system includes:

✅ Email-based authentication (no passwords)  
✅ MongoDB session storage  
✅ Automatic user creation  
✅ Secure magic links  
✅ Session management  
✅ Type-safe implementation  

All 6 core files are in place and the system is ready to use!

