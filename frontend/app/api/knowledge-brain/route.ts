// app/api/knowledge-brain/route.ts
/**
 * Unified Knowledge Brain API
 *
 * Returns all knowledge from Qdrant organized by type:
 * - Stories (kind: 'story')
 * - Tips & Advice (kind: 'tip')
 * - Agent Knowledge (source: 'agent_knowledge') - by category (built-in + custom)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import { qdrant } from '@/lib/qdrant/client';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

export const runtime = 'nodejs';

// Knowledge entry unified type
export interface KnowledgeItem {
  id: string;
  title: string;
  text: string;
  category: string; // 'stories' | 'tips' | 'about' | 'services' | etc. or custom category id
  kind?: 'story' | 'tip';
  source?: string;
  tags?: string[];
  // Story-specific fields
  situation?: string;
  action?: string;
  outcome?: string;
  // Metadata
  chunkCount?: number;
  createdAt?: string;
}

export interface CategoryData {
  id: string;
  label: string;
  count: number;
  items: KnowledgeItem[];
  // Custom category fields
  isCustom?: boolean;
  icon?: string;
  color?: string;
  description?: string;
  parentId?: string | null;
}

export interface CustomCategoryInfo {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
}

// Built-in categories (cannot be deleted)
const BUILTIN_CATEGORIES = [
  { id: 'stories', label: 'Stories' },
  { id: 'tips', label: 'Tips & Advice' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'value-proposition', label: 'Value Props' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'general', label: 'General' },
];

async function getUserConfig(userId: string): Promise<ClientConfigDocument | null> {
  try {
    const collection = await getClientConfigsCollection();
    return await collection.findOne({ userId }) as ClientConfigDocument | null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig?.qdrantCollectionName) {
      return NextResponse.json(
        { error: 'Configuration not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const collectionName = userConfig.qdrantCollectionName;
    const businessName = userConfig.businessName || 'Agent';

    // Get custom categories from config
    const customCategories = userConfig.customKnowledgeCategories || [];

    // Initialize categories map with built-in categories
    const categories: Record<string, CategoryData> = {};
    for (const cat of BUILTIN_CATEGORIES) {
      categories[cat.id] = {
        id: cat.id,
        label: cat.label,
        count: 0,
        items: [],
        isCustom: false,
      };
    }

    // Add custom categories
    for (const custom of customCategories) {
      categories[custom.id] = {
        id: custom.id,
        label: custom.label,
        count: 0,
        items: [],
        isCustom: true,
        icon: custom.icon,
        color: custom.color,
        description: custom.description,
        parentId: custom.parentId,
      };
    }

    // Fetch ALL items from Qdrant
    const result = await qdrant.scroll(collectionName, {
      limit: 500,
      with_payload: true,
      with_vector: false,
    });

    // Track seen entry IDs for agent knowledge (they have multiple chunks)
    const seenAgentKnowledgeIds = new Set<string>();

    for (const point of result.points) {
      const payload = point.payload as Record<string, unknown>;

      // Check if it's agent knowledge (has source: 'agent_knowledge')
      if (payload?.source === 'agent_knowledge') {
        const entryId = payload.entryId as string;

        // Skip if we've already processed this entry (it has multiple chunks)
        if (seenAgentKnowledgeIds.has(entryId)) continue;
        seenAgentKnowledgeIds.add(entryId);

        const category = (payload.category as string) || 'general';
        const item: KnowledgeItem = {
          id: entryId,
          title: payload.title as string || 'Untitled',
          text: payload.text as string || '',
          category,
          source: 'agent_knowledge',
          chunkCount: 1,
        };

        // Route to category (custom or built-in) or fallback to general
        if (categories[category]) {
          categories[category].items.push(item);
          categories[category].count++;
        } else {
          categories.general.items.push(item);
          categories.general.count++;
        }
      }
      // Check if it's a story
      else if (payload?.kind === 'story') {
        const item: KnowledgeItem = {
          id: point.id as string,
          title: payload.title as string || 'Untitled Story',
          text: payload.advice as string || '',
          category: 'stories',
          kind: 'story',
          tags: payload.tags as string[] || [],
          situation: payload.situation as string,
          action: payload.action as string,
          outcome: payload.outcome as string,
        };
        categories.stories.items.push(item);
        categories.stories.count++;
      }
      // Otherwise it's a tip
      else if (payload?.kind === 'tip' || (!payload?.source && !payload?.kind)) {
        const item: KnowledgeItem = {
          id: point.id as string,
          title: payload.title as string || 'Untitled Tip',
          text: payload.advice as string || '',
          category: 'tips',
          kind: 'tip',
          tags: payload.tags as string[] || [],
        };
        categories.tips.items.push(item);
        categories.tips.count++;
      }
    }

    // Get agent knowledge entries from MongoDB for accurate data
    const agentKnowledgeEntries = userConfig.agentKnowledgeEntries || [];
    const mongoEntryMap: Record<string, { text: string; title: string; chunkCount: number }> = {};
    for (const entry of agentKnowledgeEntries) {
      mongoEntryMap[entry.id] = {
        text: entry.text,
        title: entry.title,
        chunkCount: entry.chunkCount,
      };
    }

    // Update agent knowledge items with MongoDB data
    for (const catId of Object.keys(categories)) {
      for (const item of categories[catId].items) {
        if (item.source === 'agent_knowledge' && mongoEntryMap[item.id]) {
          item.text = mongoEntryMap[item.id].text;
          item.title = mongoEntryMap[item.id].title;
          item.chunkCount = mongoEntryMap[item.id].chunkCount;
        }
      }
    }

    // Calculate total
    const totalCount = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0);

    // Prepare custom categories info for the response
    const customCategoriesInfo: CustomCategoryInfo[] = customCategories.map(c => ({
      id: c.id,
      label: c.label,
      description: c.description,
      icon: c.icon,
      color: c.color,
      parentId: c.parentId,
      order: c.order,
    }));

    return NextResponse.json({
      success: true,
      businessName,
      totalCount,
      categories,
      customCategories: customCategoriesInfo,
    });
  } catch (error) {
    console.error('[knowledge-brain/GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
