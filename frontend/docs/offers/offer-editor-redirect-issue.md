# Offer Editor Redirect Issue

## Problem Summary

When clicking the "Configure" button on an offer in the `OffersDashboard`, the user is briefly shown the `OfferEditor` component but then immediately redirected to the "My Setup" (configuration summary) tab instead of staying in the offer editor.

**Expected Behavior:**
- User clicks "Configure" on an offer
- User is taken to `/dashboard?section=offers&offer=pdf` (or other offer type)
- `OfferEditor` component displays and stays visible
- User can edit the offer configuration

**Actual Behavior:**
- User clicks "Configure" on an offer
- `OfferEditor` briefly appears (for a split second)
- User is immediately redirected to the "My Setup" (config) tab
- Offer editor is not accessible

---

## Architecture Context

### Component Structure

The dashboard uses a tabbed sidebar navigation system:

1. **`UserDashboard`** (`src/components/dashboard/user/userDashboard/userDashboard.tsx`)
   - Main dashboard container
   - Manages sidebar navigation and active section state
   - Handles URL query parameters (`?section=offers&offer=pdf`)
   - Conditionally renders either:
     - Regular section components (OffersDashboard, ConfigSummary, etc.)
     - OR `OfferEditor` when `editingOfferType` state is set

2. **`OffersDashboard`** (`src/components/dashboard/user/offers/OffersDashboard.tsx`)
   - Lists all configured offers
   - Has "Configure" button that navigates to: `/dashboard?section=offers&offer=${offer.type}`

3. **`OfferEditor`** (`src/components/dashboard/user/offers/editor/OfferEditor.tsx`)
   - Detailed editor for individual offers
   - Should display when URL has `?offer=${type}` parameter
   - Takes `offerType` prop and `onBack` callback

### Current Implementation

**UserDashboard Logic:**
```typescript
const [activeSection, setActiveSection] = useState<string>('config'); // Defaults to 'config'
const [editingOfferType, setEditingOfferType] = useState<OfferType | null>(null);
const searchParams = useSearchParams();

useEffect(() => {
  const section = searchParams.get('section');
  const offer = searchParams.get('offer') as OfferType | null;
  
  // If offer param exists and section is offers, show editor
  if (offer && section === 'offers') {
    setEditingOfferType(offer);
    setActiveSection('offers');
    return;
  }
  
  // Clear editing state if offer param is removed
  if (!offer) {
    setEditingOfferType(null);
  }
  
  // Set section from URL
  if (section && USER_SECTIONS.find(s => s.id === section)) {
    setActiveSection(section);
  } else if (!section) {
    setActiveSection('config'); // Defaults to config if no section
  }
}, [searchParams]);

// Render logic
{editingOfferType ? (
  <OfferEditor 
    offerType={editingOfferType} 
    onBack={handleBackFromEditor}
  />
) : (
  ActiveComponent && <ActiveComponent />
)}
```

**OffersDashboard "Configure" Button:
```typescript
<button
  onClick={() => {
    router.push(`/dashboard?section=offers&offer=${offer.type}`);
  }}
>
  Configure
</button>
```

---

## Suspected Issues

### Issue 1: Initial State Conflict
- `activeSection` defaults to `'config'`
- When component first mounts, `useEffect` may run before URL params are fully processed
- This could cause a race condition where `activeSection` is set to `'config'` before the `offer` param is detected

### Issue 2: Sidebar Click Handler
- Sidebar navigation buttons call `setActiveSection(section.id)` directly
- This might be overriding the `editingOfferType` state
- Need to ensure sidebar clicks don't interfere when editing an offer

### Issue 3: useEffect Dependency/Timing
- `useSearchParams()` might not be reactive enough
- The effect might be running in the wrong order
- URL changes might not be detected immediately

### Issue 4: Default Section Logic
- When no section is specified, it defaults to `'config'`
- This might be triggering after the offer editor tries to load

---

## Files Involved

### Primary Files (Must Review)
1. **`src/components/dashboard/user/userDashboard/userDashboard.tsx`**
   - Main dashboard component
   - Handles URL params and state management
   - Conditionally renders OfferEditor

2. **`src/components/dashboard/user/offers/OffersDashboard.tsx`**
   - Contains the "Configure" button
   - Navigates to offer editor URL

