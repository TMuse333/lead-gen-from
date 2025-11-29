// lib/colors/defaultTheme.ts
// Default color themes for the chatbot

export interface ColorTheme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  accent: string;
  buttonHover: string;
  gradientFrom: string;
  gradientTo: string;
}

export const FOCUSFLOW_THEME: ColorTheme = {
  name: 'FocusFlow',
  primary: '#06b6d4',        // cyan-500
  secondary: '#3b82f6',      // blue-500
  background: '#0f172a',      // slate-900
  surface: '#1e293b',         // slate-800
  text: '#f0f9ff',            // cyan-50
  textSecondary: '#94a3b8',  // slate-400
  border: '#334155',         // slate-700
  success: '#10b981',        // green-500
  error: '#ef4444',          // red-500
  warning: '#f59e0b',        // amber-500
  accent: '#8b5cf6',         // purple-500
  buttonHover: '#0891b2',    // cyan-600
  gradientFrom: '#06b6d4',   // cyan-500
  gradientTo: '#3b82f6',     // blue-500
};

// Traditional high-contrast themes (primary color + white background)
export const TRADITIONAL_THEMES: ColorTheme[] = [
  {
    name: 'Classic Blue',
    primary: '#2563eb',
    secondary: '#1d4ed8',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#3b82f6',
    buttonHover: '#1d4ed8',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
  },
  {
    name: 'Emerald Green',
    primary: '#10b981',
    secondary: '#059669',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#34d399',
    buttonHover: '#059669',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
  {
    name: 'Violet Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#a78bfa',
    buttonHover: '#7c3aed',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
  },
  {
    name: 'Coral Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#fb923c',
    buttonHover: '#ea580c',
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
  },
  {
    name: 'Rose Pink',
    primary: '#ec4899',
    secondary: '#db2777',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#f472b6',
    buttonHover: '#db2777',
    gradientFrom: '#ec4899',
    gradientTo: '#db2777',
  },
  {
    name: 'Indigo',
    primary: '#6366f1',
    secondary: '#4f46e5',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#818cf8',
    buttonHover: '#4f46e5',
    gradientFrom: '#6366f1',
    gradientTo: '#4f46e5',
  },
  {
    name: 'Teal',
    primary: '#14b8a6',
    secondary: '#0d9488',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#5eead4',
    buttonHover: '#0d9488',
    gradientFrom: '#14b8a6',
    gradientTo: '#0d9488',
  },
];

// Dark themes (low contrast, dark backgrounds)
export const DARK_THEMES: ColorTheme[] = [
  FOCUSFLOW_THEME,
  {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    background: '#064e3b',
    surface: '#065f46',
    text: '#d1fae5',
    textSecondary: '#6ee7b7',
    border: '#047857',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#34d399',
    buttonHover: '#059669',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
  {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    background: '#7c2d12',
    surface: '#9a3412',
    text: '#ffedd5',
    textSecondary: '#fed7aa',
    border: '#c2410c',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#fb923c',
    buttonHover: '#ea580c',
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
  },
  {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    background: '#3b0764',
    surface: '#581c87',
    text: '#f3e8ff',
    textSecondary: '#c4b5fd',
    border: '#6b21a8',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#a78bfa',
    buttonHover: '#7c3aed',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
  },
  {
    name: 'Ocean Blue',
    primary: '#3b82f6',
    secondary: '#2563eb',
    background: '#1e3a8a',
    surface: '#1e40af',
    text: '#dbeafe',
    textSecondary: '#93c5fd',
    border: '#1d4ed8',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#60a5fa',
    buttonHover: '#2563eb',
    gradientFrom: '#3b82f6',
    gradientTo: '#2563eb',
  },
  {
    name: 'Rose Pink Dark',
    primary: '#ec4899',
    secondary: '#db2777',
    background: '#831843',
    surface: '#9f1239',
    text: '#fce7f3',
    textSecondary: '#fbcfe8',
    border: '#be185d',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#f472b6',
    buttonHover: '#db2777',
    gradientFrom: '#ec4899',
    gradientTo: '#db2777',
  },
];

// All preset themes combined
export const PRESET_THEMES: ColorTheme[] = [
  ...DARK_THEMES,
  ...TRADITIONAL_THEMES,
];

export const DEFAULT_THEME = FOCUSFLOW_THEME;

