# Installation Guide - Phase 1

## Quick Install

### Option 1: Direct Copy (Recommended)

```bash
# From the outputs directory
cp -r /mnt/user-data/outputs/offer-system-phase1/* src/lib/offers/
```

### Option 2: Manual File-by-File

```bash
# Create directory structure
mkdir -p src/lib/offers/{core,validators,promptBuilders,future}

# Copy core files
cp /mnt/user-data/outputs/offer-system-phase1/core/*.ts src/lib/offers/core/

# Copy validators
cp /mnt/user-data/outputs/offer-system-phase1/validators/*.ts src/lib/offers/validators/

# Copy prompt builders
cp /mnt/user-data/outputs/offer-system-phase1/promptBuilders/*.ts src/lib/offers/promptBuilders/

# Copy future placeholders
cp /mnt/user-data/outputs/offer-system-phase1/future/*.ts src/lib/offers/future/

# Copy index
cp /mnt/user-data/outputs/offer-system-phase1/index.ts src/lib/offers/
```

---

## Verification

After copying, verify the structure:

```bash
tree src/lib/offers/
```

Expected output:
```
src/lib/offers/
├── core/
│   ├── types.ts
│   ├── costEstimator.ts
│   ├── retry.ts
│   ├── versionControl.ts
│   ├── generator.ts
│   └── registry.ts
├── validators/
│   ├── inputValidator.ts
│   └── outputValidator.ts
├── promptBuilders/
│   └── promptHelpers.ts
├── future/
│   ├── caching.placeholder.ts
│   ├── streaming.placeholder.ts
│   └── abTesting.placeholder.ts
└── index.ts
```

---

## Environment Setup

Add to your `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-...
```

---

## Test Import

Create a test file to verify imports work:

```typescript
// test-offers.ts
import {
  generateOffer,
  validateOfferInputs,
  createCostEstimator,
  getRegistryStatus,
  logRegistryStatus,
} from '@/lib/offers';

// Check registry status
logRegistryStatus();
// Expected output:
// [Registry Status] { total: 5, registered: 0, missing: 5 }
//   ❌ pdf
//   ❌ landingPage
//   ❌ video
//   ❌ home-estimate
//   ❌ custom

console.log('✅ Offer system imports working!');
```

Run the test:
```bash
ts-node test-offers.ts
# or
npx tsx test-offers.ts
```

---

## TypeScript Configuration

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Dependencies

Install required dependencies:

```bash
npm install openai
# or
yarn add openai
# or
pnpm add openai
```

Current version: `openai@^4.0.0`

---

## Next Steps

1. ✅ Copy files to project
2. ✅ Set environment variables
3. ✅ Verify imports
4. ⏳ Wait for Phase 2 (Offer Definitions)
5. ⏳ Integrate with onboarding flow
6. ⏳ Update generation API

---

## Troubleshooting

### Issue: Import errors

```
Cannot find module '@/lib/offers'
```

**Solution**: Check your `tsconfig.json` paths configuration.

### Issue: OpenAI types not found

```
Cannot find module 'openai'
```

**Solution**: Run `npm install openai`

### Issue: Registry shows all ❌

```
[Registry Status] { total: 5, registered: 0, missing: 5 }
```

**Solution**: This is expected! Definitions will be added in Phase 2.

---

## File Count Verification

Total files: **15**
- Core: 6
- Validators: 2
- Prompt Builders: 1
- Future: 3
- Index: 1
- Documentation: 2

Verify with:
```bash
find src/lib/offers -type f | wc -l
# Should output: 13 (or 15 with docs)
```

---

## Success Criteria

✅ All files copied  
✅ No TypeScript errors  
✅ Imports work  
✅ Registry status shows 0 registered (expected)  
✅ Environment variables set  

If all criteria met: **Installation successful!**

---

## Ready for Phase 2

Once installed and verified, you're ready for Phase 2:

**Command**: 
```
"Let's proceed with Phase 2 - implement the 5 offer definitions"
```

This will add:
- PDF Offer Definition
- Landing Page Offer Definition
- Home Estimate Offer Definition
- Video Offer Definition
- Custom Offer Definition

---

**Questions?** Review the README.md in the offer-system-phase1 directory.