3. **`src/components/dashboard/user/offers/editor/OfferEditor.tsx`**
   - The editor component itself
   - Should receive `offerType` prop and display

### Supporting Files (For Context)
4. **`src/hooks/offers/useOfferCustomizations.ts`**
   - Hook used by OfferEditor to fetch data
   - Might be causing redirect if it fails

5. **`src/hooks/offers/useOfferEditor.ts`**
   - Hook for editor state management

6. **`src/app/api/offers/[type]/route.ts`**
   - API endpoint that OfferEditor calls
   - If this fails, might cause issues

---

## Debugging Steps to Try

1. **Add console logs** to track state changes:
   ```typescript
   console.log('activeSection:', activeSection);
   console.log('editingOfferType:', editingOfferType);
   console.log('searchParams:', searchParams.toString());
   ```

2. **Check if OfferEditor is mounting/unmounting**:
   - Add `useEffect` in OfferEditor to log mount/unmount
   - See if it's being unmounted immediately

3. **Verify URL is correct**:
   - Check that `router.push()` is actually navigating to the correct URL
   - Verify the URL in browser address bar after clicking "Configure"

4. **Check for error boundaries**:
   - See if OfferEditor is throwing an error that causes a redirect
   - Check browser console for errors

5. **Verify useSearchParams behavior**:
   - `useSearchParams()` might need to be used differently in Next.js App Router
   - Might need to use `usePathname()` or other hooks

---

## Potential Solutions

### Solution 1: Fix Initial State
Don't default to `'config'` - wait for URL params:
```typescript
const [activeSection, setActiveSection] = useState<string | null>(null);
// Only set default after checking URL
```

### Solution 2: Prevent Sidebar Interference
When `editingOfferType` is set, disable or modify sidebar click behavior:
```typescript
onClick={() => {
  if (editingOfferType) {
    // Don't allow section switching while editing
    return;
  }
  // Normal behavior
}}
```

### Solution 3: Use Router Events
Listen to router events instead of searchParams:
```typescript
import { usePathname, useSearchParams } from 'next/navigation';

const pathname = usePathname();
const searchParams = useSearchParams();

useEffect(() => {
  // React to both pathname and searchParams changes
}, [pathname, searchParams]);
```

### Solution 4: Separate Route
Create a dedicated route for offer editing:
- `/dashboard/offers/[type]` instead of query params
- This would be cleaner and avoid conflicts

### Solution 5: Guard Against Default
Only set default section if we're NOT editing:
```typescript
if (!section && !offer) {
  setActiveSection('config');
}
```

---

## Additional Context

### Next.js App Router
- Using `next/navigation` (not `next/router`)
- `useSearchParams()` is a client component hook
- Component must be marked `'use client'`

### State Management
- Using React `useState` for local state
- No global state management (Zustand) for this navigation
- URL is the source of truth

### Navigation Pattern
- Other sections use: `/dashboard?section=analytics`
- Offer editor uses: `/dashboard?section=offers&offer=pdf`
- Need to handle both patterns correctly

---

## Questions to Answer

1. Is `useSearchParams()` the right hook for this use case?
2. Should we use a different navigation pattern (dedicated route)?
3. Is there a timing issue with when the effect runs vs when the component renders?
4. Are there any error boundaries or error handling that might be causing redirects?
5. Is the sidebar click handler interfering with the editor state?

---

## Expected Fix

The fix should ensure that:
1. When URL has `?section=offers&offer=pdf`, the editor shows and stays visible
2. Sidebar navigation doesn't interfere when editing an offer
3. No race conditions between initial state and URL params
4. Editor component mounts and stays mounted until user navigates away

---

## Test Cases

1. **Click "Configure" on an offer**
   - Should navigate to `/dashboard?section=offers&offer=pdf`
   - Should show OfferEditor
   - Should NOT redirect to config tab

2. **Click "Back" in OfferEditor**
   - Should navigate to `/dashboard?section=offers`
   - Should show OffersDashboard (list view)
   - Should NOT show config tab

3. **Click sidebar "Offers" while editing**
   - Should navigate to `/dashboard?section=offers`
   - Should clear editor and show list
   - Should NOT show config tab

4. **Direct URL navigation**
   - Navigate directly to `/dashboard?section=offers&offer=pdf`
   - Should show OfferEditor immediately
   - Should NOT redirect

---

**End of Problem Summary**

