// Recommended Rules Component - Refactored

# Recommended Rules Component Refactoring

## Overview

The original `recommendedRules.tsx` (1,233 lines) has been refactored into **10 modular files** with enhanced search and filtering capabilities.

## New Features

### ✨ **Search with Highlighting**

The search functionality now:
- ✅ **Highlights all occurrences** of search terms in yellow
- ✅ **Filters results** - only items matching the search are shown
- ✅ **Shows match count** - displays "Showing X of Y items"
- ✅ **Searches across multiple fields**: title, advice, tags, and flows
- ✅ **Case-insensitive** matching
- ✅ **Real-time filtering** as you type

Example: Searching for "buy" will highlight every occurrence of "buy" in titles, advice text, and tags, and only show items containing "buy".

## File Structure

```
components/admin/rules/recommendedRules/
├── RecommendedRules.tsx          # Main component (150 lines)
├── index.ts                       # Barrel exports
├── types.ts                       # TypeScript interfaces
│
├── Components/
│   ├── RecommendationCard.tsx     # Individual recommendation card
│   ├── AdviceItemCard.tsx         # Searchable advice item card
│   ├── AttachRuleModal.tsx        # Modal for attaching rules
│   └── SearchHighlight.tsx        # Text highlighting component
│
├── Logic/
│   ├── useRecommendedRules.ts     # Custom hook for state management
│   ├── api.ts                     # API service layer
│   └── utils.ts                   # Utility functions (filtering, search)
```

## Component Breakdown

### 1. **RecommendedRules.tsx** (Main Component)
- Orchestrates all sub-components
- Handles flow selection
- Displays recommendations list
- ~150 lines (was 1,233)

### 2. **SearchHighlight.tsx** (New!)
- Highlights search terms in text
- Uses regex for case-insensitive matching
- Yellow highlighting with `<mark>` tags
- ~50 lines

```tsx
<SearchHighlight 
  text="This is buy advice for buying" 
  searchQuery="buy" 
/>
// Output: This is <mark>buy</mark> advice for <mark>buy</mark>ing
```

### 3. **AdviceItemCard.tsx** (Enhanced)
- Displays individual advice items
- Integrates SearchHighlight component
- Shows selection state
- Highlights matches in title, advice, and tags
- ~70 lines

### 4. **AttachRuleModal.tsx** (Enhanced)
- Modal for attaching rules to advice
- Integrated search bar
- Real-time filtering with highlights
- Shows filtered count
- ~150 lines

### 5. **RecommendationCard.tsx**
- Displays individual recommendations
- Edit/view modes
- Placeholder warnings
- Attach functionality
- ~120 lines

### 6. **useRecommendedRules.ts** (Custom Hook)
- All business logic
- State management
- API call orchestration
- ~180 lines

### 7. **api.ts** (Service Layer)
- All API calls
- Error handling
- Type-safe responses
- ~120 lines

### 8. **utils.ts** (Search Utilities)
- `filterAdviceItems()` - Filters items by search query
- `containsSearchQuery()` - Checks if text contains query
- `getSearchMatchCount()` - Counts matches in text
- ~50 lines

### 9. **types.ts**
- All TypeScript interfaces
- Clean type definitions
- ~50 lines

## Search Functionality

### How It Works

1. **User types in search box**
   ```tsx
   <input 
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
   />
   ```

2. **Items are filtered**
   ```tsx
   const filteredItems = filterAdviceItems(adviceItems, searchQuery);
   // Only returns items matching the search term
   ```

3. **Matching text is highlighted**
   ```tsx
   <SearchHighlight 
     text={item.title} 
     searchQuery={searchQuery} 
   />
   // Wraps matches in <mark> tags
   ```

4. **Count is displayed**
   ```tsx
   Showing {filteredItems.length} of {adviceItems.length} items
   ```

### Search Fields

