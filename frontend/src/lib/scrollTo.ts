// hooks/useScrollToId.ts
'use client';

import { useCallback } from 'react';

// lib/scrollToId.ts


export const scrollToId = (id: string, offset: number = 80) => {
  // Handle 'chatbot' as an alias for 'chatbot-container'
  const actualId = id === 'chatbot' ? 'chatbot-container' : id;
  const element = document.getElementById(actualId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
};