# Document Extraction Feature - Design Document

## Overview
Extract structured advice/knowledge from uploaded documents (PDF, DOCX, TXT) using a hybrid approach:
1. **Non-LLM text extraction** (fast, cheap)
2. **LLM processing** (intelligent extraction based on user context)
3. **User validation** (edit/confirm before upload)

## Flow Architecture

```
User uploads file
    ↓
[Non-LLM] Extract raw text (pdf-parse, mammoth, etc.)
    ↓
User provides context prompt ("extract pricing strategies", "get renovation tips", etc.)
    ↓
[LLM] Process text with context → Extract structured advice items
    ↓
User reviews/edits extracted items
    ↓
User optionally adds rules for each item
    ↓
User clicks "Upload to Database"
    ↓
Items saved to Qdrant + MongoDB
```

## Token Tracking Integration

### New Feature Type
```typescript
export interface DocumentExtractionUsage extends BaseLLMUsage {
  feature: 'documentExtraction';
  apiType: 'chat';
  model: 'gpt-4o-mini' | 'claude-3-5-sonnet'; // Can use Claude for complex docs
  featureData: {
    documentType: 'pdf' | 'docx' | 'txt' | 'other';
    documentSize: number; // bytes
    extractedTextLength: number; // characters
    contextPrompt?: string; // User's custom prompt
    itemsExtracted: number; // How many advice items extracted
    itemsValidated: number; // How many user confirmed
    itemsWithRules: number; // How many have rules attached
    processingMethod: 'chunked' | 'full'; // If document was chunked
    chunksProcessed?: number;
  };
}
```

## Non-LLM Text Extraction

### Libraries Needed
```json
{
  "pdf-parse": "^1.1.1",        // PDF text extraction
  "mammoth": "^1.6.0",          // DOCX to HTML/text
  "mime-types": "^2.1.35"       // File type detection
}
```

### Extraction Functions
```typescript
// lib/document-extraction/extractors.ts

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use pdf-parse
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  // Use mammoth
}

export async function extractTextFromFile(file: File): Promise<{
  text: string;
  type: string;
  size: number;
}> {
  // Route to appropriate extractor based on MIME type
}
```

## API Route Structure

### `/api/document-extraction/extract-text` (Non-LLM)
```typescript
// POST /api/document-extraction/extract-text
// Input: FormData with file
// Output: { text: string, type: string, size: number }
// No token tracking needed (non-LLM)
```

### `/api/document-extraction/process` (LLM)
```typescript
// POST /api/document-extraction/process
// Input: {
//   text: string,
//   contextPrompt: string,
//   flows: string[],
//   documentType: string
// }
// Output: {
//   items: Array<{
//     title: string,
//     advice: string,
//     confidence: number,
//     source: string // Which part of doc it came from
//   }>
// }
// Tracks: DocumentExtractionUsage
```

### `/api/document-extraction/upload` (Final step)
```typescript
// POST /api/document-extraction/upload
// Input: {
//   items: Array<{
//     title: string,
//     advice: string,
//     flows: string[],
//     tags: string[],
//     ruleGroups?: RuleGroup[]
//   }>
// }
// Output: { success: true, uploaded: number, adviceIds: string[] }
// Tracks: EmbeddingUsage (for each item uploaded)
```

## Frontend Component Structure

### Component: `DocumentExtractor.tsx`
```typescript
// components/dashboard/user/documentExtraction/documentExtractor.tsx

Steps:
1. FileUploadStep - Drag & drop, file selection
2. TextPreviewStep - Show extracted text (non-LLM result)
3. ContextPromptStep - User enters context prompt
4. ProcessingStep - LLM processes (loading state)
5. ReviewStep - User reviews/edits extracted items
6. RulesStep - Optional: Add rules to items
7. UploadStep - Final confirmation and upload
```

## Token Tracking Implementation

### Step 1: Add to tokenUsage.types.ts
```typescript
// Add DocumentExtractionUsage interface
// Add to LLMUsageTracking union type
```

### Step 2: Track in API route
```typescript
// In /api/document-extraction/process
const startTime = Date.now();
const completion = await openai.chat.completions.create({...});
const endTime = Date.now();

const usage: DocumentExtractionUsage = {
  ...createBaseTrackingObject({...}),
  feature: 'documentExtraction',
  featureData: {
    documentType,
    documentSize,
    extractedTextLength: text.length,
    contextPrompt,
    itemsExtracted: extractedItems.length,
    // ... other metadata
  }
};

trackUsageAsync(usage);
```

## Smart Chunking Strategy

For large documents (>50K characters):
1. Split into chunks (10K chars each, with overlap)
2. Process each chunk separately
3. Deduplicate/merge results
4. Track total chunks processed

```typescript
if (text.length > 50000) {
  const chunks = chunkText(text, 10000, 2000); // 10K chunks, 2K overlap
  // Process each chunk
  // Merge results
  usage.featureData.processingMethod = 'chunked';
  usage.featureData.chunksProcessed = chunks.length;
}
```

## Cost Optimization

1. **Text extraction is free** (non-LLM)
2. **Chunking reduces token costs** (process in smaller pieces)
3. **User validation prevents bad uploads** (saves embedding costs)
4. **Batch embedding** (upload multiple items at once)

## Integration Points

### Where to add in UI:
- **Onboarding Step 4**: Add "Upload Document" option alongside manual/questions
- **User Dashboard**: New "Document Extraction" tab in knowledge base section
- **Admin Dashboard**: View document extraction usage stats

### Database:
- Store extracted items in `knowledgeBaseItems` (same as manual uploads)
- Track source as `'document'` (already supported)
- Store original document metadata (optional)

## Example User Flow

1. User clicks "Upload Document" in Step 4
2. Drops PDF file → System extracts text (instant, no LLM)
3. User sees extracted text preview
4. User enters: "Extract all pricing strategies and renovation tips"
5. System processes with LLM → Returns structured items
6. User reviews, edits titles/advice, removes unwanted items
7. User optionally adds rules: "Only show if timeline = urgent"
8. User clicks "Upload" → Items saved to Qdrant
9. Done!

## Benefits of This Approach

✅ **Cost efficient**: Only LLM for processing, not extraction
✅ **Fast**: Text extraction is instant
✅ **User control**: Validation step prevents bad data
✅ **Flexible**: User provides context, not hardcoded prompts
✅ **Trackable**: Full token usage tracking
✅ **Quality**: User can edit before upload

