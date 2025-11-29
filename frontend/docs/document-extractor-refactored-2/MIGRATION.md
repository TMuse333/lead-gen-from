# Quick Migration Guide

## Step 1: Update Document Extractors

Replace your current `src/lib/document-extraction/extractors.ts` with the new version.

**Key changes:**
- Fixed PDF import using dynamic ES6 import
- Better file type detection
- Improved chunking algorithm
- Added utility functions

## Step 2: Create New Component Structure

Create this folder structure in your project:

```
src/components/documentExtractor/
├── DocumentExtractor.tsx
├── index.ts
├── types.ts
├── hooks/
│   ├── useDocumentExtractor.ts
│   └── useDragAndDrop.ts
├── steps/
│   ├── UploadStep.tsx
│   ├── ContextStep.tsx
│   └── ReviewStep.tsx
└── components/
    ├── ExtractedItemCard.tsx
    └── SuccessState.tsx
```

## Step 3: Copy Files

Copy the provided files to the correct locations:

1. `extractors.ts` → `src/lib/document-extraction/extractors.ts`
2. `DocumentExtractor.tsx` → `src/components/documentExtractor/DocumentExtractor.tsx`
3. `index.ts` → `src/components/documentExtractor/index.ts`
4. `types.ts` → `src/components/documentExtractor/types.ts`
5. Hook files → `src/components/documentExtractor/hooks/`
6. Step files → `src/components/documentExtractor/steps/`
7. Component files → `src/components/documentExtractor/components/`

## Step 4: Update Imports

Update any files that import the old DocumentExtractor:

```typescript
// Before
import DocumentExtractor from '@/components/DocumentExtractor';

// After
import DocumentExtractor from '@/components/documentExtractor';
```

## Step 5: Clear Cache & Rebuild

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies (if needed)
npm install

# Rebuild
npm run dev
```

## Testing Checklist

- [ ] File upload works (drag & drop)
- [ ] PDF extraction works
- [ ] DOCX extraction works
- [ ] TXT extraction works
- [ ] Context prompt and processing works
- [ ] Item review and editing works
- [ ] Rule builder works
- [ ] Upload to knowledge base works

## Rollback Plan

If you encounter issues, you can easily rollback:

1. Keep your old `DocumentExtractor.tsx` as `DocumentExtractor.old.tsx`
2. Revert import changes
3. Report issues

## Benefits Summary

✅ **Fixed**: PDF import errors  
✅ **Reduced**: 700+ lines → 7 focused files  
✅ **Improved**: Code organization and maintainability  
✅ **Enhanced**: Document extraction with better detection  
✅ **Added**: Utility functions for validation  
✅ **Maintained**: Same API - no breaking changes  

## Support

If you encounter any issues:
1. Check the README.md for detailed documentation
2. Verify all files are in the correct locations
3. Ensure dependencies are installed
4. Clear Next.js cache and rebuild
