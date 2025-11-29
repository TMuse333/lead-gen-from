# Zustand + localStorage Pattern: Solving Race Conditions

## Problem Statement

When using Zustand for state management with cross-page navigation (especially in Next.js), you can encounter race conditions where:

1. **Zustand state is not ready on initial render** - The store may not be hydrated when the component first renders
2. **State is lost on page navigation** - Zustand state is in-memory and doesn't persist across page navigations
3. **Timing issues** - State updates may not complete before navigation occurs
4. **Browser differences** - Different browsers handle state persistence differently

### Common Error Patterns

```
❌ Error: Cannot read property 'hero' of null
❌ Error: Application error: a client-side exception has occurred
❌ State is undefined on first render
❌ Data works on your device but fails on others
```

## Solution: localStorage as Source of Truth

The solution is to use **localStorage as the primary data store** and **Zustand as an in-memory cache**. This ensures data persists across navigation and is available immediately on page load.

---

## Core Principles

### 1. Write to localStorage FIRST
Always write to localStorage before updating Zustand. localStorage is synchronous and reliable.

### 2. Read from localStorage on Mount
On component mount, always check localStorage first, then sync to Zustand.

### 3. Use Zustand as Cache
Zustand is great for in-memory state during a session, but localStorage is the source of truth.

### 4. Add Hydration Checks
Wait for client-side hydration before accessing Zustand state.

---

## Implementation Pattern

### Step 1: Writing Data (On Completion/Submission)

```typescript
// ✅ CORRECT: Write to localStorage FIRST
const submitData = async () => {
  try {
    // 1. Get data from API
    const { data } = await axios.post("/api/endpoint", payload);
    
    // 2. Write to localStorage FIRST (most reliable)
    localStorage.setItem("dataCache", JSON.stringify(data));
    console.log('✅ Data cached to localStorage');
    
    // 3. Then update Zustand (for immediate access if on same page)
    try {
      setData(data);
      console.log('✅ Data stored in Zustand');
    } catch (storeErr) {
      console.error('⚠️ Error storing in Zustand (non-critical):', storeErr);
      // Non-critical since we have localStorage
    }
    
    // 4. Small delay to ensure localStorage is written
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 5. Navigate (use window.location.href for reliability)
    window.location.href = '/results';
    
  } catch (err) {
    console.error('❌ Error:', err);
    // Handle error
  }
};
```

### Step 2: Reading Data (On Component Mount)

```typescript
// ✅ CORRECT: Read from localStorage first, then sync to Zustand
useEffect(() => {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem("dataCache");
      if (!cached) {
        console.log("No cached data found");
        return null;
      }

      const parsed = JSON.parse(cached);
      
      // Validate data structure
      if (parsed && typeof parsed === "object") {
        console.log("✅ Cache hit: Loaded from localStorage");
        return parsed;
      }
    } catch (err) {
      console.error("❌ Failed to parse cached data:", err);
      // Clear corrupted cache
      try {
        localStorage.removeItem("dataCache");
        console.log("Cleared corrupted cache");
      } catch (clearErr) {
        console.error("Failed to clear corrupted cache:", clearErr);
      }
    }
    return null;
  };

  const cached = loadFromCache();
  
  if (cached) {
    // Sync to Zustand
    setData(cached);
    setLoading(false);
  }
}, [setData]);
```

### Step 3: Hydration Check

```typescript
// ✅ CORRECT: Wait for hydration before accessing Zustand
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
  console.log('✅ Component hydrated');
}, []);

// Only access Zustand after hydration
useEffect(() => {
  if (!isHydrated) {
    console.log("⏳ Waiting for hydration...");
    return;
  }

  // Now safe to access Zustand
  if (data) {
    console.log("✅ Zustand data ready:", data);
    setLoading(false);
  }
}, [data, isHydrated]);
```

### Step 4: Loading State

```typescript
// ✅ CORRECT: Show loading until hydrated
if (!isHydrated || loading) {
  return (
    <div>
      <Loader />
      <p>{!isHydrated ? "Initializing..." : "Loading..."}</p>
    </div>
  );
}
```

---

## Complete Example: Results Page Pattern

