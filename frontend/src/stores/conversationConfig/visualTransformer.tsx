// utils/visualTransformer.ts
import { VISUAL_MAP } from '@/utils/visualMapper';

export const transformVisual = (visual: any) => {
  if (!visual?.value) return visual;

  // Handle old emoji strings
  if (visual.type === 'emoji' && typeof visual.value === 'string') {
    const emoji = VISUAL_MAP[visual.value as keyof typeof VISUAL_MAP];
    if (typeof emoji === 'string') {
      return { ...visual, value: emoji };
    }
  }

  // Handle icon component names → actual components
  if (visual.type === 'icon' && typeof visual.value === 'string') {
    const IconComponent = VISUAL_MAP[visual.value as keyof typeof VISUAL_MAP];
    if (typeof IconComponent === 'function') {
      return { ...visual, value: IconComponent };
    }
  }

  return visual;
};

export const transformFlow = (flow: any) => ({
  ...flow,
  visual: flow.visual ? transformVisual(flow.visual) : undefined,
  questions: flow.questions.map((q: any) => ({
    ...q,
    visual: q.visual ? transformVisual(q.visual) : undefined,
    buttons: q.buttons?.map((b: any) => ({
      ...b,
      visual: b.visual ? transformVisual(b.visual) : undefined,
    })),
  })),
});