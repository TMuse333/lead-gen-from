# Offer Editor - File Manifest

Complete list of all 21 files with descriptions and line counts.

---

## Type Definitions (1 file)

### `types/offerCustomization.types.ts` (138 lines)
**Purpose**: TypeScript type definitions for the entire customization system  
**Exports**:
- `InputRequirementsCustomization` - Input field modifications
- `PromptModifications` - Custom prompt changes
- `OfferCustomizations` - Complete customization object
- `OfferCustomizationDocument` - MongoDB document schema
- `OfferStats` - Statistics interface
- `OfferHistoryEntry` - Generation history entry
- `OfferTestRequest/Response` - Test generation types
- `EditorTab` - Tab identifier union type

---

## Database Layer (1 file)

### `lib/offerCustomization.ts` (135 lines)
**Purpose**: MongoDB operations for offer customizations  
**Functions**:
- `getOfferCustomizationsCollection()` - Get collection reference
- `getOfferCustomization()` - Fetch single customization
- `getAllOfferCustomizations()` - Fetch all for user
- `upsertOfferCustomization()` - Save/update customization
- `deleteOfferCustomization()` - Remove customization
- `updateLastTested()` - Update timestamp
- `updateLastGenerated()` - Update timestamp
- `isOfferEnabled()` - Check if offer is enabled

---

## Utilities (3 files)

### `lib/mergeCustomizations.ts` (175 lines)
**Purpose**: Merge system defaults with user overrides  
**Functions**:
- `mergeOfferDefinition()` - Main merge function
- `mergeInputRequirements()` - Merge input configs
- `extractCustomizations()` - Extract diffs for saving
- `hasCustomizations()` - Check if any exist
- `getCustomizationSummary()` - Human-readable summary

### `lib/validateCustomizations.ts` (195 lines)
**Purpose**: Validation logic for user customizations  
**Functions**:
- `validateCustomizations()` - Validate all customizations
- `validateGenerationMetadata()` - Validate model/temperature/etc
- `validateInputRequirements()` - Validate field changes
- `validatePromptModifications()` - Validate prompt text

### `lib/getSampleData.ts` (100 lines)
**Purpose**: Generate sample test data for each offer type  
**Functions**:
- `getSampleDataForOffer()` - Get sample data by type
- `getFieldLabel()` - Convert field names to labels
- `validateSampleData()` - Validate sample data completeness

---

## API Routes (4 files)

### `api/[type]/route.ts` (165 lines)
**Purpose**: Main API for fetching and saving customizations  
**Endpoints**:
- `GET /api/offers/[type]` - Fetch merged definition
- `PUT /api/offers/[type]` - Save customizations
- `DELETE /api/offers/[type]` - Reset to defaults

### `api/[type]/test/route.ts` (75 lines)
**Purpose**: Test offer generation  
**Endpoints**:
- `POST /api/offers/[type]/test` - Generate test offer

### `api/[type]/stats/route.ts` (60 lines)
**Purpose**: Fetch offer statistics  
**Endpoints**:
- `GET /api/offers/[type]/stats` - Get generation stats

### `api/[type]/history/route.ts` (55 lines)
**Purpose**: Fetch generation history  
**Endpoints**:
- `GET /api/offers/[type]/history` - Get recent generations

---

## Custom Hooks (3 files)

### `hooks/useOfferEditor.ts` (55 lines)
**Purpose**: Manage editor UI state  
**Returns**:
- `activeTab` - Currently active tab
- `setActiveTab()` - Change active tab
- `hasUnsavedChanges` - Track unsaved state
- `isLoading` - Loading state
- `error` - Error message
- `success` - Success message

### `hooks/useOfferCustomizations.ts` (130 lines)
**Purpose**: Fetch and save offer customizations  
**Returns**:
- `definition` - Merged offer definition
- `customization` - User customizations
- `hasCustomizations` - Boolean flag
- `isLoading` - Loading state
- `error` - Error message
- `refetch()` - Reload data
- `saveCustomizations()` - Save changes
- `resetToDefaults()` - Clear customizations

### `hooks/useOfferTest.ts` (80 lines)
**Purpose**: Handle test generation  
**Returns**:
- `isGenerating` - Generation in progress
- `result` - Test result
- `error` - Error message
- `generateTest()` - Start test generation
- `clearResult()` - Clear previous result

---

## Tab Components (7 files)

### `components/tabs/OverviewTab.tsx` (125 lines)
**Purpose**: Overview tab with status and basic info  
**Features**:
- Enable/disable toggle
- Basic info display (icon, name, version)
- Customization status indicator
- Quick stats grid (model, tokens, etc.)
- Activity timeline

### `components/tabs/InputsTab.tsx` (95 lines)
**Purpose**: Display input requirements  
**Features**:
- Required fields list
- Optional fields list
- Field validations display
- Type information

