# Recommended Rules - Installation Guide

## Quick Install

### For Cursor AI

1. Extract the ZIP file in your project root

2. Copy this prompt into Cursor:

```
Copy all files from recommended-rules-refactored/components/ to src/components/,
maintaining the folder structure. This replaces the old recommendedRules.tsx file.
```

3. Done! The component works exactly the same but with enhanced search.

## What's New

### ✨ Enhanced Search Features

1. **Text Highlighting**
   - Every occurrence of your search term is highlighted in yellow
   - Works across titles, advice text, and tags

2. **Smart Filtering**
   - Only items matching your search are shown
   - Searches across: title, advice, tags, and flows
   - Real-time filtering as you type

3. **Match Counts**
   - Shows "Showing X of Y items"
   - Know exactly how many results match

### Example

Search for "buy":
- ✅ Highlights every "buy" in yellow
- ✅ Filters to show only items containing "buy"
- ✅ Shows "Showing 3 of 10 items"

## File Structure

```
components/admin/rules/recommendedRules/
├── RecommendedRules.tsx          # Main component
├── index.ts                       # Exports
├── types.ts                       # TypeScript types
├── SearchHighlight.tsx            # NEW - Highlighting
├── AdviceItemCard.tsx             # Item display with search
├── AttachRuleModal.tsx            # Modal with search
├── RecommendationCard.tsx         # Recommendation display
├── useRecommendedRules.ts         # State management hook
├── api.ts                         # API calls
└── utils.ts                       # Search utilities
```

## Migration

### No Code Changes Needed!

The import remains the same:

```tsx
// Still works!
import RecommendedRules from '@/components/admin/rules/recommendedRules';
```

### What Happened

```
Before: 1 file × 1,233 lines
After:  10 files × ~100 lines each
```

## Features

✅ All original features preserved  
✅ Enhanced search with highlighting  
✅ Better code organization  
✅ Easier to maintain  
✅ Type-safe with TypeScript  

## Testing

After installation:

1. Open the recommended rules page
2. Try searching for any term (e.g., "buy", "sell", "rent")
3. Watch the results filter and highlight in real-time!

## Troubleshooting

**Issue: Can't find SearchHighlight component**
- Make sure all files are in `components/admin/rules/recommendedRules/`

**Issue: Types not found**
- Check that `types.ts` is in the same directory

**Issue: Search not working**
- Verify `utils.ts` is present
- Clear your build cache: `rm -rf .next`

## Support

See `RECOMMENDED_RULES_README.md` for full documentation.

---

**That's it!** Your recommended rules now have powerful search capabilities. 🎉
