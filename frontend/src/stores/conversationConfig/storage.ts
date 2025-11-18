// stores/conversation/storage/clientStorage.ts
import type { StateStorage } from 'zustand/middleware';

export const clientStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : null;
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};