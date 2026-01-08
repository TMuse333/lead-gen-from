# Installation Guide - Document Extractor Refactored

## Quick Install (For Cursor AI)

### Step 1: Install PDF Library

Choose ONE of these (pdf2json is recommended):

```bash
# RECOMMENDED: Works best with Next.js
npm install pdf2json

# ALTERNATIVE: Better quality, larger bundle
npm install pdfjs-dist
```

Uninstall the old library:
```bash
npm uninstall pdf-parse
```

### Step 2: Copy Files with Cursor

Paste this into Cursor AI:

```
Copy all files from document-extractor-refactored/components/ to src/components/ 
and document-extractor-refactored/lib/ to src/lib/, maintaining the folder structure.
If there's an existing DocumentExtractor, back it up first.
```

### Step 3: Clear Cache and Rebuild

```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## What's Included

### Main Extractor File (2 versions!)

1. **extractors.ts** - Uses pdf2json (RECOMMENDED)
   - Best for Next.js and serverless
   - Smaller bundle size
   - More compatible

2. **extractors-pdfjs-alternative.ts** - Uses pdfjs-dist
   - Better text quality
   - Use if pdf2json doesn't work well

### Component Files

All 11 component files in proper folder structure:
- DocumentExtractor.tsx (main)
- 2 hooks
- 3 step components
- 2 shared components
- Type definitions

### Documentation

- **PDF_SOLUTIONS.md** - Detailed PDF library comparison and troubleshooting
- **README.md** - Full documentation
- **MIGRATION.md** - Migration guide
- **SUMMARY.md** - Quick overview

---

## Package Structure

```
document-extractor-refactored/
├── components/documentExtractor/
│   ├── DocumentExtractor.tsx
│   ├── index.ts
│   ├── types.ts
│   ├── hooks/
│   │   ├── useDocumentExtractor.ts
│   │   └── useDragAndDrop.ts
│   ├── steps/
│   │   ├── UploadStep.tsx
│   │   ├── ContextStep.tsx
│   │   └── ReviewStep.tsx
│   └── components/
│       ├── ExtractedItemCard.tsx
│       └── SuccessState.tsx
│
├── lib/document-extraction/
│   ├── extractors.ts                    ← Uses pdf2json
│   └── extractors-pdfjs-alternative.ts  ← Uses pdfjs-dist
│
└── Documentation/
    ├── PDF_SOLUTIONS.md     ← READ THIS if you have PDF issues!
    ├── README.md
    ├── MIGRATION.md
    └── SUMMARY.md
```

---

## Switching PDF Libraries

### If pdf2json doesn't work well:

1. Install pdfjs-dist:
```bash
npm uninstall pdf2json
npm install pdfjs-dist
```

2. Replace the extractor file:
```bash
cp lib/document-extraction/extractors-pdfjs-alternative.ts \
   src/lib/document-extraction/extractors.ts
```

3. Clear cache:
```bash
rm -rf .next node_modules/.cache
npm run dev
```

---

## Troubleshooting

### "Cannot find module 'pdfjs-dist/legacy/build/pdf.js'"

Use pdf2json instead:
```bash
npm install pdf2json
# Make sure you're using the default extractors.ts (not the alternative)
```

### "Module not found: Can't resolve 'canvas'"

Add to `next.config.js`:
```javascript
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};
```

### PDF text extraction quality is poor

Switch to pdfjs-dist (see "Switching PDF Libraries" above)

### Works locally but fails on Vercel

Use pdf2json - it's most serverless-friendly

---

## Testing

After installation, test with a PDF upload to verify extraction works.

---

## What Changed

✅ Fixed PDF import errors  
✅ Split 700+ lines into 13 modular files  
✅ Added 2 PDF extraction options  
✅ Enhanced text chunking  
✅ Better file validation  
✅ Same component API (drop-in replacement)

---

## Need More Help?

See **PDF_SOLUTIONS.md** for:
- Detailed comparison of PDF libraries
- Step-by-step troubleshooting
- Next.js configuration tips
- Testing procedures

---

Good luck! 🚀