```typescript
'use client';

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/dataStore";

const STORAGE_KEY = "dataCache";

export default function ResultsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Zustand selectors
  const data = useDataStore((state) => state.data);
  const setData = useDataStore((state) => state.setData);

  // 1. Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 2. Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          console.log("✅ Cache hit: Loaded from localStorage");
          return parsed;
        }
      } catch (err) {
        console.error("❌ Failed to parse cached data:", err);
        localStorage.removeItem(STORAGE_KEY);
      }
      return null;
    };

    const cached = loadFromCache();
    if (cached) {
      setData(cached);
      setLoading(false);
    }
  }, [setData]);

  // 3. Check Zustand after hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (data) {
      console.log("✅ Zustand data ready:", data);
      setLoading(false);
    } else {
      // Set timeout if data doesn't arrive
      const timeout = setTimeout(() => {
        if (!data) {
          setError("Data is taking longer than expected. Please refresh.");
          setLoading(false);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [data, isHydrated]);

  // 4. Loading state
  if (!isHydrated || loading) {
    return <Loader />;
  }

  // 5. Error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // 6. No data state
  if (!data) {
    return <NoDataDisplay />;
  }

  // 7. Render with data
  return <ResultsDisplay data={data} />;
}
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Rely only on Zustand

```typescript
// ❌ BAD: State may not be ready
const data = useDataStore((state) => state.data);
if (!data) return <NoData />; // May fail on first render
```

### ❌ DON'T: Write to Zustand first

```typescript
// ❌ BAD: Zustand may not persist across navigation
setData(data);
localStorage.setItem("cache", JSON.stringify(data));
router.push('/results'); // State may be lost
```

### ❌ DON'T: Access Zustand before hydration

```typescript
// ❌ BAD: May access before store is ready
const data = useDataStore((state) => state.data);
useEffect(() => {
  console.log(data); // May be undefined
}, []);
```

### ✅ DO: Use localStorage as primary

```typescript
// ✅ GOOD: localStorage is always available
const cached = localStorage.getItem("cache");
if (cached) {
  const data = JSON.parse(cached);
  // Use data immediately
}
```

---

## Error Handling Best Practices

### 1. Validate localStorage Data

```typescript
const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    
    // Validate structure
    if (parsed && typeof parsed === "object" && parsed.requiredField) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to parse cache:", err);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
  }
  return null;
};
```

### 2. Handle localStorage Errors

```typescript
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch (err) {
  // localStorage may be disabled or full
  console.error("Failed to cache data:", err);
  // Consider alternative storage or show error to user
}
```

### 3. Add Timeouts

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    if (!data) {
      setError("Data is taking longer than expected.");
      setLoading(false);
    }
  }, 10000); // 10 second timeout
  return () => clearTimeout(timeout);
}, [data]);
```

---

## When to Use This Pattern

### ✅ Use This Pattern When:

- Cross-page navigation (Next.js routing)
- Data needs to persist across page reloads
- Working with external users (different browsers/devices)
- Data is critical and cannot be lost
- You're experiencing race conditions with Zustand

### ❌ Don't Use This Pattern When:

- Simple in-memory state (no persistence needed)
- Single-page application (no navigation)
- Data is sensitive (use encrypted storage instead)
- Data is very large (localStorage has size limits)

---

## Migration Checklist

When applying this pattern to an existing project:

- [ ] Identify all Zustand stores that need persistence
- [ ] Add localStorage write operations before Zustand updates
- [ ] Add localStorage read operations on component mount
- [ ] Add hydration checks before accessing Zustand
- [ ] Add error handling for localStorage failures
- [ ] Test on multiple browsers/devices
- [ ] Test with slow network conditions
- [ ] Add loading states during hydration
- [ ] Add timeouts for data that doesn't arrive

---

## Key Takeaways

1. **localStorage is the source of truth** - Write first, read first
2. **Zustand is the cache** - Use for in-memory state during session
3. **Always check hydration** - Wait for client-side hydration
4. **Handle errors gracefully** - localStorage can fail
5. **Add timeouts** - Don't wait forever for data
6. **Test across browsers** - Different browsers behave differently

---

## Related Files in This Project

- `frontend/src/components/ux/chatWithTracker/chatWithTracker.tsx` - Writing pattern
- `frontend/src/components/pageComponents/frontendPages/results/resultsPage.tsx` - Reading pattern
- `frontend/src/stores/chatStore/` - Zustand store structure

---

## Additional Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

