# Files Related to Sign-In/Login

Only the files directly involved in the sign-in/login process.

---

## Sign-In Flow Files (6 files)

### 1. **Sign-In Page** 
**`app/auth/signin/page.tsx`**
- User-facing sign-in page
- Email input form
- Calls `signIn("email")` to send magic link
- Shows "Check your email" message after submission
- Handles errors and redirects

### 2. **Auth Configuration**
**`src/lib/auth/authConfig.ts`**
- NextAuth configuration
- Email provider setup (SMTP)
- Session callbacks
- Redirect logic after login
- Exports `signIn`, `signOut`, `auth`, `handlers`

### 3. **API Route Handler**
**`app/api/auth/[...nextauth]/route.ts`**
- Handles all NextAuth API endpoints
- Creates `/api/auth/signin/email` endpoint (sends magic link)
- Creates `/api/auth/callback/email` endpoint (verifies magic link)
- Creates `/api/auth/session` endpoint (gets current session)

### 4. **Callback Page**
**`app/auth/callback/page.tsx`**
- Handles redirect after user clicks magic link in email
- Checks if user is authenticated
- Checks onboarding status
- Redirects to dashboard or onboarding page

### 5. **MongoDB Client**
**`src/lib/mongodb/clientPromise.ts`**
- Required for MongoDBAdapter
- Stores users, sessions, and verification tokens in MongoDB
- Used by NextAuth to persist authentication data

### 6. **Root Layout (SessionProvider)**
**`app/layout.tsx`**
- Wraps app with `<SessionProvider>`
- Required for `signIn()` and `useSession()` to work
- Provides session context to all components

---

## Sign-In Flow

```
1. User visits /auth/signin
   └─> app/auth/signin/page.tsx
       └─> User enters email
           └─> Calls signIn("email") from next-auth/react
               └─> Goes to app/api/auth/[...nextauth]/route.ts
                   └─> Uses src/lib/auth/authConfig.ts
                       └─> Sends email via SMTP
                           └─> User clicks magic link in email
                               └─> Goes to app/api/auth/[...nextauth]/route.ts
                                   └─> Verifies token
                                       └─> Redirects to app/auth/callback/page.tsx
                                           └─> Checks onboarding status
                                               └─> Redirects to /dashboard or /onboarding
```

---

## File Dependencies

```
app/auth/signin/page.tsx
  └─> Uses: signIn() from next-auth/react
      └─> Requires: SessionProvider in app/layout.tsx
      └─> Calls: app/api/auth/[...nextauth]/route.ts
          └─> Uses: src/lib/auth/authConfig.ts
              └─> Uses: src/lib/mongodb/clientPromise.ts
                  └─> Connects to MongoDB

app/auth/callback/page.tsx
  └─> Uses: useSession() from next-auth/react
      └─> Requires: SessionProvider in app/layout.tsx
      └─> Gets session from: app/api/auth/[...nextauth]/route.ts
          └─> Which uses: src/lib/auth/authConfig.ts
              └─> Which reads from: MongoDB (via clientPromise.ts)
```

---

## Summary

**Essential for sign-in to work:**
1. `app/auth/signin/page.tsx` - Sign-in UI
2. `src/lib/auth/authConfig.ts` - Auth configuration
3. `app/api/auth/[...nextauth]/route.ts` - API endpoints
4. `app/auth/callback/page.tsx` - Post-login redirect
5. `src/lib/mongodb/clientPromise.ts` - Database connection
6. `app/layout.tsx` - SessionProvider wrapper

All 6 files are required for the sign-in process to work.

