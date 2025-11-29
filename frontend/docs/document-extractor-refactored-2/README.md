# Document Extractor - Refactored Structure

## Overview

This refactored version of the Document Extractor splits the original 700+ line component into a modular, maintainable structure with improved document extraction capabilities.

## Key Improvements

### 1. Fixed PDF Import Issue
- Changed from CommonJS `require()` to **dynamic ES6 import**
- Uses `import('pdf-parse').default` which properly handles both CommonJS and ESM modules
- No more "export default doesn't exist" errors

### 2. Enhanced Document Extraction
- **Better file type detection**: Checks MIME type, file extension, AND buffer content
- **Smarter text chunking**: Uses regex for sentence boundaries instead of simple character search
- **New utility functions**: Token estimation, file validation helpers
- **Optimized switch statement**: Cleaner type detection logic

### 3. Modular Architecture
The component is now split into logical, reusable pieces:

```
components/documentExtractor/
├── DocumentExtractor.tsx          # Main component (160 lines)
├── index.ts                       # Barrel export
├── types.ts                       # TypeScript types
│
├── hooks/
│   ├── useDocumentExtractor.ts    # Business logic hook (220 lines)
│   └── useDragAndDrop.ts          # Drag & drop logic (90 lines)
│
├── steps/
│   ├── UploadStep.tsx             # File upload UI (90 lines)
│   ├── ContextStep.tsx            # Context input UI (90 lines)
│   └── ReviewStep.tsx             # Review items UI (110 lines)
│
└── components/
    ├── ExtractedItemCard.tsx      # Individual item card (140 lines)
    └── SuccessState.tsx           # Success/loading state (30 lines)
```

## Project Structure

### Core Files

#### `types.ts`
Shared TypeScript interfaces and types used throughout the component.

#### `DocumentExtractor.tsx`
Main component that orchestrates all the steps and manages the overall state.

### Hooks

#### `useDocumentExtractor.ts`
Custom hook containing all business logic:
- File upload and text extraction
- LLM processing
- Item management (edit, select, delete)
- Rules management
- Upload to knowledge base

#### `useDragAndDrop.ts`
Handles all drag-and-drop functionality:
- Global drag event prevention
- File validation
- Drag state management

### Step Components

#### `UploadStep.tsx`
File upload interface with drag-and-drop support.

#### `ContextStep.tsx`
Context prompt input with document statistics display.

#### `ReviewStep.tsx`
Item review and selection interface.

### Shared Components

#### `ExtractedItemCard.tsx`
Reusable card for displaying and editing extracted items with inline rule builder.

#### `SuccessState.tsx`
Loading and success state display.

## Enhanced Document Extraction (`extractors.ts`)

### New Features

1. **Dynamic PDF Import**
```typescript
const pdfParse = (await import('pdf-parse')).default;
```

2. **Smart File Type Detection**
```typescript
function detectFileType(buffer, mimeType, fileName) {
  // Checks MIME type, extension, and buffer content
  if (buffer.toString('utf-8', 0, 4) === '%PDF') return 'pdf';
  // ...
}
```

3. **Improved Text Chunking**
```typescript
// Uses regex for sentence boundaries
const sentencePattern = /[.!?][\s\n]/g;
const matches = [...chunk.matchAll(sentencePattern)];
```

4. **New Utility Functions**
- `estimateTokenCount()`: Rough token estimation
- `validateFileSize()`: File size validation
- `validateFileType()`: MIME and extension validation

## Usage

### Basic Import
```typescript
import DocumentExtractor from '@/components/documentExtractor';

// Or with types
import DocumentExtractor, { type ExtractedItem } from '@/components/documentExtractor';
```

### Example
```tsx
<DocumentExtractor
  onComplete={(items) => {
    console.log('Extracted items:', items);
  }}
  onCancel={() => {
    console.log('Cancelled');
  }}
  initialFlows={selectedFlows}
/>
```

## Migration Guide

### From Old to New

1. **Update imports**
```typescript
// Old
import DocumentExtractor from '@/components/DocumentExtractor';

// New
import DocumentExtractor from '@/components/documentExtractor';
```

2. **Replace extractors.ts**
Replace your old `lib/document-extraction/extractors.ts` with the new version.

3. **No API changes**
The component API remains the same - no changes needed to parent components.

## File Organization

Copy files to your project in this structure:

```
src/
├── components/
│   └── documentExtractor/
│       ├── DocumentExtractor.tsx
│       ├── index.ts
│       ├── types.ts
│       ├── hooks/
│       │   ├── useDocumentExtractor.ts
│       │   └── useDragAndDrop.ts
│       ├── steps/
│       │   ├── UploadStep.tsx
│       │   ├── ContextStep.tsx
│       │   └── ReviewStep.tsx
│       └── components/
│           ├── ExtractedItemCard.tsx
│           └── SuccessState.tsx
│
└── lib/
    └── document-extraction/
        └── extractors.ts
```

## Benefits

### Maintainability
- **Smaller files**: Each file has a single, clear responsibility
- **Easier debugging**: Issues can be isolated to specific files
- **Better testing**: Individual hooks and components can be tested separately

### Performance
- **Code splitting**: Smaller bundles with better tree-shaking
- **Optimized imports**: Only import what you need

### Developer Experience
- **Better IDE support**: Faster autocomplete with smaller files
- **Clearer structure**: Easy to find and modify specific functionality
- **Reusable hooks**: Logic can be reused in other components

## Troubleshooting

### PDF Import Errors

If you still see `export default doesn't exist`:
1. Make sure you're using the new `extractors.ts`
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `npm install pdf-parse@latest`

### TypeScript Errors

If you see type errors:
1. Make sure all imports point to the correct paths
2. Check that `types.ts` is properly exported in `index.ts`

### Missing Dependencies

Required packages:
- `pdf-parse`
- `mammoth`
- `axios`
- `lucide-react`

Install with:
```bash
npm install pdf-parse mammoth axios lucide-react
```

## Future Improvements

Potential enhancements:
- [ ] Add unit tests for hooks
- [ ] Implement error boundaries
- [ ] Add progress indicators for large files
- [ ] Support for more file types (Excel, PowerPoint)
- [ ] Batch processing of multiple files
- [ ] OCR for scanned PDFs
