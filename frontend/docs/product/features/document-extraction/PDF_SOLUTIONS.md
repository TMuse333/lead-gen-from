# PDF Extraction Solutions for Next.js

## The Problem

The `pdf-parse` library has issues with Next.js due to:
1. CommonJS/ESM module conflicts
2. Missing `pdfjs-dist` dependencies
3. Serverless environment compatibility issues

## Solutions (Choose One)

We've created **3 different solutions** - try them in order until one works:

---

## ✅ Solution 1: Using `pdf2json` (RECOMMENDED)

**Best for**: Next.js serverless environments, Vercel deployments

### Installation
```bash
npm install pdf2json
```

### File to Use
- **extractors-pdf2json.ts** → Copy to `src/lib/document-extraction/extractors.ts`

### Pros
- ✅ Works great with Next.js
- ✅ No complex dependencies
- ✅ Serverless-friendly
- ✅ Event-based parsing

### Cons
- ⚠️ Text extraction quality depends on PDF structure
- ⚠️ May have issues with complex PDFs

---

## ✅ Solution 2: Using `pdfjs-dist` directly

**Best for**: When you need high-quality text extraction

### Installation
```bash
npm install pdfjs-dist
```

### File to Use
- **extractors-pdfjs.ts** → Copy to `src/lib/document-extraction/extractors.ts`

### Pros
- ✅ High-quality text extraction
- ✅ Official Mozilla PDF.js library
- ✅ Handles complex PDFs well

### Cons
- ⚠️ Larger bundle size
- ⚠️ May have canvas dependency issues in serverless

---

## ✅ Solution 3: Using `pdf-lib` + `pdfjs-dist` (Fallback)

**Best for**: When solutions 1 and 2 don't work

### Installation
```bash
npm install pdf-lib pdfjs-dist
```

### Implementation
This combines pdf-lib for structure and pdfjs-dist for text extraction.

---

## Quick Fix Guide

### Step 1: Uninstall pdf-parse
```bash
npm uninstall pdf-parse
```

### Step 2: Install Recommended Library
```bash
# Try this first (recommended)
npm install pdf2json

# OR if that doesn't work well
npm install pdfjs-dist
```

### Step 3: Replace extractors.ts

Copy the appropriate file:
- For pdf2json: Use `extractors-pdf2json.ts`
- For pdfjs-dist: Use `extractors-pdfjs.ts`

```bash
# Example
cp extractors-pdf2json.ts src/lib/document-extraction/extractors.ts
```

### Step 4: Clear Cache and Rebuild
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## Testing Each Solution

After installing, test with this code:

```typescript
import { extractTextFromPDF } from '@/lib/document-extraction/extractors';
import fs from 'fs';

// Test with a sample PDF
const buffer = fs.readFileSync('sample.pdf');
const text = await extractTextFromPDF(buffer);
console.log('Extracted text:', text);
```

---

## Troubleshooting

### Issue: "Cannot find module 'pdfjs-dist/legacy/build/pdf.js'"

**Solution**: Use pdf2json instead
```bash
npm uninstall pdfjs-dist
npm install pdf2json
# Use extractors-pdf2json.ts
```

### Issue: "Module not found: Can't resolve 'canvas'"

**Solution**: Add to next.config.js
```javascript
module.exports = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

### Issue: Text extraction quality is poor

**Solution**: Try pdfjs-dist instead of pdf2json
```bash
npm uninstall pdf2json
npm install pdfjs-dist
# Use extractors-pdfjs.ts
```

### Issue: Works locally but fails on Vercel

**Solution**: 
1. Use pdf2json (most serverless-friendly)
2. Add to package.json:
```json
{
  "optionalDependencies": {
    "canvas": "^2.11.2"
  }
}
```

---

## Comparison Table

| Library | Next.js Compat | Quality | Bundle Size | Serverless |
|---------|----------------|---------|-------------|------------|
| pdf2json | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Small | ✅ Great |
| pdfjs-dist | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Large | ⚠️ OK |
| pdf-parse | ⭐⭐ | ⭐⭐⭐⭐ | Medium | ❌ Poor |

---

## Recommended Approach

1. **Start with pdf2json** (extractors-pdf2json.ts)
   - Install: `npm install pdf2json`
   - Copy: `extractors-pdf2json.ts` → `extractors.ts`

2. **If text quality is poor, switch to pdfjs-dist** (extractors-pdfjs.ts)
   - Install: `npm install pdfjs-dist`
   - Copy: `extractors-pdfjs.ts` → `extractors.ts`

3. **Clear cache between attempts**
   ```bash
   rm -rf .next node_modules/.cache
   npm run dev
   ```

---

## Files Provided

1. **extractors-pdf2json.ts** - Uses pdf2json (RECOMMENDED)
2. **extractors-pdfjs.ts** - Uses pdfjs-dist directly
3. Original component files (unchanged)

---

## Next.js Config (if needed)

If you encounter canvas issues, add to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

module.exports = nextConfig;
```

---

## Need Help?

1. Try **pdf2json** first (simplest, most compatible)
2. If quality issues, try **pdfjs-dist**
3. Always clear `.next` cache between changes
4. Check the error message and match it to troubleshooting section

Good luck! 🚀
