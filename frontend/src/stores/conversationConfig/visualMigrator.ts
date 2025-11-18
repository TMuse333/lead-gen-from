// stores/conversation/utils/visualMigrator.ts
import { VISUAL_MAP } from '@/utils/visualMapper';
import type { VisualAttachment } from '@/types/conversation.types';

export const migrateVisual = (old: any): VisualAttachment | undefined => {
  if (!old?.value) return undefined;

  // Old format: { type: 'icon', value: 'Home' } → { type: 'icon', value: HomeIconComponent }
  if (old.type === 'icon' && typeof old.value === 'string') {
    const Icon = VISUAL_MAP[old.value as keyof typeof VISUAL_MAP];
    if (typeof Icon === 'function') {
      return { type: 'icon', value: Icon };
    }
  }

  // Old emoji string → new emoji
  if (old.type === 'emoji' && typeof old.value === 'string') {
    const emoji = VISUAL_MAP[old.value as keyof typeof VISUAL_MAP];
    if (typeof emoji === 'string') {
      return { type: 'emoji', value: emoji };
    }
  }

  // Already correct or unknown → pass through
  return old as VisualAttachment;
};