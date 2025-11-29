# Authentication Pattern

## Overview

This application uses NextAuth.js for authentication, providing session management, protected routes, and user authentication flows.

## When to Use

- User login/logout
- Protected routes
- Session management
- User-specific data access
- API route authentication

## Implementation

### NextAuth Configuration

**File:** `frontend/src/lib/auth/authConfig.ts`

```typescript
import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
```

### API Route Handler

**File:** `frontend/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authConfig";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

## Code Examples

### Protected Page

**File:** `frontend/src/app/form/page.tsx`

```typescript
"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const FormPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div>
      {/* Protected content */}
    </div>
  );
};

export default FormPage;
```

### Protected API Route

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authConfig";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Use session.user.email or session.user.id
  const userEmail = session.user.email;
  
  // Process authenticated request
}
```

### Using Session in Components

```typescript
"use client"

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please sign in</div>;
  
  return (
    <div>
      <p>Signed in as {session?.user?.email}</p>
    </div>
  );
}
```

## Common Patterns

### Redirect After Sign In

```typescript
const router = useRouter();
const { data: session } = useSession();

useEffect(() => {
  if (session) {
    router.push('/dashboard');
  }
}, [session, router]);
```

### Sign Out

```typescript
import { signOut } from "next-auth/react";

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/auth/signin' });
};
```

### Session Provider Setup

**File:** `frontend/src/app/layout.tsx`

```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Common Pitfalls

1. **Not checking session status**
   - Always check `status === "loading"` before rendering
   - Handle `unauthenticated` state

2. **Not protecting API routes**
   - Always verify session in API routes
   - Don't trust client-side checks alone

3. **Not handling session refresh**
   - Sessions expire
   - Handle token refresh automatically

4. **Not securing session data**
   - Don't expose sensitive data in session
   - Use server-side session checks

## Variations

### Custom Sign In Page

```typescript
// app/auth/signin/page.tsx
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <button onClick={() => signIn('google')}>
      Sign in with Google
    </button>
  );
}
```

### Role-Based Access

```typescript
// Add role to session
callbacks: {
  async session({ session, user }) {
    session.user.role = user.role; // From database
    return session;
  },
},

// Check role in API route
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Related Patterns

- [API Route Patterns](./api-routes.md) - Authentication in API routes
- [Database Operations](./database-operations.md) - Storing user data
- [State Management](./state-management.md) - User state management
