# Onboarding Flow - Next Steps Summary

## ✅ What's Done

1. **Step 1: Business Setup**
   - Business name input
   - Data collection preferences (email, phone, property address, custom)
   - Flow intentions selection (buy, sell, browse)

2. **Step 2: Offers**
   - Predefined offers (PDF, Landing Page, Video)
   - Custom offer input
   - Navigation (Back/Continue)

3. **Infrastructure**
   - Zustand store with persistence
   - Auth integration (redirects to onboarding after login)
   - Progress tracking
   - Mobile-responsive UI

---

## 🎯 What to Do Next

### Immediate Next Steps

1. **Test the Current Flow**
   - Sign in → Should redirect to `/onboarding`
   - Complete Step 1 → Should validate and allow continue
   - Complete Step 2 → Should show success (currently just logs to console)
   - Refresh page → Should maintain state

2. **Save Data to Database**
   - Create API route: `app/api/onboarding/save/route.ts`
   - Save onboarding data to MongoDB after each step
   - Link to user's session (userId from NextAuth)

3. **Add Step 3: Conversation Flow Setup**
   - Simplified question builder
   - Allow users to add 3-5 questions
   - Use templates from existing flows (buy/sell/browse)
   - Save to onboarding store

4. **Add Step 4: Knowledge Base Upload**
   - Simplified advice uploader
   - Upload 3-5 initial advice snippets
   - Text or speech upload option
   - Save to onboarding store

5. **Add Completion Flow**
   - After Step 2 (or final step), show success screen
   - Save all data to database
   - Create client record in MongoDB
   - Redirect to dashboard

---

## 📋 Implementation Checklist

### Step 3: Conversation Flow Setup
- [ ] Add `conversationFlow` to onboarding store
- [ ] Create `step3ConversationFlow.tsx` component
- [ ] Add question builder UI (simplified)
- [ ] Add question templates (buy/sell/browse)
- [ ] Add drag & drop reordering
- [ ] Update onboarding page to include Step 3
- [ ] Update progress calculation (3 steps total)

### Step 4: Knowledge Base Upload
- [ ] Add `adviceLibrary` to onboarding store
- [ ] Create `step4KnowledgeBase.tsx` component
- [ ] Add text upload form (simplified)
- [ ] Add speech upload option (optional)
- [ ] Add "upload 3-5 snippets" guidance
- [ ] Update onboarding page to include Step 4
- [ ] Update progress calculation (4 steps total)

### Database Integration
- [ ] Create `app/api/onboarding/save/route.ts`
- [ ] Create MongoDB client model/schema
- [ ] Save data after each step (or at completion)
- [ ] Link to user session (userId)
- [ ] Handle errors gracefully

### Completion & Success
- [ ] Create `step9Success.tsx` (or final step)
- [ ] Add confetti animation
- [ ] Show completion summary
- [ ] Create client record in database
- [ ] Redirect to dashboard
- [ ] Add "Re-run onboarding" option in dashboard

---

## 🔧 Quick Reference

### File Locations

```
Onboarding Store:     src/stores/onboardingStore/onboarding.store.ts
Onboarding Page:      app/onboarding/page.tsx
Step 1 Component:     src/components/onboarding/steps/step1BusinessSetup.tsx
Step 2 Component:     src/components/onboarding/steps/step2Offers.tsx
Documentation:        docs/onboarding-implementation.md
```

### Key Functions

**Store Actions:**
- `setBusinessName(name)` - Set business name
- `setDataCollection(types)` - Set data collection preferences
- `setSelectedIntentions(intentions)` - Set flow intentions
- `setSelectedOffers(offers)` - Set offers
- `setCurrentStep(step)` - Navigate to step
- `markStepComplete(step)` - Mark step as complete

**Navigation:**
- `handleNext()` - Move to next step (with validation)
- `handleBack()` - Move to previous step

### Adding a New Step

1. Add data to store interface
2. Create step component (`stepXName.tsx`)
3. Add to onboarding page: `{currentStep === X && <StepXName />}`
4. Update progress calculation
5. Add validation logic

---

## 🚀 Quick Start Commands

```bash
# Test the onboarding flow
npm run dev
# Navigate to: http://localhost:3000/auth/signin
# Sign in → Should redirect to /onboarding

# Check localStorage (in browser DevTools)
# Application → Local Storage → onboarding-storage
# Should see all onboarding state persisted
```

---

## 📝 Notes

- **State Persistence:** All state is saved to localStorage automatically
- **Auth Required:** Users must be logged in to access onboarding
- **Progress Tracking:** Steps are marked complete when user clicks "Continue"
- **Validation:** Each step validates before allowing navigation
- **Mobile Ready:** All steps are responsive and mobile-friendly

---

## 🐛 Common Issues

**Issue:** Auth redirect not working
- **Fix:** Check `AUTH_SECRET` and `AUTH_URL` in `.env`
- **Fix:** Verify redirect callback in `authConfig.ts`

**Issue:** State not persisting
- **Fix:** Check browser localStorage in DevTools
- **Fix:** Verify Zustand persist middleware is configured

**Issue:** Step navigation not working
- **Fix:** Check validation logic isn't blocking navigation
- **Fix:** Verify `currentStep` is being updated correctly

---

## 📚 Full Documentation

See `docs/onboarding-implementation.md` for:
- Complete architecture overview
- Detailed step-by-step implementation guide
- Database schema examples
- Best practices
- Troubleshooting guide