The search looks in:
- **Title** - Item titles
- **Advice** - Advice content
- **Tags** - All tags associated with the item
- **Flows** - Flow names the item applies to

### Example Usage

```tsx
// User searches for "buy"
Search: "buy"

// Results shown:
✅ "How to buy a house" (title match)
✅ "Advice for buyers" (advice match)
✅ Tag: "buying-guide" (tag match)
❌ "How to sell property" (no match - filtered out)

// All occurrences of "buy" highlighted in yellow
```

## Migration Guide

### From Old File

Replace:
```tsx
// Old
import RecommendedRules from '@/components/admin/rules/recommendedRules';
```

With:
```tsx
// New
import RecommendedRules from '@/components/admin/rules/recommendedRules';
// Same import - component interface unchanged!
```

### File Organization

Copy files to your project:

```bash
src/components/admin/rules/recommendedRules/
├── RecommendedRules.tsx
├── index.ts
├── types.ts
├── SearchHighlight.tsx
├── AdviceItemCard.tsx
├── AttachRuleModal.tsx
├── RecommendationCard.tsx
├── useRecommendedRules.ts
├── api.ts
└── utils.ts
```

## Benefits

### For Users
- ✅ **Better search** - Find items faster
- ✅ **Visual highlights** - See matches immediately
- ✅ **Filtered results** - Only see relevant items
- ✅ **Match counts** - Know how many results

### For Developers
- ✅ **Modular code** - Easy to maintain
- ✅ **Reusable components** - Use SearchHighlight elsewhere
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Testable** - Each piece can be tested independently
- ✅ **Smaller files** - Average ~100 lines vs 1,233

### Code Quality
- ✅ **Single Responsibility** - Each file does one thing
- ✅ **Separation of Concerns** - UI, logic, and API separated
- ✅ **DRY** - Search logic reused across components
- ✅ **Clean Architecture** - Clear dependencies

## Key Improvements

### 1. Search Enhancement

**Before:**
```tsx
// Basic filtering, no highlighting
const filtered = items.filter(item => 
  item.title.includes(query)
);
```

**After:**
```tsx
// Multi-field search with highlighting
const filtered = filterAdviceItems(items, query);
// Returns only matching items

<SearchHighlight text={item.title} searchQuery={query} />
// Highlights all occurrences
```

### 2. Component Size

| Component | Before | After |
|-----------|--------|-------|
| Main file | 1,233 lines | 150 lines |
| Average file | - | ~100 lines |
| Total files | 1 | 10 |

### 3. Maintainability

**Before:** Change search logic → Edit 1,233-line file

**After:** Change search logic → Edit `utils.ts` (50 lines)

## API Reference

### SearchHighlight Component

```tsx
interface SearchHighlightProps {
  text: string;          // Text to search in
  searchQuery: string;   // Search term
  className?: string;    // Optional CSS classes
}
```

### Filter Functions

```tsx
// Filter items by search query
filterAdviceItems(items: AdviceItem[], query: string): AdviceItem[]

// Check if text contains query
containsSearchQuery(text: string, query: string): boolean

// Count matches in text
getSearchMatchCount(text: string, query: string): number
```

## Testing

```tsx
// Test SearchHighlight
<SearchHighlight text="buy now or buy later" searchQuery="buy" />
// Should highlight both "buy" occurrences

// Test filtering
const items = [
  { title: "How to buy", advice: "..." },
  { title: "How to sell", advice: "..." }
];
const filtered = filterAdviceItems(items, "buy");
// Should return only first item
```

## Future Enhancements

Possible additions:
- [ ] Fuzzy search (typo tolerance)
- [ ] Search history
- [ ] Advanced filters (by tags, flows)
- [ ] Regex search support
- [ ] Export filtered results

## Support

For questions or issues:
1. Check this README
2. Review the code comments
3. Test with simple searches first

---

**All features from the original component are preserved** - this is purely a refactor with enhanced search capabilities!
