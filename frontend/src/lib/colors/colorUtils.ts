// lib/colors/colorUtils.ts
// Utilities for working with color themes

import { ColorTheme, DEFAULT_THEME } from './defaultTheme';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Generate CSS variables from a color theme
 */
export function generateCSSVariables(theme: ColorTheme): string {
  return `
    :root {
      --color-primary: ${theme.primary};
      --color-primary-rgb: ${hexToRgb(theme.primary)};
      --color-secondary: ${theme.secondary};
      --color-secondary-rgb: ${hexToRgb(theme.secondary)};
      --color-background: ${theme.background};
      --color-background-rgb: ${hexToRgb(theme.background)};
      --color-surface: ${theme.surface};
      --color-surface-rgb: ${hexToRgb(theme.surface)};
      --color-text: ${theme.text};
      --color-text-secondary: ${theme.textSecondary};
      --color-text-secondary-rgb: ${hexToRgb(theme.textSecondary)};
      --color-border: ${theme.border};
      
      /* Placeholder color */
      --color-placeholder: rgba(${hexToRgb(theme.textSecondary)}, 0.5);
      --color-success: ${theme.success};
      --color-error: ${theme.error};
      --color-warning: ${theme.warning};
      --color-accent: ${theme.accent};
      --color-button-hover: ${theme.buttonHover};
      --color-gradient-from: ${theme.gradientFrom};
      --color-gradient-to: ${theme.gradientTo};
      
      /* Placeholder color */
      --color-placeholder: rgba(${hexToRgb(theme.textSecondary)}, 0.5);
    }
    
    /* Global placeholder styling */
    input::placeholder,
    textarea::placeholder {
      color: var(--color-placeholder) !important;
    }
  `;
}

/**
 * Get theme from config or return default
 */
export function getTheme(colorConfig: ColorTheme | null | undefined): ColorTheme {
  if (!colorConfig) {
    return DEFAULT_THEME;
  }
  return colorConfig;
}

/**
 * Inject CSS variables into the document
 */
export function injectColorTheme(theme: ColorTheme) {
  if (typeof window === 'undefined') return;
  
  const styleId = 'bot-color-theme';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = generateCSSVariables(theme);
}