### `components/tabs/PromptTab.tsx` (40 lines)
**Purpose**: Show prompt configuration  
**Features**:
- System-managed prompt notice
- Prompt builder preview
- Info about future customization

### `components/tabs/OutputTab.tsx` (55 lines)
**Purpose**: Display output schema  
**Features**:
- Complete JSON schema
- Property breakdown
- Type and description display

### `components/tabs/SettingsTab.tsx` (125 lines)
**Purpose**: Edit generation settings  
**Features**:
- Model dropdown selection
- Temperature slider (0-2)
- Max tokens input
- Advanced settings (Top P, penalties)
- Save button
- Reset to defaults button

### `components/tabs/TestTab.tsx` (145 lines)
**Purpose**: Test offer generation  
**Features**:
- Editable sample data form
- Generate button with loading
- Success/failure indicators
- Metrics display (cost, tokens, duration)
- Full JSON output viewer

### `components/tabs/AnalyticsTab.tsx` (80 lines)
**Purpose**: Display generation analytics  
**Features**:
- Stats grid (total, success rate, avg cost, avg tokens)
- Placeholder for future detailed analytics
- Color-coded stat cards

---

## Main Component (1 file)

### `components/OfferEditor.tsx` (190 lines)
**Purpose**: Main editor component with tab navigation  
**Features**:
- Tab navigation bar
- Tab content rendering
- Loading states
- Error/success notifications
- Back navigation
- State management
- API integration

---

## Summary by Category

| Category | Files | Total Lines |
|----------|-------|-------------|
| Types | 1 | 138 |
| Database | 1 | 135 |
| Utilities | 3 | 470 |
| API Routes | 4 | 355 |
| Hooks | 3 | 265 |
| Tab Components | 7 | 665 |
| Main Component | 1 | 190 |
| **TOTAL** | **21** | **~2,218** |

---

## File Size Distribution

| Size Range | Count | Files |
|------------|-------|-------|
| 0-50 lines | 1 | PromptTab |
| 51-100 lines | 7 | OutputTab, getSampleData, useOfferEditor, AnalyticsTab, test route, stats route, history route |
| 101-150 lines | 7 | offerCustomization, InputsTab, mergeCustomizations, useOfferCustomizations, useOfferTest, OverviewTab, SettingsTab |
| 151-200 lines | 6 | offerCustomization.types, validateCustomizations, main route, TestTab, OfferEditor |

**Largest file**: 195 lines (validateCustomizations.ts)  
**Smallest file**: 40 lines (PromptTab.tsx)  
**Average file size**: 119 lines  

✅ **All files under 200 lines as requested!**

---

## Dependencies

### External Packages (already in project)
- `mongodb` - Database operations
- `next-auth` - Authentication
- `framer-motion` - Animations
- `lucide-react` - Icons
- `next` - Framework

### Internal Dependencies
- `@/lib/offers` - Offer system (Phases 1 & 2)
- `@/stores/onboardingStore` - OfferType definition
- `@/contexts/UserConfigContext` - User config
- `@/lib/mongodb/db` - Database connection

---

## TypeScript Exports

### Types Module
```typescript
import type {
  OfferCustomizations,
  OfferCustomizationDocument,
  OfferStats,
  OfferHistoryEntry,
  OfferTestRequest,
  OfferTestResponse,
  EditorTab,
} from '@/types/offerCustomization.types';
```

### Hooks
```typescript
import { useOfferEditor } from '@/hooks/useOfferEditor';
import { useOfferCustomizations } from '@/hooks/useOfferCustomizations';
import { useOfferTest } from '@/hooks/useOfferTest';
```

### Utilities
```typescript
import { mergeOfferDefinition } from '@/lib/offers/utils/mergeCustomizations';
import { validateCustomizations } from '@/lib/offers/utils/validateCustomizations';
import { getSampleDataForOffer } from '@/lib/offers/utils/getSampleData';
```

### Database
```typescript
import {
  getOfferCustomization,
  upsertOfferCustomization,
  deleteOfferCustomization,
} from '@/lib/mongodb/models/offerCustomization';
```

### Components
```typescript
import { OfferEditor } from '@/components/dashboard/user/offers/OfferEditor';
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/offers/[type]` | Fetch offer definition + customizations |
| PUT | `/api/offers/[type]` | Save customizations |
| DELETE | `/api/offers/[type]` | Reset to defaults |
| POST | `/api/offers/[type]/test` | Test generation |
| GET | `/api/offers/[type]/stats` | Get statistics |
| GET | `/api/offers/[type]/history` | Get generation history |

---

## MongoDB Collections

### `offer_customizations`
**Schema**: See `OfferCustomizationDocument` type  
**Indexes**: `{ userId: 1, offerType: 1 }` (compound unique)  
**Purpose**: Store user-specific offer customizations

---

This manifest provides a complete overview of all files in the Offer Editor system!
