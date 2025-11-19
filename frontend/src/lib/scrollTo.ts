// hooks/useScrollToId.ts
'use client';

import { useCallback } from 'react';

// lib/scrollToId.ts


export const scrollToId = (id: string, offset: number = 80) => {
  const element = document.getElementById(id);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
};