// app/api/knowledge-categories/route.ts
/**
 * Custom Knowledge Categories API
 *
 * Manages user-defined categories and subcategories for organizing knowledge.
 *
 * GET - List all custom categories for the user
 * POST - Create a new custom category
 * PUT - Update an existing category
 * DELETE - Remove a custom category
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getEffectiveUserId } from '@/lib/auth/impersonation';
import { getClientConfigsCollection } from '@/lib/mongodb/db';
import type { ClientConfigDocument } from '@/lib/mongodb/models/clientConfig';

export const runtime = 'nodejs';

// ==================== TYPES ====================

interface CustomCategory {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCategoryBody {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}

interface UpdateCategoryBody {
  id: string;
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
}

// ==================== HELPERS ====================

async function getUserConfig(userId: string): Promise<ClientConfigDocument | null> {
  try {
    const collection = await getClientConfigsCollection();
    return await collection.findOne({ userId }) as ClientConfigDocument | null;
  } catch {
    return null;
  }
}

function generateCategoryId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ==================== GET ====================

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const categories = userConfig.customKnowledgeCategories || [];

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('[knowledge-categories/GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==================== POST ====================

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const body: CreateCategoryBody = await request.json();
    const { label, description, icon, color, parentId } = body;

    if (!label?.trim()) {
      return NextResponse.json(
        { error: 'Category label is required' },
        { status: 400 }
      );
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const existingCategories = userConfig.customKnowledgeCategories || [];
      const parentExists = existingCategories.some(c => c.id === parentId);
      if (!parentExists) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const existingCategories = userConfig.customKnowledgeCategories || [];

    const newCategory: CustomCategory = {
      id: generateCategoryId(),
      label: label.trim(),
      description: description?.trim(),
      icon: icon || '📁',
      color: color || 'slate',
      parentId: parentId || null,
      order: existingCategories.length,
      createdAt: now,
      updatedAt: now,
    };

    // Update MongoDB
    const collection = await getClientConfigsCollection();
    await collection.updateOne(
      { userId },
      {
        $push: { customKnowledgeCategories: newCategory },
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error('[knowledge-categories/POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==================== PUT ====================

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const body: UpdateCategoryBody = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const existingCategories = userConfig.customKnowledgeCategories || [];
    const categoryIndex = existingCategories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If changing parentId, verify it's valid (not self, not circular)
    if (updates.parentId !== undefined) {
      if (updates.parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }
      if (updates.parentId) {
        // Check for circular reference
        let currentParentId: string | null | undefined = updates.parentId;
        const visited = new Set<string>([id]);
        while (currentParentId) {
          if (visited.has(currentParentId)) {
            return NextResponse.json(
              { error: 'Circular parent reference detected' },
              { status: 400 }
            );
          }
          visited.add(currentParentId);
          const parent = existingCategories.find(c => c.id === currentParentId);
          currentParentId = parent?.parentId;
        }
      }
    }

    const now = new Date();
    const updatedCategory = {
      ...existingCategories[categoryIndex],
      ...updates,
      updatedAt: now,
    };

    // Update MongoDB
    const collection = await getClientConfigsCollection();
    await collection.updateOne(
      { userId, 'customKnowledgeCategories.id': id },
      {
        $set: {
          'customKnowledgeCategories.$': updatedCategory,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error('[knowledge-categories/PUT] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==================== DELETE ====================

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (await getEffectiveUserId()) || session.user.id;
    const userConfig = await getUserConfig(userId);

    if (!userConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const existingCategories = userConfig.customKnowledgeCategories || [];
    const category = existingCategories.find(c => c.id === categoryId);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has children
    const hasChildren = existingCategories.some(c => c.parentId === categoryId);
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Delete subcategories first.' },
        { status: 400 }
      );
    }

    // Check if category has knowledge entries
    const entriesInCategory = (userConfig.agentKnowledgeEntries || [])
      .filter(e => e.category === categoryId);
    if (entriesInCategory.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${entriesInCategory.length} knowledge entries. Move or delete them first.` },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update MongoDB
    const collection = await getClientConfigsCollection();
    await collection.updateOne(
      { userId },
      {
        $pull: { customKnowledgeCategories: { id: categoryId } },
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Category deleted',
    });
  } catch (error) {
    console.error('[knowledge-categories/DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
