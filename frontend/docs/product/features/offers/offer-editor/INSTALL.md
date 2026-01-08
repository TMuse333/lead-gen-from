# Quick Installation Guide - Offer Editor

## Prerequisites

- Offer System (Phases 1 & 2) already installed
- MongoDB connection configured
- NextAuth setup complete

---

## Installation Steps

### 1. Copy All Files

```bash
# From the root of your project:
cd frontend

# Copy types
cp /mnt/user-data/outputs/offer-editor/types/offerCustomization.types.ts \
   src/types/

# Copy MongoDB model
cp /mnt/user-data/outputs/offer-editor/lib/offerCustomization.ts \
   src/lib/mongodb/models/

# Copy utilities
cp /mnt/user-data/outputs/offer-editor/lib/mergeCustomizations.ts \
   src/lib/offers/utils/
cp /mnt/user-data/outputs/offer-editor/lib/validateCustomizations.ts \
   src/lib/offers/utils/
cp /mnt/user-data/outputs/offer-editor/lib/getSampleData.ts \
   src/lib/offers/utils/

# Copy hooks
mkdir -p src/hooks
cp /mnt/user-data/outputs/offer-editor/hooks/useOfferEditor.ts src/hooks/
cp /mnt/user-data/outputs/offer-editor/hooks/useOfferCustomizations.ts src/hooks/
cp /mnt/user-data/outputs/offer-editor/hooks/useOfferTest.ts src/hooks/

# Copy components
mkdir -p src/components/dashboard/user/offers/editor/tabs
cp /mnt/user-data/outputs/offer-editor/components/OfferEditor.tsx \
   src/components/dashboard/user/offers/
cp /mnt/user-data/outputs/offer-editor/components/tabs/*.tsx \
   src/components/dashboard/user/offers/editor/tabs/

# Copy API routes
mkdir -p app/api/offers/[type]/test
mkdir -p app/api/offers/[type]/stats
mkdir -p app/api/offers/[type]/history
cp /mnt/user-data/outputs/offer-editor/api/[type]/route.ts \
   app/api/offers/[type]/
cp /mnt/user-data/outputs/offer-editor/api/[type]/test/route.ts \
   app/api/offers/[type]/test/
cp /mnt/user-data/outputs/offer-editor/api/[type]/stats/route.ts \
   app/api/offers/[type]/stats/
cp /mnt/user-data/outputs/offer-editor/api/[type]/history/route.ts \
   app/api/offers/[type]/history/
```

---

### 2. Update userDashboard.tsx

Add these imports at the top:

```typescript
import { OfferEditor } from './offers/OfferEditor';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
```

Add query param detection:

```typescript
const searchParams = useSearchParams();
const router = useRouter();
const selectedOffer = searchParams?.get('offer') as OfferType | null;
```

Update the offers section render:

```typescript
{activeSection === 'offers' && (
  selectedOffer ? (
    <OfferEditor
      offerType={selectedOffer}
      onBack={() => {
        // Clear the 'offer' query param
        const newParams = new URLSearchParams(searchParams?.toString());
        newParams.delete('offer');
        router.push(`/dashboard?${newParams.toString()}`);
      }}
    />
  ) : (
    <OffersDashboard />
  )
)}
```

---

### 3. Verify Imports

Make sure these imports work:

```typescript
// Test in any file:
import type { OfferCustomizations } from '@/types/offerCustomization.types';
import { useOfferEditor } from '@/hooks/useOfferEditor';
import { getOfferDefinition } from '@/lib/offers';
```

---

### 4. Test the Installation

```bash
# Compile TypeScript
npm run build

# Start dev server
npm run dev
```

Navigate to:
1. Dashboard → Offers tab
2. Click "Configure" on any offer
3. Should see the Offer Editor with 7 tabs

---

## Verification Checklist

- [ ] All files copied successfully
- [ ] No TypeScript errors
- [ ] Dashboard shows offers list
- [ ] Clicking "Configure" opens editor
- [ ] All 7 tabs visible
- [ ] Test generation works
- [ ] Settings can be saved
- [ ] No console errors

---

## Troubleshooting

### Error: "Cannot find module '@/hooks/useOfferEditor'"

**Fix**: Make sure hooks directory exists and path alias is configured:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: "getOfferDefinition is not a function"

**Fix**: Ensure Offer System (Phases 1 & 2) is installed:

```bash
# Check if registry exists:
ls src/lib/offers/core/registry.ts

# Should show populated registry with all 5 offers
```

### Editor doesn't appear when clicking Configure

**Fix**: Check userDashboard.tsx has the conditional render logic:

```typescript
{selectedOffer ? (
  <OfferEditor ... />
) : (
  <OffersDashboard />
)}
```

### API routes return 404

**Fix**: Ensure API directory structure matches:

```
app/api/offers/[type]/route.ts
app/api/offers/[type]/test/route.ts
app/api/offers/[type]/stats/route.ts
app/api/offers/[type]/history/route.ts
```

---

## Quick Test

After installation, run this test:

1. Navigate to `/dashboard?section=offers`
2. Click "Configure" on PDF offer
3. Should navigate to `/dashboard?section=offers&offer=pdf`
4. Should see Offer Editor with "PDF Guide Configuration" title
5. Click through all 7 tabs - each should render without errors
6. Go to Test tab
7. Click "Generate Test Offer"
8. Should see loading spinner, then results with cost/tokens

If all steps work, installation is successful! ✅

---

## Next Steps

After successful installation:

1. Test each offer type (PDF, Landing Page, Video, etc.)
2. Try customizing settings and saving
3. Test the reset to defaults feature
4. Verify MongoDB collection `offer_customizations` is created

---

**Installation complete!** 🎉

For detailed documentation, see `IMPLEMENTATION_COMPLETE.md`
