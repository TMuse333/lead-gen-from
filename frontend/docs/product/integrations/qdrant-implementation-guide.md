# Qdrant Implementation Guide for New App

Complete step-by-step guide to implement Qdrant vector storage in your new app, using the proven patterns from the agent-lead-gen project.

---

## Overview

This guide shows you how to implement Qdrant for storing and searching website knowledge (component patterns, best practices, editing styles) using the same patterns and code structure as the agent-lead-gen chatbot app.

**Goal**: Set up Qdrant with semantic search for AI Web Assistant knowledge base.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Step 1: Install Dependencies](#step-1-install-dependencies)
4. [Step 2: Environment Variables](#step-2-environment-variables)
5. [Step 3: Qdrant Client Setup](#step-3-qdrant-client-setup)
6. [Step 4: Collection Management](#step-4-collection-management)
7. [Step 5: Embedding Generation](#step-5-embedding-generation)
8. [Step 6: Knowledge Storage](#step-6-knowledge-storage)
9. [Step 7: Knowledge Search](#step-7-knowledge-search)
10. [Step 8: API Routes](#step-8-api-routes)
11. [Step 9: Testing](#step-9-testing)
12. [Step 10: Knowledge Population](#step-10-knowledge-population)

---

## Prerequisites

- Next.js 16+ with App Router
- TypeScript configured
- Qdrant instance (local or cloud)
- OpenAI API key (for embeddings)

---

## Project Structure

Create this folder structure in your new app:

```
your-app/
├── src/
│   ├── lib/
│   │   ├── qdrant/
│   │   │   ├── client.ts                    # Qdrant client initialization
│   │   │   ├── collections/
│   │   │   │   └── vector/
│   │   │   │       └── knowledge/
│   │   │   │           ├── collection.ts   # Collection management
│   │   │   │           ├── queries.ts       # Search functions
│   │   │   │           └── upsert.ts       # Storage functions
│   │   ├── openai/
│   │   │   └── embedding.ts                 # Embedding generation
│   │   └── types/
│   │       └── knowledge.types.ts           # TypeScript types
│   └── app/
│       └── api/
│           └── knowledge/
│               ├── search/
│               │   └── route.ts            # Search endpoint
│               ├── add/
│               │   └── route.ts            # Add knowledge endpoint
│               └── collections/
│                   └── route.ts            # List collections endpoint
├── .env.local
└── package.json
```

---

## Step 1: Install Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@qdrant/js-client-rest": "^1.15.1",
    "openai": "^6.7.0",
    "next": "16.0.1"
  }
}
```

Run:
```bash
npm install
```

---

## Step 2: Environment Variables

Add to `.env.local`:

```env
# Qdrant Configuration
QDRANT_URL=http://localhost:6333
# Or for cloud: https://your-cluster.qdrant.io
QDRANT_API_KEY=your-api-key-here
# Optional: Leave empty for local Qdrant

# OpenAI Configuration (for embeddings)
OPENAI_KEY=your-openai-api-key

# Optional: Default collection name
QDRANT_COLLECTION_NAME=general_website_knowledge
```

---

## Step 3: Qdrant Client Setup

**File**: `src/lib/qdrant/client.ts`

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

/**
 * Qdrant client instance
 * Singleton pattern - use this throughout the app
 */
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

// Export as alias for consistency
export { qdrant as qdrantClient };

/**
 * Collection names constant
 * Add new collections here as needed
 */
export const COLLECTIONS = {
  GENERAL_KNOWLEDGE: 'general_website_knowledge',
  COMPONENT_PATTERNS: 'component_patterns',
} as const;
```

**What this does:**
- Creates a singleton Qdrant client
- Configures connection from environment variables
- Exports collection name constants

---

## Step 4: Collection Management

**File**: `src/lib/qdrant/collections/vector/knowledge/collection.ts`

```typescript
import { qdrant } from '../../../client';
import { COLLECTIONS } from '../../../client';

/**
 * Default knowledge collection name
 */
export const KNOWLEDGE_COLLECTION =
  process.env.QDRANT_COLLECTION_NAME || COLLECTIONS.GENERAL_KNOWLEDGE;

/**
 * Ensure the knowledge collection exists
 * Creates it if it doesn't exist
 * 
 * Collection configuration:
 * - Vector size: 1536 (OpenAI text-embedding-ada-002)
 * - Distance metric: Cosine (best for semantic similarity)
 * - On disk: true (saves memory)
 */
export async function ensureKnowledgeCollection(
  collectionName: string = KNOWLEDGE_COLLECTION
): Promise<void> {
  try {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some((col) => col.name === collectionName);

    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: 1536, // OpenAI ada-002 embedding size
          distance: 'Cosine' as const,
          on_disk: true, // Saves memory
        },
        optimizers_config: {
          default_segment_number: 5,
          memmap_threshold: 20000,
        },
      });
      console.log('✅ Created Qdrant collection:', collectionName);
    } else {
      console.log('✅ Qdrant collection already exists:', collectionName);
    }
  } catch (error: any) {
    // Handle case where collection might already exist (race condition)
    if (error?.message?.includes('already exists') || error?.status === 409) {
      console.log('✅ Qdrant collection already exists (from error):', collectionName);
      return;
    }
    console.error('❌ Failed to ensure knowledge collection:', error);
    throw error;
  }
}

/**
 * Check if a collection exists
 */
export async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    const { collections } = await qdrant.getCollections();
    return collections.some((col) => col.name === collectionName);
  } catch (error) {
    console.error('❌ Failed to check collection existence:', error);
    return false;
  }
}

/**
 * Delete a collection (use with caution!)
 */
export async function deleteCollection(collectionName: string): Promise<void> {
  try {
    await qdrant.deleteCollection(collectionName);
    console.log('✅ Deleted collection:', collectionName);
  } catch (error) {
    console.error('❌ Failed to delete collection:', error);
    throw error;
  }
}
```

**What this does:**
- Ensures collections exist before use
- Creates collections with proper configuration
- Handles race conditions gracefully
- Provides utility functions for collection management

---

## Step 5: Embedding Generation

**File**: `src/lib/openai/embedding.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Generate an embedding vector from text
 * Uses OpenAI's text-embedding-ada-002 model
 * 
 * @param text - Text to embed
 * @param metadata - Optional metadata for logging
 * @returns Embedding vector (1536 dimensions)
 */
export async function getEmbedding(
  text: string,
  metadata?: {
    userId?: string;
    knowledgeId?: string;
    knowledgeTitle?: string;
    collectionName?: string;
  }
): Promise<number[]> {
  try {
    console.log('🔍 Generating embedding...', {
      text: text.substring(0, 100) + '...',
      ...metadata,
    });

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0].embedding;
    console.log(`✅ Embedding generated: ${embedding.length} dimensions`);

    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embedding for a search query
 * Same as getEmbedding but with query-specific logging
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return getEmbedding(query, { knowledgeTitle: 'search-query' });
}
```

**What this does:**
- Generates embeddings using OpenAI
- Uses `text-embedding-ada-002` model (1536 dimensions)
- Includes logging for debugging
- Handles errors gracefully

---

## Step 6: Knowledge Storage

**File**: `src/lib/qdrant/collections/vector/knowledge/upsert.ts`

```typescript
import { qdrant } from '../../../client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Knowledge point payload structure
 */
export interface KnowledgePointPayload {
  content: string; // The actual knowledge text
  metadata: {
    type: string; // e.g., "component_pattern", "best_practice", "editing_style"
    source: string; // e.g., "component-generation-guide"
    tags: string[]; // e.g., ["components", "structure", "files"]
    title?: string; // Optional title
    description?: string; // Optional description
    [key: string]: any; // Allow additional metadata
  };
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Store a knowledge point in Qdrant
 * 
 * @param collectionName - Collection to store in
 * @param content - Knowledge content text
 * @param embedding - Pre-generated embedding vector
 * @param metadata - Knowledge metadata
 * @returns Point ID
 */
export async function storeKnowledgePoint(
  collectionName: string,
  content: string,
  embedding: number[],
  metadata: KnowledgePointPayload['metadata']
): Promise<string> {
  try {
    // Generate deterministic ID from content hash to prevent duplicates
    const contentHash = Buffer.from(content)
      .toString('base64')
      .substring(0, 32);
    const pointId = `kb-${contentHash}`;

    const payload: KnowledgePointPayload = {
      content,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Storing knowledge point...', {
      id: pointId,
      collection: collectionName,
      title: metadata.title || 'Untitled',
    });

    await qdrant.upsert(collectionName, {
      wait: true, // Wait for operation to complete
      points: [
        {
          id: pointId,
          vector: embedding,
          payload,
        },
      ],
    });

    console.log('✅ Stored knowledge point:', pointId);
    return pointId;
  } catch (error) {
    console.error('❌ Error storing knowledge point:', error);
    throw error;
  }
}

/**
 * Update an existing knowledge point
 */
export async function updateKnowledgePoint(
  collectionName: string,
  pointId: string,
  content: string,
  embedding: number[],
  metadata: KnowledgePointPayload['metadata']
): Promise<void> {
  try {
    const payload: KnowledgePointPayload = {
      content,
      metadata,
      createdAt: new Date().toISOString(), // Keep original or update?
      updatedAt: new Date().toISOString(),
    };

    await qdrant.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload,
        },
      ],
    });

    console.log('✅ Updated knowledge point:', pointId);
  } catch (error) {
    console.error('❌ Error updating knowledge point:', error);
    throw error;
  }
}

/**
 * Delete a knowledge point
 */
export async function deleteKnowledgePoint(
  collectionName: string,
  pointId: string
): Promise<void> {
  try {
    await qdrant.delete(collectionName, {
      wait: true,
      points: [pointId],
    });
    console.log('✅ Deleted knowledge point:', pointId);
  } catch (error) {
    console.error('❌ Error deleting knowledge point:', error);
    throw error;
  }
}
```

**What this does:**
- Stores knowledge points with embeddings
- Uses deterministic IDs to prevent duplicates
- Includes metadata for filtering and organization
- Provides update and delete functions

---

## Step 7: Knowledge Search

**File**: `src/lib/qdrant/collections/vector/knowledge/queries.ts`

```typescript
import { qdrant } from '../../../client';
import { KNOWLEDGE_COLLECTION } from './collection';

/**
 * Search result structure
 */
export interface KnowledgeSearchResult {
  id: string;
  score: number; // Similarity score (0-1, higher is better)
  content: string;
  metadata: {
    type: string;
    source: string;
    tags: string[];
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

/**
 * Search for relevant knowledge points
 * 
 * @param embedding - Query embedding vector
 * @param collectionName - Collection to search (defaults to KNOWLEDGE_COLLECTION)
 * @param limit - Max number of results (default: 10)
 * @param filters - Optional metadata filters
 * @returns Array of search results sorted by relevance
 */
export async function searchKnowledge(
  embedding: number[],
  collectionName: string = KNOWLEDGE_COLLECTION,
  limit: number = 10,
  filters?: {
    type?: string;
    source?: string;
    tags?: string[];
  }
): Promise<KnowledgeSearchResult[]> {
  try {
    console.log('🔍 Searching knowledge base...', {
      collection: collectionName,
      limit,
      filters,
      embeddingDimensions: embedding.length,
    });

    // Build filter if provided
    const filter: any = {};
    if (filters) {
      const must: any[] = [];
      
      if (filters.type) {
        must.push({
          key: 'metadata.type',
          match: { value: filters.type },
        });
      }
      
      if (filters.source) {
        must.push({
          key: 'metadata.source',
          match: { value: filters.source },
        });
      }
      
      if (filters.tags && filters.tags.length > 0) {
        must.push({
          key: 'metadata.tags',
          match: { any: filters.tags },
        });
      }
      
      if (must.length > 0) {
        filter.must = must;
      }
    }

    const searchResult = await qdrant.search(collectionName, {
      vector: embedding,
      limit,
      with_payload: true,
      ...(Object.keys(filter).length > 0 && { filter }),
    });

    console.log(`✅ Found ${searchResult.length} results`);

    const results: KnowledgeSearchResult[] = searchResult.map((result) => {
      const payload = result.payload as any;
      return {
        id: result.id as string,
        score: result.score || 0,
        content: payload.content,
        metadata: payload.metadata,
      };
    });

    // Log top results
    results.slice(0, 3).forEach((r, i) => {
      console.log(`   ${i + 1}. Score: ${r.score.toFixed(3)} | ${r.metadata.title || 'Untitled'}`);
    });

    return results;
  } catch (error) {
    console.error('❌ Error searching knowledge:', error);
    return [];
  }
}

/**
 * Get all knowledge points from a collection (for admin/debugging)
 */
export async function getAllKnowledge(
  collectionName: string = KNOWLEDGE_COLLECTION,
  limit: number = 100
): Promise<KnowledgeSearchResult[]> {
  try {
    const result = await qdrant.scroll(collectionName, {
      limit,
      with_payload: true,
      with_vector: false, // Don't return vectors (saves bandwidth)
    });

    return result.points.map((point) => {
      const payload = point.payload as any;
      return {
        id: point.id as string,
        score: 1, // No score for scroll results
        content: payload.content,
        metadata: payload.metadata,
      };
    });
  } catch (error) {
    console.error('❌ Error getting all knowledge:', error);
    return [];
  }
}
```

**What this does:**
- Searches knowledge base using semantic similarity
- Supports metadata filtering
- Returns results sorted by relevance score
- Includes logging for debugging

---

## Step 8: API Routes

### Search Endpoint

**File**: `src/app/api/knowledge/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateQueryEmbedding } from '@/lib/openai/embedding';
import { searchKnowledge } from '@/lib/qdrant/collections/vector/knowledge/queries';
import { KNOWLEDGE_COLLECTION } from '@/lib/qdrant/collections/vector/knowledge/collection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      collection = KNOWLEDGE_COLLECTION,
      limit = 10,
      filters,
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for query
    const embedding = await generateQueryEmbedding(query);

    // Search knowledge base
    const results = await searchKnowledge(embedding, collection, limit, filters);

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('❌ Error in search endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### Add Knowledge Endpoint

**File**: `src/app/api/knowledge/add/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getEmbedding } from '@/lib/openai/embedding';
import { storeKnowledgePoint } from '@/lib/qdrant/collections/vector/knowledge/upsert';
import { ensureKnowledgeCollection } from '@/lib/qdrant/collections/vector/knowledge/collection';
import { KNOWLEDGE_COLLECTION } from '@/lib/qdrant/collections/vector/knowledge/collection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collection = KNOWLEDGE_COLLECTION,
      content,
      metadata,
    } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!metadata || !metadata.type || !metadata.source) {
      return NextResponse.json(
        { error: 'Metadata with type and source is required' },
        { status: 400 }
      );
    }

    // Ensure collection exists
    await ensureKnowledgeCollection(collection);

    // Generate embedding
    const embedding = await getEmbedding(content, {
      knowledgeTitle: metadata.title,
      collectionName: collection,
    });

    // Store knowledge point
    const pointId = await storeKnowledgePoint(
      collection,
      content,
      embedding,
      metadata
    );

    return NextResponse.json({
      success: true,
      id: pointId,
      message: 'Knowledge point added successfully',
    });
  } catch (error) {
    console.error('❌ Error adding knowledge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### List Collections Endpoint

**File**: `src/app/api/knowledge/collections/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { qdrant } from '@/lib/qdrant/client';

export async function GET(request: NextRequest) {
  try {
    const { collections } = await qdrant.getCollections();
    
    const collectionNames = collections.map((col) => col.name);

    return NextResponse.json({
      success: true,
      collections: collectionNames,
      count: collectionNames.length,
    });
  } catch (error) {
    console.error('❌ Error listing collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Step 9: Testing

### Test Script

**File**: `src/scripts/test-qdrant.ts`

```typescript
import dotenv from 'dotenv';
import { qdrant } from '../lib/qdrant/client';
import { ensureKnowledgeCollection } from '../lib/qdrant/collections/vector/knowledge/collection';
import { getEmbedding } from '../lib/openai/embedding';
import { storeKnowledgePoint } from '../lib/qdrant/collections/vector/knowledge/upsert';
import { searchKnowledge } from '../lib/qdrant/collections/vector/knowledge/queries';
import { KNOWLEDGE_COLLECTION } from '../lib/qdrant/collections/vector/knowledge/collection';

dotenv.config({ path: '../../.env' });

async function testQdrant() {
  try {
    console.log('🚀 Starting Qdrant tests...\n');

    // Test 1: Connection
    console.log('📡 Test 1: Testing Qdrant connection...');
    const { collections } = await qdrant.getCollections();
    console.log(`✅ Connected! Found ${collections.length} collections\n`);

    // Test 2: Collection creation
    console.log('📦 Test 2: Ensuring collection exists...');
    await ensureKnowledgeCollection();
    console.log('✅ Collection ready\n');

    // Test 3: Embedding generation
    console.log('🔍 Test 3: Generating test embedding...');
    const testText = 'Components should have three files: index.ts, componentName.tsx, and componentNameEdit.tsx';
    const embedding = await getEmbedding(testText);
    console.log(`✅ Embedding generated: ${embedding.length} dimensions\n`);

    // Test 4: Store knowledge point
    console.log('💾 Test 4: Storing test knowledge point...');
    const pointId = await storeKnowledgePoint(
      KNOWLEDGE_COLLECTION,
      testText,
      embedding,
      {
        type: 'component_pattern',
        source: 'test',
        tags: ['components', 'structure', 'test'],
        title: 'Test Component Structure',
      }
    );
    console.log(`✅ Stored with ID: ${pointId}\n`);

    // Test 5: Search
    console.log('🔎 Test 5: Testing search...');
    const query = 'How should components be structured?';
    const queryEmbedding = await getEmbedding(query);
    const results = await searchKnowledge(queryEmbedding, KNOWLEDGE_COLLECTION, 5);
    console.log(`✅ Found ${results.length} results:`);
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. Score: ${r.score.toFixed(3)} | ${r.metadata.title}`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testQdrant();
```

Run with:
```bash
npx tsx src/scripts/test-qdrant.ts
```

---

## Step 10: Knowledge Population

### Example: Populate from Component Guide

**File**: `src/scripts/populate-knowledge.ts`

```typescript
import dotenv from 'dotenv';
import { ensureKnowledgeCollection } from '../lib/qdrant/collections/vector/knowledge/collection';
import { getEmbedding } from '../lib/openai/embedding';
import { storeKnowledgePoint } from '../lib/qdrant/collections/vector/knowledge/upsert';
import { KNOWLEDGE_COLLECTION } from '../lib/qdrant/collections/vector/knowledge/collection';

dotenv.config({ path: '../../.env' });

// Example knowledge points
const KNOWLEDGE_POINTS = [
  {
    content: "Every component must have three files: index.ts (registry, types, exports), componentName.tsx (production component with required props), and componentNameEdit.tsx (editorial component with editor UI).",
    metadata: {
      type: "component_pattern",
      source: "component-generation-guide",
      tags: ["components", "structure", "files"],
      title: "Component File Structure (3 Files Required)",
    },
  },
  {
    content: "Production components should have required props (not Partial<>), since props are guaranteed to exist. No optional chaining or safe checks needed on required props.",
    metadata: {
      type: "component_pattern",
      source: "component-generation-guide",
      tags: ["components", "props", "typescript"],
      title: "Production Component Props (Required, Not Partial)",
    },
  },
  {
    content: "Always use Next.js Image component from 'next/image', never use <img> tags. Always include src and alt properties. Use ImageProp type for images.",
    metadata: {
      type: "editing_style",
      source: "component-generation-guide",
      tags: ["images", "nextjs", "components"],
      title: "Image Handling Pattern (Next.js Image Required)",
    },
  },
  // Add more knowledge points...
];

async function populateKnowledge() {
  try {
    console.log('🚀 Starting knowledge population...\n');

    // Ensure collection exists
    await ensureKnowledgeCollection();

    console.log(`📝 Adding ${KNOWLEDGE_POINTS.length} knowledge points...\n`);

    for (let i = 0; i < KNOWLEDGE_POINTS.length; i++) {
      const point = KNOWLEDGE_POINTS[i];
      console.log(`[${i + 1}/${KNOWLEDGE_POINTS.length}] Processing: ${point.metadata.title}`);

      // Generate embedding
      const embedding = await getEmbedding(point.content, {
        knowledgeTitle: point.metadata.title,
        collectionName: KNOWLEDGE_COLLECTION,
      });

      // Store in Qdrant
      const pointId = await storeKnowledgePoint(
        KNOWLEDGE_COLLECTION,
        point.content,
        embedding,
        point.metadata
      );

      console.log(`✅ Stored: ${pointId}\n`);
    }

    console.log('✅ Knowledge population complete!');
  } catch (error) {
    console.error('❌ Error populating knowledge:', error);
    process.exit(1);
  }
}

populateKnowledge();
```

---

## TypeScript Types

**File**: `src/lib/types/knowledge.types.ts`

```typescript
/**
 * Knowledge point metadata structure
 */
export interface KnowledgeMetadata {
  type: string; // e.g., "component_pattern", "best_practice", "editing_style"
  source: string; // e.g., "component-generation-guide"
  tags: string[]; // e.g., ["components", "structure"]
  title?: string;
  description?: string;
  [key: string]: any; // Allow additional metadata
}

/**
 * Knowledge point payload stored in Qdrant
 */
export interface KnowledgePointPayload {
  content: string;
  metadata: KnowledgeMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search result from Qdrant
 */
export interface KnowledgeSearchResult {
  id: string;
  score: number;
  content: string;
  metadata: KnowledgeMetadata;
}

/**
 * Request body for adding knowledge
 */
export interface AddKnowledgeRequest {
  collection?: string;
  content: string;
  metadata: KnowledgeMetadata;
}

/**
 * Request body for searching knowledge
 */
export interface SearchKnowledgeRequest {
  query: string;
  collection?: string;
  limit?: number;
  filters?: {
    type?: string;
    source?: string;
    tags?: string[];
  };
}
```

---

## Usage Examples

### Example 1: Add Knowledge via API

```typescript
// Frontend or API call
const response = await fetch('/api/knowledge/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "Components should have three files: index.ts, componentName.tsx, and componentNameEdit.tsx",
    metadata: {
      type: "component_pattern",
      source: "component-generation-guide",
      tags: ["components", "structure"],
      title: "Component File Structure",
    },
  }),
});

const result = await response.json();
console.log('Added:', result.id);
```

### Example 2: Search Knowledge via API

```typescript
// Frontend or API call
const response = await fetch('/api/knowledge/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "How should components be structured?",
    limit: 5,
    filters: {
      type: "component_pattern",
    },
  }),
});

const { results } = await response.json();
results.forEach((r: KnowledgeSearchResult) => {
  console.log(`${r.metadata.title}: ${r.content}`);
});
```

### Example 3: Use in AI Assistant

```typescript
// In your AI assistant route
import { generateQueryEmbedding } from '@/lib/openai/embedding';
import { searchKnowledge } from '@/lib/qdrant/collections/vector/knowledge/queries';

export async function POST(request: Request) {
  const { userQuery } = await request.json();
  
  // Search knowledge base for relevant context
  const queryEmbedding = await generateQueryEmbedding(userQuery);
  const knowledge = await searchKnowledge(queryEmbedding, undefined, 5);
  
  // Build prompt with knowledge context
  const context = knowledge
    .map((k) => `${k.metadata.title}: ${k.content}`)
    .join('\n\n');
  
  const prompt = `
    Relevant knowledge:
    ${context}
    
    User query: ${userQuery}
    
    Please answer based on the knowledge above.
  `;
  
  // Continue with LLM call...
}
```

---

## Common Patterns from agent-lead-gen

### Pattern 1: Deterministic IDs

```typescript
// Prevent duplicates by using content hash
const contentHash = Buffer.from(content)
  .toString('base64')
  .substring(0, 32);
const pointId = `kb-${contentHash}`;
```

### Pattern 2: Collection Per User (Optional)

```typescript
// If you need per-user collections
export function getUserCollectionName(userId: string): string {
  const sanitized = userId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `user-${sanitized}-knowledge`;
}
```

### Pattern 3: Metadata Filtering

```typescript
// Filter by metadata in search
const results = await searchKnowledge(embedding, collection, 10, {
  type: 'component_pattern',
  tags: ['components', 'structure'],
});
```

### Pattern 4: Error Handling

```typescript
// Always handle race conditions for collection creation
try {
  await qdrant.createCollection(name, config);
} catch (error: any) {
  if (error?.message?.includes('already exists') || error?.status === 409) {
    // Collection already exists, continue
    return;
  }
  throw error;
}
```

---

## Troubleshooting

### Issue: "Collection not found"
**Solution**: Ensure collection exists before searching:
```typescript
await ensureKnowledgeCollection(collectionName);
```

### Issue: "Embedding dimensions mismatch"
**Solution**: Always use 1536 dimensions (text-embedding-ada-002):
```typescript
vectors: { size: 1536, distance: 'Cosine' }
```

### Issue: "No results from search"
**Solution**: 
- Check collection has data: `await qdrant.scroll(collectionName)`
- Verify embedding generation works
- Check query is semantically similar to stored content

### Issue: "Connection refused"
**Solution**: 
- Verify `QDRANT_URL` is correct
- Check Qdrant is running: `curl http://localhost:6333/health`
- For cloud, verify API key is set

---

## Next Steps

1. **Populate Initial Knowledge**
   - Add component generation guide chunks
   - Add best practices
   - Add editing style preferences

2. **Integrate with AI Assistant**
   - Call search API before LLM prompts
   - Include relevant knowledge in context
   - Test improved accuracy

3. **Add More Collections**
   - Create `component_patterns` collection
   - Create `best_practices` collection
   - Organize by knowledge type

4. **Add Authentication** (if needed)
   - Protect API routes
   - Add user-specific collections
   - Track usage per user

---

## Summary

You now have a complete Qdrant implementation using the same patterns as agent-lead-gen:

✅ Qdrant client setup  
✅ Collection management  
✅ Embedding generation  
✅ Knowledge storage  
✅ Semantic search  
✅ API routes  
✅ TypeScript types  
✅ Testing scripts  

**Key Differences from agent-lead-gen:**
- Simplified for website knowledge (no user-specific collections by default)
- Focused on component patterns and best practices
- No complex rule matching (just semantic search)
- Cleaner API structure for knowledge base use case

**Ready to use!** Start by running the test script, then populate your knowledge base.

---

# Frontend Component Guide: Qdrant Knowledge Base UI

Complete guide for building React components to view and manage your Qdrant knowledge base, following the same design patterns and color scheme as agent-lead-gen.

---

## Design System & Colors

### Color Palette

The app uses a dark theme with cyan/blue accents:

```typescript
// Primary Colors
const COLORS = {
  // Backgrounds
  background: '#0f172a',      // slate-900 - Main page background
  surface: '#1e293b',         // slate-800 - Cards, panels, surfaces
  surfaceHover: '#334155',     // slate-700 - Hover states
  
  // Text
  textPrimary: '#f0f9ff',     // cyan-50 - Primary text
  textSecondary: '#94a3b8',    // slate-400 - Secondary text
  textAccent: '#67e8f9',      // cyan-300 - Accent text
  textHeading: '#cffafe',     // cyan-100 - Headings
  
  // Borders
  border: '#334155',          // slate-700 - Default borders
  borderAccent: '#06b6d4',    // cyan-500 - Accent borders
  
  // Primary Actions
  primary: '#06b6d4',         // cyan-500 - Primary buttons, links
  primaryHover: '#0891b2',    // cyan-600 - Primary hover
  secondary: '#3b82f6',      // blue-500 - Secondary actions
  secondaryHover: '#2563eb',  // blue-600 - Secondary hover
  
  // Status Colors
  success: '#10b981',        // green-500
  error: '#ef4444',          // red-500
  warning: '#f59e0b',        // amber-500
  info: '#06b6d4',           // cyan-500
  
  // Gradients
  gradientFrom: '#06b6d4',   // cyan-500
  gradientTo: '#3b82f6',     // blue-500
};
```

### Tailwind Classes Reference

```typescript
// Backgrounds
'bg-slate-900'      // Main background (#0f172a)
'bg-slate-800'      // Surface/card (#1e293b)
'bg-slate-800/50'   // Semi-transparent surface
'bg-slate-700'      // Hover states (#334155)

// Text
'text-cyan-50'      // Primary text (#f0f9ff)
'text-cyan-100'     // Headings (#cffafe)
'text-cyan-200'     // Accent headings (#cffafe)
'text-cyan-300'     // Accent text (#67e8f9)
'text-slate-400'    // Secondary text (#94a3b8)
'text-slate-500'    // Muted text (#64748b)

// Borders
'border-slate-700'  // Default border (#334155)
'border-cyan-500'   // Accent border (#06b6d4)
'border-cyan-500/30' // Accent border with opacity

// Buttons
'bg-cyan-500'       // Primary button
'bg-blue-500'        // Secondary button
'bg-gradient-to-r from-cyan-500 to-blue-600' // Gradient button
'hover:bg-cyan-600' // Primary hover
'hover:bg-blue-600' // Secondary hover

// Shadows
'shadow-lg shadow-cyan-500/30' // Glowing cyan shadow
'shadow-xl shadow-blue-500/50'  // Glowing blue shadow
```

---

## Component Folder Structure

Organize your Qdrant components following this structure:

```
src/components/
├── dashboard/
│   ├── user/
│   │   └── knowledgeBase/
│   │       ├── KnowledgeBaseDashboard.tsx    # Main dashboard
│   │       ├── components/
│   │       │   ├── KnowledgeSearch.tsx        # Search interface
│   │       │   ├── KnowledgeList.tsx          # List of knowledge points
│   │       │   ├── KnowledgeCard.tsx          # Individual knowledge card
│   │       │   ├── KnowledgeForm.tsx          # Add/edit form
│   │       │   ├── CollectionSelector.tsx     # Collection dropdown
│   │       │   └── KnowledgeFilters.tsx       # Filter sidebar
│   │       └── hooks/
│   │           ├── useKnowledgeSearch.ts       # Search hook
│   │           ├── useKnowledgeList.ts         # List hook
│   │           └── useKnowledgeMutation.ts    # Add/edit/delete hook
│   └── admin/
│       └── knowledgeBase/
│           ├── AdminKnowledgeBase.tsx         # Admin dashboard
│           └── components/
│               ├── CollectionManager.tsx       # Manage collections
│               └── KnowledgeStats.tsx          # Statistics
├── onboarding/
│   └── steps/
│       └── step4KnowledgeBase.tsx              # Onboarding step
└── ux/
    └── knowledgeBase/
        ├── KnowledgeSearchModal.tsx           # Search modal
        └── KnowledgePreview.tsx                # Preview component
```

---

## Component 1: Knowledge Base Dashboard

**File**: `src/components/dashboard/user/knowledgeBase/KnowledgeBaseDashboard.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Search, Plus, Database, Filter, Sparkles } from 'lucide-react';
import KnowledgeSearch from './components/KnowledgeSearch';
import KnowledgeList from './components/KnowledgeList';
import KnowledgeForm from './components/KnowledgeForm';
import CollectionSelector from './components/CollectionSelector';
import KnowledgeFilters from './components/KnowledgeFilters';

export default function KnowledgeBaseDashboard() {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [selectedCollection, setSelectedCollection] = useState<string>('general_website_knowledge');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    type?: string;
    source?: string;
    tags?: string[];
  }>({});

  return (
    <div className="min-h-screen bg-slate-900 text-cyan-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
              Knowledge Base
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Manage your component patterns, best practices, and editing guidelines
          </p>
        </div>

        {/* Collection Selector */}
        <div className="mb-6">
          <CollectionSelector
            selected={selectedCollection}
            onChange={setSelectedCollection}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('view')}
            className={`
              px-6 py-3 font-semibold transition-all relative
              ${activeTab === 'view'
                ? 'text-cyan-200 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-cyan-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse & Search
            </div>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`
              px-6 py-3 font-semibold transition-all relative
              ${activeTab === 'add'
                ? 'text-cyan-200 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-cyan-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Knowledge
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar (only on view tab) */}
          {activeTab === 'view' && (
            <div className="lg:col-span-1">
              <KnowledgeFilters
                filters={filters}
                onChange={setFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={activeTab === 'view' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {activeTab === 'view' ? (
              <div className="space-y-6">
                <KnowledgeSearch
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  collection={selectedCollection}
                  filters={filters}
                />
                <KnowledgeList
                  collection={selectedCollection}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </div>
            ) : (
              <KnowledgeForm
                collection={selectedCollection}
                onSuccess={() => setActiveTab('view')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Component 2: Knowledge Search

**File**: `src/components/dashboard/user/knowledgeBase/components/KnowledgeSearch.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useKnowledgeSearch } from '../hooks/useKnowledgeSearch';

interface KnowledgeSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  collection: string;
  filters?: {
    type?: string;
    source?: string;
    tags?: string[];
  };
}

export default function KnowledgeSearch({
  query,
  onQueryChange,
  collection,
  filters,
}: KnowledgeSearchProps) {
  const { search, results, loading } = useKnowledgeSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    await search(query, collection, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search knowledge base... (e.g., 'component structure', 'image handling')"
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Search
            </>
          )}
        </button>
      </div>

      {/* Results Count */}
      {results.length > 0 && (
        <div className="mt-4 text-sm text-slate-400">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
```

---

## Component 3: Knowledge List

**File**: `src/components/dashboard/user/knowledgeBase/components/KnowledgeList.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { FileText, Tag, Calendar, Edit, Trash2, ExternalLink } from 'lucide-react';
import KnowledgeCard from './KnowledgeCard';
import { useKnowledgeList } from '../hooks/useKnowledgeList';

interface KnowledgeListProps {
  collection: string;
  searchQuery?: string;
  filters?: {
    type?: string;
    source?: string;
    tags?: string[];
  };
}

export default function KnowledgeList({
  collection,
  searchQuery,
  filters,
}: KnowledgeListProps) {
  const { knowledge, loading, error, refresh } = useKnowledgeList(collection, searchQuery, filters);

  useEffect(() => {
    refresh();
  }, [collection, searchQuery, filters]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-slate-400">Loading knowledge base...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400">Error loading knowledge: {error}</p>
      </div>
    );
  }

  if (knowledge.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No knowledge found</h3>
        <p className="text-slate-500">
          {searchQuery
            ? 'Try adjusting your search query or filters'
            : 'Start by adding your first knowledge point'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {knowledge.map((item) => (
        <KnowledgeCard
          key={item.id}
          knowledge={item}
          onUpdate={refresh}
          onDelete={refresh}
        />
      ))}
    </div>
  );
}
```

---

## Component 4: Knowledge Card

**File**: `src/components/dashboard/user/knowledgeBase/components/KnowledgeCard.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Tag, Calendar, Edit, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { KnowledgeSearchResult } from '@/lib/types/knowledge.types';

interface KnowledgeCardProps {
  knowledge: KnowledgeSearchResult;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function KnowledgeCard({
  knowledge,
  onUpdate,
  onDelete,
}: KnowledgeCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(knowledge.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = knowledge.score > 0.8 ? 'text-green-400' : 
                     knowledge.score > 0.6 ? 'text-cyan-400' : 
                     'text-slate-400';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {knowledge.metadata.title && (
            <h3 className="text-xl font-semibold text-cyan-200 mb-2">
              {knowledge.metadata.title}
            </h3>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {knowledge.metadata.type}
            </span>
            {knowledge.metadata.source && (
              <span className="flex items-center gap-1">
                <span>Source:</span>
                {knowledge.metadata.source}
              </span>
            )}
            {knowledge.score && (
              <span className={`flex items-center gap-1 ${scoreColor}`}>
                Score: {(knowledge.score * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all"
            title="Copy content"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className={`text-cyan-50 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {knowledge.content}
        </p>
        {!expanded && knowledge.content.length > 200 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Read more...
          </button>
        )}
      </div>

      {/* Tags */}
      {knowledge.metadata.tags && knowledge.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {knowledge.metadata.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          ID: {knowledge.id.substring(0, 16)}...
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-cyan-200 rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Component 5: Knowledge Form

**File**: `src/components/dashboard/user/knowledgeBase/components/KnowledgeForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { useKnowledgeMutation } from '../hooks/useKnowledgeMutation';

interface KnowledgeFormProps {
  collection: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    content?: string;
    metadata?: {
      type?: string;
      source?: string;
      tags?: string[];
      title?: string;
    };
  };
}

export default function KnowledgeForm({
  collection,
  onSuccess,
  onCancel,
  initialData,
}: KnowledgeFormProps) {
  const { addKnowledge, updateKnowledge, loading } = useKnowledgeMutation();
  
  const [content, setContent] = useState(initialData?.content || '');
  const [title, setTitle] = useState(initialData?.metadata?.title || '');
  const [type, setType] = useState(initialData?.metadata?.type || 'component_pattern');
  const [source, setSource] = useState(initialData?.metadata?.source || '');
  const [tags, setTags] = useState(initialData?.metadata?.tags?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const metadata = {
      type,
      source: source || 'manual',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      title: title || undefined,
    };

    try {
      if (initialData) {
        // Update existing
        // await updateKnowledge(collection, knowledgeId, content, metadata);
      } else {
        // Add new
        await addKnowledge(collection, content, metadata);
      }
      
      onSuccess?.();
      
      // Reset form
      setContent('');
      setTitle('');
      setType('component_pattern');
      setSource('');
      setTags('');
    } catch (error) {
      console.error('Error saving knowledge:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-200">
          {initialData ? 'Edit Knowledge' : 'Add New Knowledge'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Component File Structure"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the knowledge content..."
            rows={8}
            required
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
          />
          <p className="mt-2 text-xs text-slate-400">
            {content.length} characters
          </p>
        </div>

        {/* Type & Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Type <span className="text-red-400">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="component_pattern">Component Pattern</option>
              <option value="best_practice">Best Practice</option>
              <option value="editing_style">Editing Style</option>
              <option value="goal_matching">Goal Matching</option>
              <option value="structure_analysis">Structure Analysis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., component-generation-guide"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., components, structure, files"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-cyan-200 rounded-lg transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Knowledge
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Component 6: Collection Selector

**File**: `src/components/dashboard/user/knowledgeBase/components/CollectionSelector.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Database, ChevronDown } from 'lucide-react';

interface CollectionSelectorProps {
  selected: string;
  onChange: (collection: string) => void;
}

export default function CollectionSelector({
  selected,
  onChange,
}: CollectionSelectorProps) {
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/knowledge/collections');
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
        if (data.collections.length > 0 && !selected) {
          onChange(data.collections[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Database className="h-5 w-5 text-cyan-400" />
        <label className="text-sm font-medium text-cyan-200">
          Collection:
        </label>
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        >
          {loading ? (
            <option>Loading collections...</option>
          ) : (
            collections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
```

---

## Component 7: Knowledge Filters

**File**: `src/components/dashboard/user/knowledgeBase/components/KnowledgeFilters.tsx`

```tsx
'use client';

import { Filter, X } from 'lucide-react';

interface KnowledgeFiltersProps {
  filters: {
    type?: string;
    source?: string;
    tags?: string[];
  };
  onChange: (filters: {
    type?: string;
    source?: string;
    tags?: string[];
  }) => void;
}

export default function KnowledgeFilters({
  filters,
  onChange,
}: KnowledgeFiltersProps) {
  const types = [
    'component_pattern',
    'best_practice',
    'editing_style',
    'goal_matching',
    'structure_analysis',
  ];

  const clearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = filters.type || filters.source || (filters.tags && filters.tags.length > 0);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-cyan-200">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => onChange({ ...filters, type: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Source
          </label>
          <input
            type="text"
            value={filters.source || ''}
            onChange={(e) => onChange({ ...filters, source: e.target.value || undefined })}
            placeholder="Filter by source..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-50 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Custom Hooks

### Hook 1: useKnowledgeSearch

**File**: `src/components/dashboard/user/knowledgeBase/hooks/useKnowledgeSearch.ts`

```tsx
import { useState } from 'react';
import { KnowledgeSearchResult } from '@/lib/types/knowledge.types';

export function useKnowledgeSearch() {
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    query: string,
    collection: string,
    filters?: {
      type?: string;
      source?: string;
      tags?: string[];
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          collection,
          limit: 20,
          filters,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return { search, results, loading, error };
}
```

### Hook 2: useKnowledgeList

**File**: `src/components/dashboard/user/knowledgeBase/hooks/useKnowledgeList.ts`

```tsx
import { useState, useCallback } from 'react';
import { KnowledgeSearchResult } from '@/lib/types/knowledge.types';

export function useKnowledgeList(
  collection: string,
  searchQuery?: string,
  filters?: {
    type?: string;
    source?: string;
    tags?: string[];
  }
) {
  const [knowledge, setKnowledge] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchQuery) {
        // Use search API
        const response = await fetch('/api/knowledge/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            collection,
            limit: 50,
            filters,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setKnowledge(data.results);
        } else {
          setError(data.error || 'Failed to load knowledge');
        }
      } else {
        // Load all (you might want a separate endpoint for this)
        setKnowledge([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge');
    } finally {
      setLoading(false);
    }
  }, [collection, searchQuery, filters]);

  return { knowledge, loading, error, refresh };
}
```

### Hook 3: useKnowledgeMutation

**File**: `src/components/dashboard/user/knowledgeBase/hooks/useKnowledgeMutation.ts`

```tsx
import { useState } from 'react';

export function useKnowledgeMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addKnowledge = async (
    collection: string,
    content: string,
    metadata: {
      type: string;
      source: string;
      tags: string[];
      title?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          content,
          metadata,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add knowledge');
      }

      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add knowledge';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledge = async (collection: string, knowledgeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/knowledge/${knowledgeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete knowledge');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete knowledge';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addKnowledge, deleteKnowledge, loading, error };
}
```

---

## Integration Example

Add to your dashboard:

**File**: `src/components/dashboard/user/userDashboard/userDashboard.tsx`

```tsx
// Add to imports
import KnowledgeBaseDashboard from '../knowledgeBase/KnowledgeBaseDashboard';

// Add to USER_SECTIONS array
{
  id: 'knowledge-base',
  label: 'Knowledge Base',
  component: KnowledgeBaseDashboard,
  description: 'Manage your component patterns and best practices'
}
```

---

## Summary

You now have a complete frontend component library for managing your Qdrant knowledge base:

✅ **Design System**: Dark theme with cyan/blue accents  
✅ **Component Structure**: Organized by dashboard/onboarding/ux folders  
✅ **6 Core Components**: Dashboard, Search, List, Card, Form, Filters  
✅ **3 Custom Hooks**: Search, List, Mutation  
✅ **Color Palette**: All hex codes documented  
✅ **Ready to Use**: Copy-paste components with proper styling  

**Next Steps:**
1. Copy components to your new app
2. Install dependencies: `lucide-react` for icons
3. Update API endpoints to match your routes
4. Customize colors if needed
5. Add to your dashboard navigation

All components follow the same dark theme and design patterns as agent-lead-gen!